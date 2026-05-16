import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_STOCKS } from "@/constants/mockData";
import { useMultipleQuotes } from "@/hooks/useStockQuote";
import WatchlistItem from "@/components/stock/WatchlistItem";

export default function WatchlistScreen() {
  const { watchlist } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  // Get symbols from watchlist
  const watchlistSymbols = watchlist.map((item) => item.symbol);

  // Fetch live quotes for watchlisted symbols
  const { quotes, loading, error, refresh } = useMultipleQuotes(watchlistSymbols);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Merge live quotes into mock stocks
  const watchlistStocks = MOCK_STOCKS.filter((stock) =>
    watchlist.some((item) => item.symbol === stock.symbol)
  ).map((stock) => {
    const live = quotes[stock.symbol];
    if (!live) return stock;
    return {
      ...stock,
      price: live.price,
      change: live.change,
      changePercent: live.changePercent,
    };
  });

  return (
    <ScrollView
      className="flex-1 bg-darkBg"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4F46E5"
        />
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-white text-2xl font-bold">Watchlist</Text>
        {loading && !refreshing && (
          <ActivityIndicator size="small" color="#4F46E5" />
        )}
      </View>
      <Text className="text-neutral text-xs mb-6">
        {watchlistStocks.length} stock{watchlistStocks.length !== 1 ? "s" : ""} saved.
      </Text>

      {/* Error banner */}
      {error && watchlistStocks.length > 0 && (
        <View className="bg-bearish/10 border border-bearish/30 rounded-xl px-4 py-3 mb-4">
          <Text className="text-bearish text-xs font-semibold mb-1">
            Live prices unavailable
          </Text>
          <Text className="text-neutral text-xs">Showing last known data.</Text>
          <TouchableOpacity onPress={refresh} className="mt-1">
            <Text className="text-primary text-xs">Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty state */}
      {watchlistStocks.length === 0 ? (
        <View className="items-center py-16">
          <Text className="text-4xl mb-4">📋</Text>
          <Text className="text-white font-semibold text-base mb-1">
            No stocks yet
          </Text>
          <Text className="text-neutral text-sm text-center">
            Tap the ☆ star on any stock card to add it here.
          </Text>
        </View>
      ) : (
        watchlistStocks.map((stock) => (
          <WatchlistItem key={stock.symbol} stock={stock} />
        ))
      )}
    </ScrollView>
  );
}