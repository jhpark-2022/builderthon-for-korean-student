"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { coreDict as dict } from "@/data/dictionaryCore";
import type { SitePage } from "@/components/shared/PageChips";
import { isScrollLocked } from "@/lib/useBodyScrollLock";

export const NO_PAGE_SWIPE_ATTR = "data-no-page-swipe";
const MAX_WIDTH = 1024;
const EDGE_PX = 24;
const AXIS_LOCK_PX = 10;
const MIN_DX = 64;
const RATIO = 2;
const MAX_MS = 800;

function scrollsSideways(element: HTMLElement): boolean {
  if (element.scrollWidth <= element.clientWidth + 1) return false;
  const overflow = getComputedStyle(element).overflowX;
  return overflow === "auto" || overflow === "scroll";
}

function ownsGesture(target: EventTarget | null): boolean {
  if (!(target instanceof Element) || isScrollLocked()) return false;
  for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
    if (element.hasAttribute(NO_PAGE_SWIPE_ATTR) || element.getAttribute("role") === "dialog") return false;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || (element as HTMLElement).isContentEditable) return false;
    if (element instanceof HTMLElement && scrollsSideways(element)) return false;
  }
  return true;
}

// DECIDED 2026-10-26: 페이지 이동 손짓은 유지하되 본문 끌림·퇴장·진입 애니메이션은 하지 않습니다.
export default function PageSwipe({ page }: { page: SitePage }) {
  const router = useRouter();
  useEffect(() => {
    const index = dict.pages.findIndex((item) => item.key === page);
    if (index < 0) return;
    const previous = index > 0 ? dict.pages[index - 1] : null;
    const next = index < dict.pages.length - 1 ? dict.pages[index + 1] : null;
    if (window.innerWidth < MAX_WIDTH) {
      if (previous) router.prefetch(previous.href);
      if (next) router.prefetch(next.href);
    }
    let start: { x: number; y: number; time: number } | null = null;
    let axis: "x" | "y" | null = null;
    let leaving = false;
    const cancel = () => { start = null; axis = null; };
    const onStart = (event: TouchEvent) => {
      cancel();
      if (leaving || event.touches.length !== 1 || window.innerWidth >= MAX_WIDTH || !ownsGesture(event.target)) return;
      const touch = event.touches[0];
      if (touch.clientX < EDGE_PX || touch.clientX > window.innerWidth - EDGE_PX) return;
      start = { x: touch.clientX, y: touch.clientY, time: event.timeStamp };
    };
    const onMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return cancel();
      if (!start || axis) return;
      const touch = event.touches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) >= AXIS_LOCK_PX || Math.abs(dy) >= AXIS_LOCK_PX) axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    };
    const onEnd = (event: TouchEvent) => {
      const origin = start;
      start = null;
      if (!origin || axis !== "x") return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      const destination = dx < 0 ? next : previous;
      if (!destination || event.timeStamp - origin.time > MAX_MS || Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * RATIO) return;
      leaving = true;
      track("page_swipe", { from: page, to: destination.key });
      router.push(destination.href);
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", cancel, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", cancel);
    };
  }, [page, router]);
  return null;
}
