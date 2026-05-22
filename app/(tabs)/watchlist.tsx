import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_STOCKS } from "@/constants/mockData";
import { useMultipleQuotes } from "@/hooks/useStockQuote";
import { useTheme } from "@/hooks/useTheme";
import WatchlistItem from "@/components/stock/WatchlistItem";

export default function WatchlistScreen() {
  const { watchlist } = useAppStore();
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const watchlistSymbols = watchlist.map((item) => item.symbol);
  const { quotes, loading, error, refresh } = useMultipleQuotes(watchlistSymbols);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const watchlistStocks = MOCK_STOCKS.filter((stock) =>
    watchlist.some((item) => item.symbol === stock.symbol)
  ).map((stock) => {
    const live = quotes[stock.symbol];
    if (!live) return stock;
    return { ...stock, price: live.price, change: live.change, changePercent: live.changePercent };
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
      }
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontFamily: "SpaceGrotesk_700Bold" }}>
          Watchlist
        </Text>
        {loading && !refreshing && <ActivityIndicator size="small" color="#4F46E5" />}
      </View>
      <Text style={{ color: colors.subtext, fontSize: 12, fontFamily: "Poppins_400Regular", marginBottom: 24 }}>
        {watchlistStocks.length} stock{watchlistStocks.length !== 1 ? "s" : ""} saved.
      </Text>

      {/* Error */}
      {error && watchlistStocks.length > 0 && (
        <View style={{ backgroundColor: "#F43F5E10", borderWidth: 1, borderColor: "#F43F5E30", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: "#F43F5E", fontSize: 11, fontFamily: "Poppins_500Medium" }}>
            Live prices unavailable
          </Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ color: "#4F46E5", fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 4 }}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty state */}
      {watchlistStocks.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 64 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⭐</Text>
          <Text style={{ color: colors.text, fontSize: 16, fontFamily: "Poppins_600SemiBold", marginBottom: 8 }}>
            No stocks yet
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: "center", marginBottom: 24 }}>
            Tap the ☆ star on any stock card to save it here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search")}
            style={{
              backgroundColor: "#4F46E5",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_600SemiBold" }}>
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