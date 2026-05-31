import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { Colors, signalColor } from '@/constants/colors';
import { Signal } from '@/types/stock';
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
        <Text style={[styles.change, { color: isPos ? Colors.bullish.primary : Colors.bearish.primary }]}>
          {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </Text>
      </View>

      {/* Remove */}
      <TouchableOpacity
        onPress={() => remove(stock.symbol)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.removeBtn}
      >
        <Trash2 size={14} color={Colors.text.faint} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.bg.card,
    borderRadius:    14,
    padding:         12,
    marginBottom:    8,
    gap:             10,
  },
  avatar: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: Colors.bg.elevated,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontSize:   15,
    fontWeight: '600',
    color:      Colors.text.primary,
  },
  mid: {
    flex: 1,
    gap:  3,
  },
  symbol: {
    fontSize:   14,
    fontWeight: '600',
    color:      Colors.text.primary,
  },
  name: {
    fontSize: 11,
    color:    Colors.text.muted,
  },
  right: {
    alignItems: 'flex-end',
    gap:        3,
  },
  price: {
    fontSize:   14,
    fontWeight: '600',
    color:      Colors.text.primary,
  },
  change: {
    fontSize: 12,
  },
  removeBtn: {
    padding: 4,
  },
});