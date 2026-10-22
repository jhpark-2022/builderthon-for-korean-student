"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { coreDict as dict } from "@/data/dictionaryCore";
import type { SitePage } from "@/components/shared/PageChips";
import { isScrollLocked } from "@/lib/useBodyScrollLock";

// ─────────────────────────────────────────────────────────────────────────────
// 폰에서 원페이저 사이를 옆으로 미는 손짓. 그리는 것은 없고 document에 터치 리스너만 답니다.
//
// DECIDED 2026-10-22 (사용자: "모바일에서 swipe를 하면 한 one pager에서 다른 one pager로 넘어갈 수 있게"): 세 원페이저의
// 순서는 사이트 메뉴와 같습니다(data/dictionaryCore.ts의 pages: 홈 → 나루 → 8월 기록). 왼쪽으로 밀면 다음, 오른쪽으로
// 밀면 앞 페이지입니다. 끝에서는 돌지 않습니다(홈에서 오른쪽, 8월에서 왼쪽은 아무 일도 없음).
//
// 같은 결정(사용자: "12월 이벤트 스케줄 swipe 할 때는 다른 one pager로 이동은 하면 안 됨"): 12월 일정 블록(노선도와 Day 카드,
// NaruHome의 data-no-page-swipe)에서 시작한 손짓은 그 블록의 것입니다. 거기서는 Day 카드만 넘어갑니다. 같은 이유로
// 가로로 스크롤되는 상자(목차 레일, 8월의 카드 줄, 표), 열린 대화상자, 입력 칸에서 시작한 손짓도 페이지를 옮기지 않습니다.
// 화면 양 끝 24px은 브라우저의 뒤로/앞으로 손짓 자리라 비워 둡니다.
//
// 판단: 가로 이동 64px 이상, 세로의 2배 이상, 0.8초 안. 첫 10px에서 축이 세로로 잡히면 그 손짓은 끝까지 스크롤입니다.
// lg(1024px) 아래에서만 듣습니다. 그 위는 사이트 메뉴가 헤더에 늘 보이고 스와이프가 없습니다.
// ─────────────────────────────────────────────────────────────────────────────

export const NO_PAGE_SWIPE_ATTR = "data-no-page-swipe";

const MAX_WIDTH = 1024;
const EDGE_PX = 24;
const AXIS_LOCK_PX = 10;
const MIN_DX = 64;
const RATIO = 2;
const MAX_MS = 800;

function scrollsSideways(el: HTMLElement): boolean {
  if (el.scrollWidth <= el.clientWidth + 1) return false;
  const ox = getComputedStyle(el).overflowX;
  return ox === "auto" || ox === "scroll";
}

/** 손짓이 시작한 자리가 페이지 스와이프의 것인가. 아니면 그 자리의 것(일정 카드, 가로 스크롤, 대화상자, 입력)입니다. */
function ownsGesture(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (isScrollLocked()) return false;
  for (let el: Element | null = target; el && el !== document.body; el = el.parentElement) {
    if (el.hasAttribute(NO_PAGE_SWIPE_ATTR)) return false;
    if (el.getAttribute("role") === "dialog") return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (el as HTMLElement).isContentEditable) return false;
    if (el instanceof HTMLElement && scrollsSideways(el)) return false;
  }
  return true;
}

export default function PageSwipe({ page }: { page: SitePage }) {
  const router = useRouter();
  useEffect(() => {
    const order = dict.pages.map((p) => p.key as SitePage);
    const i = order.indexOf(page);
    if (i < 0) return;
    const prev = i > 0 ? dict.pages[i - 1] : null;
    const next = i < order.length - 1 ? dict.pages[i + 1] : null;
    // 손이 닿기 전에 양옆 페이지를 받아 둡니다. 폰에서 사이트 메뉴는 접혀 있어 Link의 prefetch가 돌지 않습니다.
    if (window.innerWidth < MAX_WIDTH) {
      if (prev) router.prefetch(prev.href);
      if (next) router.prefetch(next.href);
    }

    let start: { x: number; y: number; t: number } | null = null;
    let axis: "x" | "y" | null = null;

    const onStart = (e: TouchEvent) => {
      start = null;
      axis = null;
      if (e.touches.length !== 1 || window.innerWidth >= MAX_WIDTH) return;
      const t0 = e.touches[0];
      if (t0.clientX < EDGE_PX || t0.clientX > window.innerWidth - EDGE_PX) return;
      if (!ownsGesture(e.target)) return;
      start = { x: t0.clientX, y: t0.clientY, t: e.timeStamp };
    };
    const onMove = (e: TouchEvent) => {
      if (!start || axis) return;
      const t1 = e.touches[0];
      const dx = Math.abs(t1.clientX - start.x);
      const dy = Math.abs(t1.clientY - start.y);
      if (dx < AXIS_LOCK_PX && dy < AXIS_LOCK_PX) return;
      axis = dx > dy ? "x" : "y";
    };
    const onEnd = (e: TouchEvent) => {
      const s0 = start;
      start = null;
      if (!s0 || axis !== "x") return;
      const t1 = e.changedTouches[0];
      const dx = t1.clientX - s0.x;
      const dy = t1.clientY - s0.y;
      if (e.timeStamp - s0.t > MAX_MS) return;
      if (Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * RATIO) return;
      const to = dx < 0 ? next : prev;
      if (!to) return;
      track("page_swipe", { from: page, to: to.key });
      router.push(to.href);
    };
    const onCancel = () => {
      start = null;
      axis = null;
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onCancel);
    };
  }, [page, router]);
  return null;
}
