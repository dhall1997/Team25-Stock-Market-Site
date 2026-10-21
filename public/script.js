
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

createAccountForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName = document.getElementById("full-name").value;
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;

    localStorage.setItem("stockMarketUsername", username);
    localStorage.setItem("stockMarketPassword", password);

    document.getElementById("account-message").textContent =
        "Account created for " + fullName + "!";

    createAccountForm.reset();
});

// -------------------------------
// LOGOUT
// -------------------------------
logoutButton.addEventListener("click", function() {
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

async function loadStocks() {
    try {
        const response = await fetch("/stocks");

        if (!response.ok) {
            throw new Error("Unable to load stocks.");
        }

        const stocks = await response.json();

        stockSelect.innerHTML =
            '<option value="">Select a stock</option>';

        stocks.forEach(function(stock) {
            stockPrices[stock.ticker] = stock.price;

            const option = document.createElement("option");
            option.value = stock.ticker;
            option.textContent =
                stock.company + " (" + stock.ticker + ")";

            stockSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading stocks:", error);
    }
}

loadStocks();

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

buyButton.addEventListener("click", function() {
    const selectedStock = stockSelect.value;
    const quantity = Number(stockQuantity.value);

    if (!selectedStock) {
        tradeMessage.textContent = "Please select a stock.";
        return;
    }

    if (!quantity || quantity < 1) {
        tradeMessage.textContent = "Please enter a valid quantity.";
        return;
    }

    const price = stockPrices[selectedStock];
    const total = price * quantity;

    if (total > cashBalance) {
        tradeMessage.textContent = "Not enough cash to complete this purchase.";
        return;
    }

    cashBalance -= total;
    document.getElementById("cash-balance").textContent =
        "$" + cashBalance.toFixed(2);

    tradeMessage.textContent =
        "Bought " + quantity + " shares of " + selectedStock +
        " for $" + total.toFixed(2) + ".";

    if (portfolio[selectedStock]) {
        portfolio[selectedStock] += quantity;
    } else {
        portfolio[selectedStock] = quantity;
    }

    updatePortfolio();

    transactions.push({
        stock: selectedStock,
        type: "Buy",
        shares: quantity,
        price: price,
        total: total
    });

    updateTransactions();
});

const sellButton = document.getElementById("sell-button");

sellButton.addEventListener("click", function() {
    const selectedStock = stockSelect.value;
    const quantity = Number(stockQuantity.value);

    if (!selectedStock) {
        tradeMessage.textContent = "Please select a stock.";
        return;
    }

    if (!quantity || quantity < 1) {
        tradeMessage.textContent = "Please enter a valid quantity.";
        return;
    }

    const price = stockPrices[selectedStock];
    const total = price * quantity;

    tradeMessage.textContent =
        "Sold " + quantity + " shares of " + selectedStock +
        " for $" + total.toFixed(2) + ".";

    if (!portfolio[selectedStock]) {
        tradeMessage.textContent = "You do not own any " + selectedStock + " shares.";
        return;
    }

    if (quantity > portfolio[selectedStock]) {
        tradeMessage.textContent = "You do not own enough " + selectedStock + " shares.";
        return;
    }

    portfolio[selectedStock] -= quantity;

    cashBalance += total;
    document.getElementById("cash-balance").textContent =
        "$" + cashBalance.toFixed(2);

    if (portfolio[selectedStock] === 0) {
        delete portfolio[selectedStock];
    }

    updatePortfolio();

    transactions.push({
        stock: selectedStock,
        type: "Sell",
        shares: quantity,
        price: price,
        total: total
    });

    updateTransactions();
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

const cashAmount = document.getElementById("cash-amount");
const depositButton = document.getElementById("deposit-button");
const withdrawButton = document.getElementById("withdraw-button");
const cashMessage = document.getElementById("cash-message");

depositButton.addEventListener("click", function() {
    const amount = Number(cashAmount.value);

    if (!amount || amount <= 0) {
        cashMessage.textContent = "Please enter a valid amount.";
        return;
    }

    cashBalance += amount;

    document.getElementById("cash-balance").textContent =
        "$" + cashBalance.toFixed(2);

    cashMessage.textContent =
        "Deposited $" + amount.toFixed(2) + ".";

    transactions.push({
        stock: "Cash",
        type: "Deposit",
        shares: "-",
        price: 0,
        total: amount
    });

    updateTransactions();

    cashAmount.value = "";
});

withdrawButton.addEventListener("click", function() {
    const amount = Number(cashAmount.value);

    if (!amount || amount <= 0) {
        cashMessage.textContent = "Please enter a valid amount.";
        return;
    }

    if (amount > cashBalance) {
        cashMessage.textContent = "You do not have enough cash.";
        return;
    }

    cashBalance -= amount;

    document.getElementById("cash-balance").textContent =
        "$" + cashBalance.toFixed(2);

    cashMessage.textContent =
        "Withdrew $" + amount.toFixed(2) + ".";

    transactions.push({
        stock: "Cash",
        type: "Withdrawal",
        shares: "-",
        price: 0,
        total: amount
    });

    updateTransactions();

    cashAmount.value = "";
});

loadStocks();
setInterval(loadStocks, 10000);

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginMessage = document.getElementById("login-message");

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
            loginMessage.textContent = data.error;
            return;
        }

        if (data.role === "admin") {
            window.location.href = "/admin.html";
            return;
        }

        document.getElementById("dashboard-username").textContent =
            data.username;

        loginScreen.style.display = "none";
        dashboardScreen.style.display = "block";

    } catch (error) {
        loginMessage.textContent = "Unable to connect to the server.";
    }
});