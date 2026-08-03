# Changelog — August 3, 2026 (Day 1 장소 확정 · SMU YPHSL → The Foundry)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `data/schedule.ts` (Day 1 전체), `components/EventModal.tsx`
(장소 줄 링크 지원). 대관 비용·내부 조건은 사이트에 쓰지 않았습니다.

## The fact (8/3 확정)

Day 1(8/22 토, **필참**) 장소로 **The Foundry**(foundry.sg)의 **The Refinery**
이벤트홀 대관 완료. 주소 **11 Prinsep Link, Singapore 187949**. 확정 항목이라
헤지 없이 표기했고, Day 1의 `confirmed` 배지와 `dayMode: "offline"`은 이전 예약
(SMU YPHSL B2-03)에서 이미 확정이었으므로 그대로 유지됩니다 — 바뀐 것은 방입니다.

## 표기

```ts
const FOUNDRY_REFINERY: Bilingual = {
  ko: "The Foundry (The Refinery 홀) · 11 Prinsep Link",
  en: "The Foundry (The Refinery hall) · 11 Prinsep Link",
};
```

주소를 문자열에 함께 넣은 이유: 이름을 아는 사람이 없는 길에 있는 건물 안의 홀이라
"The Foundry"만으로는 찾아갈 수 없습니다. 상수 `YPHSL_B203`은 이름째 교체했고,
Day 1의 여섯 이벤트가 전부 이 하나를 참조합니다 — 두 이름이 공존하면 한쪽 화면에서
"SMU"를, 다른 화면에서 "Prinsep Link"를 본 학생이 어느 문으로 가야 할지 알 수 없어
한 번에 전부 옮겼습니다.

## ⚠️ 시간 표기 — 확인이 필요합니다

지시문의 시간 값이 `{시간}` 플레이스홀더로 비어 있었습니다. 기존 **11AM–5PM은 SMU
예약 기준**이라 다른 장소에 그대로 붙일 수 없으므로, **시간만 미확정으로 헤지**해
두었습니다 (Day 5 네트워킹 데이와 같은 관례):

- 날짜 카드 요약 끝 — "**시간 확정 예정**" / "Time to be confirmed."
- `d1-problem-release` 설명 — "…현장에서 진행합니다 — **시간은 확정되는 대로
  안내합니다**."
- `schedule.ts`에 `TODO: Day 1 시간 확정 시 표기 복원` 주석.

확정된 시간을 알려주시면 두 곳에 한 줄씩 채우면 됩니다. 잘못된 시간을 확정처럼
싣는 것보다 비워두는 편이 안전하다고 판단했습니다.

## 바뀐 곳

| where | before | after |
|---|---|---|
| `days[0].summary` (날짜 카드) | "SMU YPHSL B2-03 현장 11AM–5PM · …" | "The Foundry(The Refinery 홀) 현장 · … 시간 확정 예정." |
| `d1-opening-keynote` · `d1-orientation` · `d1-aws-session` · `d1-problem-release` · `d1-problem-deep-dive` · `d1-briefing` `location` | `YPHSL_B203` | `FOUNDRY_REFINERY` + `locationUrl` |
| `d1-problem-release.description` (KO/EN) | "…SMU YPHSL B2-03 현장(11AM–5PM)에서 진행합니다" | "…The Foundry의 The Refinery 홀(11 Prinsep Link) 현장에서 진행합니다 — 시간은 확정되는 대로" |
| 상수 주석 · `days[0]` 주석 | SMU 예약 기록 | Foundry 예약 + 왜 교체됐는지 + 시간이 함께 빠진 이유 |
| 8/13 사전 세션 주석 | "Day 1도 같은 로스쿨을 쓰니 명칭을 통일하라" | 이제 스케줄에 남은 유일한 SMU 장소라는 사실로 갱신 |

## SMU를 건드리지 않은 곳 (의도적)

`grep`으로 확인한 뒤 **venue 참조만** 바꿨습니다. 전역 치환은 하지 않았습니다:

- **8/13 사전 세션** — `SMU SOL (강의실 추후 안내)` 그대로. 별개 예약입니다.
- **주관 단체** — SMU·NUS·NTU 한인 학생회, `SMU KSA` 로고/라벨.
- **참가 대상·등록 폼** — 학교 선택지 "SMU", `app/layout.tsx` 키워드.
- **일반 표현** — 노선도·참여 방식 표의 "싱가포르 현장", "Day 1 현장 선착순 60세트"
  등 구체 장소가 없는 문구는 그대로 두었습니다 (지시대로).

`grep "YPHSL|B2-03|11AM–5PM"` 결과 남은 것은 **왜 바뀌었는지 기록한 주석 4줄뿐**,
표시되는 카피에는 없습니다.

## 장소 줄 외부 링크 (작업 3)

모달에 이미 링크 패턴이 있어(연사 LinkedIn 행, `org` 블록의 "사이트 열기 ↗") 무리
없이 얹을 수 있었습니다. `BEvent`에 선택 필드 하나를 더했습니다:

```ts
locationUrl?: string;   // 있으면 모달의 장소 줄이 링크가 됩니다
```

- `EventModal`의 장소 `<dd>`는 `locationUrl`이 있을 때만 `<a target="_blank"
  rel="noopener noreferrer">` + `↗`로 렌더하고, 없으면 **기존과 완전히 동일한
  평문**입니다 — 다른 모든 세션은 한 픽셀도 바뀌지 않았습니다.
- 스타일은 연사 LinkedIn 행과 같은 밑줄 앵커라 새 어포던스가 아닙니다.
- 링크는 `https://foundry.sg` 하나뿐이고, 예약/비용 정보는 어디에도 없습니다.

## Verification

- `npx tsc --noEmit` → 0; `npm run build` → ✓ compiled, 10/10 static pages
- 1440px KR·EN 실제 렌더: Day 1 날짜 카드 문구, Day 1 모달 6개 세션, 오프닝 키노트
  모달(확정 배지 + 장소 링크), 문제 공개 모달 본문의 장소·시간 문장
- 링크 속성 확인: `href=https://foundry.sg/`, `target=_blank`,
  `rel="noopener noreferrer"`
- 새로고침 후 콘솔 에러 0

## Files

- `data/schedule.ts` — `FOUNDRY_REFINERY` / `FOUNDRY_URL` 상수(구 `YPHSL_B203`),
  `BEvent.locationUrl`, `days[0]` 요약·주석, Day 1 여섯 이벤트의 location,
  `d1-problem-release` 설명 `{ko,en}`, 사전 세션 주석
- `components/EventModal.tsx` — 장소 줄의 조건부 링크
