import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View className="flex-1 bg-darkBg px-4 pt-14">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-primary text-sm">← Back</Text>
      </TouchableOpacity>
      <Text className="text-white text-2xl font-bold">{symbol}</Text>
      <Text className="text-neutral text-sm mt-1">
        Stock detail screen — coming soon
      </Text>
    </View>
  );
}
