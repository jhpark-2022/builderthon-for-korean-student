// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 현장 팀 매칭(/match)의 공용 상수와 검사 (2026-10-08, 현장 팀 매칭 브리프 4.1).
// 페이지(components/match)와 라우트(app/api/crossing/match)가 같이 읽습니다. 서버 전용 코드를 넣지 마세요.
// ─────────────────────────────────────────────────────────────────────────────
import { CURRENT_EVENT } from "@/lib/registrationWindow";
import { DECEMBER_ENDS_AT } from "@/lib/naruDates";

/** crossing_match_profiles.event_slug. 신청과 같은 회차 슬러그입니다. */
export const MATCH_EVENT = CURRENT_EVENT;
export const MATCH_EDITION = "2026-12";
export const MATCH_NAME_MAX = 40;
export const MATCH_COUNTRY_RE = /^[A-Z]{2}$/;
/** 나라 select의 값. OTHER를 고르면 두 글자 코드를 직접 넣습니다(신청 폼의 study_country와 같은 값 체계). */
export const MATCH_COUNTRY_OTHER = "OTHER";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isMatchDeviceToken = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

/**
 * 결과를 받는 기간.
 *
 * DECIDED 2026-10-08 (사용자: "다 테스트도 해 보았으면 좋겠는데, 아직 supabase에 반영은 되지 않는 걸로"):
 * **지금은 닫혀 있습니다(opensAt: null).** /match는 누구나 끝까지 해 볼 수 있고(결과, 이미지 저장, 공유 다 됨),
 * 결과만 수파베이스에 올라가지 않습니다. 라우트는 403을 돌려주고 화면은 "지금은 미리 해 보기입니다"를 보여 줍니다.
 * 받기 시작하려면 opensAt에 시각을 적습니다(예: "2026-12-18T00:00:00+09:00", Day 1). 같은 날 아침의
 * "지금부터 받는다"는 이 결정이 대신합니다.
 * 닫히는 때는 행사 마지막 날의 다음 날 끝(서울 시각)이고, 마지막 날은 lib/naruDates.ts의 DECEMBER_ENDS_AT에서 옵니다.
 */
export const MATCH_WINDOW: { opensAt: string | null; closesAt: string | null } = {
  opensAt: null,
  closesAt: DECEMBER_ENDS_AT
    ? new Date(new Date(`${DECEMBER_ENDS_AT}T00:00:00+09:00`).getTime() + 2 * 86_400_000).toISOString()
    : null,
};

export function matchWindowOpen(now: number = Date.now()): boolean {
  if (!MATCH_WINDOW.opensAt || now < new Date(MATCH_WINDOW.opensAt).getTime()) return false;
  if (MATCH_WINDOW.closesAt && now >= new Date(MATCH_WINDOW.closesAt).getTime()) return false;
  return true;
}
