/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./js/main.js"],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        surface: '#0B0B0B',
        card: '#111111',
        bordercol: '#1F1F1F',
        primaryText: '#F5F5F5',
        secondaryText: '#A1A1AA',
        accent: '#D97706'
      },
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
