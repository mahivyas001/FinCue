import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface SearchBarProps {
  value:       string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search stocks…',
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused && styles.containerFocused,
      ]}
    >
      <Search size={16} color={focused ? Colors.bullish.primary : Colors.text.faint} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.faint}
        autoCapitalize="characters"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={14} color={Colors.text.dim} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.bg.card,
    borderRadius:    12,
    paddingHorizontal: 14,
    paddingVertical:   11,
    gap:             10,
    borderWidth:     1,
    borderColor:     'transparent',
  },
  containerFocused: {
    borderColor: Colors.bullish.primary + '55',
  },
  input: {
    flex:      1,
    fontSize:  14,
    color:     Colors.text.primary,
    padding:   0,
  },
});