import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { Colors, signalColor } from '@/constants/colors';
import { Signal } from '@/types/stock';
import SignalBadge from '@/components/ui/SignalBadge';
import { useAppStore } from '@/store/useAppStore';

interface StockCardProps {
  symbol:        string;
  name:          string;
  price:         number;
  change:        number;
  changePercent: number;
  signal:        Signal;
  confidence?:   number;
  market:        'US' | 'IN';
}

export default function StockCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  signal,
  confidence,
  market,
}: StockCardProps) {
  const router             = useRouter();

  // ✅ Stable selectors — each subscribes to only what it needs,
  //    no new object references created on re-render
  const watchlist          = useAppStore((state) => state.watchlist);
  const addToWatchlist     = useAppStore((state) => state.addToWatchlist);
  const removeFromWatchlist = useAppStore((state) => state.removeFromWatchlist);

  // watchlist items are { symbol, addedAt } — compare by .symbol
  const isSaved  = watchlist.some((item) => item.symbol === symbol);
  const currency = market === 'IN' ? '₹' : '$';
  const isPos    = change >= 0;

  const handleWatchlistToggle = () => {
    if (isSaved) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/stock/${symbol}`)}
      activeOpacity={0.75}
    >
      {/* Left: avatar + name */}
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{symbol[0]}</Text>
        </View>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.tagRow}>
            <View style={styles.marketTag}>
              <Text style={styles.marketTagText}>{market}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right: price + signal + star */}
      <View style={styles.right}>
        <TouchableOpacity
          onPress={handleWatchlistToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Star
            size={16}
            color={isSaved ? Colors.bullish.primary : Colors.text.faint}
            fill={isSaved ? Colors.bullish.primary : 'transparent'}
          />
        </TouchableOpacity>

        <Text style={styles.price}>
          {currency}{price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>

        <Text style={[styles.change, { color: signalColor(signal) }]}>
          {isPos ? '+' : ''}{change.toFixed(2)} ({isPos ? '+' : ''}{changePercent.toFixed(2)}%)
        </Text>

        <SignalBadge signal={signal} confidence={confidence} size="sm" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius:    16,
    padding:         14,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    marginBottom:    10,
  },
  left: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    flex:          1,
  },
  avatar: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.bg.elevated,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontSize:   16,
    fontWeight: '600',
    color:      Colors.text.primary,
  },
  symbol: {
    fontSize:   15,
    fontWeight: '600',
    color:      Colors.text.primary,
  },
  name: {
    fontSize:  11,
    color:     Colors.text.dim,
    marginTop: 1,
    maxWidth:  140,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop:     4,
  },
  marketTag: {
    backgroundColor:   Colors.bg.elevated,
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      4,
  },
  marketTagText: {
    fontSize:      10,
    color:         Colors.text.dim,
    fontWeight:    '500',
    letterSpacing: 0.05,
  },
  right: {
    alignItems: 'flex-end',
    gap:        4,
  },
  price: {
    fontSize:   15,
    fontWeight: '600',
    color:      Colors.text.primary,
    marginTop:  4,
  },
  change: {
    fontSize: 11,
  },
});