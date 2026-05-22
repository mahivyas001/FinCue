import { useState, useEffect, useCallback } from "react";
import { fetchQuote, StockQuote } from "@/lib/api/alphaVantage";

export function useStockQuote(symbol: string) {
  const [stock, setStock] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchQuote(symbol);
      setStock(data);
      setLastUpdated(new Date());
    } catch {
      setError("Failed to load live quote.");
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stock, isLoading, error, lastUpdated, refresh };
}

export function useMultipleQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbolKey = symbols.join(",");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results: Record<string, StockQuote> = {};
      for (const symbol of symbols) {
        try {
          const data = await fetchQuote(symbol);
          results[symbol] = data;
          await new Promise((res) => setTimeout(res, 500));
        } catch {
          // skip
        }
      }
      setQuotes(results);
    } catch {
      setError("Failed to load quotes.");
    } finally {
      setLoading(false);
    }
  }, [symbolKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { quotes, loading, error, refresh };
}