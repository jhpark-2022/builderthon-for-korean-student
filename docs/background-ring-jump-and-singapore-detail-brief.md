# 배경 브리프: 파문의 위상 점프, 그리고 싱가포르 윤곽의 해상도

대상 레포: `website` (커밋 `5a01214` 이후). 두 작업이 들어 있고 서로 독립입니다. 파일은 `lib/background/shaders/water.ts`, `lib/background/scene/BackgroundScene.ts`, `lib/background/config.ts`(1부), `scripts/build-shape-points.py`, `scripts/data/`, `lib/background/shapes/singapore.ts`, `lib/background/shapes/README.md`(2부)입니다. DOM, 카피, 라우트, 수파베이스는 건드리지 않습니다.

감사 대상: https://naru-crossing-seoul.vercel.app/ 모바일(390×844). 스크롤 40% 지점에서 정지 3프레임, 휠 스크롤 중 5프레임, 정지 후 10프레임을 찍고 셰이더 식을 실제 스크롤 궤적에 그대로 돌려 위상을 계산했습니다.

---

# 1부. 파문이 "너무 조금 스크롤해도 너무 많이" 나오는 이유

## 1.1 결론 한 줄

파문이 빨라지는 것이 아니라 **순간이동**합니다. 셰이더가 파문의 위상을 `uTime × (0.5 + uFlow × 1.6)`으로 계산하는데, `uFlow`(스크롤 속도)가 바뀌는 순간 **페이지를 연 뒤 지나간 시간 전체**에 그 변화가 곱해집니다. 페이지를 30초 본 뒤 손가락을 한 번 튕기면 파문이 1.2파장을 한 프레임에 건너뜁니다. 90초 뒤에는 3.7파장입니다. 오래 볼수록 심해집니다.

지난 브리프(`background-ring-speed-brief.md`)의 `K` 보정은 **정지 상태**의 속도를 맞췄고 실제로 맞았습니다(정지 시 19px/s). 이번 것은 **스크롤하는 순간**의 문제이고, 다른 원인입니다.

## 1.2 식

`lib/background/shaders/water.ts`:

```glsl
float phase = rr * 9.0 * K - uTime * (0.5 + uFlow * 1.6) - uScroll * 7.0;
```

`uTime`은 페이지를 연 뒤의 필드 시간(초)입니다. `uFlow`는 `BackgroundScene`이 스크롤 속도에서 만드는 0..1 값이고, 올라갈 때는 80ms 안에(`k = 12`), 내려올 때는 1.5초에 걸쳐(`k = 1.8`) 움직입니다.

문제는 곱셈의 자리입니다. 위상의 흐름 의존 부분이 `uTime × 1.6 × uFlow`라서, `uFlow`가 0에서 0.5로 가면 위상이 `uTime × 0.8`만큼 **한꺼번에** 움직입니다. `uTime = 30`이면 24rad, 3.8파장입니다. 속도를 올리려던 항이 위치를 옮기고 있습니다.

정지 상태(`uFlow = 0`)에서는 이 항이 0이라 지난번 측정(정지 고정 8프레임)에 잡히지 않았습니다.

## 1.3 실제 스크롤 궤적에 식을 돌린 결과

셰이더와 `BackgroundScene`의 흐름 계산(`perSec / 0.6`, 비대칭 감쇠 12/1.8)을 그대로 옮겨서, 실제 문서 높이(폰 11,119px, 데스크톱 9,458px)로 계산했습니다.

| 상황 | 페이지 연 뒤 | 위상 이동 | 파문 개수로 |
| --- | --- | --- | --- |
| 폰, 작은 튕김(1,500px/s, 300px) | 5초 | 1.9rad | 0.3개 |
| 폰, 작은 튕김 | **30초** | 7.8rad | **1.2개** |
| 폰, 작은 튕김 | 90초 | 23.0rad | 3.7개 |
| 폰, 큰 튕김(3,000px/s, 1,200px) | 30초 | 17.5rad | 2.8개 |
| 폰, 큰 튕김 | 90초 | 51.5rad | 8.2개 |

이동은 `uFlow`가 올라가는 80ms 안에 일어나고, 1.5초에 걸쳐 되돌아옵니다. 그래서 손가락을 뗀 뒤에도 파문이 안쪽으로 빠르게 되감기는 것처럼 보입니다. 사용자가 "조금만 스크롤해도 파문이 너무 많다"고 본 것이 정확히 이것입니다.

데스크톱에도 같은 식이 있지만, 마우스 휠은 `uFlow`가 0.1~0.3에서 그치고 트랙패드는 속도가 부드럽게 변해서 덜 보입니다. 폰의 관성 스크롤은 `uFlow`를 0.5~1.0까지 단숨에 올립니다.

## 1.3b 먼저 재현합니다 (고치기 전에)

위 표는 셰이더 식을 그대로 옮겨 계산한 것이고, 라이브 화면에서 프레임으로 잡은 것은 아닙니다. 이 브리프를 쓴 쪽의 캡처 환경(소프트웨어 GL)은 스크린샷 한 장에 2초가 넘게 걸려서 80ms 안에 일어나는 점프를 못 잡았습니다. **실행하는 쪽은 실제 GPU가 있으므로 고치기 전에 한 번 재현하고, 고친 뒤에 같은 방법으로 사라졌는지 확인합니다.** 두 결과를 같이 보고하세요.

방법 둘 중 하나, 가능하면 둘 다.

**(a) 숫자로.** 개발 빌드에서 `BackgroundScene`의 water 분기에 임시 로그를 둡니다(커밋하지 않습니다).

```ts
if (process.env.NODE_ENV !== "production") {
  const legacy = this.fieldTime * (RING.baseRate + this.flow * RING.flowGain); // 지금 셰이더의 식
  const d = legacy - (this._dbgPrev ?? legacy);
  this._dbgPrev = legacy;
  if (Math.abs(d) > 1.0) console.warn("[ring] phase jump", { d: d.toFixed(2), flow: this.flow.toFixed(2), t: this.fieldTime.toFixed(1) });
}
```

`next dev`를 띄우고 Chrome 기기 모드(iPhone 14, 390×844)로 열어 **60초 기다린 뒤** 300px 튕김을 다섯 번. 고치기 전에는 `d`가 6~8rad(한 파장 이상)인 경고가 튕김마다 찍혀야 합니다. 고친 뒤에는 `ringPhase`의 프레임 간 차이로 같은 로그를 찍고, `maxRate × dt`(60fps에서 0.027rad)를 넘는 프레임이 0건이어야 합니다.

**(b) 화면으로.** Playwright를 **실제 GPU로**(SwiftShader 플래그 없이, `headless: false` 또는 `--use-gl=egl`) 띄우고 CDP `Page.startScreencast`로 프레임을 받습니다. 스크린샷과 달리 렌더 프레임을 그대로 흘려 주므로 80ms 점프가 잡힙니다. 60초 대기 → `mouse.wheel(0, 300)` → 앞뒤 1초의 프레임을 저장하고, 튕김 직후 프레임에서 파문이 한 파장 넘게 옮겨 갔는지 봅니다. 고치기 전·후 각각 GIF 하나씩 `.shots/`에 둡니다.

(a)가 되면 (b)는 보조입니다. (a)에서 경고가 **안 찍히면** 이 브리프의 진단이 틀린 것이니 고치지 말고 멈춰서 보고하세요.

## 1.4 고치기

속도는 흐름을 따르되 **위상은 적분**합니다. 곱셈을 CPU의 누적으로 바꿉니다.

`lib/background/config.ts`, `SEOUL_WATERMARK` 옆에:

```ts
/**
 * 파문의 위상 (2026-09-19, 파문 위상 브리프). 셰이더가 uTime × (0.5 + uFlow × 1.6)으로
 * 계산하던 것을 BackgroundScene이 적분합니다. 곱셈이면 uFlow가 바뀔 때마다 지나간
 * 시간 전체가 곱해져 위상이 점프했습니다(30초 뒤 손가락 한 번에 1.2파장).
 *
 * baseRate·flowGain은 지금 셰이더의 0.5·1.6 그대로입니다. 정지 상태와 데스크톱의
 * 느낌은 바뀌지 않습니다. maxRate는 폰의 관성 스크롤(uFlow ≈ 1)에서만 걸립니다.
 * 1.6rad/s면 파문 하나에 3.9초. 데스크톱의 휠(uFlow ≤ 0.3, 0.98rad/s)에는 닿지 않습니다.
 */
export const RING = {
  baseRate: 0.5,
  flowGain: 1.6,
  maxRate: 1.6,
} as const;
```

`lib/background/scene/BackgroundScene.ts`, water 분기. `this.flow`를 갱신한 **뒤**에:

```ts
    // 파문 위상 적분(2026-09-19). 셰이더의 uTime × (0.5 + uFlow × 1.6)을 대신합니다.
    // motionScale이 0(모션 민감)이면 여기서도 멈춥니다. 셰이더의 uTime이 멈추던 것과
    // 같은 결과입니다.
    const ringRate = Math.min(RING.baseRate + this.flow * RING.flowGain, RING.maxRate);
    this.ringPhase += ringRate * dt * this.motionScale;
    this.water.setRingPhase(this.ringPhase);
```

필드에 `private ringPhase = 0;`을 더합니다. `WaterSurface`에 `setRingPhase(v)`(유니폼 `uRingPhase` 한 줄)를 더합니다.

`water.ts`:

```glsl
uniform float uRingPhase;  // BackgroundScene이 적분한 파문 위상(rad). uTime × uFlow의 곱을 대신합니다.
...
    // 2026-09-19 (파문 위상 브리프): uTime × (0.5 + uFlow × 1.6) → uRingPhase.
    // 곱셈이면 uFlow가 바뀔 때 지나간 시간 전체에 곱해져 위상이 점프합니다.
    // 적분값은 연속입니다. uScroll 항은 시간과 곱하지 않으므로 그대로 둡니다.
    float phase = rr * 9.0 * K - uRingPhase - uScroll * 7.0;
```

`uScroll * 7.0`은 그대로입니다. 이 항은 시간과 곱하지 않아 점프하지 않고, 문서 전체에 걸쳐 1.1파장이라 느립니다.

## 1.5 같은 무늬가 하나 더 있습니다 (P1, 이번에 하지 않음)

같은 파일 `shimmer`에 `t * (2.2 + uFlow * 3.0)`이 있습니다(반사 기둥의 일렁임). 같은 곱셈이라 스크롤할 때 기둥이 순간 깜빡입니다. 노이즈 입력이라 파문만큼 눈에 띄지 않습니다. 1.4가 배포되고 실제 폰에서 기둥이 깜빡이는 것이 보이면 같은 방식(`uShimmerTime` 적분)으로 고칩니다. **이번 커밋에는 넣지 마세요.**

## 1.6 절대 하지 말 것

- `0.5`, `1.6`, `9.0`, `7.0`, `2.4`, `K`의 값을 바꾸지 마세요. 바뀌는 것은 곱셈이 적분이 되는 것뿐입니다. `maxRate`는 새 값이고 데스크톱에는 닿지 않습니다.
- `uFlow`의 계산(`perSec / 0.6`, 12/1.8)을 바꾸지 마세요. 물살(`cur`, `stretch`)이 같은 값을 씁니다.
- `uTime`을 지우지 마세요. 물비늘·구름·물살이 씁니다.
- `crossing`·`field` 변형은 이 셰이더를 쓰지 않습니다. 건드리지 마세요.

## 1.7 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 정지 상태 파문 속도 | 지난 브리프 방법(스크롤 55% 고정, 0.7초 × 8장). 폰 가로 대비 초당 6% 이하, 데스크톱 4.6% 그대로 |
| 2 | 위상 연속성(1.3b의 (a) 고친 뒤) | `BackgroundScene`에 개발 빌드 전용 로그: 프레임 간 `ringPhase` 변화가 `maxRate × dt`를 넘는 프레임이 **0건**. 폰 프로파일에서 1,200px 튕김 5회 |
| 3 | 폰 튕김(1.3b의 (a)·(b) 고치기 전·후 비교) | 페이지를 열고 60초 기다린 뒤 300px 튕김. 파문이 한 프레임에 한 파장 넘게 움직이지 않음(개발 빌드 로그로 확인, 캡처는 보조) |
| 4 | 데스크톱 휠 | 100px × 12회. 적용 전보다 조용해지는 것은 되지만(원래 같은 버그가 있었습니다) 정지 상태는 픽셀 차이 없음 |
| 5 | 모션 민감 | `prefers-reduced-motion: reduce`에서 파문이 정지 |
| 6 | 스크롤 반응 | 스크롤하면 파문이 빨라지긴 함(`maxRate`까지). 아예 안 빨라지면 `flow`를 안 넘긴 것 |

---

# 2부. 싱가포르 윤곽을 서울만큼 자세하게

## 2.1 지금

`lib/background/shapes/singapore.ts`는 로고 심볼(`public/naru/naru-symbol.svg`)의 섬 패스에서 굽습니다. **꼭짓점 21개**입니다. 서울은 통계청 경계 7,700 꼭짓점을 Douglas-Peucker로 **64개**까지 줄인 것입니다. 점 2,000개를 뿌려도 21각형은 21각형입니다. 창이, 투아스, 북쪽의 긴 해안이 없습니다.

## 2.2 원자료

로고 SVG 대신 실제 해안선을 씁니다. 우선순위대로:

1. **data.gov.sg** 의 국토 경계. `National Map Polygon`(SLA) 또는 `Master Plan 2019 Region Boundary (No Sea)`(URA, 다섯 권역을 하나로 합침). Singapore Open Data Licence. 출처 표기 필요.
2. 1을 받을 수 없으면 **geoBoundaries** ADM0 `SGP`(CC BY 4.0). 해상도가 1보다 낮지만 21각형과는 비교가 안 됩니다.

받은 파일에서 **본섬 폴리곤 하나**만 씁니다(MultiPolygon이면 면적이 가장 큰 고리). 센토사, 주롱섬, 우빈, 테콩은 넣지 않습니다. 서울이 폴리곤 하나인 것과 같고, 부속 섬이 있으면 점이 흩어져 윤곽이 읽히지 않습니다. 매립지(투아스·창이)는 원자료대로 둡니다. 결과를 `scripts/data/singapore-<출처>-<연도>.geojson`에 둡니다. 원자료 전체가 아니라 본섬 고리 하나입니다.

## 2.3 굽기

`scripts/build-shape-points.py`:

- `singapore_ring()`을 `seoul_ring()`과 같은 방식으로 바꿉니다. GeoJSON을 읽고, MultiPolygon이면 면적 최대 고리, 경도에 `cos(위도)`를 곱해 동서 축척 보정. 북쪽이 `+y`. `SVG` 상수와 정규식 파싱은 지웁니다(로고 SVG는 더 이상 굽기 입력이 아닙니다).
- Douglas-Peucker 목표 꼭짓점: **서울보다 많이 둡니다.** 싱가포르 해안은 만이 많아 64로는 창이와 투아스가 뭉개집니다. `DP_TARGET`을 형상별로 받게 하고 싱가포르는 **80~96** 사이로. 결과 `singapore-preview.png`에서 서쪽 끝(투아스), 동쪽 끝(창이), 북쪽의 긴 직선 해안, 남쪽의 항만 굴곡이 읽혀야 합니다.
- 나머지(래스터 512, 가장자리 6% 밀도 3배, 푸아송 디스크, 2,000점, 가장자리 75%·속 25% 접두사 유지, `phase`)는 그대로입니다. **이 규칙이 그대로여야 1부와 무관하게 서울→싱가포르 건너기의 짝짓기(`phase` 정렬)가 그대로 작동합니다.**
- `SINGAPORE_ASPECT`가 바뀝니다(로고 0.455 → 실제 0.5 언저리). `config.ts`의 `singaporeW`(0.66 / 세로 0.80)는 그대로 두고 프리뷰로 판단합니다.

## 2.4 README와 출처

`lib/background/shapes/README.md`의 싱가포르 행을 새 출처로 바꾸고, 라이선스 절에 Singapore Open Data Licence(또는 CC BY 4.0) 표기와 출처 문구를 적습니다. "로고 심볼은 나루의 것"이라는 줄은 로고가 더 이상 입력이 아니므로 지웁니다. `crossing` 변형의 왼쪽 기슭 설명("로고 심볼과 같은 단순화 정도")도 고칩니다.

## 2.5 절대 하지 말 것

- `public/naru/naru-symbol.svg`를 바꾸지 마세요. 로고는 로고입니다. 바뀌는 것은 배경의 점뿐입니다.
- `seoul.ts`를 다시 굽지 마세요. 스크립트를 고치면서 서울 출력이 바뀌면 안 됩니다(2.6 검증 1).
- 부속 섬을 넣지 마세요.
- 꼭짓점을 96 넘게 두지 마세요. 그 위로는 점 2,000개로 표현이 안 되고 가장자리가 톱니로 보입니다.
- 출처를 적지 않은 채 커밋하지 마세요.

## 2.6 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 서울 불변 | `seoul.ts`가 바이트 단위로 같음(`git diff --stat`에 없음) |
| 2 | 프리뷰 | `singapore-preview.png`에서 투아스·창이·북쪽 직선 해안·남쪽 항만이 읽힘. 부속 섬 없음 |
| 3 | 꼭짓점 | 스크립트 로그에 DP 결과 80~96 |
| 4 | 점 구성 | 2,000점, 앞 500·1,100·1,400점 접두사 각각에서 가장자리 비율 70~80% |
| 5 | 화면 | `#naru + 1.0vh`에서 도착한 형상이 싱가포르로 읽힘(1440×900, 390×844) |
| 6 | 건너기 | 서울→싱가포르 짝짓기 로그(64 또는 32 후보)의 최소값이 최대값의 절반 이하. 새 데이터로도 정렬이 먹는지 확인 |
| 7 | 출처 | README에 라이선스와 출처 문구 |

---

# 3. 커밋

1부와 2부는 독립입니다. 1부를 먼저 합니다(사용자가 지금 보고 있는 문제).

1. `fix(bg): 파문 위상을 적분한다` (1.4)
2. `docs(changelog): 2026-09-19 background-ring-phase`
3. `data(bg): 싱가포르 본섬을 실제 해안선에서 굽는다` (2.2, 2.3)
4. `docs(shapes): 싱가포르 출처와 라이선스` (2.4)
5. `docs(changelog): 2026-09-19 background-singapore-detail`

각 커밋에서 `npm run build`가 지나고 해당 검증을 통과해야 다음으로 갑니다. `main` 푸시는 1부와 2부 각각 검증 뒤에 따로 해도 됩니다.
