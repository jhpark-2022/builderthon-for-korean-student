// ─────────────────────────────────────────────────────────────────────────────
// 배경 움직임을 방문자가 직접 끄는 손잡이.
//
// DECIDED 2026-09-15: prefers-reduced-motion을 켠 사람에게는 배경이 완전히
// 멈춥니다(BackgroundScene의 motionScale = 0). 하지만 WCAG 2.2.2는 5초를 넘겨
// 자동으로 시작하는 모든 움직임에 "일시정지, 정지, 또는 숨김 수단"을 요구하고,
// OS 설정을 그 수단으로 인정할지는 감사자에 따라 갈립니다. 페이지 안에도 손잡이가
// 있어야 다툼이 없습니다.
//
// 저장 키가 locale과 같은 모양인 이유(문자열 하나, try/catch, 기본값이 안전한
// 쪽)는 lib/LocaleContext.tsx와 같습니다. 스토리지가 막힌 브라우저에서도
// 토글은 그 세션 동안 동작해야 하고, 읽기에 실패하면 "켜짐"으로 떨어집니다.
// 움직임이 기본값인 것이 맞습니다. 끈 사람은 다시 끄면 되지만, 켜져야 할 배경이
// 저장소 오류로 꺼져 있으면 그건 고장으로 보입니다.
// ─────────────────────────────────────────────────────────────────────────────

export const MOTION_KEY = "naru.motion";

declare global {
  interface Window {
    /** components/Background.tsx가 씬을 띄우면서 심습니다. 없으면 배경이 아직
     *  뜨지 않았거나 WebGL이 실패한 것이고, 토글은 조용히 아무 일도 안 합니다. */
    __naruSetBackgroundPaused?: (paused: boolean) => void;
    /** 씬이 start()한 뒤 true. 같은 때 "naru:bg-ready" 이벤트도 갑니다. 홈의 형상
     *  라벨(ShapeLabels)이 배경과 같이 뜨기 위해 봅니다. */
    __naruBackgroundStarted?: boolean;
  }
}

export function readMotionPaused(): boolean {
  try {
    return window.localStorage.getItem(MOTION_KEY) === "off";
  } catch {
    return false;
  }
}

export function writeMotionPaused(paused: boolean) {
  try {
    window.localStorage.setItem(MOTION_KEY, paused ? "off" : "on");
  } catch {
    /* storage blocked: 이 세션 동안만 적용됩니다 */
  }
  window.__naruSetBackgroundPaused?.(paused);
}
