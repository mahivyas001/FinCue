/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        bullish: "#10B981",
        bearish: "#F43F5E",
        neutral: "#64748B",
        darkBg: "#0F172A",
        darkCard: "#1E293B",
        lightBg: "#F8FAFC",
        lightCard: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
