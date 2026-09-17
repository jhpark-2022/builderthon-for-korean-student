"use client";

import { useEffect, useRef, useState } from "react";
import { BackgroundScene, type BackgroundVariant } from "@/lib/background/scene/BackgroundScene";
import { MOTION_KEY } from "@/lib/motionPreference";

/**
 * Mounts the interactive Three.js background behind page content. Client-only,
 * full-viewport, fixed. Falls back to a branded CSS gradient if WebGL is
 * unavailable or initialization throws.
 */
export default function Background({ variant = "field" }: { variant?: BackgroundVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene: BackgroundScene | null = null;
    let cancelled = false;

    // We always mount the WebGL canvas when WebGL is available. Reduced-motion is
    // handled *inside* BackgroundScene as a heavily-damped "calm" variant
    // (near-frozen camera, slow particles, gentle lens/bloom) — it is no longer a
    // reason to skip the scene. The branded CSS gradient fallback is reserved for
    // genuinely unsupported / failed WebGL (the try/catch below).

    // Build the scene off the critical path: wait for idle so the heavy Three.js
    // download + shader compile don't compete with hydrating the page content
    // (protects LCP/INP). The inner rAF keeps the StrictMode mount→unmount→
    // remount safety from before. Falls back to a timeout on Safari.
    const init = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        try {
          scene = new BackgroundScene(canvas, variant);
          // 토글이 붙잡을 손잡이. 컨텍스트로 내려보내지 않는 이유는 소비처가
          // 헤더도 푸터도 아닌 어디든 될 수 있고, 그때마다 프로바이더를 한 겹
          // 더 씌우는 값이 이 한 줄보다 크기 때문입니다. 값은 함수 하나입니다.
          window.__naruSetBackgroundPaused = (p: boolean) => scene?.setPaused(p);
          scene.start();
          // 형상 라벨(NaruHome의 ShapeLabels)이 배경과 같이 뜨도록 알립니다.
          window.__naruBackgroundStarted = true;
          window.dispatchEvent(new Event("naru:bg-ready"));
          // 새로고침해도 꺼 둔 상태가 유지됩니다.
          try {
            if (window.localStorage.getItem(MOTION_KEY) === "off") scene.setPaused(true);
          } catch {
            /* storage blocked */
          }
        } catch (e) {
          console.error("[Background] init failed, using CSS fallback", e);
          scene?.dispose();
          scene = null;
          setFailed(true);
        }
      });
    };
    // DECIDED 2026-09-17: idle 대기 상한 1500 → 400ms. 홈의 히어로는 배경의 형상
    // (싱가포르·서울)이 내용의 일부라 1.5초 뒤에 뜨면 늦게 뜨는 것으로 보입니다.
    // 하이드레이션이 끝나면 바로 시작하고, 바쁘면 400ms 안에는 시작합니다.
    const idleId: number = window.requestIdleCallback
      ? window.requestIdleCallback(init, { timeout: 400 })
      : window.setTimeout(init, 100);

    return () => {
      delete window.__naruSetBackgroundPaused;
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      scene?.dispose();
      scene = null;
    };
  }, []);

  if (failed) return <CssFallback />;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}

/** Branded gradient fallback — preserves palette + atmosphere, no blank screen. */
function CssFallback() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 30%, #12246B 0%, #0B1430 45%, #070B1F 75%, #03050F 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(40% 40% at 30% 25%, rgba(124,58,237,0.25), transparent 70%), radial-gradient(35% 35% at 75% 60%, rgba(192,132,252,0.18), transparent 70%)",
        }}
      />
    </div>
  );
}
