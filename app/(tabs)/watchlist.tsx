import { View, Text, ScrollView } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { MOCK_STOCKS } from "@/constants/mockData";
import WatchlistItem from "@/components/stock/WatchlistItem";

export default function WatchlistScreen() {
  const { watchlist } = useAppStore();

  const watchlistStocks = MOCK_STOCKS.filter((stock) =>
    watchlist.some((item) => item.symbol === stock.symbol)
  );

  return (
    <ScrollView
      className="flex-1 bg-darkBg"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text className="text-white text-2xl font-bold mb-1">Watchlist</Text>
      <Text className="text-neutral text-xs mb-6">
        {watchlistStocks.length} stock{watchlistStocks.length !== 1 ? "s" : ""} saved.
      </Text>

      {/* Empty state */}
      {watchlistStocks.length === 0 ? (
        <View className="items-center py-16">
          <Text className="text-4xl mb-4">📋</Text>
          <Text className="text-white font-semibold text-base mb-1">
            No stocks yet
          </Text>
          <Text className="text-neutral text-sm text-center">
            Go to the home screen and tap a stock to add it to your watchlist.
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