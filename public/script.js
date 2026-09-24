const loginForm = document.getElementById("login-form");
const createAccountForm = document.getElementById("create-account-form");

const loginScreen = document.getElementById("login-screen");
const createAccountScreen = document.getElementById("create-account-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

const createAccountLink = document.getElementById("create-account-link");
const backToLogin = document.getElementById("back-to-login");

loginForm.addEventListener("submit", function(event) {
event.preventDefault();


const username = document.getElementById("username").value;

document.getElementById("dashboard-username").textContent = username;

loginScreen.style.display = "none";
dashboardScreen.style.display = "block";


});

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

createAccountForm.addEventListener("submit", function(event) {
event.preventDefault();

const fullName = document.getElementById("full-name").value;

document.getElementById("account-message").textContent =
    "Account created for " + fullName + "!";

});

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

    tradeMessage.textContent =
        "Bought " + quantity + " shares of " + selectedStock +
        " for $" + total.toFixed(2) + ".";
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
});

const cancelButton = document.getElementById("cancel-button");

cancelButton.addEventListener("click", function() {
    stockSelect.value = "";
    stockQuantity.value = "";
    marketPrice.textContent = "$0.00";
    tradeMessage.textContent = "";
});

