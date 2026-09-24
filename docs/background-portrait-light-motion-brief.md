# 배경 브리프: 폰에서 싱가포르의 빛이 보이게 움직입니다

대상 레포: `website` (커밋 `3c3fb2b` 기준). 바꾸는 파일은 `lib/background/config.ts`, `lib/background/scene/BackgroundScene.ts`, `lib/background/shaders/water.ts`, `lib/background/water/WaterSurface.ts`입니다. **가로 화면(데스크톱)의 움직임은 한 픽셀도 바뀌지 않습니다.** 파문(ring)도 그대로입니다.

## 0. 결론 한 줄

폰에서 빛이 움직이는 **폭을 키우고(0.15 → 0.26), 한 바퀴를 문서 끝까지가 아니라 2.6화면마다** 돌게 합니다. 폰에서 스크롤 한 화면당 빛이 움직이는 거리가 약 3.5배가 됩니다.

## 1. 실측 (배포본, 390×844)

싱가포르 도착(`#naru` + 1vh, y 7,826)부터 문서 끝(y 12,190)까지, 반 화면씩 내리며 나루 점의 가로 위치를 쟀습니다(주황 코어의 휘도 가중 중심).

| 항목 | 값 |
| --- | --- |
| 한 바퀴에 필요한 스크롤 | 4,364px = **5.2화면** (데스크톱 약 3.8화면) |
| 점이 오가는 폭 | 화면의 54% → 70% → 44% → 57%. 한쪽 약 60px |
| 읽는 속도로 내릴 때 점의 속도 | 중앙값 **약 3px/s**, 최고 약 5px/s |

화면 폭 대비 비율로만 보면 폰과 데스크톱이 비슷합니다(한 화면 스크롤에 폭의 약 12%). 그런데 폰의 60px은 손가락 한 마디(약 1cm)이고 데스크톱의 173px은 약 4cm입니다. **폰에서는 1cm를 5화면에 걸쳐 가니 멈춰 있는 것으로 보입니다.** 지난 수정(폭 절반, 속도 상한)은 데스크톱의 "너무 빠름"을 잡았고, 같은 값이 폰에서는 "너무 안 움직임"이 됐습니다. 두 화면이 한 값을 공유한 것이 원인입니다.

## 2. 고치는 방법

### 2.1 점의 가로 이동을 CPU에서 계산 (`water.ts`, `WaterSurface.ts`)

지금 셰이더가 `mx = lx + uSweep * sin(2π * smoothstep(uStage4))`로 계산합니다. 이 식을 `BackgroundScene`으로 옮기고 셰이더는 결과 하나만 받습니다.

```glsl
uniform float uLightDx;   // 구간 4에서 점의 가로 이동(uv). BackgroundScene이 계산합니다.
...
float mx = lx + uLightDx;
```

`uStage4`와 `uSweep`는 다른 곳에서 안 쓰면 지웁니다(쓰는 곳이 있으면 그대로 두고 보고). `WaterSurface`에 `setLightDx(v)` 하나.

### 2.2 가로 화면은 지금 식 그대로 (`BackgroundScene.ts`)

```ts
// 가로: 지금과 같은 값. 문서 끝까지 한 바퀴, smoothstep, 상한 LIGHT_MAX_RATE.
dxScreen = LIGHT_SWEEP.landscape * Math.sin(2 * Math.PI * ss(this.s4Eased));
```

`s4`, `s4Eased`, 감쇠 0.35, 상한 `LIGHT_MAX_RATE`는 지금 코드 그대로입니다. 결과를 지금처럼 `uvSpan`으로 나눠 uv로 바꿉니다. **이 분기의 출력이 지금 셰이더의 `mx`와 소수점까지 같아야 합니다**(검증 1).

### 2.3 세로 화면은 화면 높이 기준 바퀴 (`config.ts`, `BackgroundScene.ts`)

```ts
// DECIDED 2026-09-24 (사용자: "mobile view에서는 빛이 너무 안 움직임"). 실측: 폰에서 한 바퀴가
// 5.2화면, 폭 60px이라 읽는 속도에서 점이 초당 약 3px 움직였습니다. 가로 화면과 값을 나눕니다.
export const LIGHT_PORTRAIT = {
  sweep: 0.26,    // 한쪽 폭(화면 폭 대비). 390px에서 약 100px. 싱가포르 세로 반폭 0.40 안쪽.
  lapVh: 2.6,     // 한 바퀴에 필요한 스크롤(화면 높이 배). 문서 끝이 아니라 고정 길이라 폰에서 약 2바퀴.
  maxRate: 0.07,  // 초당 바퀴 수 상한. 점의 최고 속도가 약 45px/s(배포 전 플릭 155px/s보다 훨씬 느림).
} as const;
```

```ts
// 세로: 바퀴 수(lap)로 셉니다. 1에서 자르지 않고, 문서 끝에서 자연히 멈춥니다.
const lap = Math.max(0, (this.scrollY - morphEnd) / (LIGHT_PORTRAIT.lapVh * vh));
const wantP = (lap - this.lapEased) * Math.min(1, dt * 0.35);
const capP = LIGHT_PORTRAIT.maxRate * dt;
this.lapEased = this.reduced ? lap : this.lapEased + Math.max(-capP, Math.min(capP, wantP));
// 도착 직후 튀지 않게 첫 1/4바퀴 동안 폭을 0에서 키웁니다(가로의 smoothstep과 같은 역할).
const ramp = ss(clamp(this.lapEased / 0.25, 0, 1));
dxScreen = LIGHT_PORTRAIT.sweep * ramp * Math.sin(2 * Math.PI * this.lapEased);
```

`lapEased`는 새 필드(초깃값 0). 가로와 세로가 바뀌면(폰 회전) 두 값 모두 목표로 바로 맞춥니다(한 프레임 튐은 허용, 회전 중이라 보이지 않음).

## 3. 건드리지 말 것

- **가로 화면의 결과.** 데스크톱은 사용자가 방금 맞춘 속도입니다.
- 파문 전부(`ringGain`, `reach`, `phase`, `RING`, `smoothstep(0.86, 1.0, …)`). 점이 움직이면 파문 중심도 따라가는 것은 지금과 같습니다.
- 점의 밝기, 크기, 세로 위치(`my`), `lx`, 구간 1~3과 5, 형상.
- em dash 금지. 결정은 `DECIDED 2026-09-24` 한국어 주석으로.

## 4. 검증

SwiftShader는 프레임이 느려 스크린숏으로 재면 시간이 늘어납니다. 개발 빌드에서만 `window.__naruBg = { lightDx, s4Eased, lapEased }`를 매 프레임 갱신해 값을 읽고, 화면 캡처는 모양 확인에만 쓰세요.

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | 데스크톱 불변 | 1440×900에서 구간 4의 여러 `s4Eased`에 대해 새 `mx`와 옛 셰이더 식의 차이 1e-5 이하. 적용 전후 캡처 픽셀 차이 평균 1/255 이하 |
| 2 | 폰 읽기 속도 | 390×844, 싱가포르 도착 뒤 1.5초마다 반 화면씩 끝까지. 점의 속도 중앙값 **12px/s 이상**(지금 약 3) |
| 3 | 폰 플릭 | 도착 지점에서 바닥까지 한 번에. 점의 최고 속도 **50px/s 이하** |
| 4 | 폰 폭 | 점의 x가 화면 폭의 약 **24% ~ 76%** 안에서 움직이고 싱가포르 윤곽 밖으로 나가지 않음 |
| 5 | 도착 | 건너기가 끝나는 순간 점이 튀지 않음(도착 전후 0.5초 x 변화 3px 이하) |
| 6 | 파문 | 같은 점 위치에서 적용 전후 파문 모양 동일 |
| 7 | 모션 민감 | `prefers-reduced-motion: reduce`(켜기 버튼 안 누른 상태)에서 점이 스크롤 자리에 바로 섬 |
| 8 | 아카이브 | `/2026-08` 배경 픽셀 차이 없음 |

## 5. 사용자가 정할 것

폭 0.26, 한 바퀴 2.6화면, 상한 0.07로 적었습니다. 아직 적게 움직이면 `lapVh`를 2.0으로(폰에서 약 2.6바퀴), 너무 크면 `sweep`를 0.20으로. 둘 다 `config.ts` 값 하나입니다.

## 6. 커밋

1. `refactor(bg): 점의 가로 이동을 CPU에서 계산한다` (2.1, 2.2. 화면 변화 없음, 검증 1)
2. `fix(bg): 폰에서 싱가포르의 빛이 보이게 움직인다` (2.3, 검증 2~8)
3. `docs(changelog): 2026-09-24 background-portrait-light-motion`

`npm run build` 통과 후 `main` 푸시, 배포본에서 검증 2와 3을 다시 확인.
