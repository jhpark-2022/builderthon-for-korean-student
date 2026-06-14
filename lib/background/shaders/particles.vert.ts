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

attribute vec3  aSeed;
attribute float aScale;
attribute float aSpeed;
attribute float aOffset;

varying float vDepth;
varying float vGlow;
varying float vPointer;
varying float vSpeed;     // motion magnitude → trail brightness
varying float vNear;      // proximity to portal 0..1
varying float vRand;      // stable per-particle random (for thinning)

${NOISE_GLSL}

float wrap(float v, float h){ float s = h * 2.0; return mod(v + h, s) - h; }

void main(){
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
    float inward = grip * (uReveal * 1.2 + uPull * 3.0);
    float swirl  = grip * (uReveal * 0.5 + uPortal * 2.5);
    disp += dir * inward + tangent * swirl;
  }
  pos += disp;

  // 4 ─ velocity-aligned trail stretch (long exposure during the pull)
  vSpeed = clamp(length(disp) * 0.06 + uPull * 0.5, 0.0, 1.0);

  // stable per-particle random for thinning the convergence cluster
  vRand = fract(aOffset * 0.1234 + aSpeed);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float zCam = -mv.z;
  vDepth = clamp((zCam - 6.0) / 60.0, 0.0, 1.0);

  // size: distance attenuation, pointer glow-up, and growth as they near the portal.
  // Inflation factors dialed down so particles stay refined points, not big bokeh.
  float size = aScale * (1.0 + infl * 1.0 + vNear * uPortal * 0.8);
  // trails: enlarge points along the pull to read as streaks (cheap stand-in)
  size *= (1.0 + vSpeed * 1.2);
  // smaller base scale + a tight max clamp so a particle that drifts close to
  // the camera can never balloon into a large foreground sphere
  gl_PointSize = min(size * uPixelRatio * (130.0 / max(zCam, 0.001)), 34.0 * uPixelRatio);

  vGlow = aScale;
}
`;
