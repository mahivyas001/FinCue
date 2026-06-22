import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string; // ← fixed: was missing, caused the red underline on line 39
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search stocks...', // ← default fallback
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused && styles.containerFocused,
      ]}
    >
      <Search
        size={16}
        color={focused ? COLORS.bullish : COLORS.textPrimary.muted}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder} // ← now passed through correctly
        placeholderTextColor={COLORS.textPrimary.muted}
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <X size={14} color={COLORS.textPrimary.faint} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   COLORS.appBg.card,
    borderRadius:      16,           // matches StockCard exactly
    paddingHorizontal: 14,
    paddingVertical:   12,
    borderWidth:       1,
    borderColor:       COLORS.border.default, // visible resting border, same as StockCard
  },
  containerFocused: {
    borderColor: COLORS.bullish,     // accent on focus — same as MarketFilterBar active pill
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary.primary,
    padding: 0,
  },
  clearBtn: {
    marginLeft: 8,
    padding: 2,
  },
});