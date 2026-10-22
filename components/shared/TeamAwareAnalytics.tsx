"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

// ─────────────────────────────────────────────────────────────────────────────
// 팀 방문은 세지 않습니다 (DECIDED 2026-10-23, 사용자: Analytics 점검 뒤 "2번만", 팀 방문 빼기).
//
// 30일 점검에서 Mac 데스크톱 방문이 전체 뷰의 절반을 넘어 참가자 숫자를 읽기 어려웠습니다.
// 팀원은 쓰는 브라우저마다 한 번 아무 페이지 주소 끝에 ?team=on을 붙여 엽니다. 그 브라우저에 표시가 남고,
// 그때부터 그 브라우저의 페이지뷰와 이벤트는 보내지 않습니다(오픈채팅 클릭을 세는 /go/openchat 방문도 같은 이유로 빠집니다).
// 되돌리려면 ?team=off. 시크릿 창이나 브라우저 데이터를 지우면 표시도 사라지니 다시 켭니다.
// Speed Insights는 그대로 둡니다. 속도는 누가 열었든 같은 사이트의 속도입니다.
// ─────────────────────────────────────────────────────────────────────────────
const KEY = "naru-team";

function isTeam(url: string): boolean {
  try {
    const team = new URL(url).searchParams.get("team");
    if (team === "on") window.localStorage.setItem(KEY, "1");
    if (team === "off") window.localStorage.removeItem(KEY);
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export default function TeamAwareAnalytics() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        if (isTeam(event.url)) {
          console.info("[naru] 팀 브라우저라 이 방문은 세지 않습니다. 끄려면 ?team=off");
          return null;
        }
        return event;
      }}
    />
  );
}
