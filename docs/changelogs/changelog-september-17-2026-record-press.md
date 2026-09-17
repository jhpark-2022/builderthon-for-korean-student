# Changelog 2026-09-17 (8월의 기록: 언론 줄)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main`
**Scope:** 홈 `#record` 챕터에 언론 줄 하나. `/2026-08`은 손대지 않았습니다.

## 1. 문제

8월 페이지에는 기사 둘(경인일보, BZCF)이 인용 줄로 있는데 홈의 8월 챕터에는 없었고,
행사 뒤에 싱가포르 현지 매체(CNA, The Straits Times)에 실린 글도 어디에도 없었습니다.
사용자 요청: 홈의 8월 부분에 그 기사 둘을 보여 주고, 현지 주류 매체에도 실렸다는 것을
더한다.

## 2. 결정

- 사진 벽 아래, "기록 전체 보기" 버튼 위에 8월 페이지와 같은 인용 줄(제호 · 제목 ·
  날짜 · 원문 보기)을 둡니다. 태그는 8월과 같은 "언론에 소개된 이야기". 그 아래 한
  줄: "행사가 끝난 뒤 싱가포르의 주요 매체 두 곳에도 실렸습니다."
- 최신순. CNA와 The Straits Times는 같은 글(9/15 보도자료)이라 **한 줄에 링크 둘**
  (`PressGroup`). 같은 제목을 두 줄에 두 번 쓰면 폰에서 여섯 줄이 됩니다. 제목은 두
  매체가 실은 그대로. 두 글은 매체의 보도자료 면(CNA "media release", ST "paid press
  releases")에 실린 것이라, 카피에는 제호만 쓰고 "보도"·"취재"라는 말은 넣지 않았습니다.
- 경인일보·BZCF는 `dict.about.press`와 같은 내용을 `data/naru.ts`에 옮겨 적었습니다.
  홈이 `dictionary.ts` 전체를 번들에 끌어오지 않기 위해서입니다. 한쪽을 고치면 다른
  쪽도.
- 줄 마크업은 `components/shared/PressRows.tsx`로 냈습니다. Journey.tsx의 원문은
  그대로(8월 페이지 픽셀 회귀 0 규칙).

## 3. 바뀐 파일

| 파일 | 무엇 |
| --- | --- |
| `components/shared/PressRows.tsx` | 신설. 8월의 press 블록과 같은 줄 + `PressGroup`(링크 여럿) |
| `data/naru.ts` | `record.pressTag`, `pressLead`, `press`(셋), `pressCta` |
| `components/home/NaruHome.tsx` | `#record`에 `<PressRows>` |

## 4. 확인

- `npx tsc --noEmit`, `npm run build` 통과. 프로덕션 콘솔 오류 0(1440·390).
- 페이지 길이: 홈 390 ko 13,026 / en 14,453, 1440 ko 9,638 / en 10,195.
  줄 셋으로 폰 ko가 476px 늘었습니다(8월 문법 브리프의 상한 12,500을 넘음. 사용자가
  요청한 내용이라 그대로 두고 적어 둡니다).
- 캡처는 세션 스크래치에만 두었습니다(외부 링크 줄이라 `.shots`에 남길 회귀 기준이
  없음).
