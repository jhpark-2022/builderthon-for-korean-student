# 브리프: 등록을 혼자 또는 둘이 한 팀으로 (2026-11-14)

대상: `data/crossingForm.ts`, `components/crossing/RegisterModal.tsx`, `app/api/crossing/register/route.ts`, `supabase/migrations/0024_crossing_pair_registration.sql`, 등록 안내 줄(`data/naru.ts`, `components/crossing/redesign/copy.ts`). 근거: 사용자 "8월달 참고해줘, 혼자해도 되고, team of two 로도 할 수 있도록", Supabase는 "알아서 맞게".

## 0. 지금

| 자리 | 지금 |
| --- | --- |
| 폼 | 한 폼에 한 사람(2026-10-08 "전원 현장 편성"). 항목은 이름, 이메일, 카카오톡 ID, 학교, 나라, 전공, AI 단계, 링크드인 |
| 동의 | 목적이 "참가 안내와 현장 팀 편성" |
| 라우트 | members가 정확히 하나, join_type은 solo만. 팀 꼴은 400 |
| 표 | 0004부터 join_type check(solo, team), ordinal 1~3, 이벤트마다 이메일 하나. 표 변경 없이 둘을 받을 수 있음 |
| 등록 | 11월 16일(월)에 엶. 지금 행 0건 |

## 1. 뒤

| # | 바꿈 |
| --- | --- |
| R1 | 폼 맨 위 "어떻게 오나요?": 혼자 / 둘이 한 팀으로(번호 없는 선택 카드). 둘이면 "내 정보" 아래 "함께 오는 팀원" 묶음이 같은 칸으로 열림. 팀 이름과 매칭 희망은 묻지 않음 |
| R2 | 동의 문구: 팀원의 같은 항목도 받는다, 목적은 "참가 안내와 팀 편성", 팀원에게 먼저 알리고 적기 |
| R3 | 라우트: solo면 한 사람, team이면 정확히 둘(ordinal 1, 2), 두 이메일은 달라야 함(400 same_email). join_type이 없는 요청은 solo. 두 행은 한 번의 insert |
| R4 | 23505: 혼자는 그대로 조용한 201. 둘은 409 team_registered(조용한 201이면 아직 안 한 사람이 등록되지 않은 채 "됐다"를 봄). 드러나는 것은 둘 중 한 사람이 이미 등록했다는 사실뿐이고, 봇 확인과 IP 스로틀 뒤에 있음 |
| R5 | 0024: `crossing_matching_pool` 끝에 `pair_with`(같은 등록의 다른 사람 이름). Day 1 팀 짜기에서 둘을 같은 팀에 넣으려고 봄 |
| R6 | 안내 줄의 "혼자 등록"을 "혼자 또는 둘이 한 팀으로 등록"으로(히어로 누가, 등록 블록, 기본값) |

## 2. 검증

- tsc, build 통과. 폰 390에서 혼자/둘 전환 스크린숏.
- 0024 적용, 원격 기록 24개와 파일 24개 같음. `select count(pair_with)` 동작.
- 라우트의 실제 insert는 시험하지 않음(등록 창이 닫혀 있어 403, 운영 DB에 시험 행을 넣지 않음). 16일 열린 뒤 둘 등록 한 건으로 확인.

## 결정이 남는 곳

`docs/brand.md` 7장 팀 줄, `data/crossingForm.ts`와 라우트, 모달의 DECIDED 2026-11-14 주석.
