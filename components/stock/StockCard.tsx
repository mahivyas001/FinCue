import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import SignalBadge from '@/components/ui/SignalBadge';
import { COLORS, SignalType } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import type { Stock, Signal } from '@/types/stock';
import { useBehaviorStore } from '@/store/useBehaviorStore';

interface StockCardProps {
  stock:              Stock;
  livePrice?:         number;
  liveChange?:        number;
  liveChangePercent?: number;
}

export default function StockCard({
  stock,
  livePrice,
  liveChange,
  liveChangePercent,
}: StockCardProps) {
  const router     = useRouter();
  const watchlist  = useAppStore(s => s.watchlist);
  const inWatchlist = watchlist.includes(stock.symbol);

  const price     = livePrice   ?? stock.price;
  const change    = liveChange  ?? stock.change;
  const changePct = liveChangePercent ?? stock.changePercent;
  const isPositive = change >= 0;
  const changeColor = isPositive ? COLORS.bullish : COLORS.bearish;
  const currency  = stock.market === 'IN' ? '₹' : '$';

  function toggleWatchlist() {
    const { addToWatchlist, removeFromWatchlist } = useAppStore.getState();
    if (!inWatchlist) {
      const capSignal = stock.signal === 'bullish' ? 'Bullish' : stock.signal === 'bearish' ? 'Bearish' : 'Neutral';
      useBehaviorStore.getState().recordWatchlistAdd(stock.symbol, price, capSignal, changePct);
    }
    inWatchlist ? removeFromWatchlist(stock.symbol) : addToWatchlist(stock.symbol);
  }

  return (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: `/stock/${stock.symbol}`,
        params: { name: stock.name, type: (stock as any).type || 'Common Stock' }
      } as any)}
      activeOpacity={0.75}
      style={styles.card}
    >
      {/* Left: avatar + name */}
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{stock.symbol[0]}</Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.symbol}>{stock.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>{stock.name}</Text>
          <View style={styles.marketTag}>
            <Text style={styles.marketText}>{stock.market}</Text>
          </View>
        </View>
      </View>

      {/* Right: price + signal + star */}
      <View style={styles.right}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {currency}{price.toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={toggleWatchlist}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Star
              size={16}
              color={inWatchlist ? COLORS.bullish : COLORS.textPrimary.faint}
              fill={inWatchlist ? COLORS.bullish : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.change, { color: changeColor }]}>
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePct.toFixed(2)}%)
        </Text>

        <View style={styles.badgeRow}>
          <SignalBadge signal={stock.signal as Signal} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.appBg.card,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     COLORS.border.default,
    padding:         16,
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
    width:           44,
    height:          44,
    borderRadius:    12,
    backgroundColor: COLORS.appBg.elevated,
    borderWidth:     1,
    borderColor:     COLORS.border.default,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontSize:   16,
    color:      COLORS.textPrimary.primary,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  nameBlock: {
    gap:  3,
    flex: 1,
  },
  symbol: {
    fontSize:      15,
    color:         COLORS.textPrimary.primary,
    letterSpacing: 0.5,
    fontFamily:    'Montserrat_700Bold',
  },
  name: {
    fontSize:   12,
    color:      COLORS.textPrimary.muted,
    fontFamily: 'Montserrat_400Regular',
  },
  marketTag: {
    backgroundColor:   COLORS.appBg.elevated,
    borderRadius:      4,
    paddingHorizontal: 6,
    paddingVertical:   2,
    alignSelf:         'flex-start',
  },
  marketText: {
    fontSize:      10,
    color:         COLORS.textPrimary.faint,
    letterSpacing: 0.8,
    fontFamily:    'Montserrat_600SemiBold',
  },
  right: {
    alignItems: 'flex-end',
    gap:        4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  price: {
    fontSize:      15,
    color:         COLORS.textPrimary.primary,
    letterSpacing: 0.3,
    fontFamily:    'Montserrat_700Bold',
  },
  change: {
    fontSize:      12,
    letterSpacing: 0.3,
    fontFamily:    'Montserrat_600SemiBold',
  },
  badgeRow: {
    marginTop: 2,
  },
});