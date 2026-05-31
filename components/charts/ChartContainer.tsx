import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import LineChart from './LineChart';
import CandlestickChart from './CandlestickChart';
import { useStockChart } from '@/hooks/useStockChart';
import { Colors, Signal, signalColor as getSignalColor } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

type Timeframe = '1W' | '1M' | '3M';

interface ChartContainerProps {
  symbol: string;
  signal?: Signal;
}

export default function ChartContainer({
  symbol,
  signal = 'neutral',
}: ChartContainerProps) {
  const { mode }    = useAppStore();
  const [tf, setTf] = useState<Timeframe>('1M');

  const { data, isLoading, error, refresh } = useStockChart(symbol, tf);
  const color = getSignalColor(signal);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={color} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={refresh}
          style={[styles.retryBtn, { borderColor: color }]}
        >
          <Text style={[styles.retryText, { color }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {(['1W', '1M', '3M'] as Timeframe[]).map((t) => {
          const active = tf === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTf(t)}
              style={[
                styles.tab,
                active && { backgroundColor: color + '20', borderColor: color },
              ]}
            >
              <Text style={[styles.tabText, active && { color }]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={styles.modeTag}>
          <Text style={styles.modeText}>
            {mode === 'beginner' ? 'LINE' : 'CANDLE'}
          </Text>
        </View>
      </View>

      {mode === 'beginner'
        ? <LineChart data={data} signal={signal} />
        : <CandlestickChart data={data} />
      }

      {mode === 'advanced' && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.bullish.primary }]} />
            <Text style={styles.legendText}>Bullish</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.bearish.primary }]} />
            <Text style={styles.legendText}>Bearish</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  center: {
    height:         180,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            12,
  },
  errorText: {
    fontSize:   12,
    color:      Colors.text.muted,
    textAlign:  'center',
    fontFamily: 'Montserrat_400Regular',
  },
  retryBtn: {
    borderWidth:       1,
    borderRadius:      8,
    paddingHorizontal: 16,
    paddingVertical:   8,
  },
  retryText: {
    fontSize:   13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  tabRow: {
    flexDirection: 'row',
    gap:           8,
    alignItems:    'center',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical:   6,
    borderRadius:      8,
    borderWidth:       1,
    borderColor:       Colors.border.default,
    backgroundColor:   Colors.bg.elevated,
  },
  tabText: {
    fontSize:      11,
    color:         Colors.text.muted,
    letterSpacing: 0.8,
    fontFamily:    'Montserrat_600SemiBold',
  },
  modeTag: {
    marginLeft:        'auto',
    backgroundColor:   Colors.bg.elevated,
    borderRadius:      6,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },
  modeText: {
    fontSize:      10,
    color:         Colors.text.muted,
    letterSpacing: 1.2,
    fontFamily:    'Montserrat_700Bold',
  },
  legend: {
    flexDirection: 'row',
    gap:           16,
    paddingTop:    4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  legendDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  legendText: {
    fontSize:   11,
    color:      Colors.text.muted,
    fontFamily: 'Montserrat_400Regular',
  },
});