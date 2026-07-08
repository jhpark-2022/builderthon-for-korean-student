import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "-apple-system", "sans-serif"],
      },
      // Accent tokens used across EventModal (and elsewhere). Without these,
      // Tailwind v3 silently drops `text-accent`/`bg-accent`/`text-gold` etc.,
      // so the modal's neon strip, confirmed badge, gold star and links lost
      // their colour. Values mirror the violet/indigo/amber used site-wide.
      colors: {
        accent: "#7c3aed",
        "accent-strong": "#4f46e5",
        gold: "#fcd34d",
      },
      maxWidth: {
        wide: "1180px",
        board: "1760px",
      },
    },
  },
  plugins: [],
};

export default config;
