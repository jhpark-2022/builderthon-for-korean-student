/**
 * 기슭 형상(싱가포르·서울)의 화면 자리.
 *
 * DECIDED 2026-09-17 (2차): 가로 화면에서는 히어로 카피 아래와 카운트다운 패널
 * 아래의 빈 띠에 세웁니다. 브리프의 자리(x 22%/78%, y 55%, 카피 뒤 40% 감광)로
 * 만들어 보니 싱가포르는 카피 글자 뒤에 묻혀 보이지 않았고 서울은 패널 유리에
 * 반쯤 가려졌습니다. 실제 화면 캡처(2000×881)를 본 판단: "배경에 서울과 싱가폴이
 * 보이지 않는다". 그래서 DOM의 두 사각형(카피 단의 CTA 줄, 패널 카드)을 재서
 * 그 아래 빈자리에 두 형상을 같은 너비, 같은 밑선으로 놓습니다. 감광은 없습니다.
 *
 * 빈 띠가 얕은 화면(1280×720, 1366×768 노트북)에서는 형상 너비를 뷰포트의 16%
 * 아래로 줄이지 않고, 대신 카피·패널과 겹치는 윗부분만 40%로 감광합니다. 형상의
 * 아래 대부분은 빈 띠에 남아 읽힙니다.
 *
 * 폰(lg 아래, 패널 없음): 히어로 CTA 아래에 150px 띠(data-shape-anchor="band")를
 * 두고 두 형상을 나란히 세웁니다(각 너비 38%). 브리프의 "위아래로 쌓기"는 폰
 * 히어로가 625px에서 끝나 빈 띠가 없어서 카피 뒤에 묻혔습니다. 사용자 결정
 * 2026-09-17: 띠를 추가한다(폰 페이지 길이 +약 160px, 상한 12,500을 넘는 것을 감수).
 *
 * 브리프의 자리(behind)는 앵커가 하나도 없을 때만 씁니다.
 *
 * BackgroundScene(월드 좌표 → 셰이더)과 ShapeLabels(DOM 라벨)가 같은 함수를 씁니다.
 */
import { SHAPES } from "../config";
import { SINGAPORE_ASPECT } from "../shapes/singapore";
import { SEOUL_ASPECT } from "../shapes/seoul";

export type Rect = { left: number; top: number; right: number; bottom: number };
/** 뷰포트 px. cy는 위에서부터. w는 형상(바운딩 박스) 너비, h는 기울인 뒤의 화면 높이. */
export type ShapePlacement = { cx: number; cy: number; w: number; h: number };
export type ShapeLayout = {
  mode: "anchored" | "behind";
  left: ShapePlacement;
  right: ShapePlacement;
  dimA: readonly number[];
  dimB: readonly number[];
};

const COS_T = Math.cos((SHAPES.tiltDeg * Math.PI) / 180);
const PAD_TOP = 14;      // 앵커 사각형 아래 여백
const PAD_BOTTOM = 40;   // 뷰포트 아래 여백(라벨 자리 포함)
const MIN_WIDTH = 0.16;  // 빈 띠가 얕아도 이 아래로 줄이지 않음(겹치는 부분은 감광)

export function shapeHeight(w: number, aspect: number) {
  return w * aspect * COS_T;
}

function behind(vw: number, vh: number): ShapeLayout {
  const P = vh > vw ? SHAPES.portrait : SHAPES.landscape;
  const w = P.width * vw;
  const mk = (c: { x: number; y: number }, aspect: number): ShapePlacement => ({
    cx: c.x * vw, cy: c.y * vh, w, h: shapeHeight(w, aspect),
  });
  return { mode: "behind", left: mk(P.left, SINGAPORE_ASPECT), right: mk(P.right, SEOUL_ASPECT), dimA: P.dimA, dimB: P.dimB };
}

/**
 * copy: 카피 단의 마지막 줄(CTA 줄) 사각형. panel: 카운트다운 카드 사각형.
 * 둘 다 스크롤 0 기준 뷰포트 좌표여야 합니다(호출자가 scrollY를 더해 둠).
 */
export type ShapeAnchors = { copy: Rect | null; panel: Rect | null; band: Rect | null };

const BAND_WIDTH = 0.38;  // 폰 띠 모드의 형상 너비(뷰포트 비율)
const BAND_LABEL = 26;    // 띠 안에서 라벨이 차지하는 높이

export function computeShapeLayout(vw: number, vh: number, a: ShapeAnchors): ShapeLayout {
  const { copy, panel, band } = a;
  if (band) {
    const w = BAND_WIDTH * vw;
    const hL = shapeHeight(w, SINGAPORE_ASPECT);
    const hR = shapeHeight(w, SEOUL_ASPECT);
    const base = band.bottom - BAND_LABEL;
    return {
      mode: "anchored",
      left: { cx: vw * 0.27, cy: base - hL / 2, w, h: hL },
      right: { cx: vw * 0.73, cy: base - hR / 2, w, h: hR },
      dimA: [0, 0, 0, 0],
      dimB: [0, 0, 0, 0],
    };
  }
  if (!copy || !panel) return behind(vw, vh);
  const base = vh - PAD_BOTTOM;                       // 두 형상의 밑선
  const bandL = base - (copy.bottom + PAD_TOP);
  const bandR = base - (panel.bottom + PAD_TOP);
  const wMax = SHAPES.landscape.width * vw;
  const wFit = Math.min(wMax, bandL / (SINGAPORE_ASPECT * COS_T), bandR / (SEOUL_ASPECT * COS_T));
  const w = Math.max(Math.min(wFit, wMax), MIN_WIDTH * vw);
  if (!(w > 0)) return behind(vw, vh);
  const hL = shapeHeight(w, SINGAPORE_ASPECT);
  const hR = shapeHeight(w, SEOUL_ASPECT);
  // 감광 사각형(uv, y는 아래가 0): 카피 단은 CTA 줄의 아래선 위 전부, 패널은 카드.
  // 형상이 빈 띠에 다 들어가면 겹치지 않아 아무 점도 감광되지 않습니다.
  const uv = (r: Rect, topToEdge: boolean): number[] => [
    r.left / vw, 1 - r.bottom / vh, r.right / vw, topToEdge ? 1 : 1 - r.top / vh,
  ];
  return {
    mode: "anchored",
    left: { cx: (copy.left + copy.right) / 2, cy: base - hL / 2, w, h: hL },
    right: { cx: (panel.left + panel.right) / 2, cy: base - hR / 2, w, h: hR },
    dimA: uv(copy, true),
    dimB: uv(panel, false),
  };
}

/** 스크롤 0 기준으로 되돌린 앵커 사각형. 없으면 null. */
export function readShapeAnchors(): ShapeAnchors {
  return { copy: readShapeAnchor("copy"), panel: readShapeAnchor("panel"), band: readShapeAnchor("band") };
}

export function readShapeAnchor(name: "copy" | "panel" | "band"): Rect | null {
  if (typeof document === "undefined") return null;
  const el = document.querySelector<HTMLElement>(`[data-shape-anchor="${name}"]`);
  if (!el) return null;
  const b = el.getBoundingClientRect();
  if (b.width === 0 || b.height === 0) return null;
  const sy = window.scrollY;
  return { left: b.left, top: b.top + sy, right: b.right, bottom: b.bottom + sy };
}
