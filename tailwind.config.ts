import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        scene: {
          bg: "#000000",
          // Large section cards (the dark equivalent of Macro's #f2f2f7 surface)
          surface: "#121214",
          // Inner cards / app-like UI
          "surface-2": "#1C1C1E",
          "surface-3": "#2C2C2E",
          muted: "#8E8E93",
          faint: "#636366",
          line: "rgba(255,255,255,0.08)",
          border: "#1a1a1a",
          separator: "#3A3A3C",
          // Pulled from the app's star ratings
          accent: "#FFD300",
        },
      },
      borderRadius: {
        card: "2.5rem",
        "card-sm": "1.75rem",
        "card-lg": "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-inter-tight)",
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      maxWidth: {
        "6xl": "72rem",
      },
    },
  },
  plugins: [],
};
export default config;
