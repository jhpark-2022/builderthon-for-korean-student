"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import { categoryMeta, days, type BEvent } from "@/data/schedule";

interface EventModalProps {
  event: BEvent | null;
  onClose: () => void;
  // The element to return focus to on close (the clicked card). Captured by the
  // parent on click so focus return is reliable cross-browser (e.g. Safari does
  // not focus <button>s on click, so document.activeElement isn't dependable).
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

export default function EventModal({
  event,
  onClose,
  triggerRef,
}: EventModalProps) {
  const { t } = useLocale();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Portal target only exists on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Open/close lifecycle: ESC + focus trap, body scroll lock, inert background,
  // and focus restoration to the element that opened the modal.
  useEffect(() => {
    if (!event) return;

    // Remember what had focus (the clicked event card) to restore on close.
    // Prefer the explicit trigger ref; fall back to the focused element.
    const opener =
      triggerRef?.current ?? (document.activeElement as HTMLElement | null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (active === last || !dialogRef.current.contains(active))
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    // Save/restore (not reset to "") so we don't clobber another scroll-lock
    // owner, e.g. the Nav mobile menu, if both are open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Make the rest of the page inert/inaccessible while the dialog is open.
    // The dialog is portaled to <body>, so these siblings can be safely inerted.
    // `inert` already removes them from the a11y tree AND blocks focus (it also
    // moves focus out of the now-inert subtree), so we deliberately do NOT also
    // set aria-hidden — doing so warns when the just-clicked card still holds
    // focus inside <main>. inert is the spec-recommended approach here.
    const inerted = Array.from(
      document.querySelectorAll<HTMLElement>("header, main, footer")
    );
    inerted.forEach((el) => el.setAttribute("inert", ""));

    // Move focus into the dialog for keyboard users.
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      inerted.forEach((el) => el.removeAttribute("inert"));
      window.clearTimeout(id);
      // Return focus to the triggering card.
      opener?.focus?.();
    };
  }, [event, onClose]);

  const meta = event ? categoryMeta[event.category] : null;
  const dayMeta = event ? days.find((d) => d.day === event.day) : null;
  const isMain = event?.category === "main";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {event && meta && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          {/* Dialog — dark glass */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[85vh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0c0a18] shadow-2xl sm:rounded-3xl"
          >
            {/* Neon header strip */}
            <span
              aria-hidden
              className="h-[2px] w-full shrink-0 bg-gradient-to-r from-accent to-accent-strong"
            />

            {/* Close button */}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t(dict.modal.close)}
              className="absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
                <path
                  d="M1 1l13 13M14 1L1 14"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-7 py-8 sm:px-10 sm:py-9">
              {/* Category + day chips */}
              <div className="flex flex-wrap items-center gap-2 pr-12">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                  style={{ backgroundColor: `${meta.dot}1f`, color: meta.dot }}
                >
                  {isMain && (
                    <span className="text-gold" aria-hidden>
                      ★
                    </span>
                  )}
                  {t(meta.label)}
                </span>
                {dayMeta && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/55">
                    {t(dict.program.dayLabel)} {event.day} · {event.date} ·{" "}
                    {event.timeOfDay}
                  </span>
                )}
                {event.confirmed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent ring-1 ring-accent/20">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path
                        d="M1.5 5.2 4 7.5 8.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {t(dict.program.confirmedBadge)}
                  </span>
                )}
              </div>

              <h3
                id="event-modal-title"
                className="mt-5 text-[26px] font-bold leading-tight text-white sm:text-[34px]"
              >
                {t(event.title)}
              </h3>

              {dayMeta && (
                <p className="mt-2 text-sm font-semibold text-accent">
                  {t(dayMeta.theme)}
                </p>
              )}

              <p className="mt-6 text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">
                {t(event.description)}
              </p>

              {/* Detail rows */}
              <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-white/35">
                    {t(dict.modal.category)}
                  </dt>
                  <dd className="font-semibold text-white">
                    {t(meta.label)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-white/35">
                    {t(dict.modal.time)}
                  </dt>
                  <dd className="font-semibold text-white">
                    {t(dict.program.dayLabel)} {event.day} · {event.date} ·{" "}
                    {event.timeOfDay}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-white/35">
                    {t(dict.modal.speaker)}
                  </dt>
                  <dd className="font-semibold text-white">
                    {event.speaker ? t(event.speaker) : t(dict.modal.tbc)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-white/35">
                    {t(dict.modal.location)}
                  </dt>
                  <dd className="font-semibold text-white">
                    {event.location ? t(event.location) : t(dict.modal.tbc)}
                  </dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
