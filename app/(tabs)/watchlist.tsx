// app/(tabs)/watchlist.tsx

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
import { Colors } from "@/constants/colors";
import WatchlistItem from "@/components/stock/WatchlistItem";

export default function WatchlistScreen() {
  const { watchlist } = useAppStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const watchlistSymbols = watchlist.map((item) =>
    typeof item === "string" ? item : item.symbol
  );

  const { quotes, loading, error, refresh } = useMultipleQuotes(watchlistSymbols);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const watchlistStocks = MOCK_STOCKS.filter((stock) =>
    watchlistSymbols.includes(stock.symbol)
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
      style={{ flex: 1, backgroundColor: Colors.bg.base }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary.main}
        />
      }
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ color: Colors.text.primary, fontSize: 26, fontWeight: "700" }}>
          Watchlist
        </Text>
        {loading && !refreshing && (
          <ActivityIndicator size="small" color={Colors.primary.main} />
        )}
      </View>

      <Text style={{ color: Colors.text.muted, fontSize: 12, marginBottom: 24 }}>
        {watchlistStocks.length} stock{watchlistStocks.length !== 1 ? "s" : ""} saved
      </Text>

      {/* Error banner */}
      {error && watchlistStocks.length > 0 && (
        <View style={{
          backgroundColor: Colors.bearish.tint,
          borderWidth: 1,
          borderColor: Colors.bearish.primary + "30",
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}>
          <Text style={{ color: Colors.bearish.primary, fontSize: 11, fontWeight: "500" }}>
            Live prices unavailable
          </Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ color: Colors.primary.main, fontSize: 11, marginTop: 4 }}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty state */}
      {watchlistStocks.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 64 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⭐</Text>
          <Text style={{ color: Colors.text.primary, fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            No stocks yet
          </Text>
          <Text style={{ color: Colors.text.muted, fontSize: 12, textAlign: "center", marginBottom: 24 }}>
            Tap the ☆ star on any stock card to save it here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search")}
            style={{
              backgroundColor: Colors.primary.main,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: Colors.bg.base, fontSize: 13, fontWeight: "600" }}>
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