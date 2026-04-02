/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0D1B2A',
          emerald: '#00C896',
          'emerald-light': '#E6FAF5',
          'emerald-dark': '#00A87E',
        },
        border: {
          DEFAULT: '#E2E8F0',
        },
        status: {
          success: '#10B981',
          'success-bg': '#ECFDF5',
          'success-text': '#065F46',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          'warning-text': '#92400E',
          error: '#EF4444',
          'error-bg': '#FEF2F2',
          'error-text': '#991B1B',
        },
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        badge: '999px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
