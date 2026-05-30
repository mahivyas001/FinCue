import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;

    setState({ data: null, loading: true, error: null });

    fetchExplanation(symbol, mode)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((e: any) => {
        if (!cancelled) setState({ data: null, loading: false, error: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, mode]);

  const refresh = () => {
    if (!symbol) return;
    setState({ data: null, loading: true, error: null });
    fetchExplanation(symbol, mode)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e: any) => setState({ data: null, loading: false, error: e.message }));
  };

  return { ...state, refresh };
}