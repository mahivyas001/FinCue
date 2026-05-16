import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState, useMemo } from "react";
import { MOCK_STOCKS } from "@/constants/mockData";
import { useMultipleQuotes } from "@/hooks/useStockQuote";
import SearchBar from "@/components/ui/SearchBar";
import StockCard from "@/components/stock/StockCard";

const ALL_SYMBOLS = MOCK_STOCKS.map((s) => s.symbol);

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  // Always fetch all quotes so results show live prices instantly
  const { quotes, loading } = useMultipleQuotes(ALL_SYMBOLS);

  // Merge live quotes into mock stocks
  const enrichedStocks = useMemo(() =>
    MOCK_STOCKS.map((stock) => {
      const live = quotes[stock.symbol];
      if (!live) return stock;
      return {
        ...stock,
        price: live.price,
        change: live.change,
        changePercent: live.changePercent,
      };
    }),
    [quotes]
  );

  const filtered = enrichedStocks.filter(
    (stock) =>
      query.length > 0 &&
      (stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-darkBg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 56,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-white text-2xl font-bold">Search</Text>
          {loading && (
            <ActivityIndicator size="small" color="#4F46E5" />
          )}
        </View>
        <Text className="text-neutral text-xs mb-6">
          Find stocks by name or symbol.
        </Text>

        {/* Search bar */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          placeholder="e.g. AAPL, Reliance..."
        />

        {/* Results */}
        <View className="mt-4">
          {query.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-4xl mb-4">🔎</Text>
              <Text className="text-white font-semibold text-base mb-1">
                Search for a stock
              </Text>
              <Text className="text-neutral text-sm text-center">
                Type a stock symbol or company name to get started.
              </Text>
              {/* Show live status in empty state */}
              {!loading && Object.keys(quotes).length > 0 && (
                <View className="flex-row items-center gap-1 mt-4">
                  <View className="w-1.5 h-1.5 rounded-full bg-bullish" />
                  <Text className="text-neutral text-xs">
                    {Object.keys(quotes).length} live prices loaded
                  </Text>
                </View>
              )}
            </View>
          ) : filtered.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-4xl mb-4">😕</Text>
              <Text className="text-white font-semibold text-base mb-1">
                No results found
              </Text>
              <Text className="text-neutral text-sm text-center">
                Try searching for AAPL, TSLA, INFY or Reliance.
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-neutral text-xs mb-3">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
              </Text>
              {filtered.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}