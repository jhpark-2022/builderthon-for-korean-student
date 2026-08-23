"use client";

import dynamic from "next/dynamic";

// WebGL 배경은 클라이언트 전용입니다(ssr: false).
//
// DECIDED 2026-08-24: 히어로 라이브 스트립 하이드레이션 밀림 제거 — 서버가
// 자기 시각을 내려보내고(serverNow) 클라이언트가 그대로 그린 뒤 보정한다.
// / 는 정적 프리렌더에서 ISR(revalidate 300)로 바뀐다.
//
// 이 파일이 생긴 이유가 그것입니다. `dynamic(..., { ssr: false })`는 App Router에서
// 클라이언트 컴포넌트 안에서만 쓸 수 있어서, app/page.tsx 전체가 "use client"였어요.
// 그러면 페이지가 서버에서 자기 시각을 읽을 방법이 없습니다. 이 한 줄만 클라이언트로
// 떼어내면 page.tsx가 서버 컴포넌트가 되고, 나머지 클라이언트 컴포넌트들은 그대로
// 자식으로 들어갑니다.
const Background = dynamic(() => import("@/components/Background"), { ssr: false });

export default function BackgroundMount() {
  return <Background />;
}
