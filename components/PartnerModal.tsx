"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { dict, type Phrase, type PartnerArticle } from "@/data/dictionary";

// A sponsor/mentor whose logo was clicked. `desc` is the company intro shown in
// the modal.
//
// A `stage` pill next to the name (e.g. "확정" / "협의 중") went away on
// 2026-08-10: the 협의 중 tier had already been folded away, so every caller was
// passing 확정 and the pill only ever said the one thing that was true of all of
// them. If an in-discussion tier ever returns, bring the field back with it —
// it earns its place only when there are two values to tell apart.
export interface PartnerInfo {
  name: string;
  desc: Phrase;
  // The company's own site. Host-tier tiles used to link straight out; they now
  // open this modal instead, so the link lives here rather than being lost.
  url?: string;
  // Optional press coverage, each labelled by publication (e.g. AXMOS).
  articles?: PartnerArticle[];
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

  // Declared before the lifecycle effect so the page is unfrozen before focus
  // returns to the tile — see useBodyScrollLock.
  useBodyScrollLock(!!partner);

  // ESC + focus trap, inert background, focus restoration. Kept in lockstep with
  // EventModal so both dialogs behave identically.
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

    const inerted = Array.from(
      document.querySelectorAll<HTMLElement>("header, main, footer")
    );
    inerted.forEach((el) => el.setAttribute("inert", ""));

    const id = window.setTimeout(() => closeRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", onKey);
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
          {/* Backdrop — `touch-none` backs up the scroll lock (see EventModal). */}
          <div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 cursor-default touch-none bg-black/70 backdrop-blur-sm"
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
            // dvh, NOT vh — iOS Safari에서 주소창이 펼쳐진 상태의 vh는 실제 보이는
            // 높이보다 커서 시트 위쪽(=닫기 버튼)이 화면 밖으로 밀려납니다.
            // 바텀시트 네 개가 같은 이유로 dvh입니다(RegisterModal 주석 참고).
            className="relative z-10 flex max-h-[88dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0c0a18] shadow-2xl sm:rounded-3xl"
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

            {/* overscroll-contain: a flick that hits either end stays here
                instead of scrolling the page behind the modal. */}
            <div className="overflow-y-auto overscroll-contain px-7 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-10 sm:py-9">
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
              </div>

              <p className="mt-6 text-[15px] leading-7 text-white/75 sm:text-base sm:leading-8">
                {t(partner.desc)}
              </p>

              {partner.url && (
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  {t(dict.modal.companySite)} <span aria-hidden>↗</span>
                </a>
              )}

              {partner.articles && partner.articles.length > 0 && (
                <div className="mt-7 border-t border-white/10 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                    {t(dict.modal.inTheNews)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {partner.articles.map((a) => (
                      <a
                        key={a.url}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                      >
                        {t(a.label)} <span aria-hidden className="text-white/55">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
