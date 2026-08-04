# Changelog — August 4, 2026 (모바일 모달 스크롤 격리)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Scope:** `lib/useBodyScrollLock.ts` (신규), `components/EventModal.tsx`,
`components/PartnerModal.tsx`, `components/RegisterModal.tsx`,
`components/journey/Journey.tsx` (`DayModal` + 스크롤 소비자 2곳),
`components/journey/JourneyNav.tsx`, `lib/useScrollDirection.ts`,
`lib/background/scene/BackgroundScene.ts`.

## 문제

프로브로 확인된 두 가지 버그:

1. **백드롭에서 스크롤하면 배경 페이지가 그대로 스크롤됨.** 모달을 열어둔 채
   휠·드래그를 하면 뒤 페이지가 따라 움직였습니다.
2. **모달 내부 스크롤이 끝에 닿으면 배경으로 체이닝됨.** 내용 바닥까지 내린 뒤
   계속 밀면 그 제스처가 뒤 페이지로 넘어갔습니다.

네 개 다이얼로그(EventModal · PartnerModal · RegisterModal · Journey의
`DayModal`)가 전부 `document.body.style.overflow = "hidden"` 하나로 잠그고
있었는데, 이 방식은 **이 코드베이스에서 특히** 무효였습니다:

- `overflow: hidden`은 `<body>` 박스만 스크롤 불가로 만듭니다. 실제 뷰포트
  스크롤은 documentElement의 것이고, 보통은 body의 overflow가 거기로 **전파**돼서
  우연히 동작합니다. 그런데 `app/globals.css`가 `html { overflow-x: clip }`을
  두고 있어서 그 전파가 일어나지 않습니다 — 문서는 계속 스크롤됐습니다.
  (같은 이유로 데스크톱에서 스크롤바도 사라지지 않았습니다. 아래 참고.)
- iOS Safari는 터치 스크롤에 대해 이 잠금을 아예 무시합니다. 오래된 WebKit
  동작이고, 스크롤 락 라이브러리들이 전부 position-fixed 우회를 쓰는 이유입니다.

## 1. `lib/useBodyScrollLock.ts` — 공용 스크롤 락

네 곳에 복제돼 있던 overflow-hidden 로직을 훅 하나로 대체했습니다.

**잠글 때** `window.scrollY`를 저장하고 `<body>`를 흐름에서 빼냅니다 —
`position: fixed; top: -{scrollY}px; left: 0; right: 0; width: 100%`.
스크롤 가능한 오버플로가 남지 않으므로 휠도 터치 드래그도 움직일 게 없습니다.
iOS 포함.

**풀 때** 인라인 스타일을 원래 값으로 되돌리고
`window.scrollTo({ top: 저장값, behavior: "instant" })`.

`behavior: "instant"`는 선택이 아닙니다 — `html { scroll-behavior: smooth }`가
전역이라 그냥 `scrollTo`를 쓰면 이미 그 자리에 있던 페이지를 향해 **애니메이션**이
돌아갑니다. 모달이 페이드아웃하는 동안 아무도 요청하지 않은 0.5초짜리 스크롤이
같이 재생됩니다.

**깊이 카운터가 필요했습니다.** 다이얼로그가 실제로 겹칩니다: `DayModal` 안의
세션을 누르면 그 위에 `EventModal`이 쌓입니다(`Journey.tsx`의 `eventOpen` 참고).
바깥쪽 획득만 스크롤 위치를 스냅샷하고(body가 fixed가 된 뒤에는 `window.scrollY`가
0을 반환하므로, 안쪽에서 다시 스냅샷하면 닫을 때 페이지 맨 위로 복귀합니다),
마지막 해제만 복원합니다.

**선언 순서.** 네 컴포넌트 모두 기존 라이프사이클 이펙트 **앞에** 훅을 두었습니다.
React는 선언 순서대로 클린업을 실행하므로, 포커스가 트리거로 돌아가기 전에
스크롤이 먼저 복원됩니다.

## 2. 체이닝 차단 (이중 안전망)

- 네 모달의 내부 스크롤 컨테이너에 `overscroll-contain`
  (`overscroll-behavior-y: contain`) — 내용 끝에서 제스처가 배경으로 넘어가지
  않습니다.
- 네 백드롭에 `touch-none` (`touch-action: none`) — 클릭-투-클로즈만 하는
  요소라 터치 제스처를 통째로 거부해도 잃는 게 없습니다.

position-fixed 락이 주 방어이고 이 둘은 보조입니다.

## 3. 파급 — `window.scrollY`를 읽던 곳들

락이 `<body>`를 `position: fixed`로 세워두는 동안 **`window.scrollY`는 0을
반환합니다.** 이걸 곧이곧대로 읽던 곳들이 모달이 열리는 순간 "페이지 최상단"
상태로 튀었다가 닫을 때 되돌아왔을 겁니다. 전부 락 중에는 마지막 실제 값을
유지하도록 막았습니다:

| 위치 | 증상이 됐을 것 |
|---|---|
| `lib/useScrollDirection.ts` | 이미 락을 감지하고 있었으나 `body.style.overflow === "hidden"`으로 판별 — 새 방식에서는 맞지 않아 `isScrollLocked()`로 교체 |
| `JourneyNav.tsx` | 헤더가 백드롭 뒤에서 최상단 스타일로 벗겨졌다가 복귀 |
| `Journey.tsx` 하단 등록 레일 | 레일이 내려갔다가 닫을 때 복귀 |
| `Journey.tsx` 맨위로 버튼 | 사라졌다가 복귀 |
| `BackgroundScene.ts` | 배경 씬이 시작 상태로 되감겼다가 튐 (70% 백드롭 너머로 보임) |

`Journey.tsx:2177`의 등록 바는 `if (past) setVisible(true)` 단방향 래치라
영향이 없어 그대로 뒀습니다.

훅은 잠금 상태를 `<body>`의 `data-scroll-locked` 속성으로 알리고, 소비자는
속성명을 직접 쓰지 않고 `isScrollLocked()`로 읽습니다.

## 4. 남겨둔 것 — 데스크톱 6px

클래식(비오버레이) 스크롤바가 있는 데스크톱에서는 락이 걸린 동안 페이지가
스크롤바 트랙만큼 — 여기서는 6px — 넓어집니다. body가 fixed가 되면 문서 높이가
뷰포트로 접히면서 스크롤바가 같이 사라지기 때문입니다. **이건 기존 방식에는
없던 동작입니다** (위에서 말했듯 옛 락은 스크롤바를 없애지도 못했으니까요).

측정해보니 본문과 고정 크롬(헤더·레일)이 **같은 방향으로 같은 3px씩** 움직이고,
그 위로 백드롭이 70% 검정으로 페이드인하는 중이라 사실상 보이지 않습니다.
의도적으로 보정하지 않았습니다:

- body에 padding을 주면 **흐름 콘텐츠만** 제자리로 돌아오고 고정 헤더·레일은
  그대로입니다(고정 요소의 컨테이닝 블록은 뷰포트). 균일한 밀림 하나가 서로
  어긋나는 둘로 바뀝니다.
- `<html>`에 `overflow-y: scroll`을 걸어 스크롤바를 붙잡아두면 `overflow-x: clip`
  가드의 사용값이 `hidden`으로 강제됩니다 — globals.css의 그 규칙 주석이 길게
  설명하듯 사이트 전역의 `position: sticky`가 깨집니다.
- `scrollbar-gutter: stable`은 쓸 수 없습니다. 시도했고 computed 값까지
  `stable`로 들어가지만, `<html>`이 여기서는 스크롤 컨테이너가 아니라
  (`overflow-y: visible`) 무시됩니다. 죽은 규칙이라 되돌렸습니다.

`lib/useBodyScrollLock.ts` 주석에 그대로 기록해뒀습니다.

## 검증

Chrome DevTools로 실제 페이지를 조작해 확인했습니다 (모바일 500×844,
데스크톱 1440×900).

**네 모달 전부** (EventModal · PartnerModal · RegisterModal · DayModal):

- 열린 상태에서 `window.scrollTo` / `scrollBy` / `documentElement.scrollTop` /
  `body.scrollTop`을 모두 강제 → `window.scrollY` 불변(0), 문서 높이가 뷰포트
  높이로 접힘.
- 내부 컨테이너를 바닥까지 내린 뒤 계속 밀기 → 배경 불변.
  `overscroll-behavior-y: contain`, 백드롭 `touch-action: none` 확인.
- 닫기 → 열기 전 위치로 **정확히** 복귀. 50ms 간격 12회 샘플링에서 중간값 없이
  0 → 목표값 한 번에 도달(= smooth 애니메이션 아님). 인라인 스타일 전부 비워지고
  `data-scroll-locked` 제거, `position: static` 복귀.

**중첩:** DayModal(−9969px 고정) → 위에 EventModal 스택 → 안쪽만 닫음 →
페이지 여전히 −9969px에 고정 → 바깥쪽 닫음 → 9969로 정확히 복원.

**기존 동작 무변경:** ESC로 닫힘, 포커스가 트리거로 복귀(day 카드 · 파트너 타일 ·
등록 CTA 각각 확인), 락 동안 크롬 상태 유지되고 열기 전/닫은 후 헤더 transform
동일(`matrix(1,0,0,1,0,-105)`).

**등록 모달 입력:** 인풋 포커스 전후 다이얼로그 geometry 불변
(top 68 / bottom 844, 844px 뷰포트) — 모달이 body가 아니라 뷰포트에 앵커돼 있음이
확인됐고(body가 −527.5px로 밀려 있어도 다이얼로그 bottom은 844), 내부 컨테이너가
스크롤 가능하므로 iOS 키보드가 올라와도 필드에 도달합니다. `max-h` 조정 불필요.

**콘솔:** 새 에러·경고 없음. framer-motion의 non-static container 경고는 모달을
한 번도 열지 않은 새로고침 직후에도 뜨는 기존 항목입니다.

`npm run build` 통과.
