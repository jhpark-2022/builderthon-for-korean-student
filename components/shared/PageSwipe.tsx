"use client";

import { useEffect, useLayoutEffect } from "react";
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
//
// DECIDED 2026-10-22 (사용자: "스와이프를 할 때 넘어가는 애니메이션이 있었으면"): Day 카드와 같은 문법입니다. 본문(#main)과
// 푸터(#site-footer)가 손가락을 따라 끌려오고(끝에서는 1/4만), 놓으면 민 쪽으로 0.24초에 빠져나간 뒤 페이지가 바뀌고, 새 페이지의
// 본문이 반대쪽에서 0.36초에 미끄러져 들어옵니다. 방향은 sessionStorage 한 칸(ENTER_KEY)으로 다음 페이지에 넘기고 2초 안에만 씁니다.
// 헤더와 배경은 제자리입니다. 본문 안의 고정 요소(오픈채팅 바)는 transform 아래에서 자리를 잃으므로 움직이는 동안만 숨깁니다
// (html[data-page-swiping], globals.css). 모션 줄이기에서는 끌림도 미끄러짐도 없이 바로 옮깁니다.
// ─────────────────────────────────────────────────────────────────────────────

export const NO_PAGE_SWIPE_ATTR = "data-no-page-swipe";

const MAX_WIDTH = 1024;
const EDGE_PX = 24;
const AXIS_LOCK_PX = 10;
const MIN_DX = 64;
const RATIO = 2;
const MAX_MS = 800;
const EXIT_MS = 240;
const ENTER_MS = 360;
const EASE = "cubic-bezier(0.22,1,0.36,1)";
const ENTER_KEY = "naru.pageSwipe";
const SWIPING_ATTR = "data-page-swiping";

type Dir = "next" | "prev";

// html[data-page-swiping]를 쥔 손의 수. 떠나는 페이지의 정리와 들어오는 페이지의 미끄러짐이 겹쳐도 먼저 놓는 쪽이 지우지 않게.
let swipingHolds = 0;
function holdSwiping() {
  swipingHolds++;
  document.documentElement.setAttribute(SWIPING_ATTR, "");
}
function releaseSwiping() {
  swipingHolds = Math.max(0, swipingHolds - 1);
  if (!swipingHolds) document.documentElement.removeAttribute(SWIPING_ATTR);
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 손가락을 따라 움직이는 것: 본문과 푸터. 헤더(JourneyNav)와 배경은 제자리입니다. */
function movers(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("#main, #site-footer"));
}

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

function readEnterDir(): Dir | null {
  try {
    const raw = window.sessionStorage.getItem(ENTER_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(ENTER_KEY);
    const [dir, at] = raw.split(":");
    if ((dir !== "next" && dir !== "prev") || Date.now() - Number(at) > 2000) return null;
    return dir;
  } catch {
    return null;
  }
}

function writeEnterDir(dir: Dir) {
  try {
    window.sessionStorage.setItem(ENTER_KEY, `${dir}:${Date.now()}`);
  } catch {
    /* 저장소가 막혀 있으면 들어오는 미끄러짐만 없습니다. */
  }
}

export default function PageSwipe({ page }: { page: SitePage }) {
  const router = useRouter();

  // 들어오는 미끄러짐. 첫 그리기 전에(useLayoutEffect) 본문을 화면 밖에 세워 두고 제자리로 보냅니다. 소프트 이동이라 한 번에 커밋됩니다.
  useLayoutEffect(() => {
    const dir = readEnterDir();
    if (!dir || window.innerWidth >= MAX_WIDTH || reducedMotion()) return;
    const from = dir === "next" ? 100 : -100;
    const anims = movers().map((el) => el.animate([{ transform: `translateX(${from}vw)` }, { transform: "none" }], { duration: ENTER_MS, easing: EASE }));
    if (!anims.length) return;
    let held = true;
    holdSwiping();
    const release = () => {
      if (!held) return;
      held = false;
      releaseSwiping();
    };
    let left = anims.length;
    anims.forEach((a) => a.addEventListener("finish", () => { if (--left <= 0) release(); }));
    return () => {
      anims.forEach((a) => a.cancel());
      release();
    };
  }, [page]);

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
    let dragging = false;
    let leaving = false;
    let settle: Animation[] = [];

    const setX = (x: number) => {
      for (const el of movers()) el.style.transform = x ? `translateX(${x}px)` : "";
    };
    const beginDrag = () => {
      if (dragging) return;
      dragging = true;
      settle.forEach((a) => a.cancel());
      settle = [];
      holdSwiping();
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      setX(0);
      releaseSwiping();
    };
    // 문턱을 못 넘겼거나 끝에서 놓았을 때: 제자리로 돌아옵니다.
    const springBack = (fromX: number) => {
      if (!fromX) return endDrag();
      const els = movers();
      setX(0);
      settle = els.map((el) => el.animate([{ transform: `translateX(${fromX}px)` }, { transform: "none" }], { duration: 200, easing: EASE }));
      let left = settle.length;
      settle.forEach((a) => a.addEventListener("finish", () => { if (--left <= 0) endDrag(); }));
    };
    const go = (to: { href: string; key: string }, dir: Dir, fromX: number) => {
      track("page_swipe", { from: page, to: to.key });
      if (reducedMotion() || !dragging) {
        endDrag();
        router.push(to.href);
        return;
      }
      leaving = true;
      writeEnterDir(dir);
      const toX = (dir === "next" ? -1 : 1) * window.innerWidth;
      setX(toX);
      const anims = movers().map((el) => el.animate([{ transform: `translateX(${fromX}px)` }, { transform: `translateX(${toX}px)` }], { duration: EXIT_MS, easing: "ease-in" }));
      let left = anims.length;
      const done = () => { if (--left <= 0) router.push(to.href); };
      if (!left) router.push(to.href);
      anims.forEach((a) => a.addEventListener("finish", done));
    };

    const onStart = (e: TouchEvent) => {
      start = null;
      axis = null;
      if (leaving || e.touches.length !== 1 || window.innerWidth >= MAX_WIDTH) return;
      const t0 = e.touches[0];
      if (t0.clientX < EDGE_PX || t0.clientX > window.innerWidth - EDGE_PX) return;
      if (!ownsGesture(e.target)) return;
      start = { x: t0.clientX, y: t0.clientY, t: e.timeStamp };
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      const t1 = e.touches[0];
      const dx = t1.clientX - start.x;
      const dy = t1.clientY - start.y;
      if (!axis) {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis !== "x" || reducedMotion()) return;
      beginDrag();
      const atEdge = (dx > 0 && !prev) || (dx < 0 && !next);
      setX(atEdge ? dx * 0.25 : dx);
    };
    const onEnd = (e: TouchEvent) => {
      const s0 = start;
      start = null;
      if (!s0 || axis !== "x") return;
      const t1 = e.changedTouches[0];
      const dx = t1.clientX - s0.x;
      const dy = t1.clientY - s0.y;
      const to = dx < 0 ? next : prev;
      const atEdge = !to;
      const fromX = dragging ? (atEdge ? dx * 0.25 : dx) : 0;
      if (!to || e.timeStamp - s0.t > MAX_MS || Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * RATIO) return springBack(fromX);
      go(to, dx < 0 ? "next" : "prev", fromX);
    };
    const onCancel = () => {
      start = null;
      axis = null;
      if (!leaving) springBack(0);
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
      settle.forEach((a) => a.cancel());
      // 떠난 페이지의 본문이 남아 있으면(같은 DOM이 재사용될 때) 밀어 둔 자리를 되돌립니다.
      setX(0);
      if (dragging) {
        dragging = false;
        releaseSwiping();
      }
    };
  }, [page, router]);
  return null;
}
