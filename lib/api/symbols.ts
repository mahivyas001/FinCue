// lib/api/symbols.ts
//
// Fetches the full US stock symbol list from the FinCue backend.
// Module-level cache — loaded once per app session, never re-fetched.

import { API_CONFIG } from "@/constants/config";

export interface StockSymbol {
  symbol: string;
  name: string;
}

interface SymbolsResponse {
  count: number;
  symbols: StockSymbol[];
}

// Module-level cache — persists for the lifetime of the JS bundle
let _cache: StockSymbol[] | null = null;
let _inflightPromise: Promise<StockSymbol[]> | null = null;

/**
 * Returns the full US Common Stock symbol list.
 * Fetches once from the backend on first call; subsequent calls return
 * the cached result instantly without a network request.
 */
export async function fetchUSSymbols(): Promise<StockSymbol[]> {
  // Already loaded — return immediately
  if (_cache !== null) {
    return _cache;
  }

  // Deduplicate concurrent calls — if a fetch is already in-flight,
  // all callers share the same promise instead of firing duplicate requests
  if (_inflightPromise !== null) {
    return _inflightPromise;
  }

  _inflightPromise = _doFetch().finally(() => {
    _inflightPromise = null;
  });

  return _inflightPromise;
}

async function _doFetch(): Promise<StockSymbol[]> {
  const url = `${API_CONFIG.BACKEND_URL}/api/v1/symbols/us`;
  console.log("[Symbols] Fetching US symbol list from backend…");

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    throw new Error(`Symbol list fetch failed: ${res.status} ${res.statusText}`);
  }

  const json: SymbolsResponse = await res.json();
  _cache = json.symbols;
  console.log(`[Symbols] Loaded ${_cache.length} US symbols into cache`);
  return _cache;
}

/** Manually clear the cache (e.g. for testing). */
export function clearSymbolsCache(): void {
  _cache = null;
}

export interface SearchedSymbol {
  symbol: string;
  name: string;
  type: string;
}

export async function searchSymbols(query: string): Promise<SearchedSymbol[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  const url = `${API_CONFIG.BACKEND_URL}/api/v1/search?q=${encodeURIComponent(query.trim())}`;
  console.log(`[Symbols] Searching symbols from backend for query: ${query}`);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    throw new Error(`Symbol search failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
