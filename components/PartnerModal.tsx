"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, type Phrase } from "@/data/dictionary";

// A sponsor/mentor whose logo was clicked. `desc` is the company intro shown in
// the modal; `stage` is an optional pill (e.g. "확정" / "협의 중") mirroring the
// tile's group.
export interface PartnerInfo {
  name: string;
  desc: Phrase;
  stage?: Phrase;
}

interface PartnerModalProps {
  partner: PartnerInfo | null;
  onClose: () => void;
  // The tile that opened the modal, so focus returns to it on close (Safari does
  // not focus <button>s on click, so document.activeElement isn't dependable —
  // same reasoning as EventModal).
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

export default function PartnerModal({
  partner,
  onClose,
  triggerRef,
}: PartnerModalProps) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ESC + focus trap, body scroll lock, inert background, focus restoration.
  // Kept in lockstep with EventModal so both dialogs behave identically.
  useEffect(() => {
    if (!partner) return;

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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const inerted = Array.from(
      document.querySelectorAll<HTMLElement>("header, main, footer")
    );
    inerted.forEach((el) => el.setAttribute("inert", ""));

    const id = window.setTimeout(() => closeRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      inerted.forEach((el) => el.removeAttribute("inert"));
      window.clearTimeout(id);
      opener?.focus?.();
    };
  }, [partner, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {partner && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          {/* Dialog — dark glass, matching EventModal */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-modal-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.985 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0c0a18] shadow-2xl sm:rounded-3xl"
          >
            <span
              aria-hidden
              className="h-[2px] w-full shrink-0 bg-gradient-to-r from-accent to-accent-strong"
            />

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t(dict.modal.close)}
              className="absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
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

            <div className="overflow-y-auto px-7 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-10 sm:py-9">
              <p className="pr-12 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                {t(dict.modal.companyAbout)}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 pr-12">
                <h3
                  id="partner-modal-title"
                  className="text-[26px] font-bold leading-tight text-white sm:text-[30px]"
                >
                  {partner.name}
                </h3>
                {partner.stage && (
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-white/70">
                    {t(partner.stage)}
                  </span>
                )}
              </div>

              <p className="mt-6 text-[15px] leading-7 text-white/75 sm:text-base sm:leading-8">
                {t(partner.desc)}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
