"use client";

import { useEffect } from "react";

/**
 * Freezes the page behind an open dialog.
 *
 * WHY NOT `body.style.overflow = "hidden"` (what all four dialogs used to do).
 * Probed on a phone with a day/event modal open, and it failed twice:
 *
 *   1. Dragging on the BACKDROP scrolled the page behind the modal. `overflow:
 *      hidden` on <body> only makes the BODY box non-scrollable; the viewport
 *      scroll it propagates to is the documentElement's, and this project sets
 *      `html { overflow-x: clip }` in globals.css, so the propagation that would
 *      normally carry `hidden` up to <html> never happens. The document kept
 *      scrolling.
 *   2. iOS Safari ignores the lock outright for touch scrolling — a
 *      long-standing WebKit behaviour, and the reason every scroll-lock library
 *      ships the position-fixed workaround instead.
 *
 * WHAT THIS DOES. Takes the body out of flow (`position: fixed`) and pins it at
 * its current offset via a negative `top`. With no scrollable overflow left,
 * there is nothing for a wheel or a touch drag to move — including on iOS. The
 * saved offset is put back with `window.scrollTo` on release.
 *
 * `behavior: "instant"` is not optional: `html { scroll-behavior: smooth }` is
 * set globally, so a plain `scrollTo` would ANIMATE the page back to where the
 * visitor already was — a half-second scroll they never asked for, running while
 * the modal fades out.
 *
 * DEPTH-COUNTED, because dialogs stack: tapping a session inside the day modal
 * opens EventModal on top of it, so two components hold a lock at once. Only the
 * outermost acquire snapshots the scroll offset (once the body is fixed,
 * `window.scrollY` reads 0 — a nested acquire that re-snapshotted would restore
 * the page to the top) and only the last release restores it.
 *
 * KNOWN, DELIBERATE: on a desktop engine with a classic (non-overlay) scrollbar
 * the page widens by the track — 6px here — for as long as the lock is held,
 * because a fixed body collapses the document to viewport height and the
 * scrollbar goes with it. Measured, it moves the page content and the fixed
 * chrome by the same 3px in the same direction, behind a backdrop that is fading
 * to 70% black over it, so it reads as nothing. It is left uncompensated on
 * purpose: padding the body would put the flow content back but NOT the fixed
 * header and rails (their containing block is the viewport), turning one uniform
 * nudge into two that disagree — and the alternative, holding the scrollbar open
 * with `overflow-y: scroll` on <html>, would force the used value of the
 * `overflow-x: clip` guard in globals.css to `hidden`, which that rule's comment
 * explains at length breaks `position: sticky` site-wide. `scrollbar-gutter`
 * cannot help: <html> is not a scroll container here, so it is ignored.
 *
 * The lock is also advertised as an attribute on <body>. Anything that derives
 * state from `window.scrollY` has to sit still while we hold the page at a fake
 * offset of 0, or it would snap to its top-of-page appearance the moment a modal
 * opened. Read it through `isScrollLocked()` rather than matching the attribute
 * name by hand.
 */
const LOCK_ATTR = "data-scroll-locked";

// Module-level, deliberately: the lock is a property of the document, not of any
// one component, and the dialogs that take it don't know about each other.
let depth = 0;
let savedScrollY = 0;
let savedStyle: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
} | null = null;

function acquire() {
  if (depth++ > 0) return;

  const { body } = document;
  savedScrollY = window.scrollY;
  savedStyle = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };

  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  // A fixed box shrink-wraps unless it is told otherwise, so without these the
  // page would visibly narrow to its content width as the modal opened.
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.setAttribute(LOCK_ATTR, "");
}

function release() {
  if (depth === 0) return; // defensive: unbalanced release, nothing to undo
  if (--depth > 0) return;

  const { body } = document;
  if (savedStyle) {
    body.style.position = savedStyle.position;
    body.style.top = savedStyle.top;
    body.style.left = savedStyle.left;
    body.style.right = savedStyle.right;
    body.style.width = savedStyle.width;
    savedStyle = null;
  }
  body.removeAttribute(LOCK_ATTR);
  // Attribute removed FIRST: this scroll fires listeners synchronously, and they
  // must see the page as unlocked so they resume tracking from the real offset.
  window.scrollTo({ top: savedScrollY, left: 0, behavior: "instant" });
}

/** True while any dialog is holding the page frozen. */
export function isScrollLocked() {
  return typeof document !== "undefined" && document.body.hasAttribute(LOCK_ATTR);
}

/**
 * Holds the scroll lock for as long as `active` is true. Safe to nest — see the
 * depth note above.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    acquire();
    return release;
  }, [active]);
}
