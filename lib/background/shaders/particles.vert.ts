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

attribute vec3  aSeed;
attribute float aScale;
attribute float aSpeed;
attribute float aOffset;
attribute float aBank;    // crossing: -1 왼쪽 기슭 / +1 오른쪽. field에서는 0.

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

  // 기슭에서: 씨앗 자리 + 느린 컬 드리프트 + 작은 숨
  float t = uTime * uFlowSpeed * aSpeed + aOffset;
  vec3 drift = curlNoise(aSeed * uSpaceScale + vec3(0.0, 0.0, t * 0.5)) * uCurl;
  vec3 bankPos = aSeed + drift * 2.5 + vec3(0.0, sin(t * 0.7) * 0.4, 0.0);

  // 강가로: x는 자기 기슭의 물가로, y는 지평선 쪽으로. 전부 같은 만큼 모이지는
  // 않습니다(0.55~1.0). 줄을 서는 것이 아니라 물가에 흩어져 서는 것입니다.
  // 물가는 그 깊이에서 보이는 화면 폭의 40% 자리입니다(ParticleField의 씨앗과 같은 기준).
  float halfW = (30.0 - aSeed.z) * 0.577 * 1.6;
  float edgeX = aBank * halfW * (0.40 + hash1(aOffset) * 0.06);
  vec3 shore = vec3(edgeX, mix(bankPos.y, uLantern.y + 4.0 + hash1(aOffset * 3.1) * 8.0, 0.6), bankPos.z);
  vec3 gathered = mix(bankPos, shore, uGather * (0.55 + 0.45 * hash1(aOffset * 2.3)));

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
  vRand = mix(hash1(aOffset * 6.1) * 0.5, 0.5 + hash1(aOffset * 6.1) * 0.5, step(0.0, aBank));
  vGlow = aScale;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float zCam = -mv.z;
  vDepth = clamp((zCam - 6.0) / 60.0, 0.0, 1.0);
  // 8월보다 1.6배. 입자 수가 두 기슭에 나뉘고 강 가운데가 비어서, 같은 크기면
  // 필드가 아니라 먼지로 읽힙니다.
  float size = aScale * 1.6 * (1.0 + arc * 0.5);
  size *= (1.0 + vSpeed * 0.6);
  gl_PointSize = min(size * uPixelRatio * (130.0 / max(zCam, 0.001)), 22.0 * uPixelRatio);
}

void main(){
  if (uMode > 0.5) { crossingMain(); return; }
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
