// ─────────────────────────────────────────────
// FinCue — Alpha Vantage Service
// ─────────────────────────────────────────────
// Responsibilities:
//   1. Fetch stock quotes from Alpha Vantage
//   2. Map raw API response → app's Stock shape
//   3. Cache results to protect free-tier quota
//      (25 req/day, 5 req/min)
//
// AI / indicators are NOT handled here.
// This file only deals with price/quote data.
// ─────────────────────────────────────────────

import { API_CONFIG } from "@/constants/config";
import type {
  Stock,
  AVGlobalQuoteResponse,
  AVGlobalQuoteRaw,
  Market,
} from "@/types/stock";

// ── In-memory cache ───────────────────────────
// Simple Map keyed by symbol.
// Cleared when the app restarts (acceptable for now).
// Upgrade path: AsyncStorage for persistence.
interface CacheEntry {
  data: Stock;
  fetchedAt: number; // Date.now() timestamp
}

const quoteCache = new Map<string, CacheEntry>();

// ── Helpers ───────────────────────────────────

/**
 * Strip the trailing "%" and parse to float.
 * Alpha Vantage returns change percent as "1.2300%"
 */
function parsePercent(raw: string): number {
  return parseFloat(raw.replace("%", "").trim());
}

/**
 * Infer market from symbol.
 * Extend this as you add more exchanges.
 */
function inferMarket(symbol: string): Market {
  const indianSymbols = ["RELIANCE", "INFY", "TCS", "HDFCBANK", "WIPRO"];
  return indianSymbols.includes(symbol.toUpperCase()) ? "IN" : "US";
}

/**
 * Map a raw Alpha Vantage GLOBAL_QUOTE response
 * to the app's Stock interface.
 * Signal + confidence default to neutral/50
 * until the backend analysis engine is integrated.
 */
function mapQuoteToStock(raw: AVGlobalQuoteRaw): Stock {
  const symbol = raw["01. symbol"];
  const price = parseFloat(raw["05. price"]);
  const change = parseFloat(raw["09. change"]);
  const changePercent = parsePercent(raw["10. change percent"]);

  return {
    symbol,
    name: symbol, // Name lookup to be added in Step 9
    price,
    change,
    changePercent,
    market: inferMarket(symbol),
    signal: "neutral",   // Backend engine will fill this
    confidence: 50,      // Backend engine will fill this
  };
}

// ── Public API ────────────────────────────────

/**
 * Fetch a single stock quote.
 * Returns cached data if within TTL.
 * Throws on network error or API error.
 *
 * @param symbol  Ticker symbol e.g. "AAPL"
 * @param forceRefresh  Bypass cache (use sparingly — costs a request)
 */
export async function fetchStockQuote(
  symbol: string,
  forceRefresh = false
): Promise<Stock> {
  const upperSymbol = symbol.toUpperCase();

  // ── Cache check ──────────────────────────────
  if (!forceRefresh) {
    const cached = quoteCache.get(upperSymbol);
    if (cached) {
      const age = Date.now() - cached.fetchedAt;
      if (age < API_CONFIG.QUOTE_CACHE_TTL_MS) {
        console.log(`[AV Cache] HIT for ${upperSymbol} (age: ${Math.round(age / 1000)}s)`);
        return cached.data;
      }
      console.log(`[AV Cache] STALE for ${upperSymbol} — refetching`);
    }
  }

  // ── Guard: no API key ────────────────────────
  if (!API_CONFIG.ALPHA_VANTAGE_KEY) {
    throw new Error(
      "Alpha Vantage API key missing. Add EXPO_PUBLIC_AV_KEY to your .env file."
    );
  }

  // ── Fetch ────────────────────────────────────
 const url = `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${upperSymbol}&apikey=${API_CONFIG.ALPHA_VANTAGE_KEY}`;
  console.log(`[AV Fetch] Requesting quote for ${upperSymbol}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Alpha Vantage request failed: ${response.status} ${response.statusText}`
    );
  }

  const json: AVGlobalQuoteResponse = await response.json();

  // ── Alpha Vantage error shapes ───────────────
  // The API returns 200 even for errors — check the body.
  const quote = json["Global Quote"];

  if (!quote || Object.keys(quote).length === 0) {
    // This usually means the symbol doesn't exist
    // OR the free tier rate limit was hit.
    throw new Error(
      `No data returned for "${upperSymbol}". Check the symbol or your API quota.`
    );
  }

  // ── Map + cache ──────────────────────────────
  const stock = mapQuoteToStock(quote);

  quoteCache.set(upperSymbol, {
    data: stock,
    fetchedAt: Date.now(),
  });

  console.log(`[AV Cache] SET for ${upperSymbol}`);

  return stock;
}

/**
 * Fetch multiple quotes sequentially.
 * Respects the 5 req/min free tier limit by adding
 * a 500ms delay between requests.
 *
 * @param symbols  Array of ticker symbols
 */
export async function fetchMultipleQuotes(symbols: string[]): Promise<Stock[]> {
  const results: Stock[] = [];

  for (let i = 0; i < symbols.length; i++) {
    const stock = await fetchStockQuote(symbols[i]);
    results.push(stock);

    // Throttle: wait 500ms between requests (except after the last one)
    if (i < symbols.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Manually clear the cache for a symbol.
 * Useful after a user manually triggers a refresh.
 */
export function clearQuoteCache(symbol?: string): void {
  if (symbol) {
    quoteCache.delete(symbol.toUpperCase());
  } else {
    quoteCache.clear();
  }
}
// Aliases for hook compatibility
export type StockQuote = Stock;
export const fetchQuote = fetchStockQuote;