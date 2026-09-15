"use client";

import { useEffect } from "react";

// <body>에 data-sticky를 심습니다. app/globals.css의 모바일 하단 패딩 규칙이
// 이 속성을 봅니다.
//
// DECIDED 2026-09-15: 그 규칙은 원래 전역이었습니다. 8월 페이지의 모바일
// 스티키 바 자리를 예약하는 것인데, 루트 폰트가 18px이라 4rem이 72px이고,
// 스티키 바가 없는 나루 홈에서도 푸터 아래 72px이 그대로 비어 있었습니다.
//
// 레이아웃에서 라우트를 보고 심을 수도 있지만, 그러면 레이아웃이 자식 페이지의
// 사정을 알아야 합니다. 자리를 쓰는 페이지가 자기 자리를 예약하는 쪽이 맞습니다.
export default function StickyBarSpace() {
  useEffect(() => {
    document.body.setAttribute("data-sticky", "");
    return () => document.body.removeAttribute("data-sticky");
  }, []);
  return null;
}
