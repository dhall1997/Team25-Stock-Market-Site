
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

const adminStockList = document.getElementById("adminStockList");
const manageStockMessage = document.getElementById("manageStockMessage");

const openTime = document.getElementById("openTime");
const closeTime = document.getElementById("closeTime");
const updateHoursBtn = document.getElementById("updateHoursBtn");
const hoursMessage = document.getElementById("hoursMessage");

const tradingDays = document.getElementById("tradingDays");
const holidays = document.getElementById("holidays");
const updateScheduleBtn = document.getElementById("updateScheduleBtn");
const scheduleMessage = document.getElementById("scheduleMessage");


// -------------------------------
// LOAD STOCKS FOR ADMIN
// -------------------------------

async function loadAdminStocks() {
    try {
        const response = await fetch("/admin/stocks");
        const stocks = await response.json();

        if (!response.ok) {
            throw new Error(stocks.error || "Unable to load stocks.");
        }

        adminStockList.textContent = "";

        if (stocks.length === 0) {
            adminStockList.textContent = "No stocks found.";
            return;
        }

        const table = document.createElement("table");

        const header = document.createElement("tr");

        [
            "Company",
            "Ticker",
            "Volume",
            "Current Price",
            "Status",
            "Actions"
        ].forEach(function(label) {
            const th = document.createElement("th");
            th.textContent = label;
            header.appendChild(th);
        });

        table.appendChild(header);

        stocks.forEach(function(stock) {
            const row = document.createElement("tr");

            const companyInput = document.createElement("input");
            companyInput.type = "text";
            companyInput.value = stock.company;

            const tickerInput = document.createElement("input");
            tickerInput.type = "text";
            tickerInput.value = stock.ticker;
            tickerInput.maxLength = 10;

            const volumeInput = document.createElement("input");
            volumeInput.type = "number";
            volumeInput.min = "1";
            volumeInput.step = "1";
            volumeInput.value = stock.volume;

            const priceInput = document.createElement("input");
            priceInput.type = "number";
            priceInput.min = "0.01";
            priceInput.step = "0.01";
            priceInput.value = stock.price;

            function addCell(content) {
                const cell = document.createElement("td");
                cell.appendChild(content);
                row.appendChild(cell);
            }

            addCell(companyInput);
            addCell(tickerInput);
            addCell(volumeInput);
            addCell(priceInput);

            const statusCell = document.createElement("td");
            statusCell.textContent = stock.isActive ? "Active" : "Inactive";
            row.appendChild(statusCell);

            const actionsCell = document.createElement("td");

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.textContent = "SAVE";

            saveButton.addEventListener("click", async function() {
                const company = companyInput.value.trim();
                const ticker = tickerInput.value.trim().toUpperCase();
                const volume = Number(volumeInput.value);
                const price = Number(priceInput.value);

                if (
                    !company ||
                    !/^[A-Za-z]{1,10}$/.test(ticker) ||
                    !Number.isSafeInteger(volume) ||
                    volume <= 0 ||
                    !Number.isFinite(price) ||
                    price <= 0
                ) {
                    manageStockMessage.textContent =
                        "Please enter valid stock information.";
                    return;
                }

                try {
                    const response = await fetch(
                        "/admin/stocks/" + stock.stockId,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                company: company,
                                ticker: ticker,
                                volume: volume,
                                price: price
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        manageStockMessage.textContent =
                            data.error || "Unable to update stock.";
                        return;
                    }

                    manageStockMessage.textContent =
                        data.ticker + " updated successfully.";

                    await loadAdminStocks();

                } catch (error) {
                    console.error(error);
                    manageStockMessage.textContent =
                        "Unable to connect to the server.";
                }
            });

            const statusButton = document.createElement("button");
            statusButton.type = "button";
            statusButton.textContent =
                stock.isActive ? "DEACTIVATE" : "REACTIVATE";

            statusButton.addEventListener("click", async function() {
                const newStatus = !stock.isActive;

                const confirmed = confirm(
                    newStatus
                        ? "Reactivate " + stock.ticker + "?"
                        : "Deactivate " + stock.ticker + "?"
                );

                if (!confirmed) {
                    return;
                }

                try {
                    const response = await fetch(
                        "/admin/stocks/" + stock.stockId + "/status",
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                isActive: newStatus
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        manageStockMessage.textContent =
                            data.error || "Unable to update stock status.";
                        return;
                    }

                    manageStockMessage.textContent =
                        data.ticker +
                        (newStatus
                            ? " reactivated successfully."
                            : " deactivated successfully.");

                    await loadAdminStocks();

                } catch (error) {
                    console.error(error);
                    manageStockMessage.textContent =
                        "Unable to connect to the server.";
                }
            });

            actionsCell.appendChild(saveButton);
            actionsCell.appendChild(document.createTextNode(" "));
            actionsCell.appendChild(statusButton);

            row.appendChild(actionsCell);
            table.appendChild(row);
        });

        adminStockList.appendChild(table);

    } catch (error) {
        console.error("Admin stock loading error:", error);

        adminStockList.textContent =
            "Unable to load stocks. Please refresh the page.";

    }
}


// -------------------------------
// STOCK CREATION
// -------------------------------

createStockBtn.addEventListener("click", async function() {
    const company = companyName.value.trim();
    const ticker = tickerSymbol.value.trim().toUpperCase();
    const volume = Number(stockVolume.value);
    const price = Number(initialPrice.value);

    if (
        !company ||
        !/^[A-Za-z]{1,10}$/.test(ticker) ||
        !Number.isSafeInteger(volume) ||
        volume <= 0 ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        stockMessage.textContent =
            "Please enter valid stock information.";
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

        await loadAdminStocks();

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


// -------------------------------
// INITIAL LOAD
// -------------------------------

loadAdminStocks();
