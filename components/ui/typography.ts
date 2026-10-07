// ─────────────────────────────────────────────────────────────────────────────
// 나루 홈의 제목 스케일. NaruHome과 RecordTabs가 함께 읽습니다.
//
// 여기 있는 이유는 순환 참조입니다. NaruHome이 RecordTabs를 import 하므로
// RecordTabs가 NaruHome에서 상수를 가져올 수 없습니다. 그렇다고 같은 문자열을
// 두 파일에 적어 두면 한쪽만 고쳐집니다.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 글자 크기는 셋뿐입니다 (DECIDED 2026-10-07, 이슈 브리프 4.1)
//
// 한 화면(뷰포트 한 장) 안의 글자 크기는 셋 이하입니다. 크기를 말하는 클래스는 아래 세 토큰에만
// 있고, 홈의 다른 파일은 text-sm 같은 크기 클래스를 직접 쓰지 않고 이 토큰을 씁니다. 새 크기를
// 만들지 마세요(CLAUDE.md). 루트가 18px이라 rem과 px이 어긋나므로 실제 px을 함께 적습니다.
//
//   TITLE  히어로 제목, 챕터 h2, 카운트다운 숫자, 숫자 줄(5일, 2회).
//          화면 폭마다 값 하나: 390px에서 36px, 1000px에서 55px, 1440px에서 67.5px.
//   BODY   리드, 문단, 목록, 카드 제목, h3/h4 소제목, 버튼. 폰 15.75px, sm(640px)부터 18px.
//          카드 제목과 소제목은 크기가 아니라 굵기와 색으로만 구분합니다.
//   META   알약 라벨, Day 날짜, 칩, 표의 행 라벨, 캡션, 도식 안의 설명. 13.5px. 13px 아래로 내리지 않습니다.
//
// 그 전(2026-09-20, 표현 방식 브리프 7)에는 본문 넷(12.24 / 13.5 / 15.75 / 18)에 제목 계열
// (H2, H3, ROW_HEADING, LABEL_HEADING, STATEMENT, 히어로 clamp, 큰 숫자)이 따로 있어서, 실측으로
// 1440×900의 열세 화면 중 아홉이 넷에서 일곱 가지 크기를 썼습니다. 12.24, 12.96, 22.5, 24.3, 27,
// 28.8, 34.2, 40.5px 같은 중간 크기는 이제 없습니다.
//
// 8월 페이지(/2026-08)와 같이 쓰는 컴포넌트(Chip, Eyebrow, Button)는 그쪽 픽셀이 바뀌면 안 되므로
// 건드리지 않습니다. Eyebrow(text-xs)와 Button(text-sm sm:text-base)은 이미 META, BODY와 같은 값이고,
// Chip(0.68rem)은 홈의 <main class="naru-min12"> 안에서만 META로 올립니다(app/globals.css).
// ─────────────────────────────────────────────────────────────────────────────

/** 제목. 8월 페이지의 아홉 개 h2와 같은 clamp입니다(Journey.tsx의 CHAPTER HEADING SIZE). 값을 바꾸지 마세요. */
export const TITLE = "text-[clamp(2rem,5.5vw,3.75rem)]";
/** 본문. 버튼(components/ui/Button.tsx)과 같은 값입니다. */
export const BODY = "text-sm sm:text-base";
/** 라벨과 캡션. 알약 라벨(components/ui/Eyebrow.tsx)과 같은 값입니다. */
export const META = "text-xs";

// ── 아래는 크기가 아니라 역할입니다. 크기는 위 셋에서만 옵니다. ─────────────────────────

/**
 * 챕터 제목.
 *
 * max-w는 2026-09-15에 붙었습니다. 1440px에서 긴 한글 h2가 1296px 레일을 그대로
 * 써서 한 줄이 1,000px을 넘었습니다. globals.css가 heading에 text-wrap: balance를
 * 걸어 두었으니 폭만 주면 균형 잡힌 두 줄로 떨어집니다.
 *
 * 2026-09-26 (한 축 브리프, 사용자: "h2도 맞게"): max-w-[52rem] → max-w-3xl. 챕터 제목도
 * 본문과 같은 READ 기둥(NaruHome.tsx의 READ, 864px) 안에 섭니다.
 */
export const H2 = `mx-auto w-full max-w-3xl ${TITLE} font-bold tracking-tight text-white`;

/**
 * 챕터 안의 하위 블록 제목(h3). 2026-10-07부터 BODY 크기에 굵게입니다. 그 전의
 * clamp(24.3~34.2px)는 없습니다.
 */
export const H3 = `break-keep ${BODY} font-bold tracking-tight text-white`;

/** 목록 한 행의 제목(#gains 다섯 행, #december 일정 다섯 행). H3와 같은 모양입니다. 그 전의 24.3px은 없습니다. */
export const ROW_HEADING = H3;

/**
 * 구획 제목이 라벨의 모양을 유지해야 할 때(일정표의 DAY 0 등). 태그만 heading으로 올리는 계단입니다
 * (2026-09-16, 1.3.1). 색이 /75인 것은 대비 때문입니다. 작은 글자는 큰 글자 예외를 받지 못합니다.
 */
export const LABEL_HEADING = `${META} font-bold uppercase tracking-[0.16em] text-white/75`;

/**
 * 챕터가 존재하는 이유인 문장(#join을 닫는 한 줄). 2026-10-07부터 BODY 크기에 굵게입니다.
 * 그 전의 clamp(22.5~29px)는 없습니다. 판의 무게는 크기가 아니라 굵기와 흰색, 그리고 자리가 나릅니다.
 */
export const STATEMENT = `break-keep ${BODY} font-bold leading-snug tracking-tight text-white`;

/**
 * 그라데이션 글자. 보라 틴트 → 자주 틴트 → 주황. 로고 링의 방향과 같습니다.
 *
 * ADDED 2026-09-17 (8월 문법 브리프). #naru 태그라인 2행이 쓰던 값을 토큰으로
 * 묶고 히어로 H1 2행이 같은 값을 씁니다. 8월 페이지의 2행 그라데이션
 * (violet-300 → fuchsia-300 → cyan-300)은 그쪽 팔레트라 여기 들여오지 않습니다.
 * 8월의 쓰임새(2행만 그라데이션, pb로 디센더 보호)만 같습니다.
 */
// DECIDED 2026-09-18 (감사 반영 브리프 0, 사용자): 주황은 점으로만. 그라데이션은 보라 틴트
// (#A99AD6)에서 자주 틴트(#C79BB4)로 끝납니다. 8월 문법 브리프 3장의 "보라 → 자주 → 주황"을
// 이 결정이 대체합니다. 원색 --purple·--plum이 아니라 틴트인 이유는 대비입니다(어두운 바탕
// 위 원색 보라 2.12:1). globals.css의 단색 폴백(#C79BB4)은 이제 끝 색과 같습니다.
export const GRADIENT_TEXT =
  "gradient-text bg-gradient-to-r from-[#A99AD6] to-[#C79BB4] bg-clip-text pb-[0.14em] text-transparent";
