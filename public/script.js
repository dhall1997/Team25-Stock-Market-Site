
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
loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    document.getElementById("dashboard-username").textContent = username;

    loginScreen.style.display = "none";
    dashboardScreen.style.display = "block";
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

    document.getElementById("account-message").textContent =
        "Account created for " + fullName + "!";
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

const stockPrices = {
    AAPL: 150.00,
    MSFT: 420.00,
    GOOGL: 180.00,
    AMZN: 230.00
};

stockSelect.addEventListener("change", function() {
    const selectedStock = stockSelect.value;

    if (selectedStock) {
        marketPrice.textContent = "$" + stockPrices[selectedStock].toFixed(2);
    } else {
        marketPrice.textContent = "$0.00";
    }
});

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

    cashAmount.value = "";
});
