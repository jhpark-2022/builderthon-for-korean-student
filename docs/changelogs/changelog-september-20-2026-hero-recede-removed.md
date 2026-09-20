# Changelog 2026-09-20 (히어로 스크롤 효과를 걷는다)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main`
**Scope:** `components/home/NaruHome.tsx`의 히어로와 `components/shared/useHeroRecede.ts`(삭제).
**근거:** 사용자, "undo the animation that i tried to put at the top"

## 1. 한 것

히어로의 스크롤 효과를 전부 걷었습니다. 히어로는 다시 정지 레이아웃입니다.

- `components/shared/useHeroRecede.ts` 삭제
- `NaruHome.tsx`에서 `framer-motion`과 그 훅의 import 삭제, `motion.div` 셋을 원래 `div`로
- 히어로 영역이 효과가 들어오기 전(커밋 `c4de111`)과 **바이트 단위로 같습니다.** diff로 확인했습니다

이 파일들은 남깁니다. 되살릴 일이 생기면 값과 계측이 여기 있습니다.

- `docs/hero-recede-fix-brief.md`
- `docs/changelogs/changelog-september-20-2026-hero-recede-fix.md`

## 2. 두 번의 결론이 같습니다

| 날짜 | 무엇 | 결과 |
| --- | --- | --- |
| 2026-09-19 | 8월의 `useHeroSplit`(두 단이 좌우로 ±500px 벌어지며 사라짐)을 그대로 가져옴 | 사용자: "8월 페이지와 같은 효과, 마음에 안 듦" |
| 2026-09-20 | 다른 축으로 다시 만듦(`useHeroRecede`, 제목 묶음이 물러나고 사진 단이 느리게 따라오는 깊이). 사용자가 셋 중에 고른 안 | 구간을 제목이 보이는 동안으로 옮겨 계측 열둘을 통과했지만, 실제 화면에서 원하는 것이 아니었음 |

그래서 `NaruHome.tsx`의 히어로 위에 그 기록을 주석으로 남겼습니다. **세 번째 안을 만들기
전에 사용자에게 먼저 물어보세요.**

## 3. 건드리지 않은 것

- **챕터 리빌**(`Chapter` / `Reveal`의 `data-chapter-reveal`, 올라오며 나타나는 700ms). 이것과
  별개이고 그대로 돌아갑니다. `#gains` 블록으로 확인: 화면 밖에서 불투명도 0, 들어오면 1.
- `components/shared/useHeroSplit.ts`와 `/2026-08`. 8월 페이지의 히어로는 그대로입니다.
- 배경, 카피, 다른 챕터.

## 4. 검증

| 항목 | 결과 |
| --- | --- |
| 히어로 안에서 스크롤에 따라 변하는 불투명도 | **0건**. 스크롤 0 · 110 · 150 · 260 · 400 · 700 · 900에서 전부 1 |
| 히어로 안에서 스크롤에 따라 변하는 transform | **0건**. 스크롤 0 · 400 · 900의 transform 목록이 완전히 동일. 남은 여섯은 Tailwind 정적 값(사진 홀수 칸 `lg:translate-y-8`, 호버 캡션) |
| 히어로 영역 diff | 커밋 `c4de111`과 동일 |
| `framer-motion` import (NaruHome) | 0건 |
| 챕터 리빌 | 정상 |
| `npm run build` | 통과 |
