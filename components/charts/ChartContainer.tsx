// components/charts/ChartContainer.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useStockChart } from '@/hooks/useStockChart';
import { Timeframe } from '@/lib/api/alphaVantageChart';
import LineChart from './LineChart';
import CandlestickChart from './CandlestickChart';

const TIMEFRAMES: Timeframe[] = ['1W', '1M', '3M'];

interface Props {
  symbol: string;
}

export default function ChartContainer({ symbol }: Props) {
  const { mode } = useAppStore();
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const { data, isLoading, error, refresh } = useStockChart(symbol, timeframe);
  const isAdvanced = mode === 'advanced';

  return (
    <View className="bg-dark-card rounded-2xl p-4 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white font-semibold text-base">
          {isAdvanced ? 'Candlestick Chart' : 'Price Chart'}
        </Text>
        <View className="flex-row gap-2">
          {TIMEFRAMES.map(tf => (
            <TouchableOpacity
              key={tf}
              onPress={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-full ${
                timeframe === tf ? 'bg-primary' : 'bg-dark-bg'
              }`}
            >
              <Text className={`text-xs font-medium ${
                timeframe === tf ? 'text-white' : 'text-slate-400'
              }`}>{tf}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart area */}
      {isLoading ? (
        <View className="h-48 items-center justify-center">
          <ActivityIndicator color="#4F46E5" />
          <Text className="text-slate-400 text-sm mt-2">Loading chart...</Text>
        </View>
      ) : error ? (
        <View className="h-48 items-center justify-center px-4">
          <Text className="text-rose-400 text-sm text-center mb-3">{error}</Text>
          <TouchableOpacity
            onPress={refresh}
            className="bg-primary px-4 py-2 rounded-full"
          >
            <Text className="text-white text-sm font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : data.length === 0 ? (
        <View className="h-48 items-center justify-center">
          <Text className="text-slate-400 text-sm">No chart data available</Text>
        </View>
      ) : isAdvanced ? (
        <CandlestickChart data={data} />
      ) : (
        <LineChart data={data} />
      )}

      {/* Legend */}
      {!isLoading && !error && data.length > 0 && isAdvanced && (
        <View className="flex-row gap-4 mt-3">
          {[
            { color: '#10B981', label: 'Bullish candle' },
            { color: '#F43F5E', label: 'Bearish candle' },
          ].map(({ color, label }) => (
            <View key={label} className="flex-row items-center gap-1">
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
              <Text className="text-slate-400 text-xs">{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}