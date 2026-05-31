// components/stock/StockCard.tsx
// New palette: bullish = #A2E0FC, bearish = #FB7185
// Montserrat font throughout, pure black background

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import SignalBadge from '@/components/ui/SignalBadge';
import { COLORS, SignalType } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/fonts';
import { useAppStore } from '@/store/useAppStore';
import type { Stock } from '@/types/stock';

interface StockCardProps {
  stock: Stock;
  livePrice?: number;
  liveChange?: number;
  liveChangePercent?: number;
}

export default function StockCard({ stock, livePrice, liveChange, liveChangePercent }: StockCardProps) {
  const router = useRouter();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const inWatchlist = isInWatchlist(stock.symbol);

  const price = livePrice ?? stock.price;
  const change = liveChange ?? stock.change;
  const changePct = liveChangePercent ?? stock.changePercent;
  const isPositive = change >= 0;

  // Gain = ice blue, Loss = blush pink
  const changeColor = isPositive ? COLORS.bullish : COLORS.bearish;
  const currency = stock.market === 'IN' ? '₹' : '$';

  function toggleWatchlist() {
    inWatchlist ? removeFromWatchlist(stock.symbol) : addToWatchlist(stock.symbol);
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/stock/${stock.symbol}` as any)}
      activeOpacity={0.75}
      style={styles.card}
    >
      {/* ── Left: avatar + name ── */}
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

      {/* ── Right: price + signal + star ── */}
      <View style={styles.right}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{currency}{price.toFixed(2)}</Text>
          <TouchableOpacity onPress={toggleWatchlist} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Star
              size={16}
              color={inWatchlist ? COLORS.bullish : COLORS.textMuted}
              fill={inWatchlist ? COLORS.bullish : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.change, { color: changeColor }]}>
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePct.toFixed(2)}%)
        </Text>

        <View style={styles.badgeRow}>
          <SignalBadge signal={stock.signal as SignalType} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  // ── Left ──────────────────────────────────
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.extraBold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  nameBlock: {
    gap: 3,
    flex: 1,
  },
  symbol: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
  },
  marketTag: {
    backgroundColor: '#1F1F1F',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  marketText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },

  // ── Right ─────────────────────────────────
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  change: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 0.3,
  },
  badgeRow: {
    marginTop: 2,
  },
});