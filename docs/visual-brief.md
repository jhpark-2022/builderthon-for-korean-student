# 브리프: 보라 면을 CTA 하나로, 굵기를 바로, 착지와 눌림

대상 레포: `website` (커밋 `a0dc66e` 기준). 근거는 `docs/visual-review-2026-10-15.md`(C1~C8, H1~H11, M1~M12). 정본은 `docs/brand.md`(먼저 읽습니다. 10장 색 규칙은 이 브리프에서 바꾸지 않습니다). 클래스와 토큰, 작은 핸들러만 바꿉니다. 챕터 순서, 블록 자리, 글자 크기 셋, 배경 장면, `/2026-08`은 건드리지 않습니다. 줄 번호는 `a0dc66e` 기준이라 어긋나면 클래스 문자열로 찾습니다.

세 단계. 단계마다 사용자가 스크린숏을 보고 다음으로 갑니다.

## 1단계. 색: 화면마다 보라 필은 하나 (C1~C6)

| # | 파일:줄 | 지금 | 뒤 | 근거 |
| --- | --- | --- | --- | --- |
| 1.1 | `components/home/NaruHome.tsx:473` General Mentoring 상자 | `border-emerald-400/25 bg-emerald-400/[0.06]` | `border-accent/30 bg-accent/[0.08]` (#gains 상자 :1150과 같은 토큰) | C3 |
| 1.2 | 같은 상자 :479 기간 줄, :475 점 | `text-emerald-200/90`, `<ChipDot />` | `text-accent`, `<ChipDot className="bg-accent" />` | C3 |
| 1.3 | `NaruHome.tsx:490` 현장 멘토링 점 | `border border-naru-orange` | `border border-accent/60` | C5 (주황 원장에 없던 자리) |
| 1.4 | `NaruHome.tsx:379, :371, :383, :389` 미션 띠 | `border-amber-400/25 bg-amber-400/10`, `text-amber-100`(둘), `hover:bg-amber-400/10`, `border-amber-400/20` | `border-naru-plum-tint/30 bg-naru-plum-tint/10`, `text-naru-plum-tint`(둘), `hover:bg-naru-plum-tint/10`, `border-naru-plum-tint/20` | C4. 노선도 ★(RouteMap.tsx:152)와 같은 자주가 되어 "★ = 자주" 하나 |
| 1.5 | `components/journey/JourneyNav.tsx:778` 활성 페이지 칩 | `border-accent/40 bg-accent/[0.12]` | `border-white/25 bg-white/[0.08]` (밑줄 `decoration-accent`는 유지) | C1 |
| 1.6 | `JourneyNav.tsx:673` 헤더 오픈채팅 칩 | `border-accent/40 bg-accent/[0.12] text-accent` | `border-white/20 bg-white/[0.06] text-white/85` | C1 |
| 1.7 | `components/ui/MobileChatBar.tsx:122` 고정 바 | `border-violet-400/45 text-violet-100` | `border-accent/40 text-accent` | C6 |
| 1.8 | `NaruHome.tsx:1213, :1214, :1210` 티저 발광과 테두리 | `bg-naru-purple/40`, `bg-accent-strong/25`, `from-accent/80 ... to-accent-strong/70` | `bg-naru-purple/20`, `bg-accent-strong/10`, `from-accent/40 via-white/10 to-accent-strong/30` | C2 |

바꾸지 않는 것: 두 primary CTA의 그라데이션 필(`Button.tsx:25`), 워드마크, 노선도 주황 현재점(원장), 테라코타 "CROSSING SEOUL"(로고 색). 주황을 CTA로 올리는 옵션 A는 이 브리프 밖입니다(5장 D1).

## 2단계. 위계: 같은 층 안의 굵기와 알파 (H1~H11)

| # | 파일:줄 | 지금 | 뒤 | 근거 |
| --- | --- | --- | --- | --- |
| 2.1 | `components/home/shared.tsx:113` SUBHEADING | `font-semibold text-white/85` | `font-bold text-white` | H5. 소제목이 자식 카드 제목(700/1)보다 약했음 |
| 2.2 | `NaruHome.tsx:274` 카운트다운 숫자 | `font-black text-white` | `font-bold text-white/85` | H1 |
| 2.3 | `NaruHome.tsx:876` 숫자 둘("5일", "무순위") | `font-black text-white` | `font-bold text-white/85` | H4 |
| 2.4 | `NaruHome.tsx:684` 히어로 날짜 줄 | `font-bold text-white` | `font-semibold text-white/85` (굵은 줄은 :687 포지션 줄 하나만) | H1 |
| 2.5 | `shared.tsx:241` PreparingButton | `font-bold` | `font-semibold` (SECONDARY와 같은 600) | H1 |
| 2.6 | `NaruHome.tsx:325` 히어로 사진 Image | className에 추가 | `brightness-[.85] transition group-hover:brightness-100` | H2 |
| 2.7 | `NaruHome.tsx:986` "이렇게 굴립니다" 위 간격 | `mt-8` | `mt-12` | 읽기 순서 36:28 → 54:28 |
| 2.8 | `NaruHome.tsx:530` 카드 DAY 알약 | `rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 tracking-[0.08em]` | 제거. `${META} font-bold text-accent`만(노선도 라벨과 같은 옷) | H6, H8 |
| 2.9 | `components/shared/RouteMap.tsx:167, :199` DAY 0과 힌트 | `/65` | `/70` | H9 |
| 2.10 | `RouteMap.tsx:170, :175` 정거장 이름, 미션 | `/75`, `/75` | `/85`, `/70` | H9 |
| 2.11 | `components/ui/Chip.tsx:32`, `components/ui/Button.tsx:34` | `/80`, `/75` | `/85`, `/85` | H9 |
| 2.12 | `NaruHome.tsx:1155` #gains ✓칩 | `rounded-full border border-accent/30 bg-accent/[0.1] px-3 py-1`, `text-white/90` | 상자 제거(✓ 글리프 + 글자만, 부모 `gap-2` → `gap-x-4`), `text-white/85` | H10 |
| 2.13 | `lib/typography.ts` | | `EYEBROW_TEXT = \`${META} font-semibold uppercase\`` 추가. `NaruHome.tsx:1151, :1228`, `components/naru/NaruPage.tsx:456, :825`의 인라인 아이브로가 이것 + `eyebrowTrack(locale)`. `NaruHome.tsx:224` `tracking-[0.18em]` → `eyebrowTrack(locale)` | H7 |
| 2.14 | `components/ui/MotionToggle.tsx:67` | `text-[0.7rem]` | `text-xs` | 네 번째 크기 제거 |
| 2.15 | `NaruHome.tsx:1237` 티저 "나루 알아보기" | `buttonClass("secondary","naru")` | 같은 클래스에 `font-bold text-white` 덧씀 | H11 |

H3(헤더 워드마크를 히어로가 보이는 동안 숨김)은 5장 D2. 기본값은 하지 않음.

## 3단계. 모션: 착지와 눌림 (M1~M12)

| # | 파일:줄 | 뒤 | 근거 |
| --- | --- | --- | --- |
| 3.1 | `components/journey/Chapter.tsx` | `eager?: boolean` prop. `useState(eager)`로 초기 shown = true, eager면 리빌 클래스와 transition 생략. `NaruHome.tsx:609` `<Chapter id="top" eager>` | M1 |
| 3.2 | `JourneyNav.tsx:296` 앵커 클릭 | `scrollIntoView` 대신 offsetTop 누적 + `scrollPaddingTop`: `let y=0; for (let el=target; el; el=el.offsetParent) y+=el.offsetTop; const pad=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0; window.scrollTo({ top: y - pad, behavior })` | M2 (transform 영향 없음) |
| 3.3 | 같은 핸들러 | 방향별 여백: 내려갈 때 레일만(62 + 12), 올라갈 때 펼친 헤더 실높이 + 12. 또는 `scrollend`(없으면 800ms)에서 `header.bottom + 12 - target.top`만큼 `scrollBy` 보정 | M3 |
| 3.4 | `JourneyNav.tsx` 모듈 상단, :294, :147 | `let jumpingUntil = 0`. 클릭 시 `jumpingUntil = performance.now() + 900` 과 `setActive(id)` 즉시. `useActiveSection`의 `read` 첫 줄 `if (performance.now() < jumpingUntil) return` | M5 |
| 3.5 | `tailwind.config.ts` | `future: { hoverOnlyWhenSupported: true }` | M4. 모든 `hover:`가 `@media (hover:hover)` 안으로 |
| 3.6 | `Button.tsx:26, :31, :34`와 같은 문자열을 쓰는 `shared.tsx:241`, `JourneyNav.tsx:673`, `components/match/MatchParts.tsx:235`, `components/match/Quiz.tsx:515` | PRIMARY, SECONDARY에 `active:translate-y-0 active:scale-[0.98] active:duration-75`, TEXT에 `active:text-white`, 퀴즈 선택지 `active:scale-[0.99]` | M4 |
| 3.7 | `MobileChatBar.tsx:57` | `if (past) setVisible(true)` → `setVisible(past)` | M6 |
| 3.8 | `NaruHome.tsx:919` 노선도 패널, `:908`, `RouteMap.tsx:146` | 패널에 `motion-safe:animate-[panelIn_180ms_ease-out]` + `globals.css` `@keyframes panelIn { from { opacity: 0; transform: translateY(6px) } }`. `current`는 마지막 열린 날 유지(`openDay ?? prevOpen`). 정거장 버튼에 `transition-colors` | M7 |
| 3.9 | `components/ui/Reveal.tsx:84, :87`, `Chapter.tsx:132, :155` | `duration-700` → `duration-500`, translateY 40 → 16 | M10 |
| 3.10 | `JourneyNav.tsx:753, :367` | `transition-[padding]` + `pt-2` → `transition-transform` + `translate-y-2`; `transition-all` → `transition-[transform,background-color]` | M9 |
| 3.11 | `Button.tsx:43`, `JourneyNav.tsx:568`, `JourneyNav.tsx:367` | `duration-300`, `after:duration-300`, `lg:duration-500` 삭제(150 기본). `tailwind.config.ts` `transitionTimingFunction: { out: "cubic-bezier(0.22,1,0.36,1)" }` | M12 |
| 3.12 | `components/shared/PhotoLightbox.tsx`, `NaruHome.tsx:317` | Image `onLoad` → `loaded`, `transition-opacity duration-200 opacity-0/100`. 타일 `onPointerEnter`/`onTouchStart`에서 `new Image().src = photo.src` | M8 |
| 3.13 | `Quiz.tsx:354, :487` | 260 → 160, `duration: 0.28` → 0.18, exit x -24 → -12 | M11 |
| 3.14 | `RegisterModal.tsx:54` FIELD | `focus-visible:outline-none` (보더 accent 하나만) | 두 겹 포커스 |

## 4. 건드리지 말 것

챕터 순서, 블록 자리, 글자 크기 셋, 정렬 규칙, 배경 장면과 등불, 노선도 주황 현재점, 워드마크와 테라코타 글자, 두 primary CTA의 그라데이션, `/2026-08` 전부(픽셀 회귀 0), `/match` 글. 10/11에 되돌린 2단계·3단계 내용은 넣지 않습니다. 금지어 0, em dash 0, 가운뎃점 새로 쓰지 않음.

## 5. 결정

| # | 질문 | 기본값 |
| --- | --- | --- |
| D1 | 주황을 CTA 색으로(옵션 A, `bg-naru-orange text-naru-ink`, 7.79:1) | 하지 않음. 9/18 원장과 brand.md 10장을 뒤집는 결정이라 1단계 뒤 시안을 보고 사용자가 정함 |
| D2 | 헤더 워드마크를 `#hero-title`이 보이는 동안 숨김(H3) | 하지 않음. 원하면 IntersectionObserver 한 줄로 2단계에 추가 |
| D3 | 카드 DAY 알약 제거(2.8) | 함. 노선도 라벨과 같은 옷이 됨 |
| D4 | ✓칩 상자 제거(2.12) | 함 |
| D5 | 히어로 eager(3.1) | 함. 첫 화면 페이드만 빼고 나머지 챕터 리빌은 그대로 |

## 6. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 색 | 홈 390 전체 페이지에서 emerald, amber 픽셀 0. 첫 화면 유채 색상 3종 이하. 화면마다 보라 필(그라데이션 bg) 요소 1개 이하. `violet-` 클래스 홈 컴포넌트 0 |
| 2 | 위계 | 스퀸트(10% + blur): 히어로 폰 1위 CTA, 2위 워드마크(카운트다운 3위 이하). #december 머리에서 h2 휘도 > 숫자. "일정", "이렇게 굴립니다" h3 휘도 > 카드 제목. 흰색 알파 단 수 홈 전체 4 이하(1, .85, .70, .60). DAY 라벨 스타일 2종 이하 |
| 3 | 크기 | 화면당 글자 크기 3종(고정 헤더 제외), 12.6px 0 |
| 4 | 착지 | 폰, 데스크톱에서 레일 칩 셋과 페이지 칩 셋 탭 뒤 목표 제목 top이 헤더 bottom + 8~16px 안(내려갈 때, 올라갈 때 둘 다). 이동 중 aria-current 교체 1회 |
| 5 | 눌림 | `CSS.forcePseudoState(':active')`로 primary, secondary, 페이지 칩, 퀴즈 선택지의 transform이 달라짐. `:hover` 규칙이 `(hover:hover)` 미디어 안에 있음 |
| 6 | 히어로 | 하이드레이션 전 SSR HTML에서 `#top`의 `opacity:0` 없음. Fast 3G에서 글자 첫 표시가 DOM 완료 + 100ms 안 |
| 7 | 바 | #gains 지나고 맨 위로 돌아오면 고정 바 없음 |
| 8 | 불변 | `/2026-08` 픽셀 차이 0, `/naru` 코어 영역 차이는 2.1·2.11·2.13·3.x만. axe 0. `npm run build` 통과 |

단계마다 홈, `/naru`의 첫 화면과 멘토링, 일정, #gains 화면을 1440×900, 390×844로 적용 전과 나란히. 2단계는 스퀸트 시트(10% 축소 + blur)도 함께.

## 7. 커밋

1단계 `style(color): 홈의 emerald, amber, 팔레트 밖 보라를 accent 계열로, 보라 면은 CTA 하나` / changelog.
2단계 `style(type): 소제목 굵기 올리고 큰 숫자 내림, DAY 라벨과 아이브로 한 벌, 알파 3단` / changelog.
3단계 `fix(nav): 칩 착지를 offsetTop 기준으로, 이동 중 현위치 고정` / `feat(motion): 눌림 상태, hover 가드, 히어로 eager, 바 래치 해제` / `style(motion): 리빌 16px 500ms, 이징 하나, 패널 페이드, 라이트박스 로드 페이드` / changelog.

`main` 푸시는 사용자가 단계마다 확인한 뒤입니다.
