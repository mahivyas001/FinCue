import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 bg-darkBg items-center justify-center px-6">
      <Text className="text-white text-xl font-bold mb-2">Page Not Found</Text>
      <Text className="text-neutral text-sm mb-6">
        This screen doesn't exist.
      </Text>
      <Link href="/">
        <Text className="text-primary">Go to Home</Text>
      </Link>
    </View>
  );
}
