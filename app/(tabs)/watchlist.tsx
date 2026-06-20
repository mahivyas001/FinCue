import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_STOCKS } from '@/constants/mockData';
import { useMultipleQuotes } from '@/hooks/useStockQuote';
import { COLORS } from '@/constants/colors';
import WatchlistItem from '@/components/stock/WatchlistItem';

export default function WatchlistScreen() {
  const { watchlist } = useAppStore();
  const router        = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { quotes, loading, error, refresh } = useMultipleQuotes(watchlist);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const watchlistStocks = MOCK_STOCKS.filter((s) =>
    watchlist.includes(s.symbol)
  ).map((stock) => {
    const live = quotes[stock.symbol];
    if (!live) return stock;
    return {
      ...stock,
      price:         live.price,
      change:        live.change,
      changePercent: live.changePercent,
    };
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.appBg.base }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.bullish}
        />
      }
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: COLORS.textPrimary.primary, fontSize: 26, fontFamily: 'Montserrat_700Bold' }}>
          Watchlist
        </Text>
        {loading && !refreshing && (
          <ActivityIndicator size="small" color={COLORS.bullish} />
        )}
      </View>

      <Text style={{ color: COLORS.textPrimary.muted, fontSize: 12, marginBottom: 24, fontFamily: 'Montserrat_400Regular' }}>
        {watchlistStocks.length} stock{watchlistStocks.length !== 1 ? 's' : ''} saved
      </Text>

      {/* Error banner */}
      {error && watchlistStocks.length > 0 && (
        <View style={{
          backgroundColor: COLORS.bearish.tint,
          borderWidth:     1,
          borderColor:     COLORS.bearish + '40',
          borderRadius:    12,
          padding:         12,
          marginBottom:    16,
        }}>
          <Text style={{ color: COLORS.bearish, fontSize: 12, fontFamily: 'Montserrat_500Medium' }}>
            Live prices unavailable
          </Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ color: COLORS.bullish, fontSize: 12, marginTop: 4, fontFamily: 'Montserrat_500Medium' }}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty state */}
      {watchlistStocks.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 64 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⭐</Text>
          <Text style={{ color: COLORS.textPrimary.primary, fontSize: 18, fontFamily: 'Montserrat_700Bold', marginBottom: 8 }}>
            No stocks yet
          </Text>
          <Text style={{ color: COLORS.textPrimary.muted, fontSize: 13, textAlign: 'center', marginBottom: 24, fontFamily: 'Montserrat_400Regular' }}>
            Tap the ☆ star on any stock card to save it here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            style={{
              backgroundColor:   COLORS.bullish,
              paddingHorizontal: 24,
              paddingVertical:   12,
              borderRadius:      999,
            }}
          >
            <Text style={{ color: COLORS.appBg.base, fontSize: 13, fontFamily: 'Montserrat_700Bold' }}>
              Browse Stocks →
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        watchlistStocks.map((stock) => (
          <WatchlistItem key={stock.symbol} stock={stock} />
        ))
      )}
    </ScrollView>
  );
}