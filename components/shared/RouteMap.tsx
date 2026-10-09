"use client";

import { useEffect, useRef, useState } from "react";
import { META } from "@/components/ui/typography";

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
  /**
   * 그날의 마일스톤 한 줄(2026-10-10, 마일스톤 브리프 2.1). 이름 아래에 META 크기로, 앞에 주황 점을 붙여 그립니다.
   * 주황은 현재 위치 점과 같은 naru-orange이고 점으로만 씁니다. 글자 색과 크기는 새로 만들지 않습니다.
   * 배지, 범례와 같이 sm부터 그립니다. 폰에서는 정거장 한 칸이 67px이라 한 줄이 네댓 줄로 끊깁니다.
   * 폰에서는 날짜별 일정의 각 행이 같은 말을 합니다(NaruHome).
   */
  milestone?: string;
};

export default function RouteMap({
  stations,
  pills,
  legend,
  ariaLabel,
  className = "",
  current,
}: {
  stations: RouteStation[];
  /**
   * 현재 위치(정거장 인덱스). 주황 점 하나가 레일을 따라 200ms에 이동합니다(2026-09-18, 감사
   * 반영 브리프 3.6). 지나가는 ★ 정거장은 한 번 밝아집니다. prefers-reduced-motion이면 정적.
   * 이 점이 주황 허용 목록의 "노선도 현재 위치 점"입니다. 움직이는 점은 하나만.
   * (2026-10-10: 마일스톤 줄 앞의 작은 주황 점이 더해졌습니다. 그것은 움직이지 않는 표식입니다.)
   */
  current?: number;
  /**
   * 레일 아래의 필들. 8월의 "1:1 멘토링 Day 3~7 매일 열려 있어요" 자리.
   * 2026-10-08 (프로그램 브리프 2.5): 하나(pill)에서 여럿(pills)으로. 세로로 쌓습니다. 외곽선과 크기는 같고 점의
   * 색만 다릅니다: 첫째는 accent, 둘째부터는 노선도의 현재 위치 점과 같은 주황(naru-orange). 새 색은 만들지 않습니다.
   */
  pills?: string[];
  legend?: { anchor: string; plain: string; spot?: string; milestone?: string };
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
      {/* role="list" (2026-09-19, 접근성 감사 10): Tailwind preflight가
          `ol { list-style: none }`을 걸고, Safari/VoiceOver는 그때 목록 역할을
          떼어 냅니다. 역할이 generic으로 떨어지면 **aria-label까지 통째로
          무시되어** 폰에서 노선도가 이름 없는 글자 더미가 됩니다. 이 레포의
          다른 목록들은 이미 role="list"를 달고 있습니다. */}
      <ol
        role="list"
        aria-label={ariaLabel}
        // 2026-10-08: 필이 ol 안의 absolute에서 ol 아래의 보통 흐름으로 나왔습니다. 필이 둘이 되고 폰에서 각각 두 줄로
        // 접혀도 높이가 저절로 늘어 아래 범례, 다음 블록과 겹치지 않습니다. pb-7은 ★ 정거장 아래에 매달린 배지의 자리입니다.
        // 2026-10-10 (마일스톤 브리프 2.1): items-start에서 items-stretch로. 마일스톤 줄이 칸마다 한 줄에서 세 줄까지 달라서,
        // 배지(top-full)가 자기 칸의 끝이 아니라 가장 긴 칸의 끝 아래에 매달려야 옆 칸의 마일스톤과 겹치지 않습니다.
        className={`relative flex items-stretch ${pills && pills.length ? "pb-7" : "pb-2"}`}
      >
        {/* 레일. top-[1.625rem]은 노드 줄의 중심(py-2.5 + h-8의 절반). */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-[1.625rem] h-px bg-gradient-to-r from-naru-plum-tint/40 via-white/15 to-naru-plum-tint/40"
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
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border border-naru-plum-tint/60 bg-[#9A5A82]/40 text-[0.6rem] text-white shadow-[0_0_0_4px_rgba(10,6,20,0.85)] ${flash[stations.indexOf(s)] ? "motion-safe:animate-[starFlash_600ms_ease-out_1]" : ""}`}
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
                  // 2026-10-07 (이슈 브리프 4): 이 파일의 글자는 전부 META(13.5px)입니다. 그 전의 0.58~0.72rem은
                  // 홈에서 12.24px로 올려 그리고 있었습니다(globals.css의 naru-min12). 회색은 /65 이상.
                  <span className={`${META} font-bold leading-none ${anchor ? "text-naru-plum-tint" : spot ? "text-accent" : "text-white/65"}`}>
                    {s.sub}
                  </span>
                )}
                <span className={`break-keep ${META} leading-tight ${anchor || spot ? "font-bold text-white" : "text-white/75"}`}>
                  {s.label}
                </span>
                {s.milestone && (
                  <span className={`hidden break-keep ${META} leading-tight text-white/75 sm:block`}>
                    <span aria-hidden className="mr-1.5 inline-block h-[6px] w-[6px] -translate-y-[2px] rounded-full bg-naru-orange" />
                    {s.milestone}
                  </span>
                )}
                {/* 배지는 sm부터 (2026-09-19, 모바일 감사 3). 폰에서 정거장 한 칸이
                    67px인데 영어 배지는 "Submission The problem statement"(약 186px)와
                    "Submission The build"(약 120px)이라, 가운데 정렬된 두 배지가
                    175~194px 구간에서 **서로 겹쳐 글자가 포개졌습니다.** 한국어는
                    "제출 정의서"(약 85px)라 겹치지 않는 영어 전용 파손이었어요.
                    같은 뜻은 폰의 Day 카드 안 칩이 이미 말하고, 바로 아래 범례도
                    같은 이유로 sm부터입니다(규칙이 일관됩니다). 노드의 ★는 남습니다. */}
                {anchor && s.badge && (
                  <span className={`absolute left-1/2 top-full mt-0.5 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-[#9A5A82]/50 bg-[#9A5A82]/[0.12] px-1.5 py-0.5 ${META} font-bold leading-none text-naru-plum-tint sm:inline-flex`}>
                    {s.badge}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {pills && pills.length > 0 && (
        <div className="flex flex-col items-center gap-1.5">
          {pills.map((p, i) => (
            // 2026-09-18 (감사 반영 브리프 8): 초록은 General Mentoring 상자의 기간 배지 하나에만 남깁니다. 필은 보라 외곽선.
            // whitespace-nowrap은 sm부터 (2026-09-19, 모바일 감사 11). 폰에서는 접히게 두고 가운데 정렬합니다.
            <span key={i} className={`flex max-w-full items-center gap-1.5 rounded-full border border-accent/40 bg-transparent px-2.5 py-1 text-center ${META} font-semibold leading-tight text-accent sm:whitespace-nowrap sm:leading-none`}>
              <span aria-hidden data-pill-dot className={`h-[7px] w-[7px] shrink-0 rounded-full ${i === 0 ? "bg-accent/80" : "bg-naru-orange"}`} />
              {p}
            </span>
          ))}
        </div>
      )}
      {/* 범례는 sm부터. 폰에서는 Day 카드의 "★ 제출" 칩이 같은 뜻을 말합니다(2026-09-18). */}
      {legend && (
        <div className="mt-3 hidden flex-wrap items-center gap-x-4 gap-y-1.5 sm:flex">
          <span className={`flex items-center gap-1.5 ${META} text-naru-plum-tint/90`}>
            <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-naru-plum-tint/60 bg-[#9A5A82]/40 text-[0.42rem] text-white">★</span>
            {legend.anchor}
          </span>
          <span className={`flex items-center gap-1.5 ${META} text-white/65`}>
            <span aria-hidden className="h-2 w-2 rounded-full border border-white/35" />
            {legend.plain}
          </span>
          {legend.milestone && (
            <span className={`flex items-center gap-1.5 ${META} text-white/75`}>
              <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-naru-orange" />
              {legend.milestone}
            </span>
          )}
          {legend.spot && (
            <span className={`flex items-center gap-1.5 ${META} text-accent/85`}>
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
