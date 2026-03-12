import { Router } from 'express';
// @ts-ignore
import { getStockData, getStockHistory } from '../lib/stockService';

const router = Router();

// @ts-ignore
router.get('/', async (_req, res) => {
  try {
    const data = await getStockData();
    // @ts-ignore
    res.json(data);
  } catch (error) {
    // @ts-ignore
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// @ts-ignore
router.get('/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getStockHistory(symbol);
    // @ts-ignore
    res.json(data);
  } catch (error) {
    // @ts-ignore
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

export default router;
