/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#03E1FF',
        dark: {
          DEFAULT: '#121319',
          50: '#1E1F28',
          100: '#2A2B36',
          200: '#363744',
          300: '#4A4B59',
          400: '#9395A6',
        }
      }
    },
  },
  plugins: [],
};