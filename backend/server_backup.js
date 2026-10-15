const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve frontend files using absolute path
app.use(express.static(path.resolve(__dirname, '..', 'public')));

// Fallback route
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

const port = 3000;

app.get('/stocks', (req, res) => {
  res.json({
    message: "Local backend is running!",
    price: 123.45,
    updated: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});



