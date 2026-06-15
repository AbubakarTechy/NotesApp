/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38aef9',
          500: '#0e94e7',
          600: '#0276c3',
          700: '#025ea1',
          800: '#065084',
          900: '#0b436e',
          950: '#072b49',
        },
        ucp: {
          blue: '#0d3b66',
          gold: '#f4d35e',
          orange: '#f19c79',
          light: '#faf0ca',
          dark: '#081c2d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
