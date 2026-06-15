"use client";

import { useEffect, useRef, useState } from "react";
import { BackgroundScene } from "@/lib/background/scene/BackgroundScene";

/**
 * Mounts the interactive Three.js background behind page content. Client-only,
 * full-viewport, fixed. Falls back to a branded CSS gradient if WebGL is
 * unavailable or initialization throws.
 */
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene: BackgroundScene | null = null;
    let cancelled = false;

    // Reduced-motion: skip the WebGL scene entirely (no Three.js chunk, no
    // shader compile, no rAF loop) and render the branded CSS gradient. Best for
    // the motion-sensitive / low-power devices in our audience.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFailed(true);
      return;
    }

    // Build the scene off the critical path: wait for idle so the heavy Three.js
    // download + shader compile don't compete with hydrating the page content
    // (protects LCP/INP). The inner rAF keeps the StrictMode mount→unmount→
    // remount safety from before. Falls back to a timeout on Safari.
    const init = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        try {
          scene = new BackgroundScene(canvas);
          scene.start();
        } catch (e) {
          console.error("[Background] init failed, using CSS fallback", e);
          scene?.dispose();
          scene = null;
          setFailed(true);
        }
      });
    };
    const idleId: number = window.requestIdleCallback
      ? window.requestIdleCallback(init, { timeout: 1500 })
      : window.setTimeout(init, 200);

    return () => {
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
          "radial-gradient(120% 90% at 50% 30%, #1a1235 0%, #0f172a 45%, #09090b 75%, #050505 100%)",
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
