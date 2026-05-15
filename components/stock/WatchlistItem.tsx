import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Stock } from "@/types";
import SignalBadge from "@/components/ui/SignalBadge";
import { useAppStore } from "@/store/useAppStore";

interface WatchlistItemProps {
  stock: Stock;
}

export default function WatchlistItem({ stock }: WatchlistItemProps) {
  const router = useRouter();
  const { removeFromWatchlist } = useAppStore();
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "text-bullish" : "text-bearish";
  const changePrefix = isPositive ? "+" : "";
  const currencySymbol = stock.market === "IN" ? "₹" : "$";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/stock/${stock.symbol}`)}
      activeOpacity={0.75}
      className="bg-darkCard rounded-2xl p-4 mb-3 flex-row items-center justify-between"
    >
      {/* Left — symbol + name */}
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-9 h-9 rounded-xl bg-primary/20 items-center justify-center">
          <Text className="text-primary font-bold text-xs">
            {stock.symbol.slice(0, 2)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">{stock.symbol}</Text>
          <Text className="text-neutral text-xs" numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
      </View>

      {/* Middle — price + change */}
      <View className="items-end mx-3">
        <Text className="text-white font-bold text-sm">
          {currencySymbol}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Text>
        <Text className={`${changeColor} text-xs`}>
          {changePrefix}{stock.changePercent.toFixed(2)}%
        </Text>
      </View>

      {/* Right — signal + remove */}
      <View className="items-end gap-2">
        <SignalBadge signal={stock.signal} size="sm" />
        <TouchableOpacity onPress={() => removeFromWatchlist(stock.symbol)}>
          <Text className="text-bearish text-xs">Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}