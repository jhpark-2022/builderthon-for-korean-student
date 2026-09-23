"use client";

import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Turnstile 위젯(12월 등록 폼 전용, 2026-09-23). 서버 검증은 lib/register/turnstile.ts.
//
// 스크립트는 폼이 열릴 때 한 번만 싣습니다(render=explicit). 대부분의 방문자에게는 체크가
// 저절로 끝나고, 의심스러울 때만 클릭을 요구합니다. 토큰은 한 번 쓰면 끝이라, 보낸 뒤
// 실패하면 부모가 resetKey를 올려 새 토큰을 받게 합니다.
// ─────────────────────────────────────────────────────────────────────────────

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { loading = null; reject(new Error("turnstile script failed")); };
    document.head.appendChild(s);
  });
  return loading;
}

export default function TurnstileWidget({
  siteKey, action, locale, onToken, resetKey,
}: {
  siteKey: string;
  action: string;
  locale: "ko" | "en";
  onToken: (token: string | null) => void;
  resetKey: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !boxRef.current || !window.turnstile) return;
        idRef.current = window.turnstile.render(boxRef.current, {
          sitekey: siteKey,
          action,
          theme: "dark",
          size: "flexible",
          language: locale,
          callback: (t: string) => onTokenRef.current(t),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (idRef.current && window.turnstile) window.turnstile.remove(idRef.current);
      idRef.current = null;
    };
  }, [siteKey, action, locale]);

  useEffect(() => {
    if (resetKey === 0 || !idRef.current || !window.turnstile) return;
    onTokenRef.current(null);
    window.turnstile.reset(idRef.current);
  }, [resetKey]);

  return <div ref={boxRef} className="min-h-[65px]" />;
}
