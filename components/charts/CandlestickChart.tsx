// components/charts/CandlestickChart.tsx
// Advanced mode — OHLC candlestick chart with volume bars

import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, {
  Rect,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { TimeSeriesPoint } from '@/lib/api/alphaVantageChart';
import { COLORS } from '@/constants/colors';

type Props = {
  data: TimeSeriesPoint[];
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CANDLE_HEIGHT = 160;
const VOLUME_HEIGHT = 40;
const TOTAL_HEIGHT = CANDLE_HEIGHT + VOLUME_HEIGHT + 8;
const PADDING = { top: 12, bottom: 28, left: 4, right: 48 };

export default function CandlestickChart({ data }: Props) {
  const { candles, volumeBars, yLabels, xLabels } = useMemo(() => {
    if (data.length < 2) return { candles: [], volumeBars: [], yLabels: [], xLabels: [] };

    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const maxPrice = Math.max(...highs);
    const minPrice = Math.min(...lows);
    const priceRange = maxPrice - minPrice || 1;

    const maxVolume = Math.max(...data.map(d => d.volume));

    const drawWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const drawHeight = CANDLE_HEIGHT - PADDING.top - PADDING.bottom;
    const candleCount = data.length;
    const slotWidth = drawWidth / candleCount;
    const candleWidth = Math.max(slotWidth * 0.6, 2);

    const toX = (i: number) => PADDING.left + i * slotWidth + slotWidth / 2;
    const toY = (v: number) =>
      PADDING.top + drawHeight - ((v - minPrice) / priceRange) * drawHeight;

    const candles = data.map((d, i) => {
      const x = toX(i);
      const openY = toY(d.open);
      const closeY = toY(d.close);
      const highY = toY(d.high);
      const lowY = toY(d.low);
      const isBull = d.close >= d.open;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
      return { x, openY, closeY, highY, lowY, bodyTop, bodyHeight, isBull, candleWidth };
    });

    const volDrawHeight = VOLUME_HEIGHT - 8;
    const volumeBars = data.map((d, i) => {
      const x = toX(i);
      const barHeight = (d.volume / maxVolume) * volDrawHeight;
      const isBull = d.close >= d.open;
      return { x, barHeight, isBull, candleWidth };
    });

    // Y labels
    const mid = (maxPrice + minPrice) / 2;
    const yLabels = [
      { value: maxPrice, y: toY(maxPrice) },
      { value: mid, y: toY(mid) },
      { value: minPrice, y: toY(minPrice) },
    ];

    // X labels (sparse — every ~5 candles)
    const step = Math.max(1, Math.floor(data.length / 4));
    const xLabels: { label: string; x: number }[] = [];
    for (let i = 0; i < data.length; i += step) {
      const date = new Date(data[i].date);
      xLabels.push({
        label: `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`,
        x: toX(i),
      });
    }

    return { candles, volumeBars, yLabels, xLabels };
  }, [data]);

  if (data.length < 2) return null;

  const volBaseY = CANDLE_HEIGHT + 8;

  return (
    <Svg width={CHART_WIDTH} height={TOTAL_HEIGHT}>
      {/* Candle wicks */}
      {candles.map((c, i) => (
        <Line
          key={`wick-${i}`}
          x1={c.x}
          y1={c.highY}
          x2={c.x}
          y2={c.lowY}
          stroke={c.isBull ? COLORS.bullish : COLORS.bearish}
          strokeWidth={1}
        />
      ))}

      {/* Candle bodies */}
      {candles.map((c, i) => (
        <Rect
          key={`body-${i}`}
          x={c.x - c.candleWidth / 2}
          y={c.bodyTop}
          width={c.candleWidth}
          height={c.bodyHeight}
          fill={c.isBull ? COLORS.bullish : COLORS.bearish}
          opacity={0.9}
        />
      ))}

      {/* Grid lines */}
      {yLabels.map((yl, i) => (
        <Line
          key={`grid-${i}`}
          x1={PADDING.left}
          y1={yl.y}
          x2={CHART_WIDTH - PADDING.right}
          y2={yl.y}
          stroke="#334155"
          strokeWidth={0.5}
          strokeDasharray="4,4"
        />
      ))}

      {/* Y labels */}
      {yLabels.map((yl, i) => (
        <SvgText
          key={`ylabel-${i}`}
          x={CHART_WIDTH - 4}
          y={yl.y - 2}
          fontSize={9}
          fill="#64748B"
          textAnchor="end"
        >
          ${yl.value.toFixed(2)}
        </SvgText>
      ))}

      {/* Volume divider line */}
      <Line
        x1={PADDING.left}
        y1={volBaseY}
        x2={CHART_WIDTH - PADDING.right}
        y2={volBaseY}
        stroke="#1E293B"
        strokeWidth={1}
      />

      {/* Volume bars */}
      {volumeBars.map((v, i) => (
        <Rect
          key={`vol-${i}`}
          x={v.x - v.candleWidth / 2}
          y={volBaseY + (VOLUME_HEIGHT - 8 - v.barHeight)}
          width={v.candleWidth}
          height={v.barHeight}
          fill={v.isBull ? COLORS.bullish : COLORS.bearish}
          opacity={0.4}
        />
      ))}

      {/* X labels */}
      {xLabels.map((xl, i) => (
        <SvgText
          key={`xlabel-${i}`}
          x={xl.x}
          y={TOTAL_HEIGHT - 4}
          fontSize={9}
          fill="#64748B"
          textAnchor="middle"
        >
          {xl.label}
        </SvgText>
      ))}
    </Svg>
  );
}