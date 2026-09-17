# Changelog 2026-09-17 (히어로: 형상 대신 행사 사진 넷)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main`
**Scope:** 홈(`/`) 히어로 오른쪽 단과 배경. `/2026-08`은 손대지 않았습니다.

## 1. 결정 (사용자)

"한국이랑 싱가폴 이미지 말고, 행사 이미지나 많이 보여주는 식으로. 사람 많이 나온 거로만.
같은 사진 두 번 쓰지 말 것." 원본은 Dropbox `한인 빌더톤/Photo`(359장, HEIC 대부분).

## 2. 바뀐 것

- 히어로 오른쪽 단(폰은 카피 아래)이 8월 행사 사진 넷의 2×2 격자입니다. 오른쪽 열을
  조금 내려(lg에서 translate-y 8) 한 덩어리로 읽힙니다. 전부 4:3, 1200×900 webp q78,
  EXIF 방향 적용(pillow-heif).
- 고른 넷(사람 많이 나온 장면, 8월의 기록 벽의 열두 장과 원본이 겹치지 않음):

| 파일 | 원본 | 장면 |
| --- | --- | --- |
| `hero-day8-group.webp` | Day 8/시상식/IMG_2680.HEIC | 시상식 뒤 단체 사진 |
| `hero-day1-audience.webp` | Day 1/AWS/IMG_2044.HEIC | Day 1 파운드리 홀 가득한 청중 |
| `hero-day8-career-room.webp` | Day 8/커리어 간담회/IMG_8119.heic | 긴 책상에 둘러앉은 참가자들 |
| `hero-day8-judgement.webp` | Day 8/Judgement Track Sharing/IMG_8037.HEIC | 발표를 지켜보는 방 |

  기존 열두 장의 원본은 32×24 상관으로 역추적해 겹치지 않는지 확인했습니다(day1-start =
  IMG_2092, day8-room = IMG_8114 등. day1-crowd 한 장만 원본을 못 찾았는데, 위 넷과는
  구도가 다릅니다).
- 배경: 싱가포르·서울 형상, 등불, 반사 띠를 껐습니다(`SHAPES.enabled = false`). 남은
  것은 하늘과 깊이 층(8월 필드의 잔잔한 입자)뿐이라 깊이 층 밝기를 0.25 → 0.4로. 형상
  코드는 그대로 두었습니다. `enabled`를 true로 되돌리면 다시 섭니다.
- `ShapeLabels`와 무대 앵커는 걷었습니다. 카운트다운 얇은 패널은 그대로.

## 3. 바뀐 파일

| 파일 | 무엇 |
| --- | --- |
| `public/record/hero-*.webp` | 신설 넷 |
| `data/naru.ts` | `eventHero.photos`(넷, alt ko/en, 원본 경로 주석) |
| `components/home/NaruHome.tsx` | `HeroPhotos`, 무대·라벨 제거 |
| `lib/background/config.ts` | `SHAPES.enabled`, 깊이 층 밝기 |
| `lib/background/scene/BackgroundScene.ts` | 형상 꺼진 경로(깊이 층만) |

## 4. 확인

- `npx tsc --noEmit`, `npm run build` 통과. 프로덕션 콘솔 오류 0(1440·390).
- 페이지 길이: 홈 1440 ko 9,610 / en 10,194(변화 없음), 390 ko 13,318 / en 14,645(+92).
- 사진 넷 용량 합 583 KB.

## 5. 2차 (같은 날, 사용자 지정)

사용자가 넷을 직접 골랐습니다. 순서대로 2×2.

| 파일 | 원본 | 장면 |
| --- | --- | --- |
| `hero-day1-group.webp` | Day 1/현장 사진/IMG_2092.JPG | Day 1 단체 사진 |
| `hero-day1-hall.webp` | Day 1/AWS/IMG_2028.HEIC | Day 1 홀, AWS 세션 |
| `hero-day8-group.webp` | Day 8/시상식/IMG_2680.HEIC | 시상식 뒤 단체 사진 |
| `hero-day8-judgement-room.webp` | Day 8/Judgement Track Sharing/IMG_2513.HEIC | 세로 원본, 아래쪽 4:3 |

IMG_2092는 8월의 기록 벽의 `day1-start` 자리에 있던 사진이라(같은 사진 두 번 금지)
그 자리를 Day 1/AWS/IMG_2044(홀을 가득 채운 청중, `day1-full-hall.webp`)로 바꾸고 캡션은
그대로 두었습니다. 1차의 `hero-day1-audience`(=IMG_2044)는 그 파일로 이름을 바꿨고,
`hero-day8-career-room`, `hero-day8-judgement`, `day1-start`는 지웠습니다.
