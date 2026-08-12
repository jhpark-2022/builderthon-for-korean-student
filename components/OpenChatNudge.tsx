"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Open-chat exit nudge — shown once per session when the register modal is
// dismissed without submitting.
//
// Deliberately a TOAST, not a dialog. The alternative (a second modal offering
// the open chat) would stack on top of a dialog that is mid-close, fight
// RegisterModal's focus restoration, and re-trap focus in the exact moment the
// visitor signalled they want out. This renders in a portal outside the dialog
// tree, takes no focus, and disappears on its own after 6s.
//
// `role="status"` + aria-live="polite" so screen readers hear it when they reach
// a pause, rather than having it interrupt. It is not `role="alert"` — nothing
// here is urgent, and an assertive announcement on a dismissal would be rude.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";

const VISIBLE_MS = 6000;

export default function OpenChatNudge({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [open, onClose]);

  // Nothing to offer without a real open-chat URL.
  if (!mounted || !links.openChat) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 20 }}
          transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          // Sits above the sticky register bar (z-40) but below the modal layer
          // (z-50+), and clears the iOS home indicator.
          className="fixed inset-x-3 z-[45] mx-auto max-w-md rounded-2xl border border-white/15 bg-[#13131f]/95 px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur sm:inset-x-6"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
        >
          <div className="flex items-start gap-3">
            <p className="flex-1 text-xs leading-relaxed text-white/75">
              {t(dict.register.openChatNudge)}{" "}
              <a
                href={links.openChat}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track("openchat_click", { src: "modal-exit" });
                  onClose();
                }}
                className="whitespace-nowrap font-bold text-violet-200 underline underline-offset-4 transition hover:text-white"
              >
                {t(dict.register.successOpenChatCta)} →
              </a>
            </p>
            {/* 보이는 크기는 그대로, 누르는 넓이만 키웁니다 (2026-08-12).
                아이콘 12px에 p-1.5라 실제 타깃이 24px 남짓이었습니다. 이 토스트는
                6초 뒤 스스로 사라지고, 바로 왼쪽이 카카오 오픈채팅 링크입니다 —
                작은 X를 급하게 겨냥하다 빗나가면 새 탭이 열립니다. 닫으려던
                사람에게 그건 최악의 결과입니다.
                버튼 상자를 키우지 않고 before 의사요소로 히트 영역만 넓히는 이유는
                레이아웃 때문입니다. 이 줄은 flex items-start라, 44px 상자를 두면
                토스트가 그만큼 두꺼워집니다. -inset-[11px]이면 약 46px입니다. */}
            <button
              type="button"
              onClick={onClose}
              aria-label={t(dict.modal.close)}
              className="relative -mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-white/55 transition before:absolute before:-inset-[11px] before:content-[''] hover:bg-white/10 hover:text-white/80"
            >
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
