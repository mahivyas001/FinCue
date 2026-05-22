import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/colors';
import LineChart from './LineChart';
import CandlestickChart from './CandlestickChart';
import { useStockChart, TimeFrame } from '@/hooks/useStockChart';
import { useAppStore } from '@/store/useAppStore';

const TIMEFRAMES: TimeFrame[] = ['1W', '1M', '3M'];

interface ChartContainerProps {
  symbol: string;
}

export default function ChartContainer({ symbol }: ChartContainerProps) {
  const { mode } = useAppStore();
  const isAdvanced = mode === 'advanced';

  const [timeframe, setTimeframe] = React.useState<TimeFrame>('1W');
  const { data, loading, error, refresh } = useStockChart(symbol, timeframe);

  return (
    <View style={styles.wrap}>
      {/* Timeframe pills */}
      <View style={styles.tabs}>
        {TIMEFRAMES.map((tf) => {
          const active = tf === timeframe;
          return (
            <TouchableOpacity
              key={tf}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTimeframe(tf)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tf}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chart area */}
      <View style={styles.chartArea}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={Colors.bullish.primary} size="small" />
          </View>
        ) : error ? (
          <View style={styles.loader}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isAdvanced ? (
          <CandlestickChart data={data} height={200} />
        ) : (
          <LineChart data={data} height={160} />
        )}
      </View>

      {/* Advanced legend */}
      {isAdvanced && !loading && !error && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.bullish.primary }]} />
            <Text style={styles.legendLabel}>Up candle</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.bearish.primary }]} />
            <Text style={styles.legendLabel}>Down candle</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bg.card,
    borderRadius:    16,
    padding:         14,
    marginBottom:    14,
  },
  tabs: {
    flexDirection: 'row',
    gap:           6,
    marginBottom:  14,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical:    5,
    borderRadius:      100,
    backgroundColor:   Colors.bg.elevated,
  },
  tabActive: {
    backgroundColor: Colors.bullish.primary,
  },
  tabLabel: {
    fontSize:   12,
    fontWeight: '500',
    color:      Colors.text.dim,
  },
  tabLabelActive: {
    color: '#111111',
  },
  chartArea: {
    minHeight: 120,
  },
  loader: {
    height:         160,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
  },
  errorText: {
    fontSize: 12,
    color:    Colors.text.faint,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 14,
    paddingVertical:    6,
    backgroundColor:   Colors.bg.elevated,
    borderRadius:      8,
  },
  retryText: {
    fontSize: 12,
    color:    Colors.bullish.primary,
  },
  legend: {
    flexDirection: 'row',
    gap:           16,
    marginTop:     10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  legendDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
    color:    Colors.text.faint,
  },
});