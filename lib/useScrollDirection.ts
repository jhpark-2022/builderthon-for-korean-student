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
export function useScrollDirection({ threshold = 12, topZone = 80 } = {}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let acc = 0;
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      // A modal owns the screen — leave the chrome where it is (visible).
      if (isScrollLocked()) {
        setHidden(false);
        return;
      }
      const y = window.scrollY;
      const delta = y - last;
      last = y;

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
    };
  }, [threshold, topZone]);

  return hidden;
}
