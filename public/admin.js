// -------------------------------
// ADMIN FUNCTIONALITY
// -------------------------------

// Element references
const logoutBtn = document.getElementById("logoutBtn");

const companyName = document.getElementById("companyName");
const tickerSymbol = document.getElementById("tickerSymbol");
const stockVolume = document.getElementById("stockVolume");
const initialPrice = document.getElementById("initialPrice");
const createStockBtn = document.getElementById("createStockBtn");
const stockMessage = document.getElementById("stockMessage");

const openTime = document.getElementById("openTime");
const closeTime = document.getElementById("closeTime");
const updateHoursBtn = document.getElementById("updateHoursBtn");
const hoursMessage = document.getElementById("hoursMessage");

const tradingDays = document.getElementById("tradingDays");
const holidays = document.getElementById("holidays");
const updateScheduleBtn = document.getElementById("updateScheduleBtn");
const scheduleMessage = document.getElementById("scheduleMessage");


// -------------------------------
// STOCK CREATION
// -------------------------------

createStockBtn.addEventListener("click", async function() {
    const company = companyName.value.trim();
    const ticker = tickerSymbol.value.trim().toUpperCase();
    const volume = Number(stockVolume.value);
    const price = Number(initialPrice.value);

    if (!company || !ticker) {
        stockMessage.textContent =
            "Please enter a company name and ticker symbol.";
        return;
    }

    if (!volume || volume <= 0) {
        stockMessage.textContent =
            "Please enter a valid stock volume.";
        return;
    }

    if (!price || price <= 0) {
        stockMessage.textContent =
            "Please enter a valid initial price.";
        return;
    }

    try {
        const response = await fetch("/stocks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                company: company,
                ticker: ticker,
                volume: volume,
                price: price
            })
        });

        const data = await response.json();

        if (!response.ok) {
            stockMessage.textContent =
                data.error || "Unable to create stock.";
            return;
        }

        stockMessage.textContent =
            data.company + " (" + data.ticker +
            ") created successfully.";

        companyName.value = "";
        tickerSymbol.value = "";
        stockVolume.value = "";
        initialPrice.value = "";

        console.log("Stock created:", data);

    } catch (error) {
        console.error(error);

        stockMessage.textContent =
            "Unable to connect to the server.";
    }
});

// -------------------------------
// MARKET SCHEDULE
// -------------------------------

let marketSchedule = {
    tradingDays: "Monday - Friday",
    holidays: ""
};

updateScheduleBtn.addEventListener("click", function() {
    const days = tradingDays.value.trim();
    const holidayList = holidays.value.trim();

    if (!days) {
        scheduleMessage.textContent =
            "Please enter the trading days.";
        return;
    }

    marketSchedule.tradingDays = days;
    marketSchedule.holidays = holidayList;

    scheduleMessage.textContent =
        "Market schedule updated successfully.";

    console.log(marketSchedule);
});


// -------------------------------
// LOGOUT
// -------------------------------

logoutBtn.addEventListener("click", function() {
    window.location.href = "index.html";
});