"use client";

import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 홈(/)에서 그 전 홈의 주소를 크로싱 서울(/crossing)로 넘깁니다(2026-10-26, naru-first, docs/naru-first-brief.md 1.1).
//
// 크로싱 서울은 /에서 /crossing으로 옮겼습니다. 밖에 뿌린 /#december, /#register 같은 링크와 등록을 바로 여는 /?register=1이
// 나루 홈에 떨어지면 갈 곳이 없습니다. 그래서 그 해시가 크로싱 서울 페이지에만 있는 id이거나 ?register=가 있으면 같은 해시와 쿼리로
// /crossing에 replace합니다(뒤로 가기에 나루 홈이 끼지 않게). 두 페이지에 다 있는 id(#naru, #top)는 홈에 남깁니다.
// 해시는 서버로 오지 않아 middleware.ts가 볼 수 없어 이 자리에서 합니다. ?register=는 middleware.ts도 먼저 넘깁니다.
// ─────────────────────────────────────────────────────────────────────────────
const CROSSING_ONLY_IDS = new Set(["december", "curation", "schedule", "mentoring", "register", "gains", "partners"]);

export default function HashForward() {
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const params = new URLSearchParams(window.location.search);
      if (CROSSING_ONLY_IDS.has(id) || params.has("register")) {
        window.location.replace(`/crossing${window.location.search}${window.location.hash}`);
      }
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);
  return null;
}
