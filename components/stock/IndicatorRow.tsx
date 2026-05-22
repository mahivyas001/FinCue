import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, valueColor } from '@/constants/colors';

interface IndicatorRowProps {
  label:     string;
  value:     string | number;
  barPct?:   number;   // 0–100 for the mini progress bar
  isLast?:   boolean;
}

export default function IndicatorRow({
  label,
  value,
  barPct,
  isLast = false,
}: IndicatorRowProps) {
  const numericVal   = typeof value === 'number' ? value : null;
  const color        = valueColor(numericVal);
  const displayValue = typeof value === 'number'
    ? (value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1))
    : value;

  // bar color matches value color
  const barColor = numericVal === null
    ? Colors.neutral.primary
    : numericVal > 0
      ? Colors.bullish.primary
      : numericVal < 0
        ? Colors.bearish.primary
        : Colors.neutral.primary;

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.right}>
        {barPct !== undefined && (
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.min(100, Math.max(0, barPct))}%` as any, backgroundColor: barColor },
              ]}
            />
          </View>
        )}
        <Text style={[styles.value, { color }]}>{displayValue}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  label: {
    fontSize: 13,
    color:    Colors.text.muted,
  },
  right: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  barTrack: {
    width:           52,
    height:          3,
    backgroundColor: Colors.bg.elevated,
    borderRadius:    2,
    overflow:        'hidden',
  },
  barFill: {
    height:       3,
    borderRadius: 2,
  },
  value: {
    fontSize:   14,
    fontWeight: '500',
    minWidth:   52,
    textAlign:  'right',
  },
});