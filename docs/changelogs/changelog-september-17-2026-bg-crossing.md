# Changelog 2026-09-17 (배경: 건너는 점들)

**Project:** 나루 NARU 사이트 (Next.js)
**Branch:** `main`
**Scope:** 나루 홈(`/`)의 배경 하나. `/2026-08`의 입자 필드는 손대지 않았습니다.
브리프는 `docs/background-crossing-field-brief.md`.

---

## 1. 문제

나루 홈의 배경은 9/15의 수면 셰이더(`water`)였습니다. 밤의 강과 등불 하나. 히어로에서
한 번 보여 주고 30%를 지나면 가라앉아, 페이지의 나머지는 물속의 점 하나만 남았습니다.
8월 페이지의 배경(GPU 입자 필드 + 블룸 + 스크롤 국면)이 "쿨했던" 것과 결이 달랐고,
두 페이지의 디자인 문법을 맞추는 작업(같은 날의 8월 문법 체인지로그) 뒤에 배경만
다른 손이 남아 있었습니다.

## 2. 결정

8월의 엔진을 그대로 쓰고 이야기만 바꿉니다. **양쪽 기슭에 흩어져 있던 점들이
스크롤에 따라 어두운 강을 건너 등불 하나(나루 점) 쪽으로 모입니다.** 건너는 건
각자가 한다(입자 하나하나가 자기 속도로 건넌다). 자리는 우리가 만든다(등불 한 점).

재사용한 것: `ParticleField`(입자 엔진), `PostFX`(블룸·렌즈·비네트), `CameraController`
(3° 포인터 패럴랙스, 스크롤 돌리), `Atmosphere`(하늘), `WaterSurface`(반사 띠),
`config.pickQuality`(기기별 품질 티어), `fieldTime` 누산기(정지). 새로 쓴 것: 입자의
초기 분포와 흐름장(셰이더 분기), 국면 곡선, 등불 스프라이트, 수면 셰이더의 띠 모드.

### 장면

- **기슭 둘.** 화면 양옆 30%씩. 입자 수는 같습니다(짝수 인덱스가 왼쪽, 홀수가
  오른쪽). 씨앗은 깊이(z −30~8)를 먼저 정하고 그 깊이에서 보이는 화면 폭에 맞춰
  뿌립니다. 월드 좌표로 고정하면 가까운 입자는 화면 밖으로, 먼 입자는 강 한가운데로
  가서 어느 깊이에서도 "양옆 30%, 가운데 40%"가 되지 않았습니다(실측).
- **강.** 가운데 40%는 비어 있고 어둡습니다. 등불 아래에 수면 셰이더의 반사 띠
  (뷰포트의 14%)만 남겼습니다. 띠의 지평선은 등불 스프라이트의 화면 위치를 매
  프레임 투영해 따라갑니다. 카메라가 스크롤로 돌리하면 등불이 화면에서 내려오고
  띠도 같이 내려옵니다.
- **등불 한 점.** `PALETTE.hi1` 스프라이트. 방사 그라데이션의 흰 심이 블룸 임계값
  (0.7)을 넘고 입자(hi0, 휘도 ≈ 0.65)는 넘지 않습니다. 폰(블룸 없음)에서는 구워 둔
  그라데이션이 스스로 빛납니다. 가로 화면에서는 가운데 조금 오른쪽(히어로 두 단
  사이의 틈), 세로 화면에서는 왼쪽 아래(CTA 아래). 화면의 주황은 이 점과 반사
  기둥뿐입니다.
- **흐름장.** 기슭에서는 컬 노이즈 드리프트. 모이기(gather)는 자기 기슭의 물가로,
  건너기(crossing)는 등불 둘레의 자기 자리(성좌, 반지름 3~10)로 호를 그리며. 입자마다
  지연(0~55%)과 속도(±40%)가 달라 먼저 건넌 점과 늦게 건너는 점이 같이 보입니다.
  닿으면(arrived) 드리프트가 75% 줄어 잔잔해집니다.
- **색.** 기슭 입자는 `accent0`(보라, 왼쪽) → `accent2`(자주, 오른쪽). 건너는 동안
  `hi0`(연자주)로 밝아지고 닿으면 가라앉습니다. 주황이 되지 않습니다.

### 국면 (앵커에서 읽음)

```
banks     히어로            기슭에서 느리게. 등불 희미하게(0.5).
gather    #record 직전 →  #december    강가로. 등불 또렷해짐(0.9).
crossing  #december    →  #naru        건넘. 트레일, 블룸 +0.09, 반사 띠 흔들림.
arrived   #naru 부근                   성좌로 가라앉음. 등불 한 단 내림(0.6). 불투명도 0.3.
```

경계는 `#record`, `#december`, `#naru`의 offsetTop을 스크롤 비율로 바꿔 씁니다.
시작·리사이즈, 그리고 2초마다 다시 읽습니다. 앵커가 없으면 `CROSSING.fallbackAnchors`.
8월의 `portal`·`whiteout`은 쓰지 않습니다. 화이트아웃 없음.

## 3. 바뀐 파일

| 파일 | 무엇 |
| --- | --- |
| `lib/background/config.ts` | `CROSSING` 상수(강 반폭, 등불 자리·크기, 블룸 임계값, 띠 높이, 앵커 기본값) |
| `lib/background/shaders/particles.vert.ts` | `uMode`, `uLantern`, `uGather`, `uCrossing`, `uArrived`, `aBank`. `crossingMain()`. `main()` 첫 줄에서 분기. **8월 경로의 원문은 한 글자도 안 바뀜** |
| `lib/background/shaders/particles.frag.ts` | `uMode`, `crossingFrag()`. 같은 분기 |
| `lib/background/particles/ParticleField.ts` | `variant` 인자. crossing 씨앗(깊이별 화면 폭), `aBank`, 새 uniform, 팔레트, `updateCrossing`, `setLantern` |
| `lib/background/particles/Lantern.ts` | 신설. 스프라이트 등불 |
| `lib/background/particles/Atmosphere.ts` | `setPalette`. crossing은 위가 거의 검정, 아래가 옅은 남색(water 변형의 하늘과 같은 값) |
| `lib/background/shaders/water.ts` | `uBand`, `uLampUv`, `uBandH`. 띠 모드 분기. water 경로 원문 불변 |
| `lib/background/water/WaterSurface.ts` | `band` 인자, `setLamp` |
| `lib/background/renderer/PostFX.ts` | `bloomThreshold` 인자(기본값 0.28 = 8월 그대로) |
| `lib/background/utils/phases.ts` | `computeCrossingPhases`, `crossingToPhases` |
| `lib/background/scene/BackgroundScene.ts` | `variant: "crossing"`. 앵커 읽기, 등불 자리(화면 비율), 프레임 갱신 |
| `components/BackgroundMount.tsx`, `app/page.tsx` | `variant="crossing"` |
| `components/home/NaruHome.tsx` | 히어로 그리드에 `relative`(framer `useScroll` 경고 하나) |

`"field"`와 `"water"` 경로는 그대로입니다. 셰이더는 파일을 복제하지 않고 uniform으로
분기했습니다(브리프 4). 두 페이지가 같은 파일을 읽어야 노이즈·크기·안개 규칙이
갈라지지 않습니다.

## 4. 측정

### 8월 페이지 회귀

캡처 조건: 프로덕션 빌드, `prefers-reduced-motion: reduce`(필드 시간 0에 고정),
`Math.random`을 시드 난수로 바꿔 입자 씨앗 고정, 비디오 숨김, 캔버스 켬, CPU 4배
스로틀(8월 필드의 DPR 적응이 실행마다 달라지는 것을 눌러 결정적으로). 옛 코드를
`git stash`로 빌드해 같은 조건에서 찍고, 새 코드를 빌드해 찍은 뒤 비교.

| 캡처 | 같은 옛 빌드 두 번(잡음) | 옛 빌드 vs 새 빌드 |
| --- | --- | --- |
| 1440 스크롤 0 | 0 px | **0 px** |
| 1440 스크롤 0.5 | 6,078 px | 2,591 px (잡음 아래) |
| 390 스크롤 0 | 0 px | **0 px** |
| 390 스크롤 0.5 | 0 px | **0 px** |

1440 스크롤 0.5의 잡음은 스크롤 돌리 카메라의 감쇠가 캡처 시점마다 조금씩 다른 데서
옵니다(입자 수천 개의 위치가 1px씩 흔들림). 새 빌드와의 차이가 그 잡음보다 작으므로
코드 차이로 볼 수 없습니다.

### 홈

- 스크린샷 `.shots/naru/bg-crossing/`: 1440·390에서 스크롤 0 / 0.3 / 0.6 / 0.9.
  기슭 → 강가 → 건너편이 네 장에서 읽힙니다. `canvas-only-*`는 본문을 숨기고 캔버스만
  찍은 것.
- 정지 토글(`naru.motion = off`) 켠 상태 3초 간격 두 장: 픽셀 diff **0**.
- 콘솔 오류 0(프로덕션). 셰이더 컴파일 경고 0. 헤드리스 캡처의 "GPU stall due to
  ReadPixels"는 스크린샷 자체의 것이라 제외.
- 대비(브리프 6). 본문을 숨기고 캔버스만 찍어 평균 상대 휘도를 잰 값:

| 자리 | 홈 | 8월 히어로 H1 뒤 |
| --- | --- | --- |
| 1440 히어로 H1 뒤 | 0.0045 | 0.0101 |
| 1440 코어 판 뒤 | 0.0054 | |
| 390 히어로 H1 뒤 | 0.0037 | 0.0122 |
| 390 코어 판 뒤 | 0.0059 | |

전부 8월보다 낮습니다. `intensity`는 건드리지 않았습니다.

### fps

창이 있는 Chrome for Testing(ANGLE Metal, Apple M1 Pro)에서 rAF 델타로 10초씩.

| | 히어로 | 건너는 구간(스크롤 0.3) | 최악 프레임 |
| --- | --- | --- | --- |
| 홈 1440×900, DPR 2 | 120 fps | 113 fps | 192 ms(스크롤 점프 직후 한 번) |
| 8월 1440×900, DPR 2 | 120 fps | 120 fps | 9 ms |
| 홈 390×844, DPR 3, CPU 4배 느리게(폰 근사) | 120 fps | 120 fps | 9 ms |

목표(1440 60fps, 폰 45fps)를 넘습니다. 헤드리스 소프트웨어 GL(SwiftShader)에서는 두
페이지 모두 7fps로 같아서 상대 비교만 됩니다.

## 5. 하지 않은 것

- 8월 페이지의 배경 변경. `field` 경로의 셰이더 원문과 클래스 동작은 그대로이고,
  위 회귀 diff가 그것을 증명합니다.
- 주황 입자, 주황 면, 두 번째 등불. 화이트아웃, 카메라 급가속, 포인터에 입자가 튀는
  효과(`uPointerForce` 0). 히어로 영상.
- 9/15의 "지평선을 가라앉히는" 트릭. 등불과 띠는 끝까지 따라오고, 그룹 챕터에서
  잔잔해지는 것은 국면(arrived)이 합니다.
- 유체 시뮬레이션, 등고선 지형, 리본 항적(브리프 1에서 뺀 것).

## 6. TODO: confirm

- 실기기 fps. 위 값은 M1 Pro의 창 있는 Chrome과 그 위의 폰 에뮬레이션(DPR 3, CPU 4배)입니다. 실제 iPhone의 GPU는 다릅니다. iPhone 12급 실기기에서 45fps 아래로 떨어지면
  `pickQuality`의 폰 입자 수(900)부터 줄입니다.
