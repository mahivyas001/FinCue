// components/stock/WatchlistItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { COLORS, SignalType, signalColor } from '@/constants/colors';
import { Signal } from '@/types/stock';
import { FONTS } from '@/constants/fonts';
import SignalBadge from '@/components/ui/SignalBadge';
import { useAppStore } from '@/store/useAppStore';

interface WatchlistItemProps {
  stock: {
    symbol:        string;
    name:          string;
    price:         number;
    change:        number;
    changePercent: number;
    signal:        Signal;
    market:        'US' | 'IN';
  };
}

export default function WatchlistItem({ stock }: WatchlistItemProps) {
  const router   = useRouter();
  const remove   = useAppStore(s => s.removeFromWatchlist);
  const currency = stock.market === 'IN' ? '₹' : '$';
  const isPos    = stock.changePercent >= 0;
  const changeColor = isPos ? COLORS.bullish : COLORS.bearish;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/stock/${stock.symbol}`)}
      activeOpacity={0.75}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{stock.symbol[0]}</Text>
      </View>

      {/* Name + signal */}
      <View style={styles.mid}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>{stock.name}</Text>
        <SignalBadge signal={stock.signal} size="sm" />
      </View>

      {/* Price + change */}
      <View style={styles.right}>
        <Text style={styles.price}>
          {currency}{stock.price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={[styles.change, { color: changeColor }]}>
          {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </Text>
      </View>

      {/* Remove */}
      <TouchableOpacity
        onPress={() => remove(stock.symbol)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.removeBtn}
      >
        <Trash2 size={14} color={COLORS.textPrimary.faint} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.appBg.card,
    borderRadius:    14,
    padding:         14,
    marginBottom:    10,
    gap:             12,
  },
  avatar: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: COLORS.appBg.elevated,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontSize:   16,
    color:      COLORS.textPrimary.primary,
    fontFamily: FONTS.bold,
  },
  mid: {
    flex: 1,
    gap:  4,
  },
  symbol: {
    fontSize:   15,
    color:      COLORS.textPrimary.primary,
    fontFamily: FONTS.bold,
  },
  name: {
    fontSize:   12,
    color:      COLORS.textPrimary.muted,
    fontFamily: FONTS.regular,
  },
  right: {
    alignItems: 'flex-end',
    gap:        4,
  },
  price: {
    fontSize:   15,
    color:      COLORS.textPrimary.primary,
    fontFamily: FONTS.semiBold,
  },
  change: {
    fontSize:   13,
    fontFamily: FONTS.medium,
  },
  removeBtn: {
    padding: 4,
  },
});