import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

type MarketFilter = 'All' | 'US' | 'IN';

interface MarketFilterBarProps {
  active:   MarketFilter;
  onChange: (filter: MarketFilter) => void;
}

const FILTERS: MarketFilter[] = ['All', 'US', 'IN'];

export default function MarketFilterBar({ active, onChange }: MarketFilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => {
        const isActive = f === active;
        return (
          <TouchableOpacity
            key={f}
            style={[
              styles.pill,
              isActive
                ? { backgroundColor: COLORS.bullish }
                 : { backgroundColor: COLORS.appBg.card },
            ]}
            onPress={() => onChange(f)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? '#111111' : COLORS.textPrimary.dim },
              ]}
            >
              {f === 'IN' ? 'India' : f}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap:               8,
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical:   7,
    borderRadius:      100,
  },
  label: {
    fontSize:   13,
    fontWeight: '500',
  },
});