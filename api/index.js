const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is Live!' });
});

app.get('/', (req, res) => {
  res.send('Stock Dashboard Server is running!');
});

module.exports = app;
