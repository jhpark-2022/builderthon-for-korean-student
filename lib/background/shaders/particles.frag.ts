/**
 * Particle fragment shader.
 *
 * Soft radial glow (no hard sprite edges). Colour shifts with scroll, brightens
 * with pointer/speed/portal-proximity, and dissolves toward white during the
 * crossing. Additive blending → volumetric, bloom-friendly.
 */
export const PARTICLES_FRAG = /* glsl */ `
precision highp float;

uniform vec3 uAccent;
uniform vec3 uHighlight;
uniform vec3 uAccent2;
uniform vec3 uHighlight2;
uniform vec3 uFog;
uniform float uOpacity;
uniform float uScroll;
uniform float uPortal;
uniform float uWhiteout;
uniform float uMode;      // 0 = field, 1 = crossing (2026-09-17)

varying float vBright;    // crossing: 점의 밝기
varying float vEdge;      // crossing: 가장자리 1 / 속 0
varying float vDepth;
varying float vGlow;
varying float vPointer;
varying float vSpeed;
varying float vNear;
varying float vRand;

const vec3 WHITE = vec3(0.95, 0.92, 1.0);

// ── 건너는 점들의 색 (2026-09-17 수정 브리프) ────────────────────────────────
// 형상의 속 점은 uAccent(accent1), 가장자리 점은 uHighlight(hi0). 건너는 도중(vNear)에
// hi0로 밝아지고, 닿으면 다시 가라앉습니다. 주황이 되지 않습니다. 화면의 주황은
// 등불과 그 반사뿐입니다. 밝기(vBright)는 버텍스가 정합니다(가장자리의 파도).
void crossingFrag(){
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv) * 2.0;
  if (r > 1.0) discard;
  float core = smoothstep(1.0, 0.0, r);
  float halo = pow(1.0 - r, 3.2);
  float alpha = (core * 0.62 + halo * 0.25);
  vec3 col = mix(uAccent, uHighlight, clamp(vEdge + vNear * 0.85, 0.0, 1.0));
  col = mix(col, uFog, vDepth * 0.85);
  alpha *= (1.0 - vDepth * 0.7) * uOpacity * vBright;
  alpha = mix(alpha, alpha * 1.25 + 0.06, vSpeed);
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}

void main(){
  if (uMode > 0.5) { crossingFrag(); return; }
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv) * 2.0;
  if (r > 1.0) discard;

  // tighter core, much weaker halo → refined points of light rather than soft
  // bokeh orbs (the halo was the main "glowing sphere" read)
  float core = smoothstep(1.0, 0.0, r);
  float halo = pow(1.0 - r, 3.2);
  float alpha = (core * 0.62 + halo * 0.25);

  // scroll palette blend
  vec3 accent = mix(uAccent, uAccent2, uScroll);
  vec3 highlight = mix(uHighlight, uHighlight2, uScroll);

  // heat from glow + pointer + motion trails + convergence proximity.
  // Converging particles get HOTTER (brighter highlight) rather than snapping to
  // a white core — so the focus reveals itself as accumulating volumetric light
  // (via bloom on dense regions), never as an outlined bright shape.
  // Portal heat halved — the hue shift toward the hot highlight was the other
  // half of "the tone changes here", separate from the brightness change.
  float heat = clamp(vGlow * 0.5 + vPointer * 0.9 + vSpeed * 0.6 + vNear * uPortal * 0.4, 0.0, 1.0);
  vec3 col = mix(accent, highlight, heat);

  // only the actual crossing dissolves particles into pure light
  col = mix(col, WHITE, uWhiteout);

  // depth fade into fog (suppressed during whiteout so nothing goes muddy)
  col = mix(col, uFog, vDepth * 0.85 * (1.0 - uWhiteout));

  alpha *= (1.0 - vDepth * 0.7) * uOpacity;
  // Trails still read brighter, at about a third of the old lift: the additive
  // +0.2 in particular put a floor under every fast particle, which is what made
  // the lower page glow as a whole rather than sparkle.
  alpha = mix(alpha, alpha * 1.25 + 0.06, vSpeed);

  // thin the convergence cluster heavily: fade out ~90% of particles as they
  // near the focus so only a sparse few stream in (keeps the motion, minimal
  // density)
  float thinT = vNear * uPortal;                 // only active near the portal
  float cull = step(vRand, 0.90) * thinT;        // bottom 90%
  alpha *= (1.0 - cull);

  alpha = clamp(alpha + uWhiteout * 0.4, 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;
