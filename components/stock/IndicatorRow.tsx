// components/stock/IndicatorRow.tsx
// Fixed: Colors → COLORS, removed valueColor import (doesn't exist)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SignalType, getSignalColor } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/fonts';

interface IndicatorRowProps {
  label:     string;
  value:     string | number;
  signal?:   SignalType;   // optional — colors the value if provided
  divider?:  boolean;
}

export default function IndicatorRow({
  label,
  value,
  signal,
  divider = true,
}: IndicatorRowProps) {
  const valueColor = signal ? getSignalColor(signal) : COLORS.textPrimary;

  return (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </Text>
      </View>
      {divider && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 12,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textSub,
  },
  value: {
    fontFamily: FONTS.semiBold,
    fontSize:   FONT_SIZE.sm,
    letterSpacing: 0.3,
  },
  divider: {
    height:          1,
    backgroundColor: '#1F1F1F',
  },
});