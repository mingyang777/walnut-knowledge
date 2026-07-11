import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        walnut: {
          50: "#faf6f1",
          100: "#f3ebe0",
          200: "#e6d4bc",
          300: "#d4b896",
          400: "#c19a6f",
          500: "#a67c52",
          600: "#8b6342",
          700: "#6f4d35",
          800: "#5c4030",
          900: "#4a3328",
          950: "#2a1a14",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
