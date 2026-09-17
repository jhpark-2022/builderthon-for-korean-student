import { NOISE_GLSL } from "./noise.glsl";

/**
 * 나루터 수면. 밤의 강, 건너편의 등불 하나.
 *
 * DECIDED 2026-09-15: 8월의 "중력 포털" 서사를 나루의 은유로 갈아 끼웁니다.
 * 그 서사(입자가 소용돌이로 빨려 들어가 화이트아웃으로 건너간다)는 이미
 * 꺼져 있었습니다. utils/phases.ts에서 portal과 pull이 0.3으로 눌리고
 * whiteout이 0이라, 남은 것은 떠다니는 입자뿐이었어요. 아무 말도 하지 않는
 * 배경이었습니다.
 *
 * 나루는 강을 건너려는 사람이 배를 타는 자리입니다. 건너는 일은 각자가 하고,
 * 나루는 건널 수 있는 자리를 만듭니다(매니페스토 마지막 문단). 그래서 이
 * 배경에는 세 가지만 있습니다. 밤의 강, 건너편, 그리고 등불 하나.
 *
 * ── 왜 스크린 스페이스인가 ──────────────────────────────────────────────────
 * 3D 평면을 깔고 카메라로 내려다보는 대신, 전체 화면 사각형 하나에 지평선을
 * 긋고 그 아래를 원근 보정한 UV로 그립니다. 이유가 셋입니다.
 *
 *   1. 싸다. 입자 4,000개 + 블룸이 하던 일을 쿼드 하나가 합니다. 노이즈 샘플
 *      네 번이 전부라 폰에서 특히 가볍습니다.
 *   2. 지평선이 화면 좌표에 고정됩니다. 3D였다면 카메라가 흔들릴 때마다
 *      지평선이 같이 흔들리고, 그 위에 로고와 헤드라인이 앉아 있습니다.
 *   3. 물결의 밀도를 거리로 직접 제어할 수 있습니다. 지평선 가까이는 촘촘하고
 *      아래로 올수록 성기게. 진짜 원근 투영은 이걸 공짜로 주지만 대신 셰이더가
 *      카메라 행렬에 묶입니다.
 *
 * ── 색 ──────────────────────────────────────────────────────────────────────
 * 로고 가이드의 4색만 씁니다. 하늘과 물은 남색, 물비늘은 자주, 등불만 주황.
 * 주황이 화면에서 등불 하나와 그 반사 기둥뿐인 것이 요점입니다. 로고 한가운데
 * 찍힌 주황 점 하나가 나루 자리이고, 여기서는 그 점이 세계 속에 놓입니다.
 * 어느 값이든 주황 쪽으로 더 밀지 마세요. 밀면 면이 되고, 면이 되면 로고의
 * 점이 더 이상 눈에 띄지 않습니다.
 *
 * ── 두 구간 (2026-09-16) ────────────────────────────────────────────────────
 * 이 셰이더는 두 장면을 그립니다. 스크롤 30%까지는 위의 나루터(하늘·등불·
 * 수면)이고, 그 뒤로는 물 아래입니다. 수면이 가라앉은 자리를 "깊은 물" 층이
 * 받아요. 전에는 그 자리가 비어 있어서, 페이지의 나머지 70%에는 배경이 없는
 * 것과 같았습니다.
 *
 * 두 장면을 잇는 것은 점 하나입니다. 로고 한가운데의 주황 점이 위에서는
 * 건너편의 등불이고, 아래에서는 물속에서 스크롤을 따라 내려오는 빛입니다.
 */
export const WATER_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const WATER_FRAG = /* glsl */ `
precision highp float;

uniform float uTime;      // 필드 자체 시간. 모션 민감 설정에서 여기가 멈춥니다.
uniform float uScroll;    // 0..1
uniform float uAspect;    // width / height
uniform vec2  uPointer;   // uv 좌표 (0..1). 화면 밖이면 uPointerOn이 0
uniform float uPointerOn;
uniform float uFlow;      // 스크롤 속도 0..1. 손을 떼면 서서히 0으로 잦아듭니다.
uniform vec3  uSkyTop;
uniform vec3  uSkyHorizon;
uniform vec3  uDeep;
uniform vec3  uGlint;
uniform vec3  uLamp;
// ── 띠 모드 (2026-09-17, crossing 변형) ──────────────────────────────────────
// uBand가 1이면 이 셰이더는 하늘도 등불도 깊은 물도 그리지 않고, 등불의 화면 위치
// (uLampUv) 아래로 uBandH 높이의 반사 띠 하나만 그립니다. 나머지는 알파 0.
// 등불 자체는 3D 스프라이트(particles/Lantern.ts)가 그립니다. 0이면 아래 원문이
// 그대로 돕니다(water 변형).
uniform float uBand;
uniform vec2  uLampUv;    // 등불의 화면 uv. y가 지평선.
uniform float uBandH;     // 띠의 높이(뷰포트 비율)
uniform vec2  uBandX;     // 띠의 x 범위(uv). 무대 폭 안에서만 (2026-09-17 수정 브리프)
uniform float uBandFade;  // 전체 알파. 히어로가 나가면 0

varying vec2 vUv;

${NOISE_GLSL}

// 지평선 아래 한 점의 "거리". 지평선에 붙을수록 커집니다.
// 0.02를 더하는 것은 지평선 정확히 위에서 z가 발산하는 것을 막기 위해서입니다.
float depthAt(float d){ return 0.055 / (d + 0.02); }

void main(){
  vec2 p = vUv;

  if (uBand > 0.5) {
    float H = uLampUv.y;
    // 0에서 자릅니다. 아래 원문의 NaN 주석과 같은 이유입니다.
    float d = max(H - p.y, 0.0);
    float t = uTime * 0.11;
    float z = depthAt(d);
    vec2 w = vec2((p.x - 0.5) * uAspect * z, z);
    float n1 = snoise(vec3(w * 1.3, t));
    float n2 = snoise(vec3(w * 3.3 + 7.0, t * 1.5));
    float h  = n1 * 0.62 + n2 * 0.38;
    float far = 1.0 - smoothstep(0.0, uBandH, d);
    vec3 water = mix(uDeep, uSkyHorizon * 0.95, far);
    float glint = smoothstep(0.58, 0.93, h) * far;
    water += uGlint * glint * 0.42;
    // 반사 기둥. 등불의 x 아래. 건너는 동안(uFlow) 흔들림이 커집니다.
    float dx = (p.x - uLampUv.x) * uAspect;
    float colW = (0.010 + d * 0.20) * mix(0.62, 1.0, smoothstep(0.75, 1.3, uAspect));
    float column = exp(-abs(dx) / colW);
    float shimmer = 0.55 + 0.45 * snoise(vec3(w * 2.0, t * (2.2 + uFlow * 3.0)));
    water += uLamp * column * shimmer * (0.6 - smoothstep(0.0, uBandH, d) * 0.35) * (0.7 + uFlow * 0.5);
    // 지평선 자체의 옅은 빛. 건너편이 거기 있다는 표시입니다. 2026-09-17: 0.30 → 0.10,
    // 폭 130 → 60. 화면을 가르는 밝은 줄로 읽히지 않을 만큼만.
    water += uSkyHorizon * exp(-d * 60.0) * 0.10;
    // 위는 지평선에서 얇게, 아래는 띠 높이의 절반부터 서서히 사라집니다.
    float alpha = step(p.y, H) * (1.0 - smoothstep(uBandH * 0.55, uBandH, d));
    // 무대 폭 안에서만. 양 끝은 무대 너비의 8%에 걸쳐 사라집니다.
    float bw = max(uBandX.y - uBandX.x, 1e-3);
    alpha *= smoothstep(uBandX.x, uBandX.x + bw * 0.08, p.x) * (1.0 - smoothstep(uBandX.y - bw * 0.08, uBandX.y, p.x));
    alpha *= uBandFade;
    gl_FragColor = vec4(water, alpha);
    return;
  }

  // 지평선. 화면 아래쪽 1/3 언저리입니다.
  //
  // 이 높이가 구도의 전부입니다. 위로 올리면 지평선과 등불이 로고 배지와
  // 헤드라인 뒤를 지나가고, 글자 뒤가 밝아져 대비가 떨어집니다. 내리면 수면이
  // 화면 밑단의 띠가 되어 강으로 읽히지 않습니다.
  //
  // ── 가라앉기 ──────────────────────────────────────────────────────────────
  // 캔버스가 fixed라 배경은 화면에 붙어 있습니다. 그대로 두면 등불 기둥이
  // 아래 챕터마다 따라와서, 본문 뒤가 계속 밝습니다. 히어로에서 한 번 보여
  // 주고 물러나는 편이 맞습니다.
  //
  // 서사로도 그렇습니다. 나루터는 출발하는 자리이고, 읽어 내려가는 동안
  // 방문자는 이미 거기를 떠났습니다. 30%를 지나면 화면은 밤의 남색만 남습니다.
  //
  // 대비 때문이기도 합니다(2026-09-15 접근성 감사 S-4). 캔버스가 불투명해서
  // 본문 뒤의 진짜 배경은 이 셰이더입니다. 물과 등불이 본문 구간까지 따라오면
  // 대비 하한 계산의 전제가 무너집니다. 여기서 값을 올리기 전에 반드시 본문
  // 글자와의 대비를 실제 화면에서 다시 재세요.
  float sink = smoothstep(0.02, 0.30, uScroll);
  float alive = 1.0 - sink * 0.92;

  // 지평선. 화면 아래쪽 1/3 언저리에서 시작해 가라앉습니다.
  float H = (0.315 - uScroll * 0.045) * (1.0 - sink * 0.94);

  float t = uTime * 0.11;

  // ── 하늘 ──────────────────────────────────────────────────────────────────
  float s = clamp((p.y - H) / max(1.0 - H, 0.001), 0.0, 1.0);
  vec3 sky = mix(uSkyHorizon, uSkyTop, pow(s, 0.8));
  // 아주 느린 구름 띠. 있는지 없는지 모를 정도로만.
  float cloud = snoise(vec3(p.x * 2.2, p.y * 5.0, t * 0.35)) * 0.5 + 0.5;
  sky += uSkyHorizon * cloud * 0.10 * (1.0 - s);

  // ── 등불 ──────────────────────────────────────────────────────────────────
  // 건너편에 하나. 스크롤을 따라 옆으로 아주 조금 흐릅니다. 다가가는 것이지
  // 쫓아오는 것이 아니라서, 크기는 거의 변하지 않고 자리만 바뀝니다.
  // 등불은 가운데가 아니라 왼쪽 세 번째 자리입니다. 가운데에 두면 기둥이
  // 헤드라인과 CTA 뒤를 세로로 관통합니다. 글자 뒤가 밝아지면 그 글자가
  // 읽히지 않고, 이 사이트에서 가장 중요한 두 줄이 거기 있습니다.
  // 세로 화면에서는 더 왼쪽으로 물러납니다. 폰에서는 CTA 버튼이 화면 가로의
  // 대부분을 차지해서, 0.30이면 기둥이 그 버튼 한가운데를 지나갑니다.
  float lx = mix(0.20, 0.30, smoothstep(0.75, 1.3, uAspect))
           + (uScroll - 0.5) * 0.08
           + sin(uTime * 0.05) * 0.008;
  float dx = (p.x - lx) * uAspect;
  float lamp = exp(-length(vec2(dx, (p.y - H - 0.010) * 2.4)) / 0.0115);
  sky += uLamp * lamp * 1.0 * alive;
  // 등불 둘레의 옅은 번짐
  sky += uLamp * exp(-length(vec2(dx, (p.y - H) * 1.8)) / 0.075) * 0.07 * alive;

  // ── 물 ────────────────────────────────────────────────────────────────────
  // 지평선 아래로 얼마나. **0에서 자릅니다.**
  // 자르지 않으면 지평선 위에서 d가 음수가 되고, depthAt의 (d + 0.02)가 0을
  // 지나며 z가 발산합니다. 그러면 snoise가 NaN을 돌려주고, 아래 mix가
  // mask=1(하늘)일 때도 NaN을 퍼뜨려 화면 전체가 검게 나옵니다.
  // NaN은 0을 곱해도 NaN입니다. mix로 골라내면 된다고 생각하지 마세요.
  float d = max(H - p.y, 0.0);
  float z = depthAt(d);
  vec2 w = vec2((p.x - 0.5) * uAspect * z, z);

  float n1 = snoise(vec3(w * 1.3, t));
  float n2 = snoise(vec3(w * 3.3 + 7.0, t * 1.5));
  float h  = n1 * 0.62 + n2 * 0.38;

  // 먼 물은 하늘을 되비추고, 가까운 물은 깊습니다.
  float far = 1.0 - smoothstep(0.0, 0.38, d);
  vec3 water = mix(uDeep, uSkyHorizon * 0.95, far);

  // 물비늘. 지평선 가까이에 몰립니다. 노이즈 마루의 끝만 잘라내 점으로 만듭니다.
  float glint = smoothstep(0.58, 0.93, h) * far;
  water += uGlint * glint * 0.42 * alive;

  // 등불의 반사 기둥. 이 배경에서 가장 중요한 형태입니다.
  // 멀수록 좁고 가까울수록 넓어지는 것이 물 위 불빛의 생김새입니다.
  // 세로 화면에서는 기둥도 좁힙니다. 화면 가로가 좁으면 같은 폭이라도
  // 차지하는 비율이 커집니다.
  float colW = (0.010 + d * 0.20) * mix(0.62, 1.0, smoothstep(0.75, 1.3, uAspect));
  float column = exp(-abs(dx) / colW);
  float shimmer = 0.55 + 0.45 * snoise(vec3(w * 2.0, t * 2.2));
  // 0.95에서 0.6으로. 기둥은 이 배경의 주인공이지만 본문이 그 위에 앉습니다.
  // 접근성 감사(2026-09-15)가 지적한 대로, 배경이 밝아지면 대비 계산의 전제가
  // 무너집니다. 여기 값을 올리기 전에 본문 글자와의 대비를 다시 재세요.
  water += uLamp * column * shimmer * (0.6 - smoothstep(0.0, 0.6, d) * 0.35) * alive;

  // ── 포인터 파문 ───────────────────────────────────────────────────────────
  // 물에 손을 대면 자국이 남습니다. 지평선 위에서는 아무 일도 일어나지 않습니다.
  float pd = H - uPointer.y;
  float pz = depthAt(max(pd, 0.0));
  vec2 pw = vec2((uPointer.x - 0.5) * uAspect * pz, pz);
  float r = length(w - pw);
  float ring = sin(r * 7.0 - uTime * 2.0) * exp(-r * 1.8);
  water += uGlint * max(ring, 0.0) * 0.22 * uPointerOn * step(0.0, pd) * alive;

  // ── 합치기 ────────────────────────────────────────────────────────────────
  // 지평선은 선이 아니라 아주 얇은 전환입니다. 하드 엣지로 두면 화면을 가르는
  // 자로 읽히고, 그 위에 로고가 앉습니다.
  float mask = smoothstep(H - 0.004, H + 0.004, p.y);
  vec3 col = mix(water, sky, mask);

  // 지평선 자체의 옅은 빛. 건너편이 거기 있다는 표시입니다.
  col += uSkyHorizon * exp(-abs(p.y - H) * 130.0) * 0.30 * alive;

  // ── 깊은 물 ────────────────────────────────────────────────────────────────
  // 수면이 가라앉은 자리를 이 층이 받습니다(위 sink 주석).
  //
  // 왜 필요한가: 30%를 지나면 화면에 밤의 남색만 남았습니다. 페이지의 나머지
  // 70%에는 배경이 없는 것과 같았어요. 히어로에서 한 번 보여 주고 물러나는
  // 것과, 읽어 내려가는 동안 아무 일도 일어나지 않는 것은 다릅니다.
  //
  // 세 가지만 있습니다. 흐르는 물살, 퍼지는 링, 그리고 그 한가운데의 주황 점.
  //
  // 링과 점이 로고입니다. 머리의 마스터 로고 한가운데에 흰 링과 주황 점이
  // 있고(public/naru/naru-master-rev.png), 그 표식이 물속에서 계속 파문을
  // 냅니다. 히어로를 지나 로고가 화면 밖으로 나가면, 같은 점이 물 아래에서
  // 스크롤을 따라 내려옵니다. 배경과 로고가 같은 것을 말하게 하는 유일한
  // 연결선이에요.
  //
  // ⚠️ 대비. 여기가 이 셰이더에서 가장 위험한 자리입니다. 본문 전 구간의
  // 진짜 배경이 이 층이라, 값을 올리면 흰 글자의 대비 하한이 통째로
  // 무너집니다(2026-09-15 접근성 감사 S-4). 지금 값의 휘도 기여는 물살 약
  // 0.01, 링 약 0.05, 무리 약 0.03입니다. 올리기 전에 실제 화면에서 본문
  // 글자와의 대비를 다시 재세요.
  //
  // 자리도 대비 때문입니다. 점은 등불의 세로줄에서 더 왼쪽(lx - 0.09)에
  // 있습니다. 가운데에 두면 본문 한가운데에 주황 점이 박힙니다.
  float deep = smoothstep(0.16, 0.48, uScroll);
  if (deep > 0.001) {
    // 물살. 위에서 아래로 흐릅니다. uScroll이 들어 있어서 모션 민감 설정으로
    // uTime이 멈춰도 스크롤하면 흐릅니다 - 그건 자동으로 시작되는 움직임이
    // 아니라 손가락이 만든 것이고, WCAG 2.2.2의 대상이 아닙니다.
    //
    // uFlow가 세로 주파수를 낮춥니다. 빠르게 스크롤하면 띠가 세로로 늘어나
    // 물살이 당겨지는 것처럼 보이고, 멈추면 다시 촘촘해집니다.
    float stretch = mix(3.4, 1.2, uFlow);
    float cur = snoise(vec3(p.x * 1.6, p.y * stretch - uTime * 0.06 - uScroll * 1.8, uTime * 0.05)) * 0.5 + 0.5;

    // 나루 점. 등불과 같은 세로줄에서 더 왼쪽, 스크롤을 따라 내려옵니다.
    // 한 자리에 머무르지 않는 것이 중요합니다. 멈춰 있으면 어느 문단 뒤에
    // 주황 점이 박힌 채로 그 문단을 읽게 됩니다.
    float mx = lx - 0.09;
    float my = 0.82 - uScroll * 0.64;
    vec2  q  = vec2((p.x - mx) * uAspect, p.y - my);
    float rr = length(q);

    // 링. 안에서 밖으로 계속 퍼집니다. 마루 끝만 잘라 얇은 선으로 만듭니다.
    // 감쇠 2.4는 파문을 점 둘레에 묶어 두려는 값입니다. 1.7이었을 때는 호가
    // 화면 반대편까지 건너가서, 파문이 아니라 화면을 가르는 곡선으로 읽혔어요.
    float phase = rr * 9.0 - uTime * (0.5 + uFlow * 1.6) - uScroll * 7.0;
    float rings = smoothstep(0.86, 1.0, sin(phase)) * exp(-rr * 2.4);

    vec3 dcol = uSkyHorizon * cur * (0.32 + uFlow * 0.24);
    dcol += uGlint * rings * (0.05 + uFlow * 0.045);
    // 점 하나와 그 무리. 점은 작게 둡니다 - 크게 만들면 면이 되고, 면이 되면
    // 로고 한가운데의 점이 더 이상 눈에 띄지 않습니다(파일 머리의 색 규칙).
    dcol += uLamp * (exp(-rr / 0.009) * 0.42 + exp(-rr / 0.10) * 0.055);

    col += dcol * deep;
  }

  // 가장자리를 떨어뜨려 본문이 앉는 가운데를 비웁니다.
  float vign = smoothstep(1.15, 0.25, length((p - vec2(0.5, 0.52)) * vec2(uAspect * 0.62, 1.0)));
  col *= mix(0.55, 1.0, vign);

  gl_FragColor = vec4(col, 1.0);
}
`;
