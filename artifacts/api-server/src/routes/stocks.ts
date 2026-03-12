import { Router, type IRouter } from "express";
import { getAllStocks, getStockBySymbol } from "../lib/stockService.js";

const router: IRouter = Router();

router.get("/stocks", async (_req, res) => {
  try {
    const stocks = await getAllStocks();
    const superBuySignals = stocks
      .filter((s) => s.isSuperBuySignal)
      .map((s) => s.displaySymbol);
    const goldenCrossSignals = stocks
      .filter((s) => s.crossSignal === "golden")
      .map((s) => s.displaySymbol);
    const deadCrossSignals = stocks
      .filter((s) => s.crossSignal === "dead")
      .map((s) => s.displaySymbol);
    const bestTimingSignals = stocks
      .filter((s) => s.isBestTiming)
      .map((s) => s.displaySymbol);
    res.json({
      stocks,
      lastUpdated: new Date().toISOString(),
      superBuySignals,
      goldenCrossSignals,
      deadCrossSignals,
      bestTimingSignals,
    });
  } catch (err) {
    console.error("Failed to fetch stocks:", err);
    res.status(500).json({ error: "fetch_failed", message: "Failed to fetch stock data" });
  }
});

router.get("/stocks/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await getStockBySymbol(symbol.toUpperCase());
    if (!stock) {
      res.status(404).json({ error: "not_found", message: `Symbol ${symbol} not found` });
      return;
    }
    res.json(stock);
  } catch (err) {
    console.error("Failed to fetch stock:", err);
    res.status(500).json({ error: "fetch_failed", message: "Failed to fetch stock data" });
  }
});

export default router;
