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
// 바탕 #070B1F 위에서 10.58:1입니다. 원색 #EE8A4F도 7.79:1로 AA는
// 통과하지만(2026-09-15 재측정, 이전 주석의 5.9:1은 틀린 값이었습니다)
// 여유가 크고 주황을 점으로 아끼는 규칙과도 맞아 틴트를 씁니다.
// ─────────────────────────────────────────────────────────────────────────────
export default function Eyebrow({ children, color = "violet", className = "" }: { children: React.ReactNode; color?: "violet" | "cyan" | "emerald" | "purple" | "plum" | "orange"; className?: string }) {
  const map = {
    // ── 8월 회차 전용. Journey.tsx만 부릅니다 ────────────────────────────
    // 나루 화면에서 쓰지 마세요. Tailwind 기본 violet은 색상이 나루 보라와
    // 같은 255도지만 채도가 92%입니다(나루 보라는 41%). 나란히 두면 하나는
    // 네온, 하나는 먼지 낀 보라로 명백히 다른 색입니다. cyan은 색상 187도라
    // 나루 4색 어디에서도 나올 수 없고, 대비 15.6:1이라 화면에서 가장 밝은
    // 요소가 되어 주황 CTA보다 튑니다.
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    // ── 나루 4색에서 나온 것만 ───────────────────────────────────────────
    // 원색을 글자로 쓸 수 없어서(어두운 바탕 위 보라 2.12:1, 남색 1.38:1)
    // 같은 색상환 위치에서 명도만 올린 틴트를 씁니다. 옆 숫자는 바탕
    // #070B1F 위 대비입니다.
    // 2026-09-18 (감사 반영 브리프 8): 챕터 아이브로는 이것 하나, 외곽선만(면 없음).
    // 나루 홈의 모든 챕터가 이 변형을 씁니다. violet·cyan·emerald·orange는 8월 페이지가
    // 쓰거나 정의만 남은 것이고, 홈에서는 부르지 않습니다.
    purple: "border-accent/40 bg-transparent text-accent",              // #A99AD6  7.69:1
    plum: "border-[#C79BB4]/30 bg-[#C79BB4]/10 text-[#C79BB4]",       // #C79BB4  8.15:1
    // 2026-09-17 (8월 문법 브리프): 면을 뺐습니다. 주황은 글자색과 테두리만. 주황은 면이 아니라 점입니다.
    orange: "border-naru-orange/35 bg-transparent text-[#F2B183]", // #F2B183 10.58:1
  } as const;
  return (
    <span className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${map[color]} ${className}`}>
      {children}
    </span>
  );
}
