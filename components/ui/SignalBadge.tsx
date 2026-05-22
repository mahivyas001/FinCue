import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, SignalType, signalColor, signalTint } from '@/constants/colors';

interface SignalBadgeProps {
  signal: SignalType;
  confidence?: number;
  size?: 'sm' | 'md';
}

export default function SignalBadge({
  signal,
  confidence,
  size = 'md',
}: SignalBadgeProps) {
  const color = signalColor(signal);
  const tint  = signalTint(signal);
  const isSm  = size === 'sm';

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: tint },
        isSm && styles.pillSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }, isSm && styles.labelSm]}>
        {signal}
        {confidence !== undefined ? ` · ${confidence}%` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    paddingVertical:  5,
    paddingHorizontal: 12,
    borderRadius:   100,
  },
  pillSm: {
    paddingVertical:   3,
    paddingHorizontal: 9,
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  label: {
    fontSize:   13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelSm: {
    fontSize: 11,
  },
});