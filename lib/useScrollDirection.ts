"use client";

import { useEffect, useState } from "react";
import { isScrollLocked } from "./useBodyScrollLock";

/**
 * Shared scroll-direction signal for the fixed mobile chrome (top nav, bottom
 * register bars, back-to-top button).
 *
 * WHY ONE HOOK. On a phone the header (two rows), the bottom register bar and
 * the FAB together ate a large share of a ~600px in-app-browser viewport. Each
 * one hiding on its own schedule would be worse than none of them hiding: the
 * page would flicker between four different content heights. Every piece of
 * chrome subscribes to THIS value, so they move as one surface.
 *
 * WHY A HYSTERESIS. A raw `delta > 0` test flips state on the sub-pixel jitter
 * that momentum scrolling and rubber-banding produce, which reads as a twitch.
 * The accumulator only trips after `threshold` px of travel in one direction and
 * resets whenever the direction flips, so a small wobble never reaches it.
 *
 * ALWAYS VISIBLE near the top (`topZone`): the header is part of the first
 * impression, and hiding it during the initial flick down would look broken.
 *
 * ── DECIDED 2026-08-17: 모바일 크롬 = 스크롤 중 숨김 + 정지 시 자동 복귀
 * (idle reveal) + 오버스크롤 클램프 ─────────────────────────────────────────
 *
 * IDLE REVEAL IS NOW PART OF THIS HOOK'S CONTRACT. The rule used to be purely
 * directional: hide on the way down, come back only on a deliberate scroll UP.
 * That leaves the chrome hidden for as long as the reader sits still, which is
 * exactly when they are most likely to want the register button — they stopped
 * because something caught them. Reaching it meant a scroll-up flick first,
 * which nobody thinks to do. So: `idleReveal` ms with no scroll event and the
 * chrome comes back on its own. Scrolling down hides it again immediately.
 *
 * Do not "optimise" this into a scroll-end listener: `scrollend` is still not
 * in Safari, and this hook's whole audience is mobile Safari and the KakaoTalk
 * in-app browser.
 *
 * 900은 굼떠서 450으로 (2026-08-17). 300 밑으로 내리면 드래그 중 정지 시 팝핑
 * 생김 — 조정은 300~600 사이에서.
 *
 * The timer is not armed while the scroll lock is held — the chrome is already
 * pinned visible there, and arming it would fire a redundant state write behind
 * an open modal.
 *
 * OVERSCROLL IS CLAMPED OUT. `window.scrollY` goes negative during the iOS
 * rubber-band at the top and past `scrollHeight - innerHeight` at the bottom,
 * and the KakaoTalk in-app browser's address bar collapsing produces the same
 * shape of phantom movement. Both feed the accumulator a direction flip that no
 * finger asked for, which is what made the chrome blink in and out mid-flick.
 * The delta is computed from a CLAMPED offset, so travel that only exists in
 * the bounce contributes zero.
 *
 * THRESHOLD IS 24px, not the 12 it started at. 12 was tuned watching a desktop
 * trackpad; on a phone it trips inside the deceleration of a single flick.
 *
 * SCROLL LOCK. Every modal in this app freezes the page while open (see
 * lib/useBodyScrollLock: EventModal, PartnerModal, RegisterModal, the day
 * modal). The lock pins <body> at `position: fixed`, which makes `window.scrollY`
 * read 0 for as long as it is held — so this hook has to stand down rather than
 * interpret that as a jump to the top of the page. It also means a bar hidden
 * just before the modal opened would otherwise stay hidden underneath it. The
 * lock check pins the chrome visible for exactly that window.
 *
 * Returning BEFORE `last = y` is what makes the release clean: `last` still
 * holds the real pre-lock offset, so when the modal closes and the page is
 * scrolled back, the delta is zero and nothing moves.
 *
 * @returns true when the chrome should slide out of view.
 */
export function useScrollDirection({ threshold = 24, topZone = 80, idleReveal = 450 } = {}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // The starting offset is clamped for the same reason every later one is:
    // a page restored mid-bounce would otherwise seed `last` with a value no
    // finger can return to.
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clampedY = () => Math.min(Math.max(window.scrollY, 0), maxScroll());

    let last = clampedY();
    let acc = 0;
    let frame = 0;
    let idle = 0;

    const evaluate = () => {
      frame = 0;
      // A modal owns the screen — leave the chrome where it is (visible).
      if (isScrollLocked()) {
        window.clearTimeout(idle);
        idle = 0;
        setHidden(false);
        return;
      }
      // Clamped: while the page is rubber-banding past either end, `y` stops
      // moving, so `delta` is 0 and the accumulator holds still.
      const y = clampedY();
      const delta = y - last;
      last = y;

      // Stop scrolling and the chrome comes back by itself. Re-armed on every
      // evaluation, so it only fires once the gesture has actually ended.
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        idle = 0;
        if (!isScrollLocked()) setHidden(false);
      }, idleReveal);

      if (y < topZone) {
        acc = 0;
        setHidden(false);
        return;
      }
      // Direction flip: start counting again from zero, so the threshold always
      // measures travel in ONE direction rather than a net figure.
      if ((acc > 0) !== (delta > 0)) acc = 0;
      acc += delta;

      if (acc > threshold) {
        acc = 0;
        setHidden(true);
      } else if (acc < -threshold) {
        acc = 0;
        setHidden(false);
      }
    };

    const onScroll = () => {
      // One evaluation per frame: scroll fires far more often than that, and the
      // work here writes state.
      if (!frame) frame = requestAnimationFrame(evaluate);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(idle);
    };
  }, [threshold, topZone, idleReveal]);

  return hidden;
}
