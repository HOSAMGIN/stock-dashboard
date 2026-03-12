import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

const SYMBOLS = [
  "SOXL",
  "TSLL",
  "NVDA",
  "TSLA",
  "000660.KS",
  "005930.KS",
  "005380.KS",
  "^KS11",
  "^GSPC",
  "^NDX",
] as const;
type Symbol = (typeof SYMBOLS)[number];

const SYMBOL_NAMES: Record<Symbol, string> = {
  SOXL: "Direxion Daily Semiconductors Bull 3X",
  TSLL: "Direxion Daily TSLA Bull 2X",
  NVDA: "NVIDIA Corporation",
  TSLA: "Tesla, Inc.",
  "000660.KS": "SK하이닉스",
  "005930.KS": "삼성전자",
  "005380.KS": "현대자동차",
  "^KS11": "KOSPI",
  "^GSPC": "S&P 500",
  "^NDX": "NASDAQ 100",
};

const SYMBOL_DISPLAY: Record<Symbol, string> = {
  SOXL: "SOXL",
  TSLL: "TSLL",
  NVDA: "NVDA",
  TSLA: "TSLA",
  "000660.KS": "하이닉스",
  "005930.KS": "삼성전자",
  "005380.KS": "현대차",
  "^KS11": "KOSPI",
  "^GSPC": "S&P500",
  "^NDX": "NDX100",
};

export type Category = "us-stocks" | "kr-stocks" | "indices";

const SYMBOL_CATEGORY: Record<Symbol, Category> = {
  SOXL: "us-stocks",
  TSLL: "us-stocks",
  NVDA: "us-stocks",
  TSLA: "us-stocks",
  "000660.KS": "kr-stocks",
  "005930.KS": "kr-stocks",
  "005380.KS": "kr-stocks",
  "^KS11": "indices",
  "^GSPC": "indices",
  "^NDX": "indices",
};

export interface PricePoint {
  date: string;
  close: number;
  ma20: number;
  deviationPercent: number;
}

export interface StockData {
  symbol: string;
  displaySymbol: string;
  name: string;
  category: Category;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  rsi14: number;
  rsiSignal: "buy" | "sell" | "neutral";
  ma20: number;
  ma20DeviationPercent: number;
  historicalPrices: PricePoint[];
  lastUpdated: string;
  volume: number;
  currency: string;
}

function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 100) / 100;
}

function calcMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(closes.length - period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

async function fetchStockData(symbol: string): Promise<StockData> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);

  const [quote, historical] = await Promise.all([
    yahooFinance.quote(symbol),
    yahooFinance.historical(symbol, {
      period1: startDate.toISOString().split("T")[0],
      period2: endDate.toISOString().split("T")[0],
      interval: "1d",
    }),
  ]);

  const sorted = historical
    .filter((d) => d.close != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const closes = sorted.map((d) => d.close as number);

  const rsi14 = calcRSI(closes);
  const rsiSignal: "buy" | "sell" | "neutral" =
    rsi14 < 30 ? "buy" : rsi14 >= 70 ? "sell" : "neutral";

  const ma20Val = calcMA(closes, 20) ?? (closes[closes.length - 1] || 0);
  const currentPrice = quote.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
  const previousClose = quote.regularMarketPreviousClose ?? closes[closes.length - 2] ?? 0;
  const changePercent = previousClose
    ? ((currentPrice - previousClose) / previousClose) * 100
    : 0;
  const ma20Deviation = ma20Val ? ((currentPrice - ma20Val) / ma20Val) * 100 : 0;

  const last30 = sorted.slice(-30);
  const historicalPrices: PricePoint[] = last30.map((d) => {
    const closesUpToNow = sorted
      .slice(0, sorted.indexOf(d) + 1)
      .map((x) => x.close as number);
    const ma = calcMA(closesUpToNow, 20);
    const maVal = ma ?? (closesUpToNow[closesUpToNow.length - 1] || 0);
    const dev = maVal ? (((d.close as number) - maVal) / maVal) * 100 : 0;
    return {
      date: d.date.toISOString().split("T")[0],
      close: Math.round((d.close as number) * 100) / 100,
      ma20: Math.round(maVal * 100) / 100,
      deviationPercent: Math.round(dev * 100) / 100,
    };
  });

  const currency = (quote as any).currency ?? (symbol.endsWith(".KS") ? "KRW" : "USD");

  return {
    symbol,
    displaySymbol: SYMBOL_DISPLAY[symbol as Symbol] ?? symbol,
    name: SYMBOL_NAMES[symbol as Symbol] ?? symbol,
    category: SYMBOL_CATEGORY[symbol as Symbol] ?? "us-stocks",
    currentPrice: Math.round(currentPrice * 100) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    rsi14,
    rsiSignal,
    ma20: Math.round(ma20Val * 100) / 100,
    ma20DeviationPercent: Math.round(ma20Deviation * 100) / 100,
    historicalPrices,
    lastUpdated: new Date().toISOString(),
    volume: (quote as any).regularMarketVolume ?? 0,
    currency,
  };
}

let cache: { data: StockData[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function getAllStocks(): Promise<StockData[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }
  const results = await Promise.allSettled(SYMBOLS.map((s) => fetchStockData(s)));
  const data = results
    .filter((r): r is PromiseFulfilledResult<StockData> => r.status === "fulfilled")
    .map((r) => r.value);

  if (results.some((r) => r.status === "rejected")) {
    const rejected = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    rejected.forEach((r, i) => console.error(`Failed to fetch symbol:`, r.reason));
  }

  cache = { data, fetchedAt: now };
  return data;
}

export async function getStockBySymbol(symbol: string): Promise<StockData | null> {
  const all = await getAllStocks();
  return (
    all.find(
      (s) =>
        s.symbol === symbol ||
        s.symbol.toUpperCase() === symbol.toUpperCase() ||
        s.displaySymbol === symbol
    ) ?? null
  );
}

export { SYMBOLS };
