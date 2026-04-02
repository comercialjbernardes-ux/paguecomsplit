/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0D1B2A',
          emerald: '#00C896',
          'emerald-dark': '#00A37A',
        },
        neutral: {
          50: '#F7F8FA',
          200: '#E2E8F0',
          500: '#6B7280',
          900: '#111827',
        },
        status: {
          success: '#166534',
          'success-bg': '#DCFCE7',
          warning: '#854D0E',
          'warning-bg': '#FEF9C3',
          error: '#991B1B',
          'error-bg': '#FEE2E2',
        },
        chart: {
          primary: '#00C896',
          secondary: '#6366F1',
          accent: '#F97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
