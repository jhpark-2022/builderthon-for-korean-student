// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 등록 창 (2026-09-18, Supabase 등록 브리프 2.3).
//
// 8월 상수와 isRegistrationClosed()는 2026-10-08에 걷었습니다(8월 등록 모달과 /api/register를 지우면서
// 읽는 곳이 없어졌습니다). 12월은 회차 슬러그와 창(opensAt / closesAt)을 따로 둡니다. 둘 다 null이면
// 아직 열지 않은 것입니다. 시각을 채울 때는 KST 오프셋(+09:00)을 문자열에 박으세요.
// 서버(app/api/crossing/register)와 클라이언트(components/crossing)가 같은 함수를 봅니다.
// ─────────────────────────────────────────────────────────────────────────────

import { CONSENT_NOTICE_READY } from "@/data/crossingForm";

/** 지금 등록을 받는 회차. crossing_registrations.event_slug에 그대로 들어갑니다. */
export const CURRENT_EVENT = "crossing-seoul-2026-12";

/** TODO: confirm. 등록 창. 예: opensAt "2026-10-20T12:00:00+09:00". 둘 다 null = 아직 안 엶. */
export const CROSSING_WINDOW: { opensAt: string | null; closesAt: string | null } = {
  opensAt: null,
  closesAt: null,
};

export type RegistrationState = "not_open" | "open" | "closed";

/**
 * `now` 시점의 등록 상태. 모르는 회차는 not_open.
 *
 * 2026-10-08 (보안 감사 M4, 폼 리뷰 3): 동의 안내의 보관 기간(data/crossingForm.ts의 CONSENT_RETENTION)이 비어 있으면
 * opensAt을 넣어도 not_open입니다. 날짜 한 줄로 미완성 동의 문구와 함께 등록이 열리는 일을 막습니다.
 */
export function registrationState(eventSlug: string = CURRENT_EVENT, now: number = Date.now()): RegistrationState {
  if (eventSlug !== CURRENT_EVENT) return "not_open";
  const { opensAt, closesAt } = CROSSING_WINDOW;
  if (!opensAt) return "not_open";
  if (closesAt && now >= new Date(closesAt).getTime()) return "closed";
  if (!CONSENT_NOTICE_READY) return "not_open";
  if (now < new Date(opensAt).getTime()) return "not_open";
  if (closesAt && now >= new Date(closesAt).getTime()) return "closed";
  return "open";
}
