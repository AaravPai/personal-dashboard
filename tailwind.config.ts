import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lux: {
          gold: "hsl(var(--lux-gold))",
          "gold-soft": "hsl(var(--lux-gold-soft))",
          purple: "hsl(var(--lux-purple))",
          "purple-soft": "hsl(var(--lux-purple-soft))",
          silver: "hsl(var(--lux-silver))",
        },
      },
    },
  },
  plugins: [],
};

export default config;