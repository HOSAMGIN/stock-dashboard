const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stocks', async (req, res) => {
  try {
    const yahooFinance = require('yahoo-finance2').default;
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
    const results = await Promise.all(
      symbols.map(s => yahooFinance.quote(s))
    );
    res.json({ stocks: results, lastUpdated: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'fetch_failed', message: String(err) });
  }
});

module.exports = app;
