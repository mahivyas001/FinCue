// ─────────────────────────────────────────────
// FinCue — useStockQuote Hook
// ─────────────────────────────────────────────
// Wraps the Alpha Vantage service with React
// loading / error / data state management.
//
// Screens never import the service directly —
// they always go through this hook.
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { fetchStockQuote, clearQuoteCache } from "@/services/alphaVantage";
import type { Stock } from "@/types/stock";

interface UseStockQuoteState {
  stock: Stock | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseStockQuoteReturn extends UseStockQuoteState {
  /** Re-fetch, bypassing the cache */
  refresh: () => Promise<void>;
}

export function useStockQuote(symbol: string | undefined): UseStockQuoteReturn {
  const [state, setState] = useState<UseStockQuoteState>({
    stock: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!symbol) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        if (forceRefresh) {
          clearQuoteCache(symbol);
        }

        const stock = await fetchStockQuote(symbol, forceRefresh);

        setState({
          stock,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load quote.";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    },
    [symbol]
  );

  // Fetch on mount and whenever symbol changes
  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { ...state, refresh };
}