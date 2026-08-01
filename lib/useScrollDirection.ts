"use client";

import { useEffect, useState } from "react";

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
 * SCROLL LOCK. Every modal in this app sets `body.style.overflow = "hidden"`
 * while open (EventModal, PartnerModal, RegisterModal, the day modal). While
 * locked, no scroll events arrive, so a bar hidden just before the modal opened
 * would stay hidden underneath it and reappear only after the next scroll. The
 * lock check pins the chrome visible for exactly that window.
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
      if (document.body.style.overflow === "hidden") {
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
