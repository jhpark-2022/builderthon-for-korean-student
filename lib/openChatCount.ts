import { track } from "@vercel/analytics";

// ─────────────────────────────────────────────────────────────────────────────
// 오픈채팅 클릭 세기 (DECIDED 2026-10-22, 사용자: "오픈채팅 버튼은 예전처럼 카카오 주소로 바로, 사용자가 아무런 어색함이 없도록").
//
// 무료(Hobby) Vercel Analytics는 track() 이벤트를 저장하지 않고 페이지 방문만 셉니다. 그래서 버튼은 카카오 주소로 바로 가고
// (사용자가 직접 누른 링크라 폰에서 카카오톡 앱이 그대로 열립니다), 누르는 순간 원래 페이지 안에 보이지 않는 iframe으로
// /go/openchat/<src>를 한 번 불러 그 방문을 클릭 한 번으로 셉니다. 오픈채팅은 새 탭이라 원래 페이지가 남아 있어 기록이 끊기지 않습니다.
// 같은 날 먼저 해 본 "중간 페이지를 거쳐 0.35초 뒤 이동"은 iOS에서 앱이 바로 안 열릴 수 있어 되돌렸습니다.
//
// 읽는 법: Analytics의 Pages에서 /go/openchat/<src>의 방문 수 = 그 버튼의 클릭 수(하한). 전체 페이지뷰를 볼 때는 /go를 빼고 봅니다.
// 이름을 늘리면 app/go/openchat/[src]/page.tsx가 이 목록으로 정적 페이지를 만듭니다. 목록 밖 이름은 404입니다.
// ─────────────────────────────────────────────────────────────────────────────
export const OPENCHAT_SOURCES = [
  "band", "footer", "wrap", "naru-hero", "naru-december", "naru-join", "naru-footer",
  "site-menu", "site-menu-phone", "mobile-bar", "nav", "sticky", "hero", "vision",
  "naru-register-modal", "naru-register-success",
] as const;

/** 오픈채팅 링크의 onClick. 기본 이동(카카오 주소)은 막지 않습니다. */
export function trackOpenChat(src: string) {
  track("openchat_click", { src }); // Pro로 올리면 이것도 쌓입니다.
  if (typeof document === "undefined" || !(OPENCHAT_SOURCES as readonly string[]).includes(src)) return;
  try {
    const f = document.createElement("iframe");
    f.src = `/go/openchat/${src}`;
    f.title = "";
    f.tabIndex = -1;
    f.setAttribute("aria-hidden", "true");
    // 화면 밖 1px, 보이지 않고 눌리지 않습니다. 레이아웃을 밀지 않도록 fixed입니다.
    f.style.cssText = "position:fixed;left:-10px;top:0;width:1px;height:1px;border:0;opacity:0;visibility:hidden;pointer-events:none";
    document.body.appendChild(f);
    window.setTimeout(() => f.remove(), 8000);
  } catch {
    /* 세기에 실패해도 이동에는 영향이 없습니다 */
  }
}
