// components/charts/LineChart.tsx

import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { OHLCVData } from '@/lib/api/alphaVantageChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 180;
const PADDING = { top: 10, bottom: 24, left: 8, right: 8 };

interface Props {
  data: OHLCVData[];
}

function formatDate(d: string): string {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function getSparseLabelIndices(length: number): number[] {
  if (length <= 1) return [0];
  const count = Math.min(5, length);
  return Array.from({ length: count }, (_, i) =>
    Math.round((i / (count - 1)) * (length - 1))
  ).filter((v, i, arr) => arr.indexOf(v) === i); // dedupe
}

export default function LineChart({ data }: Props) {
  if (!data.length) return null;

  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const plotW = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const toX = (i: number) =>
    PADDING.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const toY = (p: number) =>
    PADDING.top + (1 - (p - minPrice) / priceRange) * plotH;

  // Smooth bezier path
  const pathD = data.reduce((acc, point, i) => {
    const x = toX(i);
    const y = toY(point.close);
    if (i === 0) return `M ${x} ${y}`;
    const px = toX(i - 1);
    const py = toY(data[i - 1].close);
    const cpX = (px + x) / 2;
    return `${acc} C ${cpX} ${py}, ${cpX} ${y}, ${x} ${y}`;
  }, '');

  const fillD = `${pathD} L ${toX(data.length - 1)} ${PADDING.top + plotH} L ${toX(0)} ${PADDING.top + plotH} Z`;

  const isPositive = prices[prices.length - 1] >= prices[0];
  const lineColor = isPositive ? '#10B981' : '#F43F5E';

  const labelIndices = getSparseLabelIndices(data.length);

  return (
    <View>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <Line
            key={`grid-${ratio}`}
            x1={PADDING.left}
            y1={PADDING.top + ratio * plotH}
            x2={PADDING.left + plotW}
            y2={PADDING.top + ratio * plotH}
            stroke="#1E293B"
            strokeWidth={1}
          />
        ))}

        {/* Gradient fill */}
        <Path d={fillD} fill="url(#fillGrad)" />

        {/* Line */}
        <Path d={pathD} stroke={lineColor} strokeWidth={2} fill="none" />
      </Svg>

      {/* X-axis labels — key is the data index, guaranteed unique after dedup */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: PADDING.left }}>
        {labelIndices.map(dataIdx => (
          <Text key={`label-${dataIdx}`} style={{ fontSize: 9, color: '#64748B' }}>
            {formatDate(data[dataIdx].date)}
          </Text>
        ))}
      </View>
    </View>
  );
}