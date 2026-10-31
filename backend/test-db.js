require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkTransactions() {
    try {
        const result = await pool.query(`
            SELECT
                u.username,
                s.ticker,
                t.transaction_type,
                t.shares,
                t.price_per_share,
                t.total_amount,
                t.transaction_date
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            JOIN stocks s ON t.stock_id = s.stock_id
            ORDER BY t.transaction_date DESC
            LIMIT 10
        `);

        console.table(result.rows);
    } catch (error) {
        console.error("Query failed:", error.message);
    } finally {
        await pool.end();
    }
}

checkTransactions();
