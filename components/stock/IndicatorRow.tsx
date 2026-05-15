import { View, Text } from "react-native";

interface IndicatorRowProps {
  label: string;
  value: string;
  status: "bullish" | "bearish" | "neutral" | "info";
}

export default function IndicatorRow({ label, value, status }: IndicatorRowProps) {
  const valueColor =
    status === "bullish"
      ? "text-bullish"
      : status === "bearish"
      ? "text-bearish"
      : status === "neutral"
      ? "text-neutral"
      : "text-white";

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-white/5">
      <Text className="text-neutral text-sm">{label}</Text>
      <Text className={`${valueColor} text-sm font-semibold`}>{value}</Text>
    </View>
  );
}