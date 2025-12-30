/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'shopee': {
          'orange': '#ee4d2d',
          'orange-light': '#ff6b35',
          'orange-dark': '#d63031',
          'blue': '#1e88e5',
          'gray': '#f5f5f5',
          'dark-gray': '#757575',
          'text': '#333333',
          'border': '#e0e0e0'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'shopee': '0 2px 8px rgba(0,0,0,0.1)',
        'shopee-lg': '0 4px 16px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
