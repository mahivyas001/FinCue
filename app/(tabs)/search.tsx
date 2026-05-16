import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { MOCK_STOCKS } from "@/constants/mockData";
import { useMultipleQuotes } from "@/hooks/useStockQuote";
import { useTheme } from "@/hooks/useTheme";
import SearchBar from "@/components/ui/SearchBar";
import StockCard from "@/components/stock/StockCard";

const ALL_SYMBOLS = MOCK_STOCKS.map((s) => s.symbol);
const QUICK_SEARCH = ["AAPL", "TSLA", "RELIANCE", "INFY"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { colors } = useTheme();
  const router = useRouter();
  const { quotes, loading } = useMultipleQuotes(ALL_SYMBOLS);

  const enrichedStocks = useMemo(() =>
    MOCK_STOCKS.map((stock) => {
      const live = quotes[stock.symbol];
      if (!live) return stock;
      return { ...stock, price: live.price, change: live.change, changePercent: live.changePercent };
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
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontFamily: "SpaceGrotesk_700Bold" }}>
            Search
          </Text>
          {loading && <ActivityIndicator size="small" color="#4F46E5" />}
        </View>
        <Text style={{ color: colors.subtext, fontSize: 12, fontFamily: "Poppins_400Regular", marginBottom: 20 }}>
          Find stocks by name or symbol.
        </Text>

        {/* Search bar */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          placeholder="e.g. AAPL, Reliance..."
        />

        {/* Quick search chips */}
        {query.length === 0 && (
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontFamily: "Poppins_500Medium", marginBottom: 10 }}>
              POPULAR
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {QUICK_SEARCH.map((symbol) => (
                <TouchableOpacity
                  key={symbol}
                  onPress={() => setQuery(symbol)}
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 12, fontFamily: "SpaceGrotesk_600SemiBold" }}>
                    {symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        <View style={{ marginTop: 16 }}>
          {query.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={{ color: colors.text, fontSize: 15, fontFamily: "Poppins_600SemiBold", marginBottom: 6 }}>
                Search for a stock
              </Text>
              <Text style={{ color: colors.subtext, fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: "center" }}>
                Type a symbol or company name above, or tap a popular stock.
              </Text>
              {!loading && Object.keys(quotes).length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#10B981" }} />
                  <Text style={{ color: colors.muted, fontSize: 11, fontFamily: "Poppins_400Regular" }}>
                    {Object.keys(quotes).length} live prices ready
                  </Text>
                </View>
              )}
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>😕</Text>
              <Text style={{ color: colors.text, fontSize: 15, fontFamily: "Poppins_600SemiBold", marginBottom: 6 }}>
                No results
              </Text>
              <Text style={{ color: colors.subtext, fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: "center" }}>
                Try AAPL, TSLA, INFY or Reliance.
              </Text>
            </View>
          ) : (
            <>
              <Text style={{ color: colors.muted, fontSize: 11, fontFamily: "Poppins_400Regular", marginBottom: 12 }}>
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