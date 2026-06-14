import * as THREE from "three";
import { FIELD, PALETTE } from "../config";
import { NOISE_GLSL } from "../shaders/noise.glsl";
import { disposeMaterial } from "../utils/Disposable";

/**
 * Mid-layer "intelligent connections": a set of long flowing ribbons that drift
 * through the same flow field as the particles, suggesting data routes through
 * the network. GPU-advected line strips, additive, faint — depth and motion,
 * never busy.
 */
const LINE_VERT = /* glsl */ `
uniform float uTime;
uniform float uSpaceScale;
uniform float uFlowSpeed;
uniform vec3 uBounds;
uniform float uScroll;
attribute float aT;       // 0..1 along the strip
attribute float aSeed;    // per-line seed
varying float vT;
varying float vDepth;

${NOISE_GLSL}

float wrap(float v, float h){ float s=h*2.0; return mod(v+h,s)-h; }

void main(){
  vT = aT;
  // each vertex is a point sliding along a curl streamline
  float t = uTime * uFlowSpeed + aSeed * 6.2831;
  vec3 p = vec3(
    sin(aSeed * 12.0) * uBounds.x * 0.7,
    cos(aSeed * 7.0)  * uBounds.y * 0.7,
    (aSeed * 2.0 - 1.0) * uBounds.z
  );
  // march along the field for aT to draw a streamline
  vec3 cur = p;
  float steps = aT * 8.0;
  for (float i = 0.0; i < 8.0; i += 1.0) {
    if (i > steps) break;
    vec3 fieldPos = cur * uSpaceScale + vec3(0.0, 0.0, t);
    cur += curlNoise(fieldPos) * 0.9;
  }
  cur.z -= uScroll * uBounds.z * 0.6;
  cur.x = wrap(cur.x, uBounds.x);
  cur.y = wrap(cur.y, uBounds.y);
  cur.z = wrap(cur.z, uBounds.z);

  vec4 mv = modelViewMatrix * vec4(cur, 1.0);
  vDepth = clamp((-mv.z - 6.0) / 70.0, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;

const LINE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform vec3 uFog;
uniform float uOpacity;
varying float vT;
varying float vDepth;
void main(){
  // fade toward both ends of the strip + into fog
  float ends = smoothstep(0.0, 0.15, vT) * smoothstep(1.0, 0.85, vT);
  vec3 col = mix(uColor, uFog, vDepth * 0.8);
  float a = ends * (1.0 - vDepth * 0.8) * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;

export class NetworkLines {
  readonly lines: THREE.LineSegments;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;

  constructor(lineCount: number, parallax: number) {
    const perLine = 16; // segments → 2 verts each for LineSegments
    const verts = lineCount * perLine * 2;
    const aT = new Float32Array(verts);
    const aSeed = new Float32Array(verts);
    const position = new Float32Array(verts * 3); // dummy

    let v = 0;
    for (let l = 0; l < lineCount; l++) {
      const seed = Math.random();
      for (let s = 0; s < perLine; s++) {
        const t0 = s / perLine;
        const t1 = (s + 1) / perLine;
        aT[v] = t0; aSeed[v] = seed; v++;
        aT[v] = t1; aSeed[v] = seed; v++;
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    this.geometry.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
    this.geometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(),
      Math.hypot(FIELD.bounds, FIELD.bounds, FIELD.depth)
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpaceScale: { value: FIELD.spaceScale },
        uFlowSpeed: { value: FIELD.flowSpeed * parallax },
        uBounds: { value: new THREE.Vector3(FIELD.bounds, FIELD.bounds, FIELD.depth) },
        uScroll: { value: 0 },
        uColor: { value: new THREE.Color(PALETTE.accent2) },
        uFog: { value: new THREE.Color(PALETTE.base2) },
        uOpacity: { value: 0.5 },
      },
    });

    this.lines = new THREE.LineSegments(this.geometry, this.material);
    this.lines.frustumCulled = true;
  }

  update(time: number, scroll: number, motionScale: number) {
    const u = this.material.uniforms;
    u.uTime.value = time * motionScale;
    u.uScroll.value = scroll;
  }

  dispose() {
    this.geometry.dispose();
    disposeMaterial(this.material);
  }
}
