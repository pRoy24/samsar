/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0a0a0a', // deep, dark black
        'cyber-red': '#ff0000', // bright, vivid red
        'cyber-darkred': '#b30000', // dark, muted red
        'cyber-gray': '#303030', // medium gray for background
        'cyber-lightgray': '#505050', // light gray for secondary elements
      }
    },
  },
  plugins: [],
}

