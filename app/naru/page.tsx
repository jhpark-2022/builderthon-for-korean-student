import { permanentRedirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// /naru → / (308). DECIDED 2026-10-26 (naru-first, docs/naru-first-brief.md D2): 나루는 이제 홈입니다.
// 공유 카드와 카카오톡에 뿌린 /naru 링크가 살아 있도록 남깁니다. 쿼리(?lang=en 등)를 지키는 리다이렉트는 middleware.ts가 먼저 하고,
// 이 파일은 그 밖의 경로로 들어온 경우의 받침입니다.
// ─────────────────────────────────────────────────────────────────────────────
export default function NaruRedirect() {
  permanentRedirect("/");
}
