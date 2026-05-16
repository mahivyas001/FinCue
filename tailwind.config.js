/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        bullish: "#10B981",
        bearish: "#F43F5E",
        neutral: "#71717A",
        // Dark
        darkBg: "#0A0A0A",
        darkCard: "#141414",
        darkCardElevated: "#1A1A1A",
        darkBorder: "#222222",
        // Light
        lightBg: "#F8FAFC",
        lightCard: "#FFFFFF",
        lightBorder: "#E2E8F0",
      },
      fontFamily: {
        poppins: ["Poppins_400Regular"],
        "poppins-medium": ["Poppins_500Medium"],
        "poppins-semibold": ["Poppins_600SemiBold"],
        "poppins-bold": ["Poppins_700Bold"],
        grotesk: ["SpaceGrotesk_400Regular"],
        "grotesk-medium": ["SpaceGrotesk_500Medium"],
        "grotesk-semibold": ["SpaceGrotesk_600SemiBold"],
        "grotesk-bold": ["SpaceGrotesk_700Bold"],
      },
    },
  },
  plugins: [],
};