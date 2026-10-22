// ─────────────────────────────────────────────────────────────────────────────
// 오픈채팅으로 가는 주소 (DECIDED 2026-10-22, 사용자: Analytics 개선 1번 "적용").
// 무료(Hobby) 요금제의 Vercel Analytics는 track() 이벤트를 저장하지 않고 페이지 방문만 셉니다.
// 그래서 오픈채팅 버튼은 카카오로 바로 가지 않고 /go/openchat/<src>를 거칩니다. 그 페이지의 방문 수가 곧
// 버튼을 누른 수이고, src(hero, mobile-bar, nav …)로 어느 버튼인지 갈립니다. 실제 주소는 links.openChat 하나.
// ─────────────────────────────────────────────────────────────────────────────
export const openChatHref = (src: string) => `/go/openchat/${encodeURIComponent(src)}`;
