
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import SearchBar from "@/components/ui/SearchBar";
import StockCard from "@/components/stock/StockCard";
import { searchSymbols, SearchedSymbol } from "@/lib/api/symbols";
import { Stock, Market } from "@/types/stock";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await searchSymbols(query);
        setResults(data);
      } catch (err) {
        console.error("[SearchScreen] search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const mappedResults = results.map((item) => {
    const isIndian = item.symbol.endsWith('.BSE') || item.symbol.endsWith('.NS');
    const mapped: Stock = {
      symbol: item.symbol,
      name: item.name,
      price: 0,
      change: 0,
      changePercent: 0,
      signal: "neutral",
      confidence: 50,
      market: isIndian ? "IN" : "US",
    };
    (mapped as any).type = item.type;
    return mapped;
  });

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
          onClear={() => {
            setQuery("");
            setResults([]);
          }}
          placeholder="e.g. AAPL, Reliance..."
        />

        {/* Results */}
        <View className="mt-4">
          {query.trim().length < 2 ? (
            <View className="items-center py-16">
              <Text className="text-4xl mb-4">🔎</Text>
              <Text className="text-white font-semibold text-base mb-1">
                Search for a stock
              </Text>
              <Text className="text-neutral text-sm text-center">
                Type a stock symbol or company name (min 2 chars) to get started.
              </Text>
            </View>
          ) : isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#00B894" />
              <Text className="text-neutral text-sm text-center mt-4">
                Searching...
              </Text>
            </View>
          ) : results.length === 0 ? (
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
                {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </Text>
              {mappedResults.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 

