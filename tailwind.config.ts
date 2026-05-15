import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          50:  "#F0F4F9",
          100: "#D9E2EE",
          200: "#A8BBD3",
          300: "#7894B8",
          400: "#476D9D",
          500: "#1F4675",
          600: "#0A2540",
          700: "#081E35",
          800: "#06172A",
          900: "#04111F",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          50:  "#E6FAF4",
          100: "#B9F2DF",
          200: "#7FE6C4",
          300: "#45DAA9",
          400: "#1CCE94",
          500: "#00C896",
          600: "#00A07A",
          700: "#00785C",
          800: "#00513E",
          900: "#002921",
        },
        warm: {
          DEFAULT: "rgb(var(--color-accent-warm) / <alpha-value>)",
          500: "#FF6B35",
          600: "#E85A26",
          700: "#C24A1F",
        },
        bg:      "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        text:    "rgb(var(--color-text) / <alpha-value>)",
        muted:   "rgb(var(--color-text-muted) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "calc(var(--radius) + 4px)",
        xl: "14px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 37, 64, 0.04), 0 8px 24px -8px rgba(10, 37, 64, 0.10)",
        soft: "0 4px 16px -4px rgba(10, 37, 64, 0.08)",
        pop:  "0 18px 48px -12px rgba(10,37,64,.22), 0 6px 16px -8px rgba(10,37,64,.16)",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
