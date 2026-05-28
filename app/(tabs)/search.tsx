
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { MOCK_STOCKS } from "@/constants/mockData";
import SearchBar from "@/components/ui/SearchBar";
import StockCard from "@/components/stock/StockCard";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  const filtered = MOCK_STOCKS.filter(
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
        <Text className="text-white text-2xl font-bold mb-1">Search</Text>
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
                <StockCard
                  key={stock.symbol}
                  symbol={stock.symbol}
                  name={stock.name}
                  price={stock.price}
                  change={stock.change}
                  changePercent={stock.changePercent}
                  signal={stock.signal}
                  confidence={stock.confidence}
                  market={stock.market}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 

