import { NOISE_GLSL } from "./noise.glsl";

/** Full-screen-ish gradient + drifting nebula fog behind the particles. */
export const ATMO_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ATMO_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uBase;
uniform vec3 uMid;
uniform vec3 uAccent;
uniform float uScroll;
uniform float uReveal;   // black-hole approach 0..1 — darkens the sky
varying vec2 vUv;

${NOISE_GLSL}

void main(){
  vec2 p = vUv;
  // vertical base gradient (darker bottom, faint accent top)
  vec3 col = mix(uBase, uMid, smoothstep(0.0, 1.0, p.y));

  // slow drifting nebula bands
  float t = uTime * 0.02;
  float n = snoise(vec3(p * 3.0, t + uScroll * 0.5)) * 0.5 + 0.5;
  float n2 = snoise(vec3(p * 6.0 + 10.0, t * 0.7)) * 0.5 + 0.5;
  float glow = pow(n * n2, 2.0);

  // radial vignette toward centre keeps focus on hero content
  float d = distance(p, vec2(0.5, 0.55));
  float vign = smoothstep(0.9, 0.2, d);

  col += uAccent * glow * 0.18 * vign;
  col = mix(col, uBase, d * 0.4); // darken edges

  // Drain the SKY (background only) to pure black ONLY at the very end of scroll
  // (≈95→100%), so the closing screen sits on a black void — while the particles
  // / sun-like convergence keep glowing on top (they're a separate layer).
  float toBlack = smoothstep(0.95, 1.0, uScroll);
  col = mix(col, vec3(0.0), toBlack);

  gl_FragColor = vec4(col, 1.0);
}
`;
