import { useState, useEffect, useCallback } from 'react';
import { fetchExplanation, ExplanationResponse } from '@/lib/api/explainApi';

type State = {
  data: ExplanationResponse | null;
  loading: boolean;
  error: string | null;
};

export function useExplanation(
  symbol: string,
  mode: 'beginner' | 'advanced'
) {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchExplanation(symbol, mode);
      setState({ data, loading: false, error: null });
    } catch (e: any) {
      setState({ data: null, loading: false, error: e.message });
    }
  }, [symbol, mode]);

  useEffect(() => {
    if (symbol) load();
  }, [load, symbol, mode]);

  return { ...state, refresh: load };
}