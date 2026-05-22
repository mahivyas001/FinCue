import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Colors, SignalType, signalColor } from '@/constants/colors';
import SignalBadge from '@/components/ui/SignalBadge';

interface WatchlistItemProps {
  symbol:    string;
  name:      string;
  price:     number;
  changePct: number;
  signal:    SignalType;
  market:    'US' | 'IN';
  onRemove?: () => void;
  onPress?:  () => void;
}

export default function WatchlistItem({
  symbol,
  name,
  price,
  changePct,
  signal,
  market,
  onRemove,
  onPress,
}: WatchlistItemProps) {
  const currency = market === 'IN' ? '₹' : '$';
  const isPos    = changePct >= 0;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{symbol[0]}</Text>
      </View>

      {/* Name + signal */}
      <View style={styles.mid}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <SignalBadge signal={signal} size="sm" />
      </View>

      {/* Price + change */}
      <View style={styles.right}>
        <Text style={styles.price}>
          {currency}{price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={[styles.change, { color: signalColor(signal) }]}>
          {isPos ? '+' : ''}{changePct.toFixed(2)}%
        </Text>
      </View>

      {/* Remove */}
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.removeBtn}
        >
          <Trash2 size={14} color={Colors.text.faint} />
        </TouchableOpacity>
      )}
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
    color:    Colors.text.dim,
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