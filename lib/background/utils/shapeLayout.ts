/**
 * 기슭 형상(싱가포르·서울)의 화면 자리.
 *
 * DECIDED 2026-09-17 (3차): 형상은 히어로 레이아웃의 일부입니다. 히어로 그리드 아래에
 * 빈 띠(NaruHome의 data-shape-anchor="band")가 있고, 형상은 그 띠 안에 섭니다.
 *
 * 왜 띠인가. 브리프의 자리(카피 뒤, 40% 감광)로 만들어 보니 싱가포르는 글자 뒤에
 * 묻히고 서울은 패널 유리에 가려져 "배경에 서울과 싱가폴이 보이지 않는다"(사용자,
 * 2000×881 캡처). 2차로 카피·패널 아래의 남는 공간에 놓았더니 큰 화면(2000×1100)
 * 에서는 히어로가 가운데 뜨고 형상만 바닥에 붙어 "너무 화면 아래에 있다"(사용자).
 * 띠를 레이아웃에 넣으면 히어로 전체(카피 + 패널 + 형상)가 한 덩어리로 가운데
 * 잡히고, 형상은 항상 카피와 패널 바로 아래에 옵니다.
 *
 * 데스크톱(lg 이상): 띠 높이 min(20vw, 24vh). 서울(비율 0.82, 기울여 0.78)이 라벨
 * 자리를 빼고 그 높이에 맞도록 너비를 정하고, 너비 상한은 24vw. 싱가포르는 같은
 * 너비, 같은 밑선. x는 카피 단(CTA 줄)과 패널 카드의 가운데.
 * 폰(lg 아래): 띠 150px. 두 형상을 나란히(각 너비 38%, x 27%/73%).
 * 앵커가 없으면 브리프의 자리(behind).
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
const LG = 1024;          // Tailwind lg. 이 아래에서는 패널이 없고 폰 띠입니다.

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

const NONE = [0, 0, 0, 0] as const;

/**
 * copy: 카피 단의 CTA 줄, panel: 카운트다운 카드, band: 히어로 아래의 띠.
 * 전부 스크롤 0 기준 뷰포트 좌표(호출자가 scrollY를 더해 둠).
 */
export function computeShapeLayout(vw: number, vh: number, a: ShapeAnchors): ShapeLayout {
  const { copy, panel, band } = a;
  if (!band) return behind(vw, vh);
  const base = band.bottom - BAND_LABEL;
  if (vw >= LG && copy && panel) {
    const w = Math.min(SHAPES.landscape.width * vw, (band.bottom - band.top - BAND_LABEL) / (SEOUL_ASPECT * COS_T));
    const hL = shapeHeight(w, SINGAPORE_ASPECT);
    const hR = shapeHeight(w, SEOUL_ASPECT);
    return {
      mode: "anchored",
      left: { cx: (copy.left + copy.right) / 2, cy: base - hL / 2, w, h: hL },
      right: { cx: (panel.left + panel.right) / 2, cy: base - hR / 2, w, h: hR },
      dimA: NONE,
      dimB: NONE,
    };
  }
  const w = BAND_WIDTH * vw;
  const hL = shapeHeight(w, SINGAPORE_ASPECT);
  const hR = shapeHeight(w, SEOUL_ASPECT);
  return {
    mode: "anchored",
    left: { cx: vw * 0.27, cy: base - hL / 2, w, h: hL },
    right: { cx: vw * 0.73, cy: base - hR / 2, w, h: hR },
    dimA: NONE,
    dimB: NONE,
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
