import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_STOCKS } from "@/constants/mockData";
import StockCard from "@/components/stock/StockCard";
import MarketFilterBar from "@/components/ui/MarketFilterBar";
import AIInsightCard from "@/components/ui/AIInsightCard";
import { useMultipleQuotes } from "@/hooks/useStockQuote";
import { useTheme } from "@/hooks/useTheme";

const SYMBOLS = MOCK_STOCKS.map((s) => s.symbol);

export default function HomeScreen() {
  const { mode, marketFilter } = useAppStore();
  const { colors, isDark } = useTheme();
  const { quotes, loading, error, refresh } = useMultipleQuotes(SYMBOLS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const enrichedStocks = MOCK_STOCKS.map((stock) => {
    const live = quotes[stock.symbol];
    if (!live) return stock;
    return { ...stock, price: live.price, change: live.change, changePercent: live.changePercent };
  });

  const filteredStocks = enrichedStocks.filter((stock) =>
    marketFilter === "ALL" ? true : stock.market === marketFilter
  );

  const featuredStock = enrichedStocks.find((s) => s.signal === "bullish") ?? enrichedStocks[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <><RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" /><Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 30, color: "red" }}>
          Font Test
        </Text></>
      }
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <View>
          <Text style={{ color: colors.text, fontSize: 26, fontFamily: "SpaceGrotesk_700Bold" }}>
            FinCue ✦
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 2 }}>
            Market intelligence, simplified.
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {loading && <ActivityIndicator size="small" color="#4F46E5" />}
          <View
            style={{
              backgroundColor: "#4F46E515",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#4F46E530",
            }}
          >
            <Text style={{ color: "#4F46E5", fontSize: 11, fontFamily: "Poppins_600SemiBold" }}>
              {mode === "beginner" ? "🟢 Beginner" : "⚡ Advanced"}
            </Text>
          </View>
        </View>
      </View>

      {/* Error banner */}
      {error && (
        <View
          style={{
            backgroundColor: "#F43F5E10",
            borderWidth: 1,
            borderColor: "#F43F5E30",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#F43F5E", fontSize: 12, fontFamily: "Poppins_500Medium" }}>
            Could not load live prices.
          </Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ color: "#4F46E5", fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 4 }}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Beginner tip */}
      {mode === "beginner" && (
        <View
          style={{
            backgroundColor: "#4F46E510",
            borderWidth: 1,
            borderColor: "#4F46E525",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#4F46E5", fontSize: 11, fontFamily: "Poppins_600SemiBold", marginBottom: 2 }}>
            💡 Beginner Tip
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 11, fontFamily: "Poppins_400Regular", lineHeight: 16 }}>
            Green means the stock is up today. Red means it's down. The signal badge shows the overall trend.
          </Text>
        </View>
      )}

      {/* AI Insight */}
      <AIInsightCard
        symbol={featuredStock.symbol}
        signal={featuredStock.signal}
        confidence={featuredStock.confidence}
        explanation={`${featuredStock.name} is showing a ${featuredStock.signal} signal with ${featuredStock.confidence}% confidence based on current market indicators.`}
        isBeginnerMode={mode === "beginner"}
      />

      {/* Market Overview */}
      <Text style={{ color: colors.text, fontSize: 16, fontFamily: "Poppins_600SemiBold", marginBottom: 12, marginTop: 8 }}>
        Market Overview
      </Text>
      <MarketFilterBar />

      {/* Advanced mode info */}
      {mode === "advanced" && (
        <Text style={{ color: colors.muted, fontSize: 11, fontFamily: "Poppins_400Regular", marginBottom: 12 }}>
          {filteredStocks.length} stocks · {Object.keys(quotes).length} live prices loaded
        </Text>
      )}

      {/* Stock cards */}
      {filteredStocks.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 48 }}>
          <Text style={{ color: colors.subtext, fontSize: 13, fontFamily: "Poppins_400Regular" }}>
            No stocks found.
          </Text>
        </View>
      ) : (
        filteredStocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))
      )}
    </ScrollView>
  );
}