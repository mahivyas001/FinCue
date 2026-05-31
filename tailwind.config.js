/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:  '#A2E0FC',
        bullish:  '#A2E0FC',
        bearish:  '#FB7185',
        neutral:  '#6B7280',
        'baby-blue':  '#A2E0FC',
        'baby-pink':  '#FB7185',
        bg: {
          base:     '#0A0A0A',
          card:     '#111111',
          elevated: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
};