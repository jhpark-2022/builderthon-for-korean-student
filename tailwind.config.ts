import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light "program brochure" theme inspired by the event-plan timetable.
        page: "#F4F6FA", // soft grey page background
        surface: "#FFFFFF", // white cards
        line: "#E1E6EF", // subtle borders
        navy: {
          DEFAULT: "#172747", // navy day-header bar
          deep: "#14213D",
          soft: "#22345c",
          light: "#3a4d78",
        },
        ink: {
          DEFAULT: "#1F2937", // primary text
          strong: "#172033",
          muted: "#5B626F", // muted text — darkened for WCAG AA on page bg
          faint: "#6B7480", // small labels — darkened for WCAG AA
        },
        accent: {
          DEFAULT: "#1F5BE0", // single main accent (blue) — AA-contrast for small text
          strong: "#1A4FC4",
          soft: "#EAF0FF",
        },
        gold: {
          DEFAULT: "#C2912E", // "main session" star
          soft: "#F4ECD8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        wide: "1180px", // text/content sections
        board: "1760px", // wide timetable centerpiece
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,32,51,0.04), 0 8px 24px -12px rgba(23,32,51,0.12)",
        "card-hover":
          "0 2px 4px rgba(23,32,51,0.06), 0 18px 40px -16px rgba(23,32,51,0.22)",
        soft: "0 10px 30px -18px rgba(23,32,51,0.25)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
