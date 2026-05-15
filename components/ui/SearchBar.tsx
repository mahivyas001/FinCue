import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search stocks...",
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center bg-darkCard rounded-2xl px-4 py-3 border ${
        focused ? "border-primary" : "border-transparent"
      }`}
    >
      <Text className="text-neutral text-base mr-2">🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        className="flex-1 text-white text-sm"
        autoCapitalize="characters"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Text className="text-neutral text-base ml-2">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}