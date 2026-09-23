"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { readMotionChoice, writeMotionPaused } from "@/lib/motionPreference";

// ─────────────────────────────────────────────────────────────────────────────
// 배경 움직임 끄기.
//
// WCAG 2.2.2 Pause, Stop, Hide. 파티클 필드와 수면은 무한히 돕니다.
// prefers-reduced-motion을 켠 사람에게는 이미 완전히 멈추지만, 그 설정을
// 2.2.2의 "수단"으로 인정할지는 감사자에 따라 갈립니다. 페이지 안에도 손잡이가
// 있어야 다툼이 없습니다.
//
// 자리는 푸터입니다. 헤더가 아닌 이유는 폭입니다. 375px 헤더에 로고와 퀴즈 칩과
// 언어 토글이 이미 들어 있고, 네 번째 칩을 넣으면 그 줄이 넘칩니다. 그리고 이건
// 설정이지 행동이 아니라, 언어 토글과 같은 계열로 아래쪽에 두는 편이 맞습니다.
//
// 서버 렌더와 첫 클라이언트 렌더가 반드시 같아야 해서 초기값을 false로 두고
// 마운트 뒤에 저장값으로 보정합니다(LocaleProvider와 같은 패턴). 그 사이 한
// 프레임 동안 "끄기"로 보였다가 "켜기"로 바뀔 수 있는데, 글자만 바뀌고 자리는
// 그대로라 레이아웃이 움직이지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
const COPY = {
  pause: { ko: "배경 움직임 끄기", en: "Stop the background" },
  play: { ko: "배경 움직임 켜기", en: "Start the background" },
} as const;

// compact: 아이콘만(44px), 라벨은 aria-label. 헤더용(2026-09-18, 감사 반영 브리프 2.4). 푸터 것은
// 그대로 글자 버튼입니다. 둘이 같은 저장값을 읽고 씁니다.
export default function MotionToggle({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useLocale();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // prefers-reduced-motion이면 배경은 이미 멈춰 있으므로(BackgroundScene motionScale 0) 초기 표시도
    // "멈춤"(감사 반영 브리프 2.4). 저장값이 있으면 저장값.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 2026-09-23: 페이지 안에서 켠 적이 있으면("on") 동작 줄이기가 켜져 있어도 켜짐으로 보입니다.
    // 배경도 그 값을 따릅니다(components/Background.tsx).
    const saved = readMotionChoice();
    setPaused(saved === "off" || (reduce && saved !== "on"));
    // 배경은 requestIdleCallback 뒤에 뜹니다(components/Background.tsx). 이
    // 컴포넌트가 먼저 마운트되면 그 시점에는 손잡이가 아직 없어서, 저장된 "꺼짐"이
    // 적용되지 않습니다. 그래서 Background 쪽도 자기가 뜰 때 저장값을 한 번
    // 읽습니다. 둘 중 나중에 오는 쪽이 이깁니다.
  }, []);

  return (
    <button
      type="button"
      // aria-pressed가 아니라 라벨이 상태를 말합니다. 토글 버튼의 aria-pressed는
      // "눌린 상태"를 뜻하는데, 여기서 눌림은 켜짐인지 꺼짐인지 사람마다 다르게
      // 읽습니다. 라벨이 다음에 일어날 일을 말하면 그 모호함이 없습니다.
      onClick={() => {
        const next = !paused;
        setPaused(next);
        writeMotionPaused(next);
      }}
      aria-label={compact ? t(paused ? COPY.play : COPY.pause) : undefined}
      className={
        compact
          ? `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs text-white/70 transition hover:border-white/30 hover:text-white ${className}`
          : `inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/55 transition hover:border-white/30 hover:text-white ${className}`
      }
    >
      <span aria-hidden className="text-[0.7rem]">{paused ? "▶" : "❙❙"}</span>
      {!compact && t(paused ? COPY.play : COPY.pause)}
    </button>
  );
}
