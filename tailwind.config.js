/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:  '#93C5FD',
        bullish:  '#93C5FD',
        bearish:  '#FDA4AF',
        neutral:  '#6B7280',
        'baby-pink':  '#FDA4AF',
        'baby-blue':  '#93C5FD',
        'pink-light': '#FECDD3',
        'blue-light': '#BFDBFE',
        'chart-pink': '#F472B6',
        'chart-blue': '#60A5FA',
        bg: {
          base:     '#09090F',
          card:     '#111117',
          elevated: '#18181F',
        },
      },
    },
  },
  plugins: [],
};