
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is missing from .env");
}

app.use(cors());
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// -------------------------------
// AUTHENTICATION MIDDLEWARE
// -------------------------------

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            error: "Please log in first."
        });
    }

    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            error: "Please log in first."
        });
    }

    if (req.session.user.role !== "admin") {
        return res.status(403).json({
            error: "Administrator access required."
        });
    }

    next();
}

// Protect the administrator page.
app.get("/admin.html", requireAdmin, (req, res) => {
    res.sendFile(
        path.resolve(__dirname, "..", "public", "admin.html")
    );
});

// Serve public website files.
app.use(express.static(path.resolve(__dirname, "..", "public")));

// -------------------------------
// CREATE ACCOUNT
// -------------------------------

app.post("/register", async (req, res) => {
    const { fullName, username, email, password } = req.body;

    if (
        typeof fullName !== "string" ||
        !fullName.trim() ||
        typeof username !== "string" ||
        !/^[A-Za-z0-9_]{3,20}$/.test(username.trim()) ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 72
    ) {
        return res.status(400).json({
            error: "Enter a name, a username (3-20 letters, numbers, or underscores), a valid email, and a password of at least 8 characters."
        });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users
                (full_name, username, email, password_hash)
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, full_name, username, email, role, cash_balance`,
            [
                fullName.trim(),
                username.trim(),
                email.trim().toLowerCase(),
                passwordHash
            ]
        );

        const user = result.rows[0];

        req.session.user = {
            userId: user.user_id,
            username: user.username,
            role: user.role
        };

        res.status(201).json({
            message: "Account created successfully.",
            user: {
                userId: user.user_id,
                fullName: user.full_name,
                username: user.username,
                email: user.email,
                role: user.role,
                cashBalance: Number(user.cash_balance)
            }
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "That username or email is already registered."
            });
        }

        console.error("Registration error:", error.message);

        res.status(500).json({
            error: "Unable to create account."
        });
    }
});

// -------------------------------
// LOGIN
// -------------------------------

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !password
    ) {
        return res.status(400).json({
            error: "Enter your username and password."
        });
    }

    try {
        const result = await pool.query(
            `SELECT user_id, full_name, username, email,
                    password_hash, role, cash_balance
             FROM users
             WHERE LOWER(username) = LOWER($1)`,
            [username.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid username or password."
            });
        }

        const user = result.rows[0];

        if (
            !user.password_hash ||
            !(await bcrypt.compare(password, user.password_hash))
        ) {
            return res.status(401).json({
                error: "Invalid username or password."
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                console.error("Session error:", error.message);
                return res.status(500).json({
                    error: "Unable to start your session."
                });
            }

            req.session.user = {
                userId: user.user_id,
                username: user.username,
                role: user.role
            };

            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Session save error:", saveError.message);
                    return res.status(500).json({
                        error: "Unable to save your session."
                    });
                }

                res.json({
                    username: user.username,
                    fullName: user.full_name,
                    role: user.role,
                    cashBalance: Number(user.cash_balance)
                });
            });
        });
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            error: "Unable to log in."
        });
    }
});

// -------------------------------
// CHECK CURRENT SESSION
// -------------------------------

app.get("/session", requireLogin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, full_name, username, email,
                    role, cash_balance
             FROM users
             WHERE user_id = $1`,
            [req.session.user.userId]
        );

        if (result.rows.length === 0) {
            req.session.destroy(() => {});
            return res.status(401).json({
                error: "Account not found."
            });
        }

        const user = result.rows[0];

        res.json({
            userId: user.user_id,
            fullName: user.full_name,
            username: user.username,
            email: user.email,
            role: user.role,
            cashBalance: Number(user.cash_balance)
        });
    } catch (error) {
        console.error("Session lookup error:", error.message);
        res.status(500).json({
            error: "Unable to retrieve account."
        });
    }
});

// -------------------------------
// LOGOUT
// -------------------------------

app.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                error: "Unable to log out."
            });
        }

        res.clearCookie("connect.sid");
        res.json({
            message: "Logged out successfully."
        });
    });
});

// -------------------------------
// GET STOCKS
// -------------------------------

// -------------------------------
// GET STOCKS AND UPDATE PRICES
// -------------------------------

app.get("/stocks", async (req, res) => {
    try {
        // Generate a small random price change for each stock
        await pool.query(`
            UPDATE stocks
            SET current_price = GREATEST(
                    1.00,
                    ROUND(
                        (current_price * (1 + (random() - 0.5) * 0.02))::numeric,
                        2
                    )
                ),
                daily_high = GREATEST(
                    daily_high,
                    GREATEST(
                        1.00,
                        ROUND(
                            (current_price * (1 + (random() - 0.5) * 0.02))::numeric,
                            2
                        )
                    )
                ),
                daily_low = LEAST(
                    daily_low,
                    GREATEST(
                        1.00,
                        ROUND(
                            (current_price * (1 + (random() - 0.5) * 0.02))::numeric,
                            2
                        )
                    )
                )
        `);

        const result = await pool.query(`
            SELECT stock_id, company, ticker, volume,
                   opening_price, current_price,
                   daily_high, daily_low
            FROM stocks
            ORDER BY ticker
        `);

        const stockList = result.rows.map(stock => ({
            stockId: stock.stock_id,
            company: stock.company,
            ticker: stock.ticker,
            volume: Number(stock.volume),
            openingPrice: Number(stock.opening_price),
            price: Number(stock.current_price),
            high: Number(stock.daily_high),
            low: Number(stock.daily_low),
            marketCap: Math.round(
                Number(stock.current_price) *
                Number(stock.volume) * 100
            ) / 100
        }));

        res.json(stockList);

    } catch (error) {
        console.error("Unable to retrieve stocks:", error.message);

        res.status(500).json({
            error: "Unable to retrieve stocks from the database."
        });
    }
});

// -------------------------------
// CREATE STOCK (ADMIN ONLY)
// -------------------------------

app.post("/stocks", requireAdmin, async (req, res) => {
    const { company, ticker, volume, price } = req.body;

    if (
        typeof company !== "string" ||
        !company.trim() ||
        typeof ticker !== "string" ||
        !/^[A-Za-z]{1,10}$/.test(ticker.trim()) ||
        !Number.isSafeInteger(Number(volume)) ||
        Number(volume) <= 0 ||
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0
    ) {
        return res.status(400).json({
            error: "Enter a company name, valid ticker, positive volume, and positive price."
        });
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    const initialPrice = Math.round(Number(price) * 100) / 100;
    const stockVolume = Number(volume);

    try {
        const result = await pool.query(
            `INSERT INTO stocks
                (company, ticker, volume, initial_price,
                 current_price, opening_price, daily_high, daily_low)
             VALUES ($1, $2, $3, $4, $4, $4, $4, $4)
             RETURNING stock_id, company, ticker, volume,
                       opening_price, current_price,
                       daily_high, daily_low`,
            [
                company.trim(),
                normalizedTicker,
                stockVolume,
                initialPrice
            ]
        );

        const stock = result.rows[0];

        res.status(201).json({
            stockId: stock.stock_id,
            company: stock.company,
            ticker: stock.ticker,
            volume: Number(stock.volume),
            openingPrice: Number(stock.opening_price),
            price: Number(stock.current_price),
            high: Number(stock.daily_high),
            low: Number(stock.daily_low),
            marketCap: Math.round(
                Number(stock.current_price) *
                Number(stock.volume) * 100
            ) / 100
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "That ticker already exists."
            });
        }

        console.error("Unable to create stock:", error.message);

        res.status(500).json({
            error: "Unable to create stock in the database."
        });
    }
});

// -------------------------------
// GET CUSTOMER ACCOUNT DATA
// -------------------------------

app.get("/account-data", requireLogin, async (req, res) => {
    const userId = req.session.user.userId;

    try {
        const accountResult = await pool.query(
            `SELECT cash_balance
             FROM users
             WHERE user_id = $1`,
            [userId]
        );

        if (accountResult.rows.length === 0) {
            return res.status(404).json({
                error: "Account not found."
            });
        }

        const holdingsResult = await pool.query(
            `SELECT s.ticker, s.company, s.current_price,
                    ph.shares_owned
             FROM portfolio_holdings ph
             JOIN stocks s ON ph.stock_id = s.stock_id
             WHERE ph.user_id = $1
             ORDER BY s.ticker`,
            [userId]
        );

        const transactionsResult = await pool.query(
    `SELECT
        s.ticker AS stock,
        t.transaction_type AS type,
        t.shares,
        t.price_per_share AS price,
        t.total_amount AS total,
        t.transaction_date AS date
     FROM transactions t
     JOIN stocks s ON t.stock_id = s.stock_id
     WHERE t.user_id = $1

     UNION ALL

     SELECT
        'Cash' AS stock,
        transaction_type AS type,
        NULL AS shares,
        0 AS price,
        amount AS total,
        transaction_date AS date
     FROM cash_transactions
     WHERE user_id = $1

     ORDER BY date DESC`,
    [userId]
);

        res.json({
            cashBalance: Number(accountResult.rows[0].cash_balance),
            holdings: holdingsResult.rows.map(row => ({
                ticker: row.ticker,
                company: row.company,
                sharesOwned: Number(row.shares_owned),
                currentPrice: Number(row.current_price)
            })),
            transactions: transactionsResult.rows.map(row => ({
                stock: row.stock,
                type: row.type,
                shares: row.shares === null ? "-" : Number(row.shares),
                price: Number(row.price),
                total: Number(row.total),
                date: row.date
            }))
        });

    } catch (error) {
        console.error("Account data error:", error.message);

        res.status(500).json({
            error: "Unable to retrieve account data."
        });
    }
});

// -------------------------------
// BUY STOCK
// -------------------------------

app.post("/trade/buy", requireLogin, async (req, res) => {
    const { ticker, shares } = req.body;
    const userId = req.session.user.userId;

    if (
        typeof ticker !== "string" ||
        !/^[A-Za-z]{1,10}$/.test(ticker.trim()) ||
        !Number.isSafeInteger(shares) ||
        shares <= 0
    ) {
        return res.status(400).json({
            error: "Enter a valid stock ticker and whole number of shares."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const userResult = await client.query(
            `SELECT cash_balance
             FROM users
             WHERE user_id = $1
             FOR UPDATE`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error("Account not found.");
        }

        const stockResult = await client.query(
            `SELECT stock_id, ticker, current_price,
                    current_price * $2 AS total
             FROM stocks
             WHERE ticker = $1
             FOR SHARE`,
            [ticker.trim().toUpperCase(), shares]
        );

        if (stockResult.rows.length === 0) {
            throw new Error("Stock not found.");
        }

        const stock = stockResult.rows[0];

        if (Number(userResult.rows[0].cash_balance) <
            Number(stock.total)) {
            throw new Error("Not enough cash to complete this purchase.");
        }

        await client.query(
            `UPDATE users
             SET cash_balance = cash_balance - $1
             WHERE user_id = $2`,
            [stock.total, userId]
        );

        await client.query(
            `INSERT INTO portfolio_holdings
                (user_id, stock_id, shares_owned)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, stock_id)
             DO UPDATE SET
                shares_owned = portfolio_holdings.shares_owned
                               + EXCLUDED.shares_owned`,
            [userId, stock.stock_id, shares]
        );

        await client.query(
            `INSERT INTO transactions
                (user_id, stock_id, transaction_type,
                 shares, price_per_share, total_amount)
             VALUES ($1, $2, 'buy', $3, $4, $5)`,
            [userId, stock.stock_id, shares,
             stock.current_price, stock.total]
        );

        await client.query("COMMIT");

        res.json({
            message: `Bought ${shares} shares of ${stock.ticker}.`
        });

    } catch (error) {
        await client.query("ROLLBACK");

        const status = [
            "Account not found.",
            "Stock not found.",
            "Not enough cash to complete this purchase."
        ].includes(error.message) ? 400 : 500;

        console.error("Buy error:", error.message);

        res.status(status).json({
            error: status === 500
                ? "Unable to complete stock purchase."
                : error.message
        });

    } finally {
        client.release();
    }
});

// -------------------------------
// SELL STOCK
// -------------------------------

app.post("/trade/sell", requireLogin, async (req, res) => {
    const { ticker, shares } = req.body;
    const userId = req.session.user.userId;

    if (
        typeof ticker !== "string" ||
        !/^[A-Za-z]{1,10}$/.test(ticker.trim()) ||
        !Number.isSafeInteger(shares) ||
        shares <= 0
    ) {
        return res.status(400).json({
            error: "Enter a valid stock ticker and whole number of shares."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `SELECT user_id
             FROM users
             WHERE user_id = $1
             FOR UPDATE`,
            [userId]
        );

        const stockResult = await client.query(
            `SELECT stock_id, ticker, current_price,
                    current_price * $2 AS total
             FROM stocks
             WHERE ticker = $1
             FOR SHARE`,
            [ticker.trim().toUpperCase(), shares]
        );

        if (stockResult.rows.length === 0) {
            throw new Error("Stock not found.");
        }

        const stock = stockResult.rows[0];

        const holdingResult = await client.query(
            `SELECT shares_owned
             FROM portfolio_holdings
             WHERE user_id = $1 AND stock_id = $2
             FOR UPDATE`,
            [userId, stock.stock_id]
        );

        if (
            holdingResult.rows.length === 0 ||
            holdingResult.rows[0].shares_owned < shares
        ) {
            throw new Error("You do not own enough shares to complete this sale.");
        }

        await client.query(
            `UPDATE portfolio_holdings
             SET shares_owned = shares_owned - $1
             WHERE user_id = $2 AND stock_id = $3`,
            [shares, userId, stock.stock_id]
        );

        await client.query(
            `DELETE FROM portfolio_holdings
             WHERE user_id = $1
               AND stock_id = $2
               AND shares_owned = 0`,
            [userId, stock.stock_id]
        );

        await client.query(
            `UPDATE users
             SET cash_balance = cash_balance + $1
             WHERE user_id = $2`,
            [stock.total, userId]
        );

        await client.query(
            `INSERT INTO transactions
                (user_id, stock_id, transaction_type,
                 shares, price_per_share, total_amount)
             VALUES ($1, $2, 'sell', $3, $4, $5)`,
            [userId, stock.stock_id, shares,
             stock.current_price, stock.total]
        );

        await client.query("COMMIT");

        res.json({
            message: `Sold ${shares} shares of ${stock.ticker}.`
        });

    } catch (error) {
        await client.query("ROLLBACK");

        const status = [
            "Stock not found.",
            "You do not own enough shares to complete this sale."
        ].includes(error.message) ? 400 : 500;

        console.error("Sell error:", error.message);

        res.status(status).json({
            error: status === 500
                ? "Unable to complete stock sale."
                : error.message
        });

    } finally {
        client.release();
    }
});

// -------------------------------
// DEPOSIT CASH
// -------------------------------

app.post("/cash/deposit", requireLogin, async (req, res) => {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            error: "Enter a valid deposit amount."
        });
    }

    const roundedAmount = Math.round(amount * 100) / 100;
    const userId = req.session.user.userId;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE users
             SET cash_balance = cash_balance + $1
             WHERE user_id = $2
             RETURNING cash_balance`,
            [roundedAmount, userId]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                error: "Account not found."
            });
        }

        await client.query(
            `INSERT INTO cash_transactions
             (user_id, transaction_type, amount)
             VALUES ($1, 'deposit', $2)`,
            [userId, roundedAmount]
        );

        await client.query("COMMIT");

        res.json({
            message: "Deposit successful.",
            cashBalance: Number(result.rows[0].cash_balance)
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Deposit error:", error.message);

        res.status(500).json({
            error: "Unable to process deposit."
        });
    } finally {
        client.release();
    }
});

// -------------------------------
// WITHDRAW CASH
// -------------------------------

app.post("/cash/withdraw", requireLogin, async (req, res) => {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            error: "Enter a valid withdrawal amount."
        });
    }

    const roundedAmount = Math.round(amount * 100) / 100;
    const userId = req.session.user.userId;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE users
             SET cash_balance = cash_balance - $1
             WHERE user_id = $2
               AND cash_balance >= $1
             RETURNING cash_balance`,
            [roundedAmount, userId]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                error: "Not enough cash to complete this withdrawal."
            });
        }

        await client.query(
            `INSERT INTO cash_transactions
             (user_id, transaction_type, amount)
             VALUES ($1, 'withdrawal', $2)`,
            [userId, roundedAmount]
        );

        await client.query("COMMIT");

        res.json({
            message: "Withdrawal successful.",
            cashBalance: Number(result.rows[0].cash_balance)
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Withdrawal error:", error.message);

        res.status(500).json({
            error: "Unable to process withdrawal."
        });
    } finally {
        client.release();
    }
});

// -------------------------------
// START SERVER
// -------------------------------

app.get("/", (req, res) => {
    res.sendFile(
        path.resolve(__dirname, "..", "public", "index.html")
    );
});

const port = 3000;

const server = app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});

// -------------------------------
// SHUTDOWN
// -------------------------------

async function shutdown() {
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
