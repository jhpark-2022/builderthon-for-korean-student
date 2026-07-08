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

varying float vDepth;
varying float vGlow;
varying float vPointer;
varying float vSpeed;
varying float vNear;
varying float vRand;

const vec3 WHITE = vec3(0.95, 0.92, 1.0);

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv) * 2.0;
  if (r > 1.0) discard;

  float core = smoothstep(1.0, 0.0, r);
  float halo = pow(1.0 - r, 2.5);
  float alpha = (core * 0.7 + halo * 0.5);

  // scroll palette blend
  vec3 accent = mix(uAccent, uAccent2, uScroll);
  vec3 highlight = mix(uHighlight, uHighlight2, uScroll);

  // heat from glow + pointer + motion trails + convergence proximity.
  // Converging particles get HOTTER (brighter highlight) rather than snapping to
  // a white core — so the focus reveals itself as accumulating volumetric light
  // (via bloom on dense regions), never as an outlined bright shape.
  float heat = clamp(vGlow * 0.5 + vPointer * 0.9 + vSpeed * 0.6 + vNear * uPortal * 0.8, 0.0, 1.0);
  vec3 col = mix(accent, highlight, heat);

  // only the actual crossing dissolves particles into pure light
  col = mix(col, WHITE, uWhiteout);

  // depth fade into fog (suppressed during whiteout so nothing goes muddy)
  col = mix(col, uFog, vDepth * 0.85 * (1.0 - uWhiteout));

  alpha *= (1.0 - vDepth * 0.7) * uOpacity;
  alpha = mix(alpha, alpha * 1.6 + 0.2, vSpeed);   // trails read brighter

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
