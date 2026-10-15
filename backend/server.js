
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.resolve(__dirname, '..', 'public')));

const stocks = [
  {
    company: 'Apple Inc.',
    ticker: 'AAPL',
    volume: 15000000000,
    openingPrice: 225.00,
    price: 225.00,
    high: 225.00,
    low: 225.00
  },
  {
    company: 'Microsoft Corporation',
    ticker: 'MSFT',
    volume: 7430000000,
    openingPrice: 510.00,
    price: 510.00,
    high: 510.00,
    low: 510.00
  },
  {
    company: 'Alphabet Inc.',
    ticker: 'GOOGL',
    volume: 12000000000,
    openingPrice: 245.00,
    price: 245.00,
    high: 245.00,
    low: 245.00
  },
  {
    company: 'Amazon.com Inc.',
    ticker: 'AMZN',
    volume: 10500000000,
    openingPrice: 220.00,
    price: 220.00,
    high: 220.00,
    low: 220.00
  }
];

// Gradually change each stock price every 10 seconds.
setInterval(() => {
  stocks.forEach((stock) => {
    const changePercent = (Math.random() * 0.8) - 0.4;
    const change = stock.price * (changePercent / 100);

    stock.price = Math.max(
      0.01,
      Math.round((stock.price + change) * 100) / 100
    );

    stock.high = Math.max(stock.high, stock.price);
    stock.low = Math.min(stock.low, stock.price);
  });
}, 10000);

// Return all stocks.
app.get('/stocks', (req, res) => {
  const stockList = stocks.map((stock) => ({
    ...stock,
    marketCap: Math.round(stock.price * stock.volume * 100) / 100
  }));

  res.json(stockList);
});

// Create a stock for future admin-page integration.
app.post('/stocks', (req, res) => {
  const { company, ticker, volume, price } = req.body;

  if (
    typeof company !== 'string' ||
    !company.trim() ||
    typeof ticker !== 'string' ||
    !/^[A-Za-z]{1,10}$/.test(ticker.trim()) ||
    !Number.isFinite(Number(volume)) ||
    Number(volume) <= 0 ||
    !Number.isFinite(Number(price)) ||
    Number(price) <= 0
  ) {
    return res.status(400).json({
      error: 'Enter a company name, valid ticker, positive volume, and positive price.'
    });
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  if (stocks.some((stock) => stock.ticker === normalizedTicker)) {
    return res.status(409).json({
      error: 'That ticker already exists.'
    });
  }

  const initialPrice = Math.round(Number(price) * 100) / 100;

  const newStock = {
    company: company.trim(),
    ticker: normalizedTicker,
    volume: Math.floor(Number(volume)),
    openingPrice: initialPrice,
    price: initialPrice,
    high: initialPrice,
    low: initialPrice
  };

  stocks.push(newStock);

  res.status(201).json({
    ...newStock,
    marketCap: Math.round(newStock.price * newStock.volume * 100) / 100
  });
});

// Serve the customer page.
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

const port = 3000;

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
