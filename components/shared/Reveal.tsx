"use client";

import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 스크롤하면 올라오며 나타나는 블록 (ADDED 2026-09-19, 사용자: "맨 위에서
// 스크롤해서 아래로 내릴 때 애니메이션이 있으면 좋겠다, 8월 페이지와 같은 효과로").
//
// **효과는 components/journey/Chapter.tsx의 것을 그대로 씁니다.** 값 하나도
// 바꾸지 마세요: opacity 0 → 1, translateY(40px) → 0, 700ms ease-out, 한 번만.
// 두 페이지가 한 사이트로 읽히려면 움직이는 방식이 같아야 합니다.
//
// 왜 Chapter로는 모자랐는가: 홈도 같은 Chapter를 쓰고 있었지만 챕터가 다섯이고
// 하나가 3,000px입니다. 챕터에 들어서는 순간 한 번 나타난 뒤로는 화면 몇 개
// 분량을 아무 일 없이 내려가게 됩니다. 8월 페이지는 챕터가 열 몇 개이고 대부분
// 한 화면 높이라 스크롤 내내 무언가 올라왔어요. 그래서 홈에서는 챕터 안의
// 블록에 같은 효과를 답니다.
//
// data-chapter-reveal을 그대로 붙이는 것이 요점입니다. globals.css의 안전망
// (번들이 죽으면 1.5초 뒤 강제로 보이게)과 모션 민감 설정(transform 제거)이
// 그 선택자로 걸려 있습니다. 새 이름을 만들면 둘 다 빠집니다.
// ─────────────────────────────────────────────────────────────────────────────
// DECIDED 2026-10-20 (hwang 브리프 3.1, 감사 W6, D5 기본값: 리빌 전부 제거): 스크롤마다 올라오던 효과(opacity 0 → 1,
// translateY 40px, 700ms)를 걷었습니다. 모션 토글이 이 효과를 끄지 못했습니다. 감싸는 태그와 data-chapter-reveal은
// 남깁니다. 배경(lib/background/scene/BackgroundScene.ts)이 판의 위치를 잴 때 이 속성을 읽습니다.
export default function Reveal({
  children,
  className = "",
  id,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  /** 2026-10-20부터 쓰지 않습니다. 호출부를 남기려고 받기만 합니다. */
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  return (
    <Tag id={id} data-chapter-reveal className={className}>
      {children}
    </Tag>
  );
}
