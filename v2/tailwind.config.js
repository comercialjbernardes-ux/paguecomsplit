/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Navy — extraído de vendafeita.com (paleta escura teal-navy) ──
        navy: {
          50:  '#e8eaeb',
          100: '#b6bcc0',
          200: '#8e979d',
          300: '#5d6b72',
          400: '#364e5c',
          500: '#1b2831',   // bg cards dark (era #0D1B2A)
          600: '#141e25',
          700: '#0f161b',   // sidebar bg — darkest dark vendafeita.com
          800: '#0a1014',
          900: '#060b0f',
        },
        // ── Emerald — verde exato de vendafeita.com #00A573 ──
        emerald: {
          50:  '#e6f7f2',
          100: '#b3e8d9',
          200: '#80d9c0',
          300: '#4dcba7',
          400: '#26bf95',
          500: '#00A573',   // CTA principal vendafeita.com (era #00C896)
          600: '#008b61',
          700: '#006e4b',
          800: '#005038',
          900: '#003625',
        },
      },
      fontFamily: {
        // Inter para corpo de texto, Exo para títulos e exibição
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Exo', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'vf-hero': 'linear-gradient(180deg, #0f161b 0%, rgba(0,165,115,0.05) 100%)',
      },
    },
  },
  plugins: [],
}
