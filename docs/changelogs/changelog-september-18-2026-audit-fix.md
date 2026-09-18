# Changelog 2026-09-18 (감사 반영: 페르소나 8종 감사의 P0·P1·선택 사항 전부)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main`
**Scope:** 홈(`/`). `/2026-08`은 손대지 않았습니다. 브리프는 `docs/audit-fix-brief.md`, 감사는
`docs/audit-2026-09-18.md`. 카피 키는 지우지 않고 추가·수정만 했습니다.

커밋 여섯(브리프 11.9의 순서): `1f47cd6` fix(brand) → `c584149` feat(web) 등록 준비 중 → `8f12469`
fix(mobile) → `7f78321` feat(web) 깔때기 → `1a8ed0b` fix(a11y) → 마지막 fix(web) 이미지 sizes·메타·
scroll-behavior(이 문서와 같은 커밋). 파일 하나(`NaruHome.tsx`)에 여섯 커밋의 변경이 섞여 있어
`scripts/split-commits.py`가 hunk 단위로 키워드 분류해 나눴습니다. 경계가 완벽하지는 않습니다.

## 1. 결정 (사용자, 2026-09-18)

- **주황은 점으로만.** 제목 2행·태그라인 2행 그라데이션은 보라 틴트(#A99AD6)에서 자주 틴트(#C79BB4)로
  끝납니다(원색 `--purple`은 어두운 바탕 위 2.12:1이라 글자에 못 씁니다). 날짜 줄 흰색 볼드, 카운트다운
  테두리 `--border-2`. 화면의 주황은 로고 나루 점(헤더·푸터·`#naru` 인장·코어 제목 앞 NaruMark), 배경 등불,
  노선도 현재 위치 점, 카운트다운 옆 점뿐입니다.
- **민트·초록은 General Mentoring 상자 하나**("전 기간 상시" 배지). 나머지는 보라 `accent` 토큰.

## 2. 감사 항목 ↔ 반영

| 감사 | 내용 | 커밋 |
| --- | --- | --- |
| P0 1 | "등록 준비 중" + 12px 캡션 "열리면 이 자리에서 알립니다". `aria-disabled` + `aria-describedby`. 흐림 대신 색(흰 /70, 9:1). 히어로·프로그램 CTA 둘 다 | c584149 |
| P0 2 | 폰 헤더: 아래로 스크롤하면 로고 줄 52px만 접고 칩 레일은 남음. 위로 스크롤해야 복귀(정지 시 자동 복귀 없음, 나루만). `scroll-padding-top`은 헤더 실높이(접힘 65px). 레일 우측 24px 페이드 + snap + 활성 칩 가운데 | 8f12469 |
| P0 3 | Day 카드 폰 아코디언(56px 행, 첫 카드만 펼침), 아쉬웠던 넷 폰 1열 행, 나루 인장 160/220, "그래서 지키는 것" 폰 접힘, 긴 문단 폰 왼쪽 정렬. 측정은 4장 | 8f12469 |
| P0 4 | 번호 배지·"참가 혜택"·"함께하는 길" 아이브로·알럼 띠·불릿 전부 보라. 초록은 General Mentoring 상자 하나. `Halo`에서 cyan·emerald·orange 톤 제거 | 1f47cd6 |
| P0 5 | 결정대로: 그라데이션 보라 → 자주, 날짜 줄 흰색, 카운트다운 테두리 `--border-2` + 점 하나 | 1f47cd6 |
| P1 나루 한 문장 | 서술 첫 줄 "싱가포르에서 시작한 한인 학생 빌더 커뮤니티, 나루의 다음 이벤트입니다." `TODO: confirm` | c584149 |
| P1 기업 얻는 것 | 기업 카드에 얻는 것 두 줄(8월 사실만), 내는 것 앞에. 3층 다이어그램 후원·주최·주관 상자에도 "얻는 것" 한 줄 | 7f78321 |
| P1 알럼 앵커 | 8월 챕터 끝 "8월에 오셨던 분은 →" → `#join-alumni` | c584149 |
| P1 첫 이벤트 문장 | notSequel: "나루의 두 번째 이벤트입니다. 제로백 빌더톤의 속편은 아니고…" | c584149 |
| P1 사진 캡션 | "제로백 빌더톤 · 2026.08 싱가포르" 한 줄. 데스크톱 호버 시 각 사진에 Day 1/8 슬라이드(`photos[].day`) | c584149 |
| P1 8월 깔때기 | 스텝 차트 한 줄(74 → 59 → 25 → 21 → 9, 보라 단색에 마지막 단 자주, 축 없이 값 라벨) + 아래 큰 숫자 "9팀 · 출제사에 직접 자료 요청 · 시키지 않았습니다". 폰은 세로 스텝. 3+2 그리드 높이 불일치는 사라짐 | 7f78321 |
| P1 노선도/플로우 | **확인 결과: 노선도는 데스크톱에서 렌더됩니다.** 참여 플로우 스트립을 데스크톱에서도 삭제. FlowStrip 컴포넌트·`december.flow` 키는 그대로 | 1f47cd6 |
| P1 얻는 것 카드 | 데스크톱 내용 높이 + 최소 높이(`items-start`), 폰 1열 행 64px 번호 필 왼쪽. `evidence` 키만 추가, 미렌더(`TODO: confirm`) | 7f78321 |
| P1 Day 카드 강조색 | "→ 그날의 한 줄" 흰색 볼드 하나. BEFORE 호박·Day 1·2 민트·Day 3 분홍 제거. "★ 제출" 칩만 자주(`Chip` tone `plum`), 나머지 칩 `outline` | 1f47cd6 |
| P1 아이브로 4종 | 보라 외곽선 1종(`Eyebrow` purple을 외곽선으로). 8월 전용 변형은 정의만 남음 | 1f47cd6 |
| P1 보조 버튼 | `buttonClass("secondary")` 1사이즈 5곳. 함께 챕터 "메일로 문의" 셋은 44px 텍스트 링크, 알럼 띠 "메일로 보내기"만 외곽선 | 1a8ed0b |
| P1 원형 인장 | 보조 마크로 160/220px. 형태는 로고 가이드가 정본이라 그대로 | 8f12469 |
| P1 나루 챕터 텍스트 | 코어는 폰에서 제목 + 한 문장, 경첩 부연·how 리드는 lg부터, 하지 않는 것은 폰에서 각주(상자 없음), 다이어그램 폰 행 | 8f12469 |
| a11y 12px/44px | 폰 12px 미만 0, 44px 미만은 스킵 링크·헤더 로고(제외)와 링크드인 아이콘 11개(시각 31px, `after:-inset-2` 의사 요소로 히트 49px) | 1a8ed0b |
| a11y 정지 토글 | 헤더 우측에 아이콘형 토글 추가(푸터 것 유지). **확인 결과: 데스크톱 푸터에도 토글은 이미 있었습니다.** `prefers-reduced-motion`이면 초기 표시 "정지" | 8f12469 |
| a11y EN/KR | 나루 변형: 밑줄 + 굵기 + `aria-current` + `lang`. 8월·퀴즈는 그 전 그대로 | 1a8ed0b |
| a11y 카운트다운 | `role="group" aria-label="크로싱 서울까지 81일 23시간"` 하나, 자식 `aria-hidden`. 폰 라벨 "81일 · 12.10 목" | 1a8ed0b |
| web-dev 이미지 | `sizes="(max-width: 1023px) 45vw, 280px"`(데스크톱 실측 폭 ~280px이라 브리프의 230 대신), 위 두 장 `priority`, `src` 없으면 렌더 안 함. `src` 없는 `<img>`는 로컬·프로덕션 모두 0건, 폰 로드 502도 0건(감사 당시 일시 오류로 봄) | 마지막 |
| web-dev 메타 | `title.default` "크로싱 서울 2026 \| 나루 NARU", `alternates { canonical "/", languages { ko "/", en "/?lang=en" } }`, `og:alternateLocale en_US`. `?lang=`은 부트스트랩과 LocaleProvider가 읽습니다. 로케일별 description은 한 URL 정적 생성이라 한 벌(`TODO: confirm`) | 마지막 |
| web-dev scroll | `html { scroll-behavior: smooth }` 제거. 홈은 앵커 클릭 핸들러가 `scrollIntoView({ behavior: "smooth" })`, reduced-motion이면 auto. `/2026-08`은 `html:has(body[data-sticky])`로 그 전 그대로 | 마지막 |
| 선택 노선도 점 | 주황 점 하나가 호버·포커스한 Day 카드(폰은 열린 칸) 위치로 200ms 이동, 지나는 ★는 한 번 밝아짐(`starFlash`). reduced-motion이면 정적 | 1f47cd6 |
| 선택 카운트업 | 깔때기 뷰포트 진입 시 0 → 값 600ms 한 번. reduced-motion 생략 | 7f78321 |
| 선택 사진 호버 | 위 사진 캡션 항목 | c584149 |
| 영문 라벨 규칙 | 스테이지 "문제 발견 discovery"(ko, `stages[].title` 추가, `TODO: confirm` 한글 이름), 역할 "주최 host" | 1f47cd6 |

## 3. 브리프와 다르게 한 것

- **`content-visibility: auto`(9.6)는 넣었다가 뺐습니다.** 넣으니 오프스크린 챕터 높이가 900px 자리표시자가
  되어 스크롤 높이가 읽는 중에 바뀌고, 전체 페이지 캡처가 빈 프레임으로 나왔습니다(감사가 쓴 방법). 배경의
  앵커 읽기도 그 추정치를 봅니다. 이 페이지는 텍스트 위주라 얻는 것보다 잃는 것이 큽니다. `Chapter`에도
  흔적을 남기지 않았습니다.
- **사람 탭은 한 줄 행(`RecordTabs compact`).** 소개·칩·세션 요약을 빼고 이름, 소속·직함, 링크드인만.
  전문 카드로 넣으면 데스크톱 +1,300px, 폰 +2,500px이라 길이 목표와 정면으로 부딪힙니다. 폰은 2열.
- **언론 제목 `line-clamp-2`는 폰만.** `PressRows`는 8월 페이지와 공유라 데스크톱 값을 바꾸면 `/2026-08`이
  같이 바뀝니다. 폰 clamp + `title`은 모바일 수정에서 이미 되어 있었습니다.
- **`setPixelRatio(min(dpr, 1.5))`(9.6)는 이미 그렇습니다.** 폰 티어 `dprMax` 1.35(`lib/background/config.ts`).
  `document.hidden`이면 렌더 루프가 서는 것도 이미 있습니다(`BackgroundScene.loop`의 `visible`). Pretendard
  `preload: true`도 이미 그렇습니다. 손대지 않았습니다.
- **`December` ≤ 2,400과 `#naru` ≤ 2,200, 폰 합계 ≤ 10,800은 못 미쳤습니다.** 4장 표. 남은 차이는 브리프가
  더한 것(사람 탭 +~830, 기업 얻는 것, 나루 한 문장, 캡션)과 내용을 지워야만 나오는 값입니다. `TODO: confirm`.
- `next lint`는 ESLint 설정이 없어 대화형 프롬프트에서 멈춥니다(그 전과 같음). 빌드의 lint 단계는 통과.

## 4. 측정

390×844(ko, 움직임 켬, `scripts/capture-frames.mjs`):

| 챕터 | 감사 당시(ed25b4e) | 후 | 목표 |
| --- | --- | --- | --- |
| `#top` | 1,128 | 1,085 | |
| `#december` | 3,585 | 2,564 | ≤ 2,400 |
| `#gains` | 906 | 691 | |
| `#record` | 1,507 | 2,410 | (사람 탭 +) |
| `#naru`(+how) | 3,674 | 2,368 | ≤ 2,200 |
| `#join` | 2,046 | 2,004 | |
| `#closing` | 402 | 391 | |
| 합계 | 12,979 | **11,514** | ≤ 10,800 |

1440×900 ko: 합계 10,349(목표 ≤ 9,300. top 900, december 2,181, gains 900, record 2,002, naru 2,569,
join 1,397, closing 400). en: 390 12,936 / 1440 10,947.

## 5. 검사

- `npx tsc --noEmit` 통과. `npm run build`(스크래치 복사본에서) 통과, 경고 0. 콘솔 오류 0(경고 1: framer-motion
  `useScroll` "non-static position", 그 전부터 있던 것). 가로 넘침 0(390·1440).
- 색 검사(`components/home`, `components/shared`, `components/crossing`, `components/ui`):
  `emerald` 실제 사용은 `NaruHome.tsx` General Mentoring 상자(테두리·"전 기간 상시"·점) 한 곳. 나머지 히트는
  `Chip`·`Eyebrow`의 8월용 변형 정의와 `ChipDot` 기본값. `orange|#EE8A4F|F2B183` 실제 사용은 `NaruHome.tsx`
  카운트다운 점, `RouteMap.tsx` 현재 위치 점, `NaruMark.tsx` 로고 점 셋(+ `Eyebrow` orange 변형 정의). 배경
  등불은 `lib/background`. `RecordTabs`의 F2B183 한 곳과 `RegisterModal` 성공 아이콘의 emerald도 보라로.
- 폰 12px 미만 텍스트 0(aria-hidden 장식 제외). 44px 미만 a/button: 스킵 링크, 헤더 로고 36px(둘 다 제외),
  링크드인 아이콘 11개(의사 요소로 49px).
- 1차 CTA는 히어로 하나(`buttonClass("primary")` 2곳은 히어로·프로그램의 `open` 분기). 보조 버튼은
  `buttonClass("secondary")` 5곳, 옛 소형 외곽선 클래스 0.
- `/2026-08` 픽셀 diff(REDUCE=1, 스크롤 0): HEAD 워크트리 vs 작업 트리 1440 75,583px / 375 246,833px.
  **전부 히어로의 메탈 휴먼 이미지 영역**(x 518~847)이고 글자·레이아웃은 동일. 같은 HEAD를 두 번 찍어도
  41,627px이 다릅니다(그 이미지가 캡처마다 다름). 공유 파일 변경은 8월에서 부르지 않는 변형 추가뿐입니다.
- 스크린샷 `.shots/naru/audit-fix/`: `1440-ko`(13장) `1440-en`(13) `390-ko`(14) `390-en`(16), 850px 간격,
  대기 2.5초. 캔버스만 `canvas-390`(14장, headless GL이라 실기기와 밝기가 다름). `aug-*`는 위 diff 근거.
  히어로 캡션·"등록 준비 중"·깔때기·접힌 헤더는 `390-ko/s0.png`, `s850.png`, `s4250.png`에 있습니다. 노선도
  점 이동 연속 프레임은 호버 상호작용이라 정지 캡처에 없고, 데스크톱 세션에서 눈으로 확인했습니다.

## 6. TODO: confirm

- 나루 한 문장(`eventHero.naruLine`).
- 얻는 것 근거(`gains.items[].evidence`)를 그릴지.
- 스테이지 한글 이름(팀 본딩·문제 발견·빌드·다듬기·피치).
- 길이 목표 셋(4장).
- 로케일별 description: 언어별 URL이 없어 불가. 필요하면 `/en` 라우트가 먼저.
