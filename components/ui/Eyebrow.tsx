"use client";

// ─────────────────────────────────────────────────────────────────────────────
// EYEBROW: 챕터를 표시하는 작은 알약.
//
// MOVED HERE 2026-09-15 (나루 런칭). It lived inside components/journey/
// Journey.tsx, which is the 8월 회차 페이지 본체. 나루 홈(components/home/
// NaruHome.tsx)이 같은 칩을 써야 하는데 5,157줄짜리 파일에서 하나만 꺼낼 방법이
// 없어서 여기로 옮겼습니다. Journey.tsx는 이제 이 파일을 import 합니다.
// 마크업과 클래스는 한 글자도 바뀌지 않았습니다.
//
// DECIDED 2026-09-15: color에 orange 추가. 나루 팔레트의 주황(#EE8A4F)은 CTA와
// 강조점에만 점처럼 쓰는 색이라(로고 가이드의 "나루 점"), 챕터 하나에만 붙습니다.
// 지금은 다음 회차(#december)입니다. 전부 주황으로 칠하면 강조가 강조가 아닙니다.
// 글자색을 #EE8A4F가 아니라 한 단계 밝은 #F2B183으로 둔 것은 대비 때문입니다:
// 바탕 #070B1F 위에서 10.5:1이고, 원색 그대로면 5.9:1로 떨어집니다.
// ─────────────────────────────────────────────────────────────────────────────
export default function Eyebrow({ children, color = "violet", className = "" }: { children: React.ReactNode; color?: "violet" | "cyan" | "emerald" | "orange"; className?: string }) {
  const map = {
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    orange: "border-naru-orange/35 bg-naru-orange/10 text-[#F2B183]",
  } as const;
  return (
    <span className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${map[color]} ${className}`}>
      {children}
    </span>
  );
}
