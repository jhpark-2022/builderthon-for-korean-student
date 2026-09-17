/**
 * 기슭 형상(싱가포르·서울)의 화면 자리. 무대(stage) 하나에서 전부 나옵니다.
 *
 * DECIDED 2026-09-17 (배경 수정 브리프): 형상은 히어로 오른쪽 단의 시각물입니다.
 * 8월 히어로에서 메탈 휴먼이 오른쪽 단을 차지했듯, 크로싱 서울 히어로에서는 두
 * 형상이 그 자리를 차지합니다. NaruHome의 `data-shape-anchor="stage"`(데스크톱은
 * 오른쪽 단 전체, 폰은 카피 아래 한 단)의 사각형을 재서 그 안에 놓습니다.
 *
 * 이전의 시도 둘은 버렸습니다. "남는 자리에 놓기"(카피·패널 아래)와 "히어로 아래
 * 띠"는 900px 화면에서 형상이 접힘선 아래로 내려갔습니다(프로덕션 실측: 라벨 y 939).
 *
 * 무대 안: 싱가포르 왼쪽, 서울 오른쪽, 사이에 강(빈 간격)과 등불. 각 형상 너비 =
 * 무대 너비의 40%(폰 42%), 사이 12%(폰 8%). 같은 밑선. 라벨은 형상 아래 12px.
 * 등불은 두 형상 사이, 밑선보다 조금 아래. 반사 띠는 무대 폭 안에서만, 높이는
 * 무대의 10%.
 *
 * BackgroundScene(월드 좌표 → 셰이더)과 ShapeLabels(DOM 라벨)가 같은 함수를 씁니다.
 */
import { SINGAPORE_ASPECT } from "../shapes/singapore";
import { SEOUL_ASPECT } from "../shapes/seoul";

export type Rect = { left: number; top: number; right: number; bottom: number };
/** 뷰포트 px. cy는 위에서부터. w는 형상(바운딩 박스) 너비, h는 높이. */
export type ShapePlacement = { cx: number; cy: number; w: number; h: number };
export type StageLayout = {
  stage: Rect;
  left: ShapePlacement;
  right: ShapePlacement;
  /** 두 형상의 밑선(px, 위에서부터) */
  base: number;
  lantern: { cx: number; cy: number };
  /** 반사 띠: 무대의 x 범위와 높이(px) */
  band: { x0: number; x1: number; h: number };
};

export const STAGE = {
  landscape: { shapeW: 0.40, gap: 0.12 },
  portrait: { shapeW: 0.42, gap: 0.08 },
  labelGap: 12,       // 형상 아래 라벨까지
  labelH: 14,         // 라벨 글줄 높이(11px 대문자)
  lanternDrop: 0.06,  // 등불: 밑선 아래로 무대 너비의 6%
  bandH: 0.10,        // 반사 띠 높이: 무대 높이의 10%
} as const;

const LG = 1024; // Tailwind lg. 이 아래에서는 폰 무대(카피 아래 한 단).

export function computeStageLayout(vw: number, vh: number, stage: Rect | null): StageLayout | null {
  if (!stage) return null;
  const P = vw < LG ? STAGE.portrait : STAGE.landscape;
  const sw = stage.right - stage.left;
  const sh = stage.bottom - stage.top;
  if (sw <= 0 || sh <= 0) return null;
  const w = P.shapeW * sw;
  const hL = w * SINGAPORE_ASPECT;
  const hR = w * SEOUL_ASPECT;
  const cx = (stage.left + stage.right) / 2;
  const cy = (stage.top + stage.bottom) / 2;
  // 형상 블록(서울 높이 + 라벨)을 무대의 세로 가운데에. 밑선은 그 블록의 서울 밑.
  const block = hR + STAGE.labelGap + STAGE.labelH;
  const base = cy - block / 2 + hR;
  const half = (w + P.gap * sw) / 2;
  return {
    stage,
    left: { cx: cx - half, cy: base - hL / 2, w, h: hL },
    right: { cx: cx + half, cy: base - hR / 2, w, h: hR },
    base,
    lantern: { cx, cy: base + STAGE.lanternDrop * sw },
    band: { x0: stage.left, x1: stage.right, h: STAGE.bandH * sh },
  };
}

/** 보이는 무대 요소(데스크톱·폰 중 display된 쪽) */
export function findStageElement(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  for (const el of document.querySelectorAll<HTMLElement>('[data-shape-anchor="stage"]')) {
    const b = el.getBoundingClientRect();
    if (b.width > 0 && b.height > 0) return el;
  }
  return null;
}

/** 무대 사각형. 스크롤 0 기준으로 되돌린 뷰포트 좌표. 없으면 null. */
export function readStageRect(): Rect | null {
  const el = findStageElement();
  if (!el) return null;
  const b = el.getBoundingClientRect();
  const sy = window.scrollY;
  return { left: b.left, top: b.top + sy, right: b.right, bottom: b.bottom + sy };
}
