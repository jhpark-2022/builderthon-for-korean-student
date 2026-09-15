// ─────────────────────────────────────────────────────────────────────────────
// 나루 홈의 제목 스케일. NaruHome과 RecordTabs가 함께 읽습니다.
//
// 여기 있는 이유는 순환 참조입니다. NaruHome이 RecordTabs를 import 하므로
// RecordTabs가 NaruHome에서 상수를 가져올 수 없습니다. 그렇다고 같은 문자열을
// 두 파일에 적어 두면 한쪽만 고쳐집니다.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 챕터 제목. 8월 페이지의 아홉 개 h2와 같은 clamp입니다
 * (Journey.tsx의 CHAPTER HEADING SIZE 주석). 두 페이지의 제목이 같은 크기로
 * 읽혀야 한 사이트입니다. clamp 값을 바꾸지 마세요.
 *
 * max-w는 2026-09-15에 붙었습니다. 1440px에서 긴 한글 h2가 1296px 레일을 그대로
 * 써서 한 줄이 1,000px을 넘었습니다. 그 아래 lead는 756px입니다. globals.css가
 * heading에 text-wrap: balance를 걸어 두었으니 폭만 주면 균형 잡힌 두 줄로
 * 떨어집니다.
 */
export const H2 =
  "mx-auto max-w-[52rem] text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white";

/**
 * 챕터 안의 하위 블록 제목.
 *
 * h2(최대 67.5px)와 기존 h3(20.25px) 사이에 아무것도 없어서 #record의 세 하위
 * 블록이 앉을 자리가 없었습니다. 탭 블록의 제목과 그 안쪽 구획 제목이 한 글자도
 * 다르지 않았어요. 이 계단이 생기면 안쪽 라벨이 두 단계 아래로 내려가 제 역할을
 * 합니다.
 */
export const H3 =
  "break-keep text-[clamp(1.35rem,2.6vw,1.9rem)] font-bold tracking-tight text-white";
