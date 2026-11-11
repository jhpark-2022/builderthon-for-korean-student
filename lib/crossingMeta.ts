// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울의 제목, 설명, 공유 카드 문구(2026-10-26, naru-first). 값과 그 이유는 app/layout.tsx에 있던 것 그대로입니다.
// 레이아웃의 기본 메타와 크로싱 서울 페이지(app/crossing/page.tsx)가 같이 씁니다.
// ─────────────────────────────────────────────────────────────────────────────
import { DECEMBER_EVENT_NAME } from "@/lib/naruDates";

export const SITE_NAME = "나루 NARU";
export const HOME_TITLE = `${DECEMBER_EVENT_NAME?.ko ?? "크로싱 서울"} 2026 | ${SITE_NAME}`;
export const SITE_DESCRIPTION =
  `${DECEMBER_EVENT_NAME?.ko ?? "크로싱 서울"} 2026년 12월 17~21일, 서울. 한국의 대학생과 해외에서 공부하는 한인 학생이 기업의 이슈에서 문제를 찾아 그 기업 앞에서 발표하는 닷새입니다. 나루는 한국에 뿌리를 두고 학생이 직접 운영하는, 영리를 목적으로 하지 않는 학생 빌더 그룹입니다.`;
export const OG_TITLE = `${DECEMBER_EVENT_NAME?.ko ?? "크로싱 서울"}, 2026년 12월 17~21일`;
export const OG_DESCRIPTION =
  // 2026-09-29 (9/28 자문): "유학생" 대신 "해외의 한인 학생". 길이 때문에 본문의 "해외에서 공부하는"보다 짧게.
  // DECIDED 2026-11-11 (docs/poster-first-brief.md P5): 맨 앞에 캐치프레이즈 첫 줄(카드와 같은 말).
  "왜 아직, 손으로? 기업의 이슈를 받아 문제를 찾고, 마지막 날 그 기업 앞에서 발표하는 닷새. 한국의 대학생과 해외의 한인 학생이 한 팀이 됩니다.";

// 영문 공유 카드(2026-10-14, app/en/crossing/page.tsx에 있던 값 그대로). 2026-11-03: /crossing/team, /crossing/mentor,
// /crossing/vote, /match의 영문 사본도 같은 값을 씁니다.
export const EN_OG_TITLE = "CROSSING SEOUL, 17–21 December 2026";
export const EN_OG_DESCRIPTION =
  "Why still by hand? Each team takes an issue a company is facing now, finds the problem underneath it, and presents to that company on the fifth day. Whichever country you study in, you end up on the same team.";
// 사본이 openGraph를 직접 적으면 부모 폴더의 카드 그림을 물려받지 않아, 그림 주소도 같이 적습니다.
export const EN_OG_IMAGE = {
  url: "/en/crossing/opengraph-image",
  width: 1200,
  height: 630,
  alt: "CROSSING SEOUL, 17–21 December 2026, Seoul. Run by NARU.",
};
