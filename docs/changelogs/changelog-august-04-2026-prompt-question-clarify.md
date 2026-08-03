# Changelog — August 4, 2026 (심사위원 질문 인용 풀어쓰기)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/dictionary.ts` — 심사위원 질문 인용부 2곳(KO/EN). 나머지 문장은
무변경.

## 왜

심사표의 현장 질문을 사이트에서 `"프롬프트 한 줄로 한 것과 뭐가 다르죠?"`로
축약해 쓰고 있었는데, **심사위원(정요천 님)조차 이 표현의 의미를 되물었습니다.**
심사위원이 되묻는 문장을 학생이 제대로 읽을 리 없습니다.

축약형이 유도하는 오독은 "너희 팀이 프롬프트를 한 줄만 썼느냐"입니다. 실제 질문은
비교 대상이 다릅니다 — **"기업 담당자가 그냥 범용 LLM에 물어봐서 얻는 답 대비, 이
솔루션이 무엇을 더 하는가."** 비교 상대가 학생의 노력이 아니라 **담당자의 대안**
이라는 게 요지라, 그 대상을 문장 안에 넣지 않으면 뜻 자체가 서지 않습니다.

## 무엇

| | before | after |
|---|---|---|
| ko | 프롬프트 한 줄로 한 것과 뭐가 다르죠? | 담당자가 그냥 범용 LLM에 물어봐서 얻는 답과, 이건 뭐가 다르죠? |
| en | how is this different from a one-line prompt? | how is this different from what the problem owner would get by just asking a general LLM? |

## 두 곳입니다 (요청은 한 곳이었지만)

- `dict.mentoring.groups` — Day 7 피치·세일즈 sub 카피 **(요청 대상)**
- `dict.faq` — "결과물이 실제로 쓰이나요? AI로 대충 만들면 어떡하죠?" 답변

두 번째는 요청 시점의 파악에 없던 것으로, **커밋 74dc1b8(8/3, 툴 정책 반영)에서
같은 축약형이 새로 들어간 자리**입니다. 같은 오독이 그대로 적용되므로 함께
고쳤습니다 — 한쪽만 고치면 사이트가 같은 질문을 두 가지로 인용하게 됩니다.

인용을 관리하는 규칙을 첫 번째(정본) 자리 주석에 남겼습니다: 두 곳이 함께 움직일
것, 축약형으로 되돌리지 말 것, 그리고 되돌리면 안 되는 이유(심사위원이 되물었다는
사례) 기록.

## 건드리지 않은 곳 (`grep "프롬프트|prompt"` 전수)

| where | 판정 |
|---|---|
| benefits 01 "모델 선택·프롬프트·용어 가이드 제공" | 크래시코스 부속 자료 — 무관 |
| benefits 02 "출제가 아니라 '의뢰' / Not a prompt but a brief" | 출제 방식에 대한 다른 의미 — 지시대로 유지 |
| benefits 02 "Not toy prompts — a partner's real AX problem" | 위와 같은 계열 |
| `d1-problem-release.en` "These aren't made-up prompts" | 문제 출처에 대한 서술 — 무관 |
| `quiz.ts` "한 줄 프롬프트로 완성된 곡" | AI 모델 유형 테스트 결과 카피 — 무관 |

## Verification

- `npx tsc --noEmit` → 0 · `npm run build` → ✓ compiled, 10/10 static pages
- `grep "프롬프트 한 줄|one-line prompt"` → 카피 0건 (quiz.ts의 무관한 1건만)
- **375×780 모바일 확인(KO/EN)**: 인용부가 길어졌지만 문단 안에서 자연스럽게
  흐르고 따옴표가 줄 끝에 고아로 남지 않음. 문단 폭 283px, 가로 오버플로 0.
  FAQ 답변도 같은 폭에서 확인.

## Files

- `data/dictionary.ts` — `mentoring.groups` Day 7 sub (KO/EN) + 규칙 주석,
  `faq` "AI로 대충" 답변 (KO/EN)
