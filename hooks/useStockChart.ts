// hooks/useStockChart.ts

import { useState, useEffect, useCallback } from 'react';
import { fetchStockChart, OHLCVData, Timeframe } from '@/lib/api/alphaVantageChart';

interface UseStockChartResult {
  data: OHLCVData[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useStockChart(symbol: string, timeframe: Timeframe): UseStockChartResult {
  const [data, setData] = useState<OHLCVData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchStockChart(symbol, timeframe);
      setData(result);
    } catch (e: any) {
      setError(e.message === 'RATE_LIMIT' ? 'Rate limit reached. Try again in a minute.' : 'Failed to load chart data.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => { load(); }, [load]);

  return { data, isLoading, error, refresh: load };
}