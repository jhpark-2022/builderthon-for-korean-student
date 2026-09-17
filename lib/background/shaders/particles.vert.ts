import { NOISE_GLSL } from "./noise.glsl";

/**
 * Particle vertex shader — the gravitational-portal narrative.
 *
 * Each particle owns an immutable seed and per-particle attributes. Motion is
 * fully GPU-side:
 *   1. curl-noise drift (the stable "universe of opportunities")
 *   2. pointer magnetism (interactive)
 *   3. vortex attractor toward the portal — inward + tangential swirl, ramping
 *      with reveal/pull/portal so trajectories curve, then spiral, then race in
 *   4. velocity-aligned stretching → long-exposure trails during the pull
 *   5. parallax: nearer particles react faster than far ones
 *
 * varyings hand the fragment shader depth, glow, pointer, speed (for trails),
 * and proximity to the portal (for brightening / dissolve).
 */
export const PARTICLES_VERT = /* glsl */ `
uniform float uTime;
uniform float uSpaceScale;
uniform float uFlowSpeed;
uniform float uCurl;
uniform vec3  uBounds;
uniform vec3  uPointer;
uniform float uPointerRadius;
uniform float uPointerForce;
uniform float uPixelRatio;
uniform float uScroll;
uniform float uReveal;    // gravity presence
uniform float uPull;      // inward acceleration
uniform float uPortal;    // vortex organisation
uniform float uWhiteout;  // crossing
uniform vec3  uHole;      // portal centre

// ── crossing 변형 (2026-09-17) ───────────────────────────────────────────────
// uMode가 1이면 main()이 crossingMain()으로 빠집니다. 0(8월 필드)이면 아래 원문이
// 한 글자도 바뀌지 않은 채 그대로 돕니다. 파일을 복제하지 않고 분기한 이유는
// 두 페이지가 같은 파일을 읽어야 노이즈·크기·안개 규칙이 갈라지지 않기 때문입니다.
uniform float uMode;      // 0 = field (8월), 1 = crossing (나루 홈)
uniform vec3  uLantern;   // 등불의 월드 좌표
uniform float uGather;    // 기슭 → 강가 0..1
uniform float uCrossing;  // 강을 건너는 국면 0..1
uniform float uArrived;   // 건너편에 닿은 뒤 0..1
// ── 기슭 형상 (2026-09-17, 배경 수정 브리프) ────────────────────────────────
// crossing에서 aSeed는 월드 좌표가 아니라 형상의 정규화 좌표(x, y ∈ [-1,1], z = 0)
// 입니다. 아래 uniform이 그것을 월드로 놓습니다. xy = 중심, z = 반너비(월드).
// 정면입니다(기울기 없음). 가장자리 점은 두껍고 밝고, 속 점은 작고 어둡습니다.
// 가장자리를 따라 밝기의 파도가 돕니다(uWave: 주기 초, 진폭).
uniform vec3  uShapeL;    // 왼쪽 기슭(싱가포르)
uniform vec3  uShapeR;    // 오른쪽 기슭(서울)
uniform float uEdgePx;
uniform float uInnerPx;
uniform float uEdgeBright;
uniform float uInnerBright;
uniform vec2  uWave;
uniform float uBreath;    // 숨 진폭 배수

attribute vec3  aSeed;
attribute float aScale;
attribute float aSpeed;
attribute float aOffset;
attribute float aBank;    // crossing: -1 왼쪽 기슭 / +1 오른쪽. field에서는 0.
attribute float aEdge;    // crossing: 1 = 형상의 가장자리 점(마지막에 떠남), 0 = 속. field에서는 0.
attribute float aPhase;   // crossing: 윤곽을 따라 간 위상 0..1. field에서는 0.

varying float vBright;    // crossing: 점의 밝기(가장자리 1.0 × 파도, 속 0.35)
varying float vEdge;      // crossing: 가장자리 1 / 속 0
varying float vDepth;
varying float vGlow;
varying float vPointer;
varying float vSpeed;     // motion magnitude → trail brightness
varying float vNear;      // proximity to portal 0..1
varying float vRand;      // stable per-particle random (for thinning)

${NOISE_GLSL}

float wrap(float v, float h){ float s = h * 2.0; return mod(v + h, s) - h; }

float hash1(float n){ return fract(sin(n) * 43758.5453); }

// ── 건너는 점들 ──────────────────────────────────────────────────────────────
// 입자 하나의 여정: 기슭(banks) → 강가(gather) → 강을 건넘(crossing) → 등불 둘레의
// 성좌(arrived). 각 입자는 자기 지연(lead)을 가져서 먼저 건너는 점과 늦게 건너는
// 점이 화면에 같이 보입니다. 속도 편차는 aSpeed(0.6~1.4)가 만듭니다.
// 포인터 자력은 쓰지 않습니다(브리프 5: 8월도 3° 패럴랙스뿐).
void crossingMain(){
  float lead = hash1(aOffset * 1.7 + aSpeed);
  float prog = clamp((uCrossing - lead * 0.55) / 0.45, 0.0, 1.0);
  prog = prog * prog * (3.0 - 2.0 * prog);

  // ── 기슭: 형상 (2026-09-17, 수정 브리프: 정면) ──────────────────────────
  vec3 shape = aBank < 0.0 ? uShapeL : uShapeR;
  float hw = shape.z;
  vec3 origin = vec3(shape.x + aSeed.x * hw, shape.y + aSeed.y * hw, 0.0);
  // 숨: 아주 작게. 형상이 흐트러지면 안 됩니다. 컬 노이즈는 이웃이 같이 움직이는
  // 매끈한 장이라 윤곽이 번지지 않고 살짝 일렁입니다.
  float t = uTime * uFlowSpeed * aSpeed + aOffset;
  vec3 drift = curlNoise(origin * uSpaceScale + vec3(0.0, 0.0, t * 0.5)) * uCurl;
  vec3 bankPos = origin + (drift * 0.75 + vec3(0.0, sin(t * 0.7) * 0.12, 0.0)) * uBreath;

  // 강가로: 속의 점이 먼저 떠나고 가장자리 점(aEdge 1)이 마지막에 떠납니다.
  // 윤곽이 마지막까지 남아야 읽힙니다(브리프 4).
  float lag = mix(hash1(aOffset * 2.9) * 0.3, 0.55 + hash1(aOffset * 2.9) * 0.15, aEdge);
  float g = clamp((uGather - lag) / max(1.0 - lag, 0.05), 0.0, 1.0);
  g = g * g * (3.0 - 2.0 * g);
  // 물가는 그 깊이에서 보이는 화면 폭의 40% 자리입니다.
  float halfW = (30.0 - origin.z) * 0.577 * 1.6;
  float edgeX = aBank * halfW * (0.40 + hash1(aOffset) * 0.06);
  vec3 shore = vec3(edgeX, mix(bankPos.y, uLantern.y + 4.0 + hash1(aOffset * 3.1) * 8.0, 0.6), bankPos.z);
  vec3 gathered = mix(bankPos, shore, g * (0.55 + 0.45 * hash1(aOffset * 2.3)));

  // 건너편의 자리: 등불 둘레의 성좌. 반지름 3~10, 등불보다 조금 위.
  float rad = 3.0 + hash1(aOffset * 5.7) * 7.0;
  float ang = hash1(aOffset * 9.1) * 6.2831853;
  float el  = (hash1(aOffset * 4.4) - 0.3) * 1.2;
  vec3 seat = uLantern + vec3(cos(ang) * rad, sin(el) * rad * 0.7 + 2.0, sin(ang) * rad * 0.6);

  // 건너기: 호를 그리며, 컬 노이즈로 조금 흔들리며.
  float arc = sin(prog * 3.14159265);
  vec3 path = mix(gathered, seat, prog);
  path.y += arc * (1.5 + hash1(aOffset * 7.7) * 3.0);
  path += curlNoise(path * uSpaceScale * 1.5 + vec3(t * 0.3)) * arc * 1.6;
  path += drift * 0.3 * (1.0 - arc);

  // 닿은 뒤: 드리프트를 줄여 잔잔한 성좌로. 코어 판 뒤에서 움직이면 방해입니다.
  vec3 settled = seat + drift * 0.6 * (1.0 - uArrived * 0.75);
  vec3 pos = mix(path, settled, prog * uArrived);

  vPointer = 0.0;
  vSpeed = clamp(arc * uCrossing * 0.9, 0.0, 1.0);
  vNear = arc;                                   // 건너는 도중에 밝아짐
  vRand = hash1(aOffset * 6.1);
  vGlow = aScale;
  vEdge = aEdge;
  // 밝기. 가장자리는 1.0에 윤곽을 따라 도는 파도(±uWave.y, 한 바퀴 uWave.x초), 속은 0.35.
  float wave = 1.0 + uWave.y * sin(6.2831853 * (aPhase - uTime / uWave.x));
  vBright = mix(uInnerBright, uEdgeBright * wave, aEdge);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float zCam = -mv.z;
  vDepth = clamp((zCam - 6.0) / 60.0, 0.0, 1.0);
  // 크기는 화면 px로 정합니다(z = 0 평면, 카메라 30에서 그대로). 멀어지면 작아집니다.
  float px = mix(uInnerPx, uEdgePx, aEdge) * (1.0 + arc * 0.5) * (1.0 + vSpeed * 0.6);
  gl_PointSize = min(px * uPixelRatio * (30.0 / max(zCam, 0.001)), 22.0 * uPixelRatio);
}

void main(){
  if (uMode > 0.5) { crossingMain(); return; }
  vBright = 1.0; vEdge = 0.0; // field 경로는 읽지 않습니다. varying을 비워 두지 않으려는 것뿐.
  vec3 pos = aSeed;

  // per-particle parallax weight: bright/large leaders sit "nearer" and react more
  float parallax = mix(0.6, 1.4, aScale * 0.5);

  // 1 ─ curl-noise drift (calm baseline)
  float t = uTime * uFlowSpeed * aSpeed + aOffset;
  vec3 fieldPos = pos * uSpaceScale + vec3(0.0, 0.0, t);
  vec3 flow = curlNoise(fieldPos) * uCurl;
  pos += flow * (t * 2.0);
  pos.y += t * 0.4;

  pos.x = wrap(pos.x, uBounds.x);
  pos.y = wrap(pos.y, uBounds.y);
  pos.z = wrap(pos.z, uBounds.z);

  // scroll evolves the field deeper
  pos.z -= uScroll * uBounds.z * 0.5 * parallax;
  pos.z = wrap(pos.z, uBounds.z);

  // 2 ─ pointer magnetism
  vec3 toP = pos - uPointer;
  float dP = length(toP);
  float infl = smoothstep(uPointerRadius, 0.0, dP);
  vPointer = infl;
  pos += normalize(toP + 1e-4) * infl * uPointerForce;

  // 3 ─ vortex attractor toward the portal
  vec3 disp = vec3(0.0);
  vec3 toHole = uHole - pos;
  float hd = length(toHole);
  vNear = smoothstep(40.0, 4.0, hd);
  if (uReveal > 0.001) {
    vec3 dir = toHole / max(hd, 1e-4);
    vec3 tangent = normalize(cross(dir, vec3(0.0, 0.0, 1.0)) + 1e-4);
    float grip = smoothstep(90.0, 4.0, hd) * parallax;

    // Gentle gravitational drift only — greatly reduced so particles no longer
    // spiral into a tight, bright convergence ring at the bottom of the page.
    // Displacement magnitude feeds vSpeed, which feeds both point size and alpha —
    // so reveal (0..1 across the whole page) was quietly making the middle of
    // the document brighter than its ends. Trimmed so the field still organises
    // toward the portal, with roughly two thirds of the previous travel.
    float inward = grip * (uReveal * 0.9 + uPull * 2.2);
    float swirl  = grip * (uReveal * 0.4 + uPortal * 1.8);
    disp += dir * inward + tangent * swirl;
  }
  pos += disp;

  // 4 ─ velocity-aligned trail stretch (long exposure during the pull)
  // uPull's contribution halved: vSpeed feeds BOTH size and alpha downstream,
  // so it was the single biggest amplifier of the lower-page brightening.
  vSpeed = clamp(length(disp) * 0.06 + uPull * 0.25, 0.0, 1.0);

  // stable per-particle random for thinning the convergence cluster
  vRand = fract(aOffset * 0.1234 + aSpeed);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float zCam = -mv.z;
  vDepth = clamp((zCam - 6.0) / 60.0, 0.0, 1.0);

  // size: distance attenuation, pointer glow-up, and growth as they near the portal.
  // Inflation factors dialed down so particles stay refined points, not big bokeh.
  // Growth toward the portal trimmed 0.8 → 0.35. Combined with the smaller cap
  // below, this is what stops the near-field particles from resolving into
  // large soft discs behind the FAQ/vision copy — they stay a glow.
  float size = aScale * (1.0 + infl * 1.0 + vNear * uPortal * 0.35);
  // trails: enlarge points along the pull to read as streaks (cheap stand-in)
  size *= (1.0 + vSpeed * 0.6);
  // smaller base scale + a tight max clamp so a particle that drifts close to
  // the camera can never balloon into a large foreground sphere
  // Cap 34 → 22 px. At 34 the nearest particles crossed the threshold where a
  // blurred point stops reading as light and starts reading as a circle sitting
  // on top of the text. Everything below the cap is unchanged.
  gl_PointSize = min(size * uPixelRatio * (130.0 / max(zCam, 0.001)), 22.0 * uPixelRatio);

  vGlow = aScale;
}
`;
