import * as THREE from "three";
import { CROSSING, FIELD, PALETTE, SHAPES, type QualityTier } from "../config";
import { SINGAPORE_POINTS, SINGAPORE_STRIDE } from "../shapes/singapore";
import { SEOUL_POINTS, SEOUL_STRIDE } from "../shapes/seoul";
import { PARTICLES_VERT } from "../shaders/particles.vert";
import { PARTICLES_FRAG } from "../shaders/particles.frag";
import { disposeMaterial } from "../utils/Disposable";

/**
 * The hero layer: a GPU-driven curl-noise flow field of soft glowing particles.
 *
 * Positions are advected entirely in the vertex shader (see particles.vert),
 * so the only per-frame CPU work is updating a handful of uniforms — zero
 * allocations in the render loop.
 */
export type ParticleVariant = "field" | "crossing";

// 가우시안 난수(Box-Muller). crossing의 기슭 입자가 지평선 근처에 몰리게 합니다.
function gauss(mean: number, sigma: number) {
  const u = 1 - Math.random();
  const v = Math.random();
  return mean + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * 서울 점 하나하나에 싱가포르 점 하나를 짝지어 `out`(aSeed2)에 넣습니다.
 * 2026-09-19, 서울→싱가포르 브리프 2.1.
 *
 * ── 왜 인덱스 순서로 짝지으면 안 되는가 ──────────────────────────────────
 * 구운 점의 순서는 무작위로 섞여 있습니다(가장자리 75%·속 25%가 어느 접두사에서도
 * 유지되게). i번째와 i번째를 짝지으면 점 전부가 화면을 가로질러 날아가 뒤엉킵니다.
 *
 * ── 열쇠는 phase ───────────────────────────────────────────────────────
 * 굽는 스크립트가 넣어 둔 phase가 가장자리 점에서는 윤곽을 따라 간 호 길이 비율,
 * 속 점에서는 중심 기준 각도 비율입니다. 양쪽을 phase로 정렬해 같은 순번끼리 묶으면
 * 윤곽이 고무줄처럼 늘어나 다른 윤곽이 됩니다.
 *
 * ── 오프셋과 방향 ──────────────────────────────────────────────────────
 * 두 윤곽의 phase = 0이 같은 방위가 아니고, 도는 방향도 다를 수 있습니다. 그래서
 * 오프셋 32가지 × 방향 2가지 = 64개 후보를 모두 시험해 정규화 좌표에서 이동 거리
 * 제곱합이 가장 작은 짝을 씁니다. 생성자에서 한 번이고, 매 프레임이 아닙니다.
 */
function pairSeoulToSingapore(
  count: number,
  seeds: Float32Array,
  edges: Float32Array,
  phases: Float32Array,
  out: Float32Array
) {
  const t0 = typeof performance !== "undefined" ? performance.now() : 0;
  const gStride = SINGAPORE_STRIDE;
  const gCount = Math.min(count, (SINGAPORE_POINTS.length / gStride) | 0);
  if (gCount < 8) return;

  // 서울: 파티클 인덱스를 가장자리/속으로 나누고 phase 오름차순.
  const sEdge: number[] = [];
  const sInner: number[] = [];
  for (let i = 0; i < count; i++) (edges[i] > 0.5 ? sEdge : sInner).push(i);
  const byPhaseS = (a: number, b: number) => phases[a] - phases[b];
  sEdge.sort(byPhaseS);
  sInner.sort(byPhaseS);

  // 싱가포르: 굽은 점의 인덱스를 같은 방식으로.
  const gEdge: number[] = [];
  const gInner: number[] = [];
  for (let k = 0; k < gCount; k++) (SINGAPORE_POINTS[k * gStride + 2] > 0.5 ? gEdge : gInner).push(k);
  const byPhaseG = (a: number, b: number) => SINGAPORE_POINTS[a * gStride + 3] - SINGAPORE_POINTS[b * gStride + 3];
  gEdge.sort(byPhaseG);
  gInner.sort(byPhaseG);

  // 오프셋 후보 수. 브리프 2.1은 32였는데 실측에서 데스크톱(1,990점) 탐색이 9.5ms로
  // 검증 9의 상한(데스크톱 5ms)을 넘었습니다. 브리프 4장의 지시대로 16으로 내립니다.
  // 오프셋 간격이 mB/16(약 93칸)이 되지만 비용 함수가 오프셋에 대해 완만해서
  // 최소/최대 비는 그대로입니다(0.037). 폰은 1,100점에 4.1ms였습니다.
  const OFFSETS = 16;
  let logged = { off: 0, dir: 1, min: 0, max: 0 };

  /** a(서울 인덱스 목록) ↔ b(싱가포르 인덱스 목록). 최적 오프셋·방향으로 out을 채웁니다. */
  const match = (a: number[], b: number[]) => {
    const mA = a.length;
    const mB = b.length;
    if (mA === 0 || mB === 0) return;
    const j = (t: number, off: number, dir: number) => {
      const base = Math.floor((t * mB) / mA);
      const v = dir > 0 ? base + off : mB - 1 - base + off;
      return ((v % mB) + mB) % mB;
    };
    let bestCost = Infinity;
    let worstCost = -Infinity;
    let bestOff = 0;
    let bestDir = 1;
    for (let c = 0; c < OFFSETS * 2; c++) {
      const off = Math.round(((c >> 1) * mB) / OFFSETS);
      const dir = c & 1 ? -1 : 1;
      let cost = 0;
      for (let t = 0; t < mA; t++) {
        const i = a[t];
        const k = b[j(t, off, dir)];
        const dx = seeds[i * 3] - SINGAPORE_POINTS[k * gStride];
        const dy = seeds[i * 3 + 1] - SINGAPORE_POINTS[k * gStride + 1];
        cost += dx * dx + dy * dy;
      }
      if (cost < bestCost) { bestCost = cost; bestOff = off; bestDir = dir; }
      if (cost > worstCost) worstCost = cost;
    }
    for (let t = 0; t < mA; t++) {
      const i = a[t];
      const k = b[j(t, bestOff, bestDir)];
      out[i * 3] = SINGAPORE_POINTS[k * gStride];
      out[i * 3 + 1] = SINGAPORE_POINTS[k * gStride + 1];
      out[i * 3 + 2] = 0;
    }
    if (a === sEdge) logged = { off: bestOff, dir: bestDir, min: bestCost, max: worstCost };
  };

  match(sEdge, gEdge);
  match(sInner, gInner);

  if (process.env.NODE_ENV !== "production" && typeof console !== "undefined") {
    const ms = (typeof performance !== "undefined" ? performance.now() : 0) - t0;
    // 검증 6·9(브리프 4장): 최소값이 최대값의 절반 이하여야 정렬이 효과를 낸 것입니다.
    console.info(
      `[naru:bg] 서울→싱가포르 짝짓기 — 점 ${count}, 오프셋 ${logged.off}, 방향 ${logged.dir > 0 ? "+" : "-"}, ` +
        `거리제곱합 최소 ${logged.min.toFixed(1)} / 최대 ${logged.max.toFixed(1)} ` +
        `(비 ${(logged.min / Math.max(logged.max, 1e-6)).toFixed(3)}), ${ms.toFixed(1)}ms`
    );
  }
}

export class ParticleField {
  readonly points: THREE.Points;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly intensity: number; // device-tier energy/opacity scale
  private readonly variant: ParticleVariant;

  /**
   * @param only  crossing에서 형상 하나만("seoul"). 점 전부가 그 형상이고 깊이 층은 없습니다
   *              (water 변형의 서울 워터마크, 2026-09-18). 기본값은 둘(짝수 싱가포르, 홀수 서울).
   */
  constructor(quality: QualityTier, parallax: number, variant: ParticleVariant = "field", only?: "seoul") {
    const count = quality.particles;
    this.intensity = quality.intensity;
    this.variant = variant;

    const seeds = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const banks = new Float32Array(count); // field에서는 전부 0
    const edges = new Float32Array(count); // crossing: 가장자리 1 / 속 0. field에서는 0
    const phases = new Float32Array(count); // crossing: 윤곽을 따라 간 위상 0..1. field에서는 0
    // 서울 → 싱가포르 건너기의 도착 자리(2026-09-19). only === "seoul"일 때만 채우고,
    // 나머지 변형에서는 aSeed와 같은 값이라 셰이더가 항등이 됩니다.
    const seeds2 = new Float32Array(count * 3);

    // crossing: 점 예산(2026-09-17 수정 브리프 1.2). 앞쪽은 형상 둘, 나머지는 깊이 층.
    const shapeCount = variant === "crossing" ? (only ? count : SHAPES.shapePoints(count)) : 0;

    for (let i = 0; i < count; i++) {
      if (variant === "crossing" && i < shapeCount) {
        // DECIDED 2026-09-17 (배경 수정 브리프): 두 기슭은 형상입니다. 짝수 인덱스가
        // 싱가포르(왼쪽), 홀수가 서울(오른쪽). 씨앗은 굽힌 점의 정규화 xy(형상 너비를
        // [-1,1]에), z는 0(정면, 두께 없음. 3° 패럴랙스는 평행 이동만). 월드 자리는
        // 셰이더의 uShapeL/uShapeR가 정합니다(BackgroundScene.placeShapes). 구운 순서가
        // 가장자리 75%·속 25%를 어느 접두사에서도 지키므로 앞에서부터 잘라 씁니다.
        const bank = only === "seoul" ? 1 : i % 2 === 0 ? -1 : 1;
        banks[i] = bank;
        const src = bank < 0 ? SINGAPORE_POINTS : SEOUL_POINTS;
        const stride = bank < 0 ? SINGAPORE_STRIDE : SEOUL_STRIDE;
        const k = (only ? i : i >> 1) % (src.length / stride);
        seeds[i * 3 + 0] = src[k * stride];
        seeds[i * 3 + 1] = src[k * stride + 1];
        seeds[i * 3 + 2] = 0;
        edges[i] = src[k * stride + 2];
        phases[i] = src[k * stride + 3];
        scales[i] = 1;
        // 속도 편차 ±40%. 먼저 건너는 점과 늦게 건너는 점.
        speeds[i] = 0.6 + Math.random() * 0.8;
        offsets[i] = Math.random() * 100;
        continue;
      }
      // field, 그리고 crossing의 깊이 층(aBank 0): 8월 필드와 같은 분포입니다.
      // distribute through the volume; bias slightly toward centre depth
      seeds[i * 3 + 0] = (Math.random() * 2 - 1) * FIELD.bounds;
      seeds[i * 3 + 1] = (Math.random() * 2 - 1) * FIELD.bounds;
      seeds[i * 3 + 2] = (Math.random() * 2 - 1) * FIELD.depth;

      // varied size, opacity (via scale → glow), and velocity. Fewer + smaller
      // "leaders" so the field reads as fine cosmic dust, not big bokeh orbs.
      const tier = Math.random();
      scales[i] = tier < 0.93 ? 0.45 + Math.random() * 0.55 : 1.0 + Math.random() * 0.7;
      speeds[i] = 0.5 + Math.random() * 1.2;
      offsets[i] = Math.random() * 100;
    }

    // 기본값: 도착 자리 = 출발 자리. crossing과 field는 이 값을 그대로 씁니다.
    seeds2.set(seeds);
    if (variant === "crossing" && only === "seoul") {
      pairSeoulToSingapore(count, seeds, edges, phases, seeds2);
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    this.geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    this.geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    this.geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
    this.geometry.setAttribute("aBank", new THREE.BufferAttribute(banks, 1));
    this.geometry.setAttribute("aEdge", new THREE.BufferAttribute(edges, 1));
    this.geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    this.geometry.setAttribute("aSeed2", new THREE.BufferAttribute(seeds2, 3));
    // dummy position attribute (shader ignores it but Three expects one)
    this.geometry.setAttribute("position", new THREE.BufferAttribute(seeds, 3));
    this.geometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(),
      Math.hypot(FIELD.bounds, FIELD.bounds, FIELD.depth)
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader: PARTICLES_VERT,
      fragmentShader: PARTICLES_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpaceScale: { value: FIELD.spaceScale },
        uFlowSpeed: { value: FIELD.flowSpeed * parallax },
        uCurl: { value: FIELD.curl },
        uBounds: { value: new THREE.Vector3(FIELD.bounds, FIELD.bounds, FIELD.depth) },
        uPointer: { value: new THREE.Vector3() },
        uPointerRadius: { value: FIELD.pointerRadius },
        uPointerForce: { value: FIELD.pointerForce },
        uPixelRatio: { value: 1 },
        uScroll: { value: 0 },
        uReveal: { value: 0 },   // gravity presence 0..1
        uPull: { value: 0 },     // inward acceleration 0..1
        uPortal: { value: 0 },   // vortex organisation 0..1
        uWhiteout: { value: 0 }, // crossing 0..1
        uHole: { value: new THREE.Vector3(0, 0, -46) }, // portal centre (matches Portal.Z)
        // top-of-page palette (indigo-violet)
        uAccent: { value: new THREE.Color("#6366f1") },
        uHighlight: { value: new THREE.Color("#a855f7") },
        // bottom-of-page palette (fuchsia-pink) — blended by uScroll
        uAccent2: { value: new THREE.Color("#a855f7") },
        uHighlight2: { value: new THREE.Color("#e879f9") },
        uFog: { value: new THREE.Color(PALETTE.base2) },
        uOpacity: { value: 1 },
        // ── crossing (2026-09-17). field에서는 uMode 0이라 셰이더가 읽지 않습니다.
        uMode: { value: variant === "crossing" ? 1 : 0 },
        uLantern: { value: new THREE.Vector3(CROSSING.lantern.x, CROSSING.lantern.y, CROSSING.lantern.z) },
        // 서울 → 싱가포르 건너기(2026-09-19). water 변형(only === "seoul")만 1입니다.
        // 0이면 셰이더가 이 브리프 이전과 같은 경로를 돕니다.
        uMorphOn: { value: only === "seoul" ? 1 : 0 },
        uMorph: { value: 0 },
        uGather: { value: 0 },
        uCrossing: { value: 0 },
        uArrived: { value: 0 },
        // 기슭 형상의 자리(2026-09-17). placeShapes가 채웁니다.
        uShapeL: { value: new THREE.Vector3(-14, -2, 6) },
        uShapeR: { value: new THREE.Vector3(14, -2, 6) },
        uEdgePx: { value: SHAPES.edgePx },
        uInnerPx: { value: SHAPES.innerPx },
        uEdgeBright: { value: SHAPES.edgeBright },
        uInnerBright: { value: SHAPES.innerBright },
        uWave: { value: new THREE.Vector2(SHAPES.wavePeriod, SHAPES.waveAmp) },
        uBreath: { value: SHAPES.breath },
        // 깊이 층과 국면(2026-09-17 수정 브리프)
        uFar: { value: new THREE.Vector3(CROSSING.far.x, CROSSING.far.y, CROSSING.far.z) },
        uShift: { value: 0 },          // 형상을 히어로와 같이 스크롤시키는 월드 y 오프셋
        uCalm: { value: 0 },
        uShapeOpacity: { value: 1 },
        uDepthOpacity: { value: CROSSING.depthBright },
        uDepthCalm: { value: new THREE.Vector2(CROSSING.depthCalmSpeed, CROSSING.depthCalmBright) },
        uDepthDolly: { value: CROSSING.depthDollyZ },
      },
    });
    if (variant === "crossing") {
      // 나루 팔레트(2026-09-17 수정 브리프). 형상의 속 점은 accent1, 가장자리 점은
      // hi0. 건너는 동안 hi0로 밝아집니다. 주황(hi1)은 여기 없습니다. 등불이 갖습니다.
      const u = this.material.uniforms;
      u.uAccent.value.set(PALETTE.accent1);
      u.uAccent2.value.set(PALETTE.accent0); // 깊이 층의 색
      u.uHighlight.value.set(PALETTE.hi0);
      u.uHighlight2.value.set(PALETTE.hi0);
      u.uFog.value.set(PALETTE.base1);
      u.uPointerForce.value = 0; // 포인터에 따라 튀지 않습니다(브리프 5)
    }

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = true;
  }

  setPixelRatio(pr: number) {
    this.material.uniforms.uPixelRatio.value = pr;
  }

  update(
    time: number,
    pointer: THREE.Vector3,
    scroll: number,
    motionScale: number,
    p: { reveal: number; pull: number; portal: number; whiteout: number }
  ) {
    const u = this.material.uniforms;
    u.uTime.value = time * motionScale;
    u.uPointer.value.copy(pointer);
    u.uScroll.value = scroll;
    u.uReveal.value = p.reveal;
    u.uPull.value = p.pull;
    u.uPortal.value = p.portal;
    u.uWhiteout.value = p.whiteout;

    // Scroll-aware calm: medium immersive at the hero, then fade the field well
    // down through the content-heavy sections, and quietest at the footer — so
    // text/cards stay readable and the lower page feels premium, not crowded.
    const ss = (a: number, b: number, x: number) => {
      const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
      return t * t * (3 - 2 * t);
    };
    // HERO is untouched (the hero's staging is deliberate). CONTENT and FOOTER
    // move up so the ramp is a gentle settle rather than a fade-out: 0.30→0.12
    // meant the bottom third of the page sat at 40% of the brightness of the
    // middle, and any local variation on top of that (bloom, trails) read as a
    // jump because the floor kept moving. 0.34→0.22 keeps the same direction
    // with a third of the travel.
    const HERO = 0.8, CONTENT = 0.34, FOOTER = 0.22;
    let op = HERO + (CONTENT - HERO) * ss(0.04, 0.26, scroll); // hero → content
    op += (FOOTER - op) * ss(0.6, 0.95, scroll);               // → footer
    u.uOpacity.value = op * this.intensity;
  }

  /** crossing: 기슭 형상의 자리. 중심 xy(월드)와 반너비. */
  setShapes(left: { x: number; y: number; hw: number }, right: { x: number; y: number; hw: number }) {
    const u = this.material.uniforms;
    u.uShapeL.value.set(left.x, left.y, left.hw);
    u.uShapeR.value.set(right.x, right.y, right.hw);
  }

  /** crossing: 점의 밝기(가장자리, 속)와 전체 불투명도를 바깥에서. water 변형의 서울 워터마크가 씁니다. */
  setShapeLook(edgeBright: number, innerBright: number, opacity: number, edgePx?: number, innerPx?: number) {
    const u = this.material.uniforms;
    u.uEdgeBright.value = edgeBright;
    u.uInnerBright.value = innerBright;
    if (edgePx) u.uEdgePx.value = edgePx;
    if (innerPx) u.uInnerPx.value = innerPx;
    u.uShapeOpacity.value = opacity;
    u.uOpacity.value = opacity;
  }

  /**
   * water 변형: 서울 → 싱가포르 건너기의 진행도. 0이 서울, 1이 싱가포르입니다.
   * BackgroundScene이 스크롤에서 만듭니다(시간이 아닙니다).
   */
  setMorph(v: number) {
    this.material.uniforms.uMorph.value = v;
  }

  /** crossing: 등불의 월드 좌표. 세로 화면에서는 왼쪽으로 물러납니다(BackgroundScene). */
  setLantern(x: number, y: number, z: number) {
    this.material.uniforms.uLantern.value.set(x, y, z);
  }

  /**
   * crossing 변형의 프레임 갱신. 국면과 스크롤을 넘깁니다.
   * 형상 불투명도: 히어로 1.0 → 모이면서 0.55·티어 → 닿은 뒤 0.3·티어. 깊이 층은
   * 따로(uDepthOpacity)라 모든 스크롤 위치에서 같은 밝기이고, 그룹 챕터(calm)에서만
   * 60%로 잦아듭니다.
   * @param shift  형상을 히어로와 같이 스크롤시키는 월드 y 오프셋(z = 0 평면)
   */
  updateCrossing(
    time: number,
    scroll: number,
    motionScale: number,
    p: { gather: number; crossing: number; arrived: number; calm: number },
    shift: number
  ) {
    const u = this.material.uniforms;
    u.uTime.value = time * motionScale;
    u.uScroll.value = scroll;
    u.uGather.value = p.gather;
    u.uCrossing.value = p.crossing;
    u.uArrived.value = p.arrived;
    u.uCalm.value = p.calm;
    u.uShift.value = shift;
    // 기슭(형상) 상태에서는 티어 강도를 곱하지 않습니다. 형상은 첫 화면에서 읽혀야
    // 하는 것이라 밝기를 지키고, 모이기부터 티어 강도를 따릅니다.
    let op = 1.0 + (0.55 * this.intensity - 1.0) * p.gather;
    op += (0.3 * this.intensity - op) * p.arrived;
    u.uShapeOpacity.value = op;
    u.uOpacity.value = op;
  }

  dispose() {
    this.geometry.dispose();
    disposeMaterial(this.material);
  }
}
