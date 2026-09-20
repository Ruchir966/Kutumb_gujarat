/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#1d4ed8', // blue-700
          orange: '#f97316', // orange-500
          bg: '#f8fafc', // slate-50
        }
      }
    },
  },
  plugins: [],
}
