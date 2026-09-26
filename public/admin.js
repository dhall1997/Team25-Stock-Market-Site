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

let stocks = [];

createStockBtn.addEventListener("click", function() {
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

    const tickerExists = stocks.some(function(stock) {
        return stock.ticker === ticker;
    });

    if (tickerExists) {
        stockMessage.textContent =
            "A stock with that ticker symbol already exists.";
        return;
    }

    const newStock = {
        company: company,
        ticker: ticker,
        volume: volume,
        price: price
    };

    stocks.push(newStock);

    stockMessage.textContent =
        company + " (" + ticker + ") created successfully.";

    companyName.value = "";
    tickerSymbol.value = "";
    stockVolume.value = "";
    initialPrice.value = "";

    console.log(stocks);
});


// -------------------------------
// MARKET HOURS
// -------------------------------

let marketHours = {
    open: "07:00",
    close: "17:00"
};

updateHoursBtn.addEventListener("click", function() {
    const opening = openTime.value;
    const closing = closeTime.value;

    if (!opening || !closing) {
        hoursMessage.textContent =
            "Please enter an opening and closing time.";
        return;
    }

    if (opening >= closing) {
        hoursMessage.textContent =
            "Opening time must be before closing time.";
        return;
    }

    marketHours.open = opening;
    marketHours.close = closing;

    hoursMessage.textContent =
        "Market hours updated to " +
        opening + " - " + closing + ".";

    console.log(marketHours);
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