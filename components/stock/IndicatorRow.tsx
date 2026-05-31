import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Signal, signalColor } from '@/constants/colors';

interface IndicatorRowProps {
  label:    string;
  value:    string | number;
  signal?:  Signal;
  divider?: boolean;
}

export default function IndicatorRow({
  label,
  value,
  signal,
  divider = true,
}: IndicatorRowProps) {
  const valueColor = signal ? signalColor(signal) : Colors.text.primary;

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
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: 12,
  },
  label: {
    fontSize:   13,
    color:      Colors.text.muted,
    fontFamily: 'Montserrat_500Medium',
  },
  value: {
    fontSize:      13,
    letterSpacing: 0.3,
    fontFamily:    'Montserrat_600SemiBold',
  },
  divider: {
    height:          1,
    backgroundColor: Colors.border.default,
  },
});