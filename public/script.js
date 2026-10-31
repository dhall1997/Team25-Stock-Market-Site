
// -------------------------------
// USER FUNCTIONALITY 
// -------------------------------

// Element references
const loginForm = document.getElementById("login-form");
const createAccountForm = document.getElementById("create-account-form");

const loginScreen = document.getElementById("login-screen");
const createAccountScreen = document.getElementById("create-account-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

const createAccountLink = document.getElementById("create-account-link");
const backToLogin = document.getElementById("back-to-login");
const logoutButton = document.getElementById("logout-button");

// -------------------------------
// LOGIN
// -------------------------------

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const loginMessage = document.getElementById("login-message");

    loginMessage.textContent = "";

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            loginMessage.textContent =
                data.error || "Login failed.";
            return;
        }

        // Send administrators to the admin portal.
        if (data.role === "admin") {
            window.location.href = "/admin.html";
            return;
        }

        // Regular users stay on the customer dashboard.
        document.getElementById("dashboard-username").textContent =
            data.username;

        loginScreen.style.display = "none";
        dashboardScreen.style.display = "block";

        await loadAccountData();

    } catch (error) {
        console.error("Login error:", error);
        loginMessage.textContent =
            "Unable to connect to the server.";
    }
});

// -------------------------------
// SCREEN SWITCHING
// -------------------------------
createAccountLink.addEventListener("click", function(event) {
    event.preventDefault();
    loginScreen.style.display = "none";
    createAccountScreen.style.display = "block";
});

backToLogin.addEventListener("click", function(event) {
    event.preventDefault();
    createAccountScreen.style.display = "none";
    loginScreen.style.display = "block";
});

// -------------------------------
// CREATE ACCOUNT
// -------------------------------

createAccountForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const fullName = document.getElementById("full-name").value.trim();
    const username = document.getElementById("new-username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("new-password").value;

    const accountMessage = document.getElementById("account-message");

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: fullName,
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            accountMessage.textContent = data.error || "Unable to create account.";
            return;
        }

        accountMessage.textContent =
            "Account created successfully! You can now log in.";

        createAccountForm.reset();

    } catch (error) {
        console.error("Account creation error:", error);
        accountMessage.textContent =
            "Unable to connect to the server. Please try again.";
    }
});

// -------------------------------
// LOGOUT
// -------------------------------
logoutButton.addEventListener("click", async function() {
    try {
        await fetch("/logout", {
            method: "POST"
        });
    } catch (error) {
        console.error("Logout error:", error);
    }

    dashboardScreen.style.display = "none";
    loginScreen.style.display = "block";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("login-message").textContent = "";
});

// -------------------------------
//  STOCK CODE 
// -------------------------------

const stockSelect = document.getElementById("stock-select");
const marketPrice = document.getElementById("market-price");

function updateStockPrice() {
    const selectedStock = stockSelect.value;

    if (selectedStock && stockPrices[selectedStock] !== undefined) {
        marketPrice.textContent =
            "$" + stockPrices[selectedStock].toFixed(2);
    } else {
        marketPrice.textContent = "$0.00";
    }
}



let stockPrices = {};


let stocks = [];

async function loadStocks() {
    try {
        const response = await fetch('/stocks');

        if (!response.ok) {
            throw new Error('Could not load stocks');
        }

        stocks = await response.json();

        stocks.forEach((stock) => {
            stockPrices[stock.ticker] = stock.price;
        });

        updateStockDropdown();
        updateStockMarketTable();

    }catch (error) {
        console.error('Error loading stocks:', error);
    }
}

function updateStockMarketTable() {
    const stockMarketBody = document.getElementById('stock-market-body');

    if (!stockMarketBody) {
        return;
    }

    stockMarketBody.innerHTML = '';

    stocks.forEach((stock) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${stock.company}</td>
            <td>${stock.ticker}</td>
            <td>$${stock.price.toFixed(2)}</td>
            <td>${Number(stock.volume).toLocaleString('en-US')}</td>
            <td>$${Number(stock.marketCap).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}</td>
            <td>$${stock.openingPrice.toFixed(2)}</td>
            <td>$${stock.high.toFixed(2)}</td>
            <td>$${stock.low.toFixed(2)}</td>
        `;

        stockMarketBody.appendChild(row);
    });
}

function updateStockDropdown() {
    const selectedValue = stockSelect.value;

    stockSelect.innerHTML = '<option value="">Select a stock</option>';

    stocks.forEach((stock) => {
        const option = document.createElement('option');
        option.value = stock.ticker;
        option.textContent = `${stock.company} (${stock.ticker})`;
        stockSelect.appendChild(option);
    });

    if (stocks.some((stock) => stock.ticker === selectedValue)) {
        stockSelect.value = selectedValue;
    }

    updateStockPrice();
}

stockSelect.addEventListener("change", updateStockPrice);

const buyButton = document.getElementById("buy-button");
const tradeMessage = document.getElementById("trade-message");
const stockQuantity = document.getElementById("stock-quantity");

// -------------------------------
// BUY STOCK
// -------------------------------

buyButton.addEventListener("click", async function() {
    const selectedStock = stockSelect.value;
    const quantity = Number(stockQuantity.value);

    if (!selectedStock) {
        tradeMessage.textContent = "Please select a stock.";
        return;
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
        tradeMessage.textContent = "Please enter a valid whole number of shares.";
        return;
    }

    try {
        const response = await fetch("/trade/buy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ticker: selectedStock,
                shares: quantity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            tradeMessage.textContent = data.error || "Purchase failed.";
            return;
        }

        await loadAccountData();

        tradeMessage.textContent = data.message;
        stockQuantity.value = "";

    } catch (error) {
        console.error("Purchase error:", error);
        tradeMessage.textContent = "Unable to complete purchase.";
    }
});

// -------------------------------
// SELL STOCK
// -------------------------------

const sellButton = document.getElementById("sell-button");

sellButton.addEventListener("click", async function() {
    const selectedStock = stockSelect.value;
    const quantity = Number(stockQuantity.value);

    if (!selectedStock) {
        tradeMessage.textContent = "Please select a stock.";
        return;
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
        tradeMessage.textContent = "Please enter a valid whole number of shares.";
        return;
    }

    try {
        const response = await fetch("/trade/sell", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ticker: selectedStock,
                shares: quantity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            tradeMessage.textContent = data.error || "Sale failed.";
            return;
        }

        await loadAccountData();

        tradeMessage.textContent = data.message;
        stockQuantity.value = "";

    } catch (error) {
        console.error("Sale error:", error);
        tradeMessage.textContent = "Unable to complete sale.";
    }
});

const cancelButton = document.getElementById("cancel-button");

cancelButton.addEventListener("click", function() {
    stockSelect.value = "";
    stockQuantity.value = "";
    marketPrice.textContent = "$0.00";
    tradeMessage.textContent = "";
});

const portfolioBody = document.getElementById("portfolio-body");

let portfolio = {};
let cashBalance = 10000.00;
let transactions = [];

function updateTransactions() {
    const transactionBody = document.getElementById("transaction-body");

    transactionBody.innerHTML = "";

    if (transactions.length === 0) {
        transactionBody.innerHTML =
            '<tr><td colspan="5">No transactions yet.</td></tr>';
        return;
    }

    transactions.forEach(function(transaction) {
        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + transaction.stock + "</td>" +
            "<td>" + transaction.type + "</td>" +
            "<td>" + transaction.shares + "</td>" +
            "<td>$" + transaction.price.toFixed(2) + "</td>" +
            "<td>$" + transaction.total.toFixed(2) + "</td>";

        transactionBody.appendChild(row);
    });
}

function updatePortfolio() {
    portfolioBody.innerHTML = "";

    let portfolioValue = 0;

    const stocks = Object.keys(portfolio);

    if (stocks.length === 0) {
        portfolioBody.innerHTML =
            '<tr><td colspan="4">No stocks owned.</td></tr>';

        document.getElementById("portfolio-balance").textContent = "$0.00";

        return;
    }

    stocks.forEach(function(stock) {
        const shares = portfolio[stock];
        const price = stockPrices[stock];
        const totalValue = shares * price;

        portfolioValue += totalValue;

        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + stock + "</td>" +
            "<td>" + shares + "</td>" +
            "<td>$" + price.toFixed(2) + "</td>" +
            "<td>$" + totalValue.toFixed(2) + "</td>";

        portfolioBody.appendChild(row);
    });

    document.getElementById("portfolio-balance").textContent =
        "$" + portfolioValue.toFixed(2);
}
    // -------------------------------
// LOAD ACCOUNT DATA FROM DATABASE
// -------------------------------

async function loadAccountData() {
    try {
        const response = await fetch("/account-data");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load account data.");
        }

        cashBalance = data.cashBalance;

        portfolio = {};

        data.holdings.forEach(function(holding) {
            portfolio[holding.ticker] = holding.sharesOwned;
            stockPrices[holding.ticker] = holding.currentPrice;
        });

        transactions = data.transactions.map(function(transaction) {
            return {
                stock: transaction.stock,
                type: transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1),
                shares: transaction.shares,
                price: transaction.price,
                total: transaction.total
            };
        });

        document.getElementById("cash-balance").textContent =
            "$" + cashBalance.toFixed(2);

        updatePortfolio();
        updateTransactions();

    } catch (error) {
        console.error("Account data error:", error);
        tradeMessage.textContent = error.message;
    }
}

const cashAmount = document.getElementById("cash-amount");
const depositButton = document.getElementById("deposit-button");
const withdrawButton = document.getElementById("withdraw-button");
const cashMessage = document.getElementById("cash-message");

depositButton.addEventListener("click", async function() {
    const amount = Number(cashAmount.value);

    if (!Number.isFinite(amount) || amount <= 0) {
        cashMessage.textContent = "Please enter a valid amount.";
        return;
    }

    try {
        const response = await fetch("/cash/deposit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ amount: amount })
        });

        const data = await response.json();

        if (!response.ok) {
            cashMessage.textContent = data.error || "Deposit failed.";
            return;
        }

        await loadAccountData();

        cashMessage.textContent =
            "Deposited $" + amount.toFixed(2) + ".";

        cashAmount.value = "";

    } catch (error) {
        console.error("Deposit error:", error);
        cashMessage.textContent = "Unable to process deposit.";
    }
});

withdrawButton.addEventListener("click", async function() {
    const amount = Number(cashAmount.value);

    if (!Number.isFinite(amount) || amount <= 0) {
        cashMessage.textContent = "Please enter a valid amount.";
        return;
    }

    try {
        const response = await fetch("/cash/withdraw", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ amount: amount })
        });

        const data = await response.json();

        if (!response.ok) {
            cashMessage.textContent = data.error || "Withdrawal failed.";
            return;
        }

        await loadAccountData();

        cashMessage.textContent =
            "Withdrew $" + amount.toFixed(2) + ".";

        cashAmount.value = "";

    } catch (error) {
        console.error("Withdrawal error:", error);
        cashMessage.textContent = "Unable to process withdrawal.";
    }
});

loadStocks();
setInterval(loadStocks, 10000);
