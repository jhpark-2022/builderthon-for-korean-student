"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 노선도, 일반형 (2026-09-17, 8월 문법 브리프).
//
// 8월 페이지의 RouteMap(Journey.tsx)은 8일짜리 스케줄과 라이브 시계(오늘·지나온 날),
// 장소 로고, 데이 모달 버튼에 묶여 있어서 그대로 꺼내면 홈에서 쓸 수 없습니다.
// 여기 있는 것은 그 노선도의 **문법**입니다: 레일 한 줄, 정거장 노드 세 층(★ 앵커 /
// ◉ 스포트라이트 / ○ 보통), 노드 아래 이름, 앵커 아래 배지, 레일 아래 초록 필,
// 범례 한 줄. 노드와 레일의 클래스는 Journey.tsx의 것과 같은 문자열입니다.
// 8월 페이지는 자기 RouteMap을 그대로 씁니다(픽셀 회귀 0이 조건).
//
// 정거장 수는 prop이 정합니다. 레일의 양끝 inset은 한 칸의 절반(50/n %)이라 노드
// 중심에서 노드 중심까지 이어집니다.
// ─────────────────────────────────────────────────────────────────────────────
export type RouteStation = {
  key: string;
  /** 노드 위 작은 줄. "DAY 1" 자리. 없으면 그리지 않습니다. */
  sub?: string;
  /** 노드 아래 이름. */
  label: string;
  kind: "anchor" | "spot" | "plain";
  /** 앵커 노드 아래 배지("★ 제출" 같은). 앵커일 때만. */
  badge?: string;
};

export default function RouteMap({
  stations,
  pill,
  legend,
  ariaLabel,
  className = "",
  current,
}: {
  stations: RouteStation[];
  /**
   * 현재 위치(정거장 인덱스). 주황 점 하나가 레일을 따라 200ms에 이동합니다(2026-09-18, 감사
   * 반영 브리프 3.6). 지나가는 ★ 정거장은 한 번 밝아집니다. prefers-reduced-motion이면 정적.
   * 이 점이 주황 허용 목록의 "노선도 현재 위치 점"입니다. 점은 하나만.
   */
  current?: number;
  /** 레일 아래 초록 필. 8월의 "1:1 멘토링 Day 3~7 매일 열려 있어요" 자리. */
  pill?: string;
  legend?: { anchor: string; plain: string; spot?: string };
  ariaLabel?: string;
  className?: string;
}) {
  const n = Math.max(1, stations.length);
  const inset = `${50 / n}%`;
  // 지나간 ★에 한 번 번쩍. current가 바뀔 때 이전 위치와 새 위치 사이의 앵커에 key를 올려
  // CSS 애니메이션을 다시 돌립니다.
  const prev = useRef<number | undefined>(current);
  const [flash, setFlash] = useState<Record<number, number>>({});
  useEffect(() => {
    const from = prev.current;
    prev.current = current;
    if (current === undefined || from === undefined || from === current) return;
    const lo = Math.min(from, current);
    const hi = Math.max(from, current);
    setFlash((f) => {
      const next = { ...f };
      stations.forEach((s, i) => {
        if (s.kind === "anchor" && i > lo && i <= hi) next[i] = (next[i] ?? 0) + 1;
        if (s.kind === "anchor" && i >= lo && i < hi && current < from) next[i] = (next[i] ?? 0) + 1;
      });
      return next;
    });
  }, [current, stations]);
  const dotLeft = current === undefined ? null : `calc(${inset} + (100% - 2 * ${inset}) * ${n > 1 ? current / (n - 1) : 0})`;
  return (
    <div className={className}>
      <ol
        aria-label={ariaLabel}
        className={`relative flex items-start ${pill ? "pb-10" : "pb-2"}`}
      >
        {/* 레일. top-[1.625rem]은 노드 줄의 중심(py-2.5 + h-8의 절반). */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-[1.625rem] h-px bg-gradient-to-r from-[#C79BB4]/40 via-white/15 to-[#C79BB4]/40"
          style={{ left: inset, right: inset }}
        />
        {dotLeft && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-[1.625rem] z-10 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-naru-orange shadow-[0_0_0_3px_rgba(7,11,31,0.9),0_0_12px_rgba(238,138,79,0.8)] transition-[left] duration-200 ease-out motion-reduce:transition-none"
            style={{ left: dotLeft }}
          />
        )}
        {stations.map((s) => {
          const anchor = s.kind === "anchor";
          const spot = s.kind === "spot";
          return (
            <li key={s.key} className="relative flex-1">
              <div className="flex w-full flex-col items-center gap-1.5 px-1 py-2.5 text-center">
                <span className="relative flex h-8 items-center justify-center">
                  {anchor ? (
                    <span
                      key={flash[stations.indexOf(s)] ?? 0}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border border-[#C79BB4]/60 bg-[#9A5A82]/40 text-[0.6rem] text-white shadow-[0_0_0_4px_rgba(10,6,20,0.85)] ${flash[stations.indexOf(s)] ? "motion-safe:animate-[starFlash_600ms_ease-out_1]" : ""}`}
                    >
                      <span aria-hidden>★</span>
                    </span>
                  ) : spot ? (
                    <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-accent/60 bg-accent/20 shadow-[0_0_0_4px_rgba(10,6,20,0.85)]">
                      <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
                    </span>
                  ) : (
                    <span className="relative h-3 w-3 rounded-full border border-white/35 bg-[#0a0614] shadow-[0_0_0_4px_rgba(10,6,20,0.85)]" />
                  )}
                </span>
                {s.sub && (
                  <span className={`text-[0.62rem] font-bold leading-none ${anchor ? "text-[#C79BB4]" : spot ? "text-accent" : "text-white/55"}`}>
                    {s.sub}
                  </span>
                )}
                <span className={`break-keep text-[0.68rem] leading-tight ${anchor || spot ? "font-bold text-white" : "text-white/75"}`}>
                  {s.label}
                </span>
                {anchor && s.badge && (
                  <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#9A5A82]/50 bg-[#9A5A82]/[0.12] px-1.5 py-0.5 text-[0.58rem] font-bold leading-none text-[#C79BB4]">
                    {s.badge}
                  </span>
                )}
              </div>
            </li>
          );
        })}
        {pill && (
          <span className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center">
            {/* 2026-09-18 (감사 반영 브리프 8): 초록은 General Mentoring 상자의 "전 기간 상시"
                배지 하나에만 남깁니다. 이 필은 같은 말을 한 번 더 하는 자리라 보라 외곽선. */}
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/40 bg-transparent px-2.5 py-1 text-[0.72rem] font-semibold leading-none text-accent">
              <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent/80" />
              {pill}
            </span>
          </span>
        )}
      </ol>
      {/* 범례는 sm부터. 폰에서는 Day 카드의 "★ 제출" 칩이 같은 뜻을 말합니다(2026-09-18). */}
      {legend && (
        <div className="mt-3 hidden flex-wrap items-center gap-x-4 gap-y-1.5 sm:flex">
          <span className="flex items-center gap-1.5 text-[0.66rem] text-[#C79BB4]/90">
            <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#C79BB4]/60 bg-[#9A5A82]/40 text-[0.42rem] text-white">★</span>
            {legend.anchor}
          </span>
          <span className="flex items-center gap-1.5 text-[0.66rem] text-white/50">
            <span aria-hidden className="h-2 w-2 rounded-full border border-white/35" />
            {legend.plain}
          </span>
          {legend.spot && (
            <span className="flex items-center gap-1.5 text-[0.66rem] text-accent/85">
              <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-accent/60 bg-accent/20">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {legend.spot}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
