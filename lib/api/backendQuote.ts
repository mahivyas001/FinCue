// ─────────────────────────────────────────────
// FinCue — Backend Quote Service
// ─────────────────────────────────────────────
// Responsibilities:
//   1. Fetch stock quotes from FastAPI backend /api/v1/quote/{symbol}
//   2. Map raw API response → app's Stock shape
//   3. Cache results to protect backend rate limits
// ─────────────────────────────────────────────

import { API_CONFIG } from "@/constants/config";
import type { Stock, Market } from "@/types/stock";

interface BackendQuoteResponse {
  symbol: string;
  price: number;
  change_percent: number;
  source: string;
}

interface CacheEntry {
  data: Stock;
  fetchedAt: number; // Date.now() timestamp
}

const quoteCache = new Map<string, CacheEntry>();

/**
 * Infer market from symbol.
 */
function inferMarket(symbol: string): Market {
  const indianSymbols = ["RELIANCE", "INFY", "TCS", "HDFCBANK", "WIPRO"];
  return indianSymbols.includes(symbol.toUpperCase()) ? "IN" : "US";
}

/**
 * Map backend quote response to the app's Stock interface.
 */
function mapBackendQuoteToStock(raw: BackendQuoteResponse): Stock {
  const symbol = raw.symbol.toUpperCase();
  const price = raw.price;
  const changePercent = raw.change_percent;

  // Calculate change from price and change_percent
  const change = price - (price / (1 + changePercent / 100));

  return {
    symbol,
    name: symbol,
    price,
    change: parseFloat(change.toFixed(4)),
    changePercent,
    market: inferMarket(symbol),
    signal: "neutral",   // Backend engine will fill this in useAnalysis/backendApi
    confidence: 50,      // Backend engine will fill this
  };
}

/**
 * Fetch a single stock quote.
 * Returns cached data if within TTL.
 *
 * @param symbol  Ticker symbol e.g. "AAPL"
 * @param forceRefresh  Bypass cache
 */
export async function fetchStockQuote(
  symbol: string,
  forceRefresh = false
): Promise<Stock> {
  const upperSymbol = symbol.toUpperCase();

  // Cache check
  if (!forceRefresh) {
    const cached = quoteCache.get(upperSymbol);
    if (cached) {
      const age = Date.now() - cached.fetchedAt;
      if (age < API_CONFIG.QUOTE_CACHE_TTL_MS) {
        console.log(`[Quote Cache] HIT for ${upperSymbol} (age: ${Math.round(age / 1000)}s)`);
        return cached.data;
      }
      console.log(`[Quote Cache] STALE for ${upperSymbol} — refetching`);
    }
  }

  const url = `${API_CONFIG.BACKEND_URL}/api/v1/quote/${upperSymbol}`;
  console.log(`[Quote Fetch] Requesting quote from backend for ${upperSymbol}`);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Quote request failed: ${response.status} ${response.statusText}`
    );
  }

  const json: BackendQuoteResponse = await response.json();

  const stock = mapBackendQuoteToStock(json);

  quoteCache.set(upperSymbol, {
    data: stock,
    fetchedAt: Date.now(),
  });

  console.log(`[Quote Cache] SET for ${upperSymbol}`);

  return stock;
}

/**
 * Fetch multiple quotes sequentially.
 * respect rate limiting delays.
 */
export async function fetchMultipleQuotes(symbols: string[]): Promise<Stock[]> {
  const results: Stock[] = [];

  for (let i = 0; i < symbols.length; i++) {
    try {
      const stock = await fetchStockQuote(symbols[i]);
      results.push(stock);
    } catch (e) {
      console.error(`[Quote Fetch] Failed to fetch quote for ${symbols[i]}:`, e);
    }

    if (i < symbols.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RATE_LIMIT_DELAY));
    }
  }

  return results;
}

/**
 * Manually clear the cache.
 */
export function clearQuoteCache(symbol?: string): void {
  if (symbol) {
    quoteCache.delete(symbol.toUpperCase());
  } else {
    quoteCache.clear();
  }
}

export type StockQuote = Stock;
export const fetchQuote = fetchStockQuote;
