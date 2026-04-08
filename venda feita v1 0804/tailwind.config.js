/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e6e9ed',
          100: '#b0b9c5',
          200: '#8a97a9',
          300: '#546881',
          400: '#334a68',
          500: '#0D1B2A',
          600: '#0b1826',
          700: '#09131e',
          800: '#070e17',
          900: '#050b11',
        },
        emerald: {
          50: '#e6f9f2',
          100: '#b0ecd8',
          200: '#8ae3c5',
          300: '#54d6ab',
          400: '#33ce9a',
          500: '#00C896',
          600: '#00a87e',
          700: '#008362',
          800: '#00664c',
          900: '#004e3a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
