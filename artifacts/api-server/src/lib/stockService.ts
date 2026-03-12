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
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  macdLine: number;
  signalLine: number;
  macdHistogram: number;
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
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  isTouchingLowerBand: boolean;
  isSuperBuySignal: boolean;
  macdLine: number;
  signalLine: number;
  macdHistogram: number;
  historicalPrices: PricePoint[];
  lastUpdated: string;
  volume: number;
  currency: string;
}

// ── Technical indicator helpers ────────────────────────────────────────────

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
  return Math.round((100 - 100 / (1 + avgGain / avgLoss)) * 100) / 100;
}

function calcSMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(closes.length - period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calcEMA(closes: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emas: number[] = [];
  let ema = closes[0];
  emas.push(ema);
  for (let i = 1; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    emas.push(ema);
  }
  return emas;
}

function calcBollingerBands(
  closes: number[],
  period = 20,
  multiplier = 2
): { upper: number; middle: number; lower: number } | null {
  if (closes.length < period) return null;
  const slice = closes.slice(closes.length - period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((acc, val) => acc + (val - sma) ** 2, 0) / period;
  const stdDev = Math.sqrt(variance);
  return {
    upper: sma + multiplier * stdDev,
    middle: sma,
    lower: sma - multiplier * stdDev,
  };
}

function calcMACD(
  closes: number[]
): { macdLine: number; signalLine: number; histogram: number } {
  if (closes.length < 35) {
    return { macdLine: 0, signalLine: 0, histogram: 0 };
  }
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdValues = ema12.map((v, i) => v - ema26[i]);
  const signalValues = calcEMA(macdValues, 9);
  const last = macdValues.length - 1;
  const macdLine = Math.round(macdValues[last] * 10000) / 10000;
  const signalLine = Math.round(signalValues[last] * 10000) / 10000;
  return {
    macdLine,
    signalLine,
    histogram: Math.round((macdLine - signalLine) * 10000) / 10000,
  };
}

// ── Historical point builder ───────────────────────────────────────────────

function buildHistoricalPoints(
  sorted: Array<{ date: Date; close: number }>
): PricePoint[] {
  const closes = sorted.map((d) => d.close);

  // Pre-compute rolling EMAs for MACD over the full series
  const ema12All = calcEMA(closes, 12);
  const ema26All = calcEMA(closes, 26);
  const macdAll = ema12All.map((v, i) => v - ema26All[i]);
  const signalAll = calcEMA(macdAll, 9);

  const last30 = sorted.slice(-30);

  return last30.map((d) => {
    const globalIdx = sorted.indexOf(d);
    const closesUpTo = closes.slice(0, globalIdx + 1);

    const sma = calcSMA(closesUpTo, 20) ?? d.close;
    const dev = sma ? ((d.close - sma) / sma) * 100 : 0;

    const bb = calcBollingerBands(closesUpTo, 20) ?? { upper: sma, middle: sma, lower: sma };

    const macdLine = Math.round(macdAll[globalIdx] * 10000) / 10000;
    const signalLine = Math.round(signalAll[globalIdx] * 10000) / 10000;

    return {
      date: d.date.toISOString().split("T")[0],
      close: Math.round(d.close * 100) / 100,
      ma20: Math.round(sma * 100) / 100,
      deviationPercent: Math.round(dev * 100) / 100,
      bbUpper: Math.round(bb.upper * 100) / 100,
      bbMiddle: Math.round(bb.middle * 100) / 100,
      bbLower: Math.round(bb.lower * 100) / 100,
      macdLine,
      signalLine,
      macdHistogram: Math.round((macdLine - signalLine) * 10000) / 10000,
    };
  });
}

// ── Fetch ──────────────────────────────────────────────────────────────────

async function fetchStockData(symbol: string): Promise<StockData> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // need 90 days for MACD(26+9)

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
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((d) => ({ date: d.date, close: d.close as number }));

  const closes = sorted.map((d) => d.close);

  const rsi14 = calcRSI(closes);
  const rsiSignal: "buy" | "sell" | "neutral" =
    rsi14 < 30 ? "buy" : rsi14 >= 70 ? "sell" : "neutral";

  const ma20Val = calcSMA(closes, 20) ?? closes[closes.length - 1] ?? 0;
  const currentPrice = (quote as any).regularMarketPrice ?? closes[closes.length - 1] ?? 0;
  const previousClose = (quote as any).regularMarketPreviousClose ?? closes[closes.length - 2] ?? 0;
  const changePercent = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
  const ma20Deviation = ma20Val ? ((currentPrice - ma20Val) / ma20Val) * 100 : 0;

  const bb = calcBollingerBands(closes, 20) ?? { upper: ma20Val, middle: ma20Val, lower: ma20Val };
  const isTouchingLowerBand = currentPrice <= bb.lower;
  const isSuperBuySignal = isTouchingLowerBand && rsi14 < 30;

  const macd = calcMACD(closes);

  const historicalPrices = buildHistoricalPoints(sorted);
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
    bbUpper: Math.round(bb.upper * 100) / 100,
    bbMiddle: Math.round(bb.middle * 100) / 100,
    bbLower: Math.round(bb.lower * 100) / 100,
    isTouchingLowerBand,
    isSuperBuySignal,
    macdLine: macd.macdLine,
    signalLine: macd.signalLine,
    macdHistogram: macd.histogram,
    historicalPrices,
    lastUpdated: new Date().toISOString(),
    volume: (quote as any).regularMarketVolume ?? 0,
    currency,
  };
}

// ── Cache & exports ────────────────────────────────────────────────────────

let cache: { data: StockData[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function getAllStocks(): Promise<StockData[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) return cache.data;

  const results = await Promise.allSettled(SYMBOLS.map((s) => fetchStockData(s)));
  const data = results
    .filter((r): r is PromiseFulfilledResult<StockData> => r.status === "fulfilled")
    .map((r) => r.value);

  results
    .filter((r) => r.status === "rejected")
    .forEach((r) => console.error("Failed to fetch symbol:", (r as PromiseRejectedResult).reason));

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
