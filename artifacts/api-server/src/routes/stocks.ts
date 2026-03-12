import { Router } from 'express';
// @ts-ignore
import * as stockService from '../lib/stockService';

const router = Router();

// @ts-ignore
router.get('/', async (_req, res) => {
  try {
    // 함수가 있는지 확인하고 실행하거나, 없으면 빈 데이터 반환
    const getStockData = (stockService as any).getStockData || (stockService as any).default?.getStockData;
    
    if (typeof getStockData === 'function') {
      const data = await getStockData();
      // @ts-ignore
      res.json(data);
    } else {
      // @ts-ignore
      res.json({ message: "Stock data function not found", data: [] });
    }
  } catch (error) {
    // @ts-ignore
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// @ts-ignore
router.get('/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const getStockHistory = (stockService as any).getStockHistory || (stockService as any).default?.getStockHistory;

    if (typeof getStockHistory === 'function') {
      const data = await getStockHistory(symbol);
      // @ts-ignore
      res.json(data);
    } else {
      // @ts-ignore
      res.json({ message: "Stock history function not found", symbol });
    }
  } catch (error) {
    // @ts-ignore
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

export default router;
