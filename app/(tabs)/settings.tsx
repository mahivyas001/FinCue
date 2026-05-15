import { View, Text, TouchableOpacity, Switch } from "react-native";
import { useAppStore } from "@/store/useAppStore";

export default function SettingsScreen() {
  const { mode, setMode } = useAppStore();
  const isAdvanced = mode === "advanced";

  return (
    <View className="flex-1 bg-darkBg px-4 pt-14">
      {/* Header */}
      <Text className="text-white text-2xl font-bold mb-1">Settings</Text>
      <Text className="text-neutral text-xs mb-8">
        Customize your FinCue experience.
      </Text>

      {/* Mode toggle card */}
      <View className="bg-darkCard rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text className="text-white font-semibold text-sm">
              {isAdvanced ? "Advanced Mode" : "Beginner Mode"}
            </Text>
            <Text className="text-neutral text-xs mt-0.5">
              {isAdvanced
                ? "Technical indicators, candlestick charts, deeper analysis."
                : "Plain English explanations, simplified charts, guided insights."}
            </Text>
          </View>
          <Switch
            value={isAdvanced}
            onValueChange={(val) => setMode(val ? "advanced" : "beginner")}
            trackColor={{ false: "#1E293B", true: "#4F46E5" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Mode info cards */}
      <View className="flex-row gap-3 mt-2">
        <TouchableOpacity
          onPress={() => setMode("beginner")}
          className={`flex-1 rounded-2xl p-4 border ${
            !isAdvanced ? "border-primary bg-primary/10" : "border-darkCard bg-darkCard"
          }`}
        >
          <Text className="text-xl mb-1">🟢</Text>
          <Text className="text-white font-semibold text-sm mb-1">Beginner</Text>
          <Text className="text-neutral text-xs">
            Simple explanations. Great for learning.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode("advanced")}
          className={`flex-1 rounded-2xl p-4 border ${
            isAdvanced ? "border-primary bg-primary/10" : "border-darkCard bg-darkCard"
          }`}
        >
          <Text className="text-xl mb-1">⚡</Text>
          <Text className="text-white font-semibold text-sm mb-1">Advanced</Text>
          <Text className="text-neutral text-xs">
            Full indicators. For active traders.
          </Text>
        </TouchableOpacity>
      </View>

      {/* App info */}
      <View className="mt-8 bg-darkCard rounded-2xl p-4">
        <Text className="text-neutral text-xs mb-1">About</Text>
        <Text className="text-white font-semibold text-sm">FinCue</Text>
        <Text className="text-neutral text-xs mt-0.5">
          AI-powered market analysis. Not a brokerage. Not financial advice.
        </Text>
      </View>
    </View>
  );
}