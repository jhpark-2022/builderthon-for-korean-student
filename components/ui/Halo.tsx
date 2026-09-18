// ─────────────────────────────────────────────────────────────────────────────
// 제목의 발광 (2026-09-17, 8월 문법 브리프).
//
// 8월 페이지의 챕터 제목은 두 겹으로 섭니다. 글자에 어두운 drop-shadow
// (0 2px 30px rgba(0,0,0,0.6))가 있어서 WebGL 필드 위에서 떨어져 보이고, 히어로
// H1은 보라 발광(0 4px 40px rgba(124,58,237,0.5))까지 얹습니다. 나루 홈의 H2는
// 둘 다 없어서 같은 크기인데도 납작하게 읽혔습니다.
//
// 이 컴포넌트는 그 두 겹을 한 자리에서 냅니다: 글자 뒤 방사형 면(blur-3xl, 챕터
// 색) + 글자의 어두운 drop-shadow. 색은 챕터 아이브로의 색을 따릅니다. 8월 페이지는
// 이 컴포넌트를 쓰지 않습니다(그쪽 제목은 그대로).
//
// isolate: -z-10 면이 이 span 안에 갇히게. 없으면 Chapter의 z-10 컨텍스트 바닥으로
// 내려가 섹션 띠(BAND_TINT) 아래로 들어갑니다.
// ─────────────────────────────────────────────────────────────────────────────
import type { ReactNode } from "react";

// 2026-09-18 (감사 반영 브리프 8): cyan·emerald·orange 톤을 뺐습니다. 이 컴포넌트는 나루 홈만
// 쓰고, 홈의 발광은 보라 둘(violet = 틴트, purple = 원색)뿐입니다.
export type HaloTone = "violet" | "purple";

const TONE: Record<HaloTone, string> = {
  violet: "rgba(154,140,201,0.34)",  // --violet-soft
  purple: "rgba(75,58,140,0.55)",    // --purple. 히어로 H1의 발광.
};

export default function Halo({
  tone = "violet",
  children,
  className = "",
}: {
  tone?: HaloTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative isolate inline-block ${className}`.trim()}>
      <span
        aria-hidden
        // inset-x-0: 가로로 번지지 않습니다. -inset-x-[16%]였을 때 390px에서 이 면이
        // 뷰포트 밖 27px까지 나가 body.scrollWidth가 417이 됐습니다(html의
        // overflow-x: clip 덕에 스크롤은 안 생기지만 문서 폭은 늘어납니다). blur는
        // 레이아웃 폭에 잡히지 않으므로 번짐은 그대로 보입니다.
        className="pointer-events-none absolute inset-x-0 -inset-y-[40%] -z-10 rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${TONE[tone]}, transparent 72%)` }}
      />
      <span className="relative drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">{children}</span>
    </span>
  );
}
