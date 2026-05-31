import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface Candle {
  date:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

interface CandlestickChartProps {
  data:    Candle[];
  height?: number;
}

const CANDLE_W   = 8;
const CANDLE_GAP = 4;
const PADDING    = { top: 20, bottom: 40, left: 4, right: 4 };
const VOL_H      = 28;

export default function CandlestickChart({ data, height = 220 }: CandlestickChartProps) {
  if (!data || data.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No chart data</Text>
      </View>
    );
  }

  const chartH    = height - PADDING.top - PADDING.bottom - VOL_H - 8;
  const prices    = data.flatMap((d) => [d.high, d.low]);
  const minP      = Math.min(...prices);
  const maxP      = Math.max(...prices);
  const range     = maxP - minP || 1;
  const maxVol    = Math.max(...data.map((d) => d.volume));
  const toY       = (p: number) => PADDING.top + (1 - (p - minP) / range) * chartH;
  const totalW    = data.length * (CANDLE_W + CANDLE_GAP) + PADDING.left + PADDING.right;
  const labelStep = Math.max(1, Math.floor(data.length / 5));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={totalW} height={height}>
        {data.map((c, i) => {
          const isUp    = c.close >= c.open;
          const color   = isUp ? Colors.bullish.primary : Colors.bearish.primary;
          const x       = PADDING.left + i * (CANDLE_W + CANDLE_GAP);
          const bodyTop = toY(Math.max(c.open, c.close));
          const bodyH   = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
          const volBarH = (c.volume / maxVol) * VOL_H;
          const volY    = height - PADDING.bottom - volBarH;

          return (
            <React.Fragment key={`c-${i}`}>
              <Line
                x1={x + CANDLE_W / 2} y1={toY(c.high)}
                x2={x + CANDLE_W / 2} y2={toY(c.low)}
                stroke={color} strokeWidth={0.8}
              />
              <Rect
                x={x} y={bodyTop}
                width={CANDLE_W} height={bodyH}
                fill={color} rx={1} opacity={0.85}
              />
              <Rect
                x={x} y={volY}
                width={CANDLE_W} height={volBarH}
                fill={color} rx={1} opacity={0.35}
              />
              {i % labelStep === 0 && (
                <SvgText
                  x={x + CANDLE_W / 2} y={height - 6}
                  fontSize={9} fill={Colors.text.faint}
                  textAnchor="middle"
                >
                  {c.date.slice(5)}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty:     { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 12, color: Colors.text.faint, fontFamily: 'Montserrat_400Regular' },
});