# 배경 브리프: 스크롤하면 서울이 싱가포르로 바뀝니다

대상 레포: `website` (커밋 `a1c16a4` 이후). 바꾸는 파일은 `lib/background/` 안 넷입니다. `particles/ParticleField.ts`, `shaders/particles.vert.ts`, `scene/BackgroundScene.ts`, `config.ts`. DOM, 카피, `data/naru.ts`, 라우트, 수파베이스는 건드리지 않습니다.

## 0. 무엇을 만드나

지금 홈 배경은 히어로가 지나면 서울 경계가 점으로 떠오르고, `#naru`부터 어두워집니다. 이걸 바꿉니다. **`#naru`에 닿으면 서울의 점들이 하나씩 흘러가 싱가포르 본섬의 윤곽으로 다시 섭니다.** 이벤트(크로싱 서울)를 읽는 동안은 서울이고, 그룹(나루)을 읽는 동안은 싱가포르입니다. 그룹이 태어난 곳이 싱가포르라서, 자리가 뜻과 맞습니다. 스크롤을 올리면 되돌아옵니다.

## 1. 왜 거의 다 되어 있는가

세 가지가 이미 레포에 있습니다. 새로 만드는 것은 짝짓기와 보간뿐입니다.

1. **두 형상이 굽혀 있습니다.** `lib/background/shapes/seoul.ts`와 `singapore.ts`. 둘 다 `[x, y, edge, phase] × 2,000`, 너비를 `[-1, 1]`에 맞춘 좌표, 가장자리 75%·속 25%가 어느 접두사에서도 유지되게 섞여 있습니다.
2. **`phase`가 짝짓기 열쇠입니다.** 가장자리 점의 `phase`는 윤곽을 따라 간 호 길이 비율(0..1), 속 점은 중심 기준 각도 비율입니다. 두 형상의 가장자리 점을 각각 `phase`로 정렬해 같은 순번끼리 짝지으면, 점이 제멋대로 날아다니지 않고 **윤곽이 고무줄처럼 늘어나 다른 윤곽이 됩니다.** 굽는 스크립트가 이걸 위해 넣어 둔 값이나 다름없습니다.
3. **셰이더에 형상 자리가 둘 있습니다.** `uShapeL`(원래 싱가포르 기슭)과 `uShapeR`(서울 기슭). water 변형은 지금 둘 다에 서울 자리를 넣고 있습니다(`placeSeoul`의 `setShapes(sym, sym)`). L에 싱가포르 자리를 넣으면 목적지의 자리가 생깁니다.

## 2. 설계

### 2.1 짝짓기 (`ParticleField` 생성자, `only === "seoul"`일 때)

`N = quality.particles` 기준으로 두 형상에서 각각 앞 `N`개를 가져옵니다(지금 서울만 가져오는 것과 같은 방식).

1. 서울 `N`개를 가장자리(`edge = 1`)와 속으로 나누고, 각각 `phase` 오름차순으로 정렬합니다. 싱가포르도 같게.
2. 서울 가장자리 `i`번째와 싱가포르 가장자리 `j = floor(i × mB / mA)`번째를 짝짓습니다(`mA`, `mB`는 각 목록 길이. 75:25 비율이 같아 거의 1:1입니다). 속도 같게.
3. **회전 오프셋과 방향을 찾습니다.** 두 윤곽의 `phase = 0`이 같은 방위가 아니고(서울은 한 지점에서, 싱가포르는 다른 지점에서 호 길이를 재기 시작), 돌아가는 방향도 다를 수 있습니다. 가장자리 목록에 대해 오프셋 32가지 × 방향 2가지 = 64개 후보로 짝을 지어 보고, **정규화 좌표에서 이동 거리 제곱의 합이 가장 작은 후보**를 씁니다. `N = 1,400`이면 9만 번의 뺄셈이라 초기화 시 한 번은 아무것도 아닙니다. 속 점도 같은 방식(각도 기준이라 같은 문제가 있습니다).
4. 결과를 `aSeed2`(vec3, z = 0) 속성으로 넣습니다. `aSeed`는 서울 그대로, `aEdge`와 `aPhase`도 서울 것 그대로(짝이 가장자리↔가장자리라 `aEdge`는 같습니다. `aPhase`는 밝기 파도에만 쓰이므로 서울 것으로 두어도 됩니다).

이 짝짓기는 `only === "seoul"`일 때만 합니다. `crossing` 변형(두 기슭)과 `field` 변형(8월)은 한 줄도 바뀌면 안 됩니다. 그쪽에서는 `aSeed2 = aSeed`로 채워 셰이더가 항등이 되게 합니다.

### 2.2 셰이더 (`particles.vert.ts`, `crossingMain`)

```glsl
uniform float uMorph;     // 0 = 서울, 1 = 싱가포르. BackgroundScene이 스크롤로 넣습니다.
attribute vec3 aSeed2;    // 짝지어진 싱가포르 점. 형상이 하나뿐인 변형에서는 aSeed와 같음.
```

`origin`을 계산하는 자리를 이렇게 바꿉니다.

```glsl
  // ── 서울 → 싱가포르 (2026-09-19, 서울→싱가포르 브리프) ──────────────────
  // 점마다 출발 시점을 흩뜨립니다(lead). 전부 같은 순간에 움직이면 도형이 통째로
  // 늘어나는 트윈으로 보이고, 흩뜨리면 흘러가서 다시 서는 것으로 보입니다.
  // 가장자리 점을 조금 늦게 보냅니다. 윤곽이 마지막까지 남아야 서울로 읽힙니다
  // (gather의 lag와 같은 이유).
  float mlead = mix(hash1(aOffset * 3.1) * 0.35, 0.25 + hash1(aOffset * 3.1) * 0.30, aEdge);
  float m = clamp((uMorph - mlead) / (1.0 - mlead), 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  // 출발 자리는 서울(uShapeR), 도착 자리는 싱가포르(uShapeL). 자리(중심·반너비)도
  // 같이 보간되므로 두 형상의 폭이 달라도 됩니다.
  vec3 fromShape = uShapeR;
  vec3 toShape   = uShapeL;
  vec3 originA = vec3(fromShape.x + aSeed.x  * fromShape.z, fromShape.y + aSeed.y  * fromShape.z, 0.0);
  vec3 originB = vec3(toShape.x   + aSeed2.x * toShape.z,   toShape.y   + aSeed2.y * toShape.z,   0.0);
  vec3 origin  = mix(originA, originB, m);
  // 살짝 들어 올립니다. 직선으로 가면 기계적입니다. 반너비의 6%, 중간에서 최대.
  origin.y += sin(m * 3.14159265) * 0.06 * fromShape.z;
```

기존의 `vec3 shape = aBank < 0.0 ? uShapeL : uShapeR;` 분기는 **`uMorph`를 쓰지 않는 변형을 위해 그대로 남겨야 합니다.** 가장 간단한 방법은 `uMorphOn`(0/1) 유니폼 하나를 두고, 0이면 기존 경로, 1이면 위 경로로 가는 것입니다. water 변형의 `ParticleField`만 `uMorphOn = 1`입니다. `crossing`과 `field`는 0이라 셰이더 출력이 바이트 단위로 같아야 합니다.

`m`이 0일 때 `origin == originA`이고 `originA`는 지금 코드의 `origin`과 같습니다(uShapeR = 서울). 그래서 스크롤이 `#naru` 앞에 있는 동안은 화면이 지금과 같습니다.

### 2.3 스크롤 드라이버 (`BackgroundScene.ts`, water 분기)

지금 `calm`이 `naruTop - 0.5vh`에서 1vh에 걸쳐 0→1로 가고, 형상을 `calmBright`(0.6)로 어둡게 합니다. 여기에 `morph`를 넣고 `calm`을 뒤로 미룹니다.

```ts
      // 서울 → 싱가포르 (2026-09-19). #naru 반 화면 앞에서 시작해 1.5화면에 걸쳐 건넙니다.
      // calm(어두워짐)은 건너기가 끝난 뒤에 시작합니다. 싱가포르가 한 번은 온전한
      // 밝기로 서야 합니다. 어두워지면서 도착하면 물러나는 것으로 읽힙니다.
      const M = SEOUL_WATERMARK.morph;
      const morphStart = this.naruTop - M.startVh * vh;
      const morph = ss(clamp((this.scrollY - morphStart) / (M.spanVh * vh), 0, 1));
      const c = clamp((this.scrollY - (morphStart + M.spanVh * vh)) / vh, 0, 1);
      const calm = ss(c);
      this.particles?.setMorph(morph);
```

`placeSeoul`은 이제 자리 둘을 계산합니다. 같은 중심(`cx`, `cy`), 반너비만 다르게.

```ts
    const hwSeoul = (portrait ? W.portrait.naruW : W.landscapeW) * halfW;
    const hwSg    = (portrait ? W.portrait.singaporeW : W.singaporeW) * halfW;
    const cyv = (1 - cy * 2) * halfH;
    this.particles.setShapes(
      { x: (W.cx * 2 - 1) * halfW, y: cyv, hw: hwSg },     // L = 싱가포르(도착)
      { x: (W.cx * 2 - 1) * halfW, y: cyv, hw: hwSeoul },  // R = 서울(출발)
    );
```

세로 화면에서 `placeSeoul`에 `widthFrac`을 넘기던 호출은 그대로 두되, 그 값은 서울 쪽(`hwSeoul`)에만 적용합니다. 패리티 브리프 이후 `heroW == naruW`라 실질적으로 상수입니다.

### 2.4 설정 (`config.ts`, `SEOUL_WATERMARK`)

```ts
  // 싱가포르 본섬의 폭. 서울(0.58)보다 조금 넓게 둡니다. 싱가포르는 납작해서
  // (높이/너비 0.455, 서울 0.820) 같은 폭이면 훨씬 작아 보입니다.
  singaporeW: 0.66,
  // 서울 → 싱가포르. startVh: #naru 위쪽 몇 화면 앞에서 시작하는가. spanVh: 몇 화면에
  // 걸쳐 건너는가. 1.5화면이면 폰에서 스크롤 두어 번, 데스크톱에서 휠 몇 번입니다.
  // 더 짧으면 순간이동으로, 더 길면 무슨 일이 일어나는지 모르게 됩니다.
  morph: { startVh: 0.5, spanVh: 1.5 },
```

`portrait`에 `singaporeW: 0.80`을 더합니다.

`ParticleField`에 `setMorph(v: number)`를 더합니다(`uMorph` 한 줄).

## 3. 절대 하지 말 것

- **`crossing`과 `field` 변형의 출력이 바뀌면 안 됩니다.** `/2026-08` 아카이브가 `field`를 씁니다. `uMorphOn = 0`일 때 셰이더는 지금과 바이트 단위로 같아야 합니다.
- `aSeed`, `aEdge`, `aPhase`의 값을 바꾸지 마세요. 서울 형상이 지금과 한 점도 다르면 안 됩니다. 더하는 것은 `aSeed2`뿐입니다.
- 짝짓기를 인덱스 순서 그대로 하지 마세요(`i`번째 ↔ `i`번째). 굽은 순서는 무작위로 섞여 있어서, 그렇게 하면 점 전부가 화면을 가로질러 뒤엉킵니다. 2.1의 정렬과 오프셋 탐색이 이 브리프의 핵심입니다.
- 짝짓기를 매 프레임 하지 마세요. 생성자에서 한 번입니다.
- 형상 크기·밝기·점 개수(패리티 브리프 값)를 바꾸지 마세요. 새 값은 `singapore·W`와 `morph` 둘뿐입니다.
- 시간 기반 움직임을 더하지 마세요. 건너기는 스크롤로만 움직입니다. 그래야 모션 민감 설정과의 관계가 지금과 같습니다(손가락이 만든 움직임, WCAG 2.2.2 대상 아님).
- 라벨("SEOUL", "SINGAPORE")을 넣지 마세요. 사용자가 요청하지 않았습니다. 필요하면 별도 브리프입니다.

## 4. 검증

| # | 항목 | 기준 |
| --- | --- | --- |
| 1 | `#naru` 앞 | 스크롤이 `naruTop - 0.5vh`보다 위일 때 화면이 적용 전과 **픽셀 차이 없음** (1440×900, 390×844 각 3지점) |
| 2 | 건너기 | `naruTop - 0.5vh`부터 `naruTop + 1.0vh`까지 6단계 캡처. 점이 화면을 가로질러 뒤엉키지 않고, 윤곽이 늘어나며 옮겨감 |
| 3 | 도착 | `naruTop + 1.0vh`에서 싱가포르 본섬으로 읽힘. `singapore-preview.png`와 비교 |
| 4 | 도착 밝기 | 도착 직후 형상 밝기가 `calm` 전 서울과 같음(1.0). 어두워지는 것은 그 뒤 1vh |
| 5 | 되돌아오기 | 위로 스크롤하면 같은 경로로 서울로 복귀 |
| 6 | 짝짓기 품질 | 콘솔에 초기화 시 한 번, 선택된 오프셋·방향과 이동 거리 제곱합을 출력(개발 빌드에서만). 64개 후보 중 최소값이 최대값의 절반 이하여야 정렬이 효과를 낸 것 |
| 7 | 아카이브 | `/2026-08`의 배경이 적용 전과 픽셀 차이 없음 |
| 8 | 본문 대비 | `#naru`·`#join` 본문 흰 글자가 4.5:1 이상. 싱가포르는 납작해서 본문 한가운데를 가로지릅니다. 넘으면 `singaporeW`를 줄이지 말고 `calm` 시작을 앞당기세요 |
| 9 | 초기화 비용 | 짝짓기 탐색이 데스크톱 5ms, 폰 15ms 이하. 넘으면 후보를 32×2에서 16×2로 |
| 10 | 모션 민감 | `prefers-reduced-motion: reduce`에서 스크롤에 따른 건너기는 그대로, 그 외 변화 없음 |

## 5. 커밋

1. `feat(bg): 서울 점을 싱가포르 점과 phase로 짝짓는다` (2.1, 짝짓기만. 화면 변화 없음)
2. `feat(bg): 셰이더에 uMorph를 두고 두 자리를 보간한다` (2.2, 2.4의 `setMorph`. 아직 드라이버가 0을 넣어 화면 변화 없음)
3. `feat(bg): #naru에서 서울이 싱가포르로 건넌다` (2.3, 2.4)
4. `docs(changelog): 2026-09-19 background-seoul-to-singapore`

1과 2 뒤에는 검증 1·7이 통과해야 합니다(아직 아무것도 안 보여야 정상). 3 뒤에 나머지 전부. `main` 푸시는 그다음입니다.
