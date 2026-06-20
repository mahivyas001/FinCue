// hooks/useTrackRecord.ts

import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/constants/config';

export interface ConfidenceBucketData {
  range: string;
  bullish_count: number;
  bullish_correct_pct: number | null;
  bearish_count: number;
  bearish_correct_pct: number | null;
}

export interface TrackRecordData {
  total_signals_logged: number;
  total_evaluated: number;
  min_sample_size_met: boolean;
  confidence_buckets: ConfidenceBucketData[];
  last_updated: number;
}

export function useTrackRecord() {
  const [data, setData] = useState<TrackRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackRecord = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG.BACKEND_URL}/api/v1/track-record/summary`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to load track record: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message ?? 'An error occurred fetching track record.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackRecord();
  }, [fetchTrackRecord]);

  return { data, loading, error, refetch: fetchTrackRecord };
}
