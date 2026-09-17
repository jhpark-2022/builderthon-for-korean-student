// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울(2026년 12월, 서울)의 이름과 날짜. 단일 출처.
//
// DECIDED 2026-09-15 (나루 런칭): 12월의 이름과 날짜 문자열은 오직 이 파일에서만
// 나옵니다.
//
// ── 12월은 제로백 빌더톤이 아닙니다 ─────────────────────────────────────────
// 제로백 빌더톤은 2026년 8월 싱가포르에서 한 이벤트의 이름입니다. 12월은 그
// 이벤트에서 나온 코어 2개를 잇는 다른 이벤트이고, 이름이 아직 없습니다.
//
// "2회차"라고 부르면 제로백의 속편이 됩니다. 그러면 12월에 오는 사람은 8월을
// 모르면 늦었다고 느끼고, 기업은 같은 문제를 또 여는 자리로 읽습니다. 둘 다
// 사실이 아닙니다. 이름이 정해질 때까지 "12월 이벤트", "다음 이벤트"로만
// 씁니다.
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
 * 12월 이벤트의 이름. **크로싱 서울 (CROSSING SEOUL)** 로 확정됐습니다
 * (2026-09-15).
 *
 * 태그라인에서 나온 이름입니다. "건너는 건 각자가 한다. 자리는 우리가 만든다."
 * 그리고 8월의 기록이 "59명이 8일을 건넜습니다"로 시작합니다. 건넌다는 말이
 * 이 그룹의 동사이고, 크로싱은 그 동사를 이벤트 이름으로 세운 것입니다.
 *
 * 형식을 약속하지 않는 이름이라는 점이 중요합니다. 빌더톤이라는 낱말이
 * 없으므로 8일이 4일이 되어도, 형식이 다른 무엇이 되어도 이름이 거짓이 되지
 * 않습니다(매니페스토 IV).
 *
 * 시리즈로 확장됩니다. "크로싱"이 이벤트의 이름이고 뒤의 도시가 회차를
 * 구분합니다. 다음이 어디서 열리든 크로싱 [도시]가 됩니다.
 *
 * 제로백 빌더톤의 속편이 아닙니다. 이름이 다른 것이 그 사실을 문장 없이
 * 말합니다. 그래도 data/naru.ts의 notSequel 한 줄은 남겨 두세요. 8월을 아는
 * 사람은 이름이 달라도 한 번은 묻습니다.
 */
export const DECEMBER_EVENT_NAME: { ko: string; en: string } | null = {
  ko: "크로싱 서울",
  en: "CROSSING SEOUL",
};

/**
 * 12월 이벤트 시작일. **확정된 사실**입니다.
 *
 * 기획 초안(빌더톤_2회차_원페이저.pdf, v1 2026-09-10)은 12/10~12/14로 적고
 * 있습니다. 그 문서는 내부 공유용 초안이고, 확정된 것은 12월 9일 시작이라는
 * 사실뿐입니다. TODO: confirm. 초안과 확정 사이의 차이를 기획 팀과 맞출 것.
 */
// DECIDED 2026-09-17: 12월 10일. 기획(빌더톤_2회차_기획.pdf 04 일정)의 12/10~12/14를
// 사용자가 확정했습니다. 그 전까지는 12/9 시작만 확정이었고 초안과 어긋나
// 있었어요(아래 옛 주석). 스테이지 날짜는 이 값에서 formatDecemberDay로 셉니다.
export const DECEMBER_STARTS_AT = "2026-12-10";

/**
 * 12월 이벤트 종료일. **아직 확정되지 않았습니다.**
 *
 * TODO: confirm. 기획 초안은 12/14 종료(실질 4일 + 사전 팀 본딩)이지만 확정이
 * 아닙니다. null인 동안 화면은 "12월 9일부터"까지만 그립니다. 없는 날짜를
 * 지어내 채우지 마세요. 참가자가 항공권을 그 날짜로 끊습니다.
 */
// DECIDED 2026-09-17: 12월 14일. 위와 같은 결정입니다. null로 돌아가면 화면은
// 다시 "부터"까지만 그립니다.
// TODO: confirm. 기획의 스테이지는 12/13 Pitch에서 끝나는데 기간은 12/14까지입니다.
// 하루가 비어 있습니다. 14일에 무엇이 있는지(예비일, 클로징, 이동일) 기획 팀과
// 맞추기 전까지 화면은 기간만 말하고 14일에 무엇이 있다고 쓰지 않습니다.
export const DECEMBER_ENDS_AT: string | null = "2026-12-14";

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
 * 이벤트 기간 한 줄.
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

/**
 * 화면에 쓸 이벤트 이름.
 *
 * 이름이 없는 동안은 "12월 이벤트"입니다. 비워 두거나 "이벤트"라고만 쓰지 않는
 * 이유는, 문장 안에서 어느 이벤트인지 가리켜야 하기 때문입니다. 날짜가 이름을
 * 대신하는 동안에도 가리키는 일은 되어야 합니다.
 */
export function decemberEventLabel(locale: Locale): string {
  if (DECEMBER_EVENT_NAME) return DECEMBER_EVENT_NAME[locale];
  // 이름이 비었던 동안 쓰던 값입니다. 지금은 닿지 않지만, 다음 회차가 이름 없이
  // 시작할 때 다시 쓰입니다. 지우지 마세요.
  return locale === "ko" ? "12월 이벤트" : "the December event";
}

/**
 * 아이브로에 들어가는 달. "2026.12" / "Dec 2026".
 *
 * 날짜 문자열은 이 파일에서만 나옵니다. 아이브로에 "2026.12"를 직접 쓰면
 * DECEMBER_STARTS_AT을 고쳐도 그 줄만 남습니다.
 */
export function formatDecemberMonth(locale: Locale): string {
  const [y, m] = parts(DECEMBER_STARTS_AT);
  return locale === "ko" ? `${y}.${String(m).padStart(2, "0")}` : `${EN_MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/**
 * 제목 아래 날짜 한 줄. "2026년 12월 9일부터, 서울." / "From 9 December 2026, Seoul."
 *
 * DECIDED 2026-09-15 (포지션 반영): 날짜가 H2에서 내려왔습니다. 제목이 이제
 * 포지션을 말하고("국경과 상관없이, 한인 학생 빌더가 만나는 자리") 날짜는 그
 * 아래 한 줄입니다. 날짜가 제목이던 동안은 12월 챕터가 "언제"만 말했는데,
 * 이 이벤트에서 설명이 필요한 것은 언제가 아니라 무엇이었습니다.
 *
 * 종료일이 없으면 formatDecemberRange가 "부터"까지만 돌려주므로 이 줄도 자동으로
 * "2026년 12월 9일부터, 서울."이 됩니다. 종료일이 채워지면 기간으로 바뀝니다.
 */
export function formatDecemberDateLine(locale: Locale): string {
  const range = formatDecemberRange(locale);
  const city = DECEMBER_CITY[locale];
  if (locale === "ko") return `${range}, ${city}.`;
  // 영문은 문장 첫 글자를 올립니다. formatDecemberRange가 "from ..."으로
  // 시작하는데 여기서는 그 조각이 문장의 처음입니다.
  return `${range.charAt(0).toUpperCase()}${range.slice(1)}, ${city}.`;
}

/**
 * 시작일에서 n일 뒤의 날짜. 스테이지 칸의 "12월 10일" / "10 Dec".
 *
 * ADDED 2026-09-17. 스테이지마다 날짜를 카피에 박아 두면 DECEMBER_STARTS_AT을
 * 고쳐도 그 다섯 줄만 남습니다. 오프셋으로 셉니다. 월을 넘어가면 그대로
 * 넘어갑니다(12월 30일 + 3 = 1월 2일).
 */
export function formatDecemberDay(locale: Locale, offset: number): string {
  const [y, m, d] = parts(DECEMBER_STARTS_AT);
  const date = new Date(Date.UTC(y, m - 1, d + offset));
  const mm = date.getUTCMonth() + 1;
  const dd = date.getUTCDate();
  return locale === "ko" ? `${mm}월 ${dd}일` : `${dd} ${EN_MONTHS[mm - 1].slice(0, 3)}`;
}

const KO_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * 시작일에서 n일 뒤, 요일까지. "12.10 목" / "Dec 10 Thu". 8월 데이 카드의
 * "08.22 토" 자리입니다(2026-09-17, 8월 문법 브리프).
 */
export function formatDecemberDayWithWeekday(locale: Locale, offset: number): string {
  const [y, m, d] = parts(DECEMBER_STARTS_AT);
  const date = new Date(Date.UTC(y, m - 1, d + offset));
  const mm = date.getUTCMonth() + 1;
  const dd = date.getUTCDate();
  const wd = date.getUTCDay();
  return locale === "ko"
    ? `${String(mm).padStart(2, "0")}.${String(dd).padStart(2, "0")} ${KO_WEEKDAYS[wd]}`
    : `${EN_MONTHS[mm - 1].slice(0, 3)} ${dd} ${EN_WEEKDAYS[wd]}`;
}

/**
 * 카운트다운의 기준 시각. 시작일 0시, 한국 시간. 서울에서 열리므로 +09:00입니다.
 * 문자열에 시간대를 박아 두는 것이 핵심입니다(registrationWindow.ts의 같은 규칙).
 */
export const DECEMBER_STARTS_AT_MS = new Date(`${DECEMBER_STARTS_AT}T00:00:00+09:00`).getTime();
