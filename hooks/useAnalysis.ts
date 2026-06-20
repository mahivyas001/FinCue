import { useState, useEffect, useCallback } from "react";
import { fetchAnalysis, AnalysisResult } from "@/lib/api/backendApi";
import { SignalType, Signal } from "@/types/stock";

function normalizeSignal(raw: string): Signal {
  const lower = raw.toLowerCase();
  if (lower === "bullish") return "bullish";
  if (lower === "bearish") return "bearish";
  return "neutral";
}

export function useAnalysis(symbol: string | undefined) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
     console.log('[useAnalysis] Fetching for:', symbol); 
    try {
      const data = await fetchAnalysis(symbol);
      // Normalize signal to lowercase to match our SignalType
      setAnalysis({
        ...data,
        signal: normalizeSignal(data.signal),
      });
    } catch (e: any) {
      setError(e.message ?? "Failed to load analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { analysis, isLoading, error, refresh };
}