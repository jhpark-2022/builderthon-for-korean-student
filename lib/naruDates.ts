// ─────────────────────────────────────────────────────────────────────────────
// 12월 회차(나루 2회차, 서울)의 날짜. 단일 출처.
//
// DECIDED 2026-09-15 (나루 런칭): 12월 날짜 문자열은 오직 이 파일에서만 나옵니다.
//
// 8월 회차에서 같은 실수를 이미 했습니다. 등록 마감 시각이 Journey.tsx 안에
// 상수로 박혀 있었고, 그걸 글로 말하는 문구가 dictionary에 따로 있었어요. 하나를
// 고치면 다른 하나가 남았습니다(lib/registrationWindow.ts의 기록 참고).
//
// 12월은 그 위험이 더 큽니다. 지금 확정된 것은 시작일 하나뿐이고 나머지는 11월
// 까지 확정될 예정이라, 앞으로 이 값들은 반드시 한 번 이상 바뀝니다. 바뀔 것을
// 아는 값은 처음부터 한 곳에 둡니다.
//
// 2단계에서 /seoul 상세 페이지와 12월 등록 창도 이 파일을 읽게 하세요.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 2회차 시작일. **확정된 사실**입니다.
 *
 * 기획 초안(빌더톤_2회차_원페이저.pdf, v1 2026-09-10)은 12/10~12/14로 적고
 * 있습니다. 그 문서는 내부 공유용 초안이고, 확정된 것은 12월 9일 시작이라는
 * 사실뿐입니다. TODO: confirm. 초안과 확정 사이의 차이를 기획 팀과 맞출 것.
 */
export const DECEMBER_STARTS_AT = "2026-12-09";

/**
 * 2회차 종료일. **아직 확정되지 않았습니다.**
 *
 * TODO: confirm. 기획 초안은 12/14 종료(실질 4일 + 사전 팀 본딩)이지만 확정이
 * 아닙니다. null인 동안 화면은 "12월 9일부터"까지만 그립니다. 없는 날짜를
 * 지어내 채우지 마세요. 참가자가 항공권을 그 날짜로 끊습니다.
 */
export const DECEMBER_ENDS_AT: string | null = null;

/** 열리는 도시. 확정. */
export const DECEMBER_CITY = { ko: "서울", en: "Seoul" } as const;

type Locale = "ko" | "en";

// "2026-12-09" → [2026, 12, 9]. Date를 거치지 않는 것이 요점입니다:
// new Date("2026-12-09")는 UTC 자정으로 읽히고, UTC-x 시간대에서 하루 앞의
// 날짜를 돌려줍니다. 여기서 필요한 것은 순간이 아니라 달력 위의 날이에요.
function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * 회차 기간 한 줄.
 *
 * 종료일이 `null`이면 시작일만 그리고 "부터"로 끝냅니다. "12월 9일부터".
 * 기간을 모른다는 사실이 화면에 그대로 보이는 편이, 있지도 않은 종료일을
 * 채워 두었다가 나중에 고치는 것보다 낫습니다.
 */
export function formatDecemberRange(locale: Locale): string {
  const [sy, sm, sd] = parts(DECEMBER_STARTS_AT);
  if (!DECEMBER_ENDS_AT) {
    return locale === "ko"
      ? `${sy}년 ${sm}월 ${sd}일부터`
      : `from ${sd} ${EN_MONTHS[sm - 1]} ${sy}`;
  }
  const [ey, em, ed] = parts(DECEMBER_ENDS_AT);
  if (locale === "ko") {
    // 같은 해 같은 달이면 뒤쪽의 연·월을 생략합니다. 아니면 전부 씁니다.
    return sy === ey && sm === em
      ? `${sy}년 ${sm}월 ${sd}일부터 ${ed}일까지`
      : `${sy}년 ${sm}월 ${sd}일부터 ${ey}년 ${em}월 ${ed}일까지`;
  }
  // en dash(–), em dash(—)가 아닙니다. 날짜 범위의 en dash는 하우스 스타일에
  // 이미 있습니다(dictionary의 "22–29 Aug 2026").
  return sy === ey && sm === em
    ? `${sd}–${ed} ${EN_MONTHS[em - 1]} ${ey}`
    : `${sd} ${EN_MONTHS[sm - 1]} ${sy} – ${ed} ${EN_MONTHS[em - 1]} ${ey}`;
}

/** 시작일 하나만. 히어로처럼 짧게 말해야 하는 자리에서 씁니다. */
export function formatDecemberStart(locale: Locale): string {
  const [y, m, d] = parts(DECEMBER_STARTS_AT);
  return locale === "ko" ? `${y}년 ${m}월 ${d}일` : `${d} ${EN_MONTHS[m - 1]} ${y}`;
}

/** 시작일에서 연도를 뺀 짧은 꼴. 칩과 CTA 라벨용. */
export function formatDecemberStartShort(locale: Locale): string {
  const [, m, d] = parts(DECEMBER_STARTS_AT);
  return locale === "ko" ? `${m}월 ${d}일` : `${d} ${EN_MONTHS[m - 1]}`;
}
