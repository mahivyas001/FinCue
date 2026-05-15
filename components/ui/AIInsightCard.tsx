import { View, Text } from "react-native";
import { Signal } from "@/types";

interface AIInsightCardProps {
  symbol: string;
  signal: Signal;
  confidence: number;
  explanation: string;
  isBeginnerMode?: boolean;
}

export default function AIInsightCard({
  symbol,
  signal,
  confidence,
  explanation,
  isBeginnerMode = true,
}: AIInsightCardProps) {
  const signalColor =
    signal === "bullish"
      ? "text-bullish"
      : signal === "bearish"
      ? "text-bearish"
      : "text-neutral";

  const borderColor =
    signal === "bullish"
      ? "border-bullish/30"
      : signal === "bearish"
      ? "border-bearish/30"
      : "border-neutral/30";

  const bgColor =
    signal === "bullish"
      ? "bg-bullish/5"
      : signal === "bearish"
      ? "bg-bearish/5"
      : "bg-neutral/5";

  return (
    <View className={`rounded-2xl p-4 border ${borderColor} ${bgColor} mb-3`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">✦</Text>
          <Text className="text-white font-semibold text-sm">
            AI Insight — {symbol}
          </Text>
        </View>
        <View className="bg-darkCard px-2 py-0.5 rounded-full">
          <Text className={`${signalColor} text-xs font-bold`}>
            {confidence}% confidence
          </Text>
        </View>
      </View>

      {/* Explanation */}
      <Text className="text-white/80 text-sm leading-5">{explanation}</Text>

      {/* Beginner label */}
      {isBeginnerMode && (
        <View className="mt-3 flex-row items-center gap-1">
          <Text className="text-neutral text-xs">🟢 Beginner-friendly explanation</Text>
        </View>
      )}
    </View>
  );
}