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
        // ── DECIDED 2026-09-15 (나루 런칭) ────────────────────────────────
        // accent는 EventModal·PartnerModal·RegisterModal에서 어두운 면 위의
        // 글자색으로 쓰입니다. 그래서 브랜드 원색(#4B3A8C)을 그대로 넣을 수
        // 없어요. --surface-2 위에서 2:1도 나오지 않아 읽히지 않습니다.
        // 원색의 밝은 틴트를 씁니다(6.1:1). 브랜드 원색은 아래 naru.purple에
        // 있고, 면이나 테두리로 쓸 때 그쪽을 부르세요.
        accent: "#A99AD6",
        // from-accent to-accent-strong 2px 헤어라인에만 쓰입니다. 보라에서
        // 자주로 흐르게 해 로고 그라데이션의 방향과 같은 쪽을 봅니다.
        "accent-strong": "#9A5A82",
        gold: "#fcd34d",
        // 나루 4색. 정본은 로고 가이드 v1(2026-09-13)입니다.
        // ink/surface는 app/globals.css의 --bg/--surface와 같은 값이라,
        // 한쪽을 바꾸면 반드시 다른 쪽도 바꾸세요.
        naru: {
          navy: "#12246B",
          purple: "#4B3A8C",
          plum: "#9A5A82",
          orange: "#EE8A4F",
          ink: "#070B1F",
          surface: "#0C1230",
          "surface-2": "#111A3A",
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
