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

    // Defer init by one frame. React 18 StrictMode mounts → unmounts → remounts
    // effects in dev; deferring lets the throwaway first mount's cleanup run
    // BEFORE we build the renderer, so we never create a context on a canvas
    // that's about to be torn down (which previously caused context loss +
    // the "reading 'precision'" crash on the second mount).
    const id = requestAnimationFrame(() => {
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

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
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
