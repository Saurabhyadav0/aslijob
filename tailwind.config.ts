import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        safe: "#15803d",
        suspicious: "#b45309",
        scam: "#b91c1c",
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "'Noto Sans Devanagari'",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
    },
  },
  plugins: [],
};

export default config;
