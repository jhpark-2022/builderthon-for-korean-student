import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  // DECIDED 2026-10-20 (hwang 브리프 3.3, 시각 브리프 3.5): hover: 변형을 (hover: hover) 미디어 안에서만 만듭니다. 폰에서 누른 뒤 호버 모양이 남지 않게.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "-apple-system", "sans-serif"],
      },
      // DECIDED 2026-10-26: UI 값은 globals.css가 소유하고 Tailwind는 같은 채널을 읽습니다.
      colors: {
        // 밝은 링크 색과 흰 글자를 얹는 버튼 면을 구분합니다.
        accent: "rgb(var(--ui-link) / <alpha-value>)",
        // 모달의 2px 헤어라인은 밝은 블루에서 버튼 블루로 이어집니다.
        "accent-strong": "rgb(var(--ui-primary) / <alpha-value>)",
        action: {
          DEFAULT: "rgb(var(--ui-primary) / <alpha-value>)",
          hover: "rgb(var(--ui-primary-hover) / <alpha-value>)",
        },
        gold: "#fcd34d",
        // 브랜드 원색은 로고용으로 유지합니다. ink/surface/text는 공통 UI 토큰입니다.
        naru: {
          navy: "#12246B",
          purple: "#4B3A8C",
          plum: "#9A5A82",
          // DECIDED 2026-10-08 (사용자 승인, 브랜드 감사 11): 손으로 적던 색 셋에 이름을 붙입니다.
          // plum-tint는 GRADIENT_TEXT의 끝 색이자 자주 글자색(바탕 위 8.15:1). logo-from, logo-to는
          // 히어로 워드마크의 그라데이션(로고 v2)입니다. 값은 그 전과 같습니다.
          "plum-tint": "#C79BB4",
          "logo-from": "#9AA8EE",
          "logo-to": "#C99ACB",
          orange: "#EE8A4F",
          ink: "rgb(var(--ui-ink) / <alpha-value>)",
          surface: "rgb(var(--ui-surface) / <alpha-value>)",
          "surface-2": "rgb(var(--ui-raised) / <alpha-value>)",
          text: "rgb(var(--ui-text) / <alpha-value>)",
          muted: "rgb(var(--ui-muted) / <alpha-value>)",
        },
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
