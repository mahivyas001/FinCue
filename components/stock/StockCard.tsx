import { TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Stock } from "@/types";
import SignalBadge from "@/components/ui/SignalBadge";
import { useAppStore } from "@/store/useAppStore";

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const router = useRouter();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();

  const isWatchlisted = watchlist.some((item) => item.symbol === stock.symbol);
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "text-bullish" : "text-bearish";
  const changePrefix = isPositive ? "+" : "";
  const currencySymbol = stock.market === "IN" ? "₹" : "$";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/stock/${stock.symbol}`)}
      activeOpacity={0.75}
      className="bg-darkCard rounded-2xl p-4 mb-3"
    >
      {/* Top row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-xl bg-primary/20 items-center justify-center">
            <Text className="text-primary font-bold text-xs">
              {stock.symbol.slice(0, 2)}
            </Text>
          </View>
          <View>
            <Text className="text-white font-semibold text-sm">{stock.symbol}</Text>
            <Text className="text-neutral text-xs">{stock.market} Market</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <SignalBadge signal={stock.signal} confidence={stock.confidence} size="sm" />
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              isWatchlisted
                ? removeFromWatchlist(stock.symbol)
                : addToWatchlist(stock.symbol);
            }}
            className="w-7 h-7 rounded-full bg-darkBg items-center justify-center"
          >
            <Text className="text-xs">
              {isWatchlisted ? "★" : "☆"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom row */}
      <View className="flex-row items-end justify-between mt-1">
        <Text className="text-white text-xl font-bold">
          {currencySymbol}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Text>
        <Text className={`${changeColor} text-sm font-medium`}>
          {changePrefix}{stock.change.toFixed(2)} ({changePrefix}{stock.changePercent.toFixed(2)}%)
        </Text>
      </View>

      <Text className="text-neutral text-xs mt-1">{stock.name}</Text>
    </TouchableOpacity>
  );
}