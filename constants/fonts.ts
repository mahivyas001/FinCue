// constants/fonts.ts
//
// Space Grotesk — the definitive crypto / Web3 font
// Used by Coinbase, Uniswap, many top DeFi and crypto apps
// Geometric, confident, modern — nothing else looks quite like it
//
// Install with:
//   npx expo install @expo-google-fonts/space-grotesk expo-font

export const FONTS = {
  regular:    'SpaceGrotesk_300Light',   // use for body text
  medium:     'SpaceGrotesk_400Regular', // use for labels
  semiBold:   'SpaceGrotesk_500Medium',  // use for subheadings
  bold:       'SpaceGrotesk_600SemiBold',// use for headings
  extraBold:  'SpaceGrotesk_700Bold',    // use for display / hero text
} as const;

// ── Font size scale ────────────────────────────────────────────────────
// Slightly larger than typical — crypto apps go big and bold
export const FONT_SIZE = {
  xs:   13,
  sm:   15,
  base: 17,
  md:   19,
  lg:   22,
  xl:   26,
  '2xl': 32,
  '3xl': 38,
  '4xl': 46,
} as const;