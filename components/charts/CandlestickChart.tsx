// components/charts/CandlestickChart.tsx

import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { OHLCVData } from '@/lib/api/alphaVantageChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const VOLUME_HEIGHT = 40;
const CANDLE_WIDTH = 8;
const CANDLE_GAP = 4;

interface Props {
  data: OHLCVData[];
}

export default function CandlestickChart({ data }: Props) {
  if (!data.length) return null;

  const totalWidth = Math.max(SCREEN_WIDTH - 64, data.length * (CANDLE_WIDTH + CANDLE_GAP));
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const maxPrice = Math.max(...highs);
  const minPrice = Math.min(...lows);
  const priceRange = maxPrice - minPrice || 1;

  const maxVol = Math.max(...data.map(d => d.volume));

  const toY = (p: number) => 10 + (1 - (p - minPrice) / priceRange) * (CHART_HEIGHT - 20);
  const toCandleX = (i: number) => i * (CANDLE_WIDTH + CANDLE_GAP) + CANDLE_GAP;

  // Sparse date labels
  const step = Math.max(1, Math.floor(data.length / 5));
  const labelIndices = Array.from({ length: Math.ceil(data.length / step) }, (_, i) => i * step);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <Svg width={totalWidth} height={CHART_HEIGHT}>
          {data.map((d, i) => {
            const isBull = d.close >= d.open;
            const color = isBull ? '#10B981' : '#F43F5E';
            const x = toCandleX(i);
            const openY = toY(d.open);
            const closeY = toY(d.close);
            const highY = toY(d.high);
            const lowY = toY(d.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyH = Math.max(Math.abs(closeY - openY), 1);
            const cx = x + CANDLE_WIDTH / 2;

            return (
              <React.Fragment key={d.date}>
                {/* Wick */}
                <Line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1} />
                {/* Body */}
                <Rect x={x} y={bodyTop} width={CANDLE_WIDTH} height={bodyH} fill={color} rx={1} />
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Volume bars */}
        <Svg width={totalWidth} height={VOLUME_HEIGHT}>
          {data.map((d, i) => {
            const isBull = d.close >= d.open;
            const color = isBull ? '#10B98166' : '#F43F5E66';
            const x = toCandleX(i);
            const barH = (d.volume / maxVol) * (VOLUME_HEIGHT - 4);
            return (
              <Rect key={d.date} x={x} y={VOLUME_HEIGHT - barH} width={CANDLE_WIDTH}
                height={barH} fill={color} rx={1} />
            );
          })}
        </Svg>

        {/* X labels */}
        <View style={{ flexDirection: 'row', width: totalWidth }}>
          {labelIndices.map(i => {
            const d = data[i];
            if (!d) return null;
            const dt = new Date(d.date);
            return (
              <Text
                key={i}
                style={{
                  position: 'absolute',
                  left: toCandleX(i),
                  fontSize: 9,
                  color: '#64748B',
                }}
              >
                {`${dt.getMonth() + 1}/${dt.getDate()}`}
              </Text>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}