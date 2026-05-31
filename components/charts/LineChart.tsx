import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path, Defs, LinearGradient, Stop, Circle, Text as SvgText,
} from 'react-native-svg';
import { Colors, Signal, signalColor } from '@/constants/colors';

interface ChartPoint {
  date:  string;
  close: number;
}

interface LineChartProps {
  data:    ChartPoint[];
  height?: number;
  signal?: Signal;
}

const W       = Dimensions.get('window').width - 40;
const PADDING = { top: 20, bottom: 36, left: 4, right: 4 };

function smooth(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx  = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function LineChart({ data, height = 160, signal = 'neutral' }: LineChartProps) {
  const color = signalColor(signal);

  if (!data || data.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No chart data</Text>
      </View>
    );
  }

  const innerW  = W - PADDING.left - PADDING.right;
  const innerH  = height - PADDING.top - PADDING.bottom;
  const closes  = data.map((d) => d.close);
  const minVal  = Math.min(...closes);
  const maxVal  = Math.max(...closes);
  const range   = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: PADDING.left + (i / (data.length - 1)) * innerW,
    y: PADDING.top  + (1 - (d.close - minVal) / range) * innerH,
  }));

  const linePath = smooth(points);
  const areaPath = linePath
    + ` L ${points[points.length - 1].x} ${PADDING.top + innerH}`
    + ` L ${points[0].x} ${PADDING.top + innerH} Z`;

  const last         = points[points.length - 1];
  const labelCount   = Math.min(5, data.length);
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round(i * (data.length - 1) / (labelCount - 1))
  );

  return (
    <View>
      <Svg width={W} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor={color} stopOpacity={0.22} />
            <Stop offset="100%" stopColor={color} stopOpacity={0}    />
          </LinearGradient>
        </Defs>

        <Path d={areaPath} fill="url(#grad)" />
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />

        <Circle cx={last.x} cy={last.y} r={5} fill={color} opacity={0.3} />
        <Circle cx={last.x} cy={last.y} r={3} fill={color} />

        {labelIndices.map((idx, pos) => (
          <SvgText
            key={`lbl-${idx}`}
            x={points[idx].x}
            y={height - 8}
            fontSize={10}
            fill={Colors.text.faint}
            fontFamily="Montserrat_400Regular"
            textAnchor={
              pos === 0 ? 'start' :
              pos === labelIndices.length - 1 ? 'end' :
              'middle'
            }
          >
            {data[idx].date.slice(5)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize:   12,
    color:      Colors.text.faint,
    fontFamily: 'Montserrat_400Regular',
  },
});