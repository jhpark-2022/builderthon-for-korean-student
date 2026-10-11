"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { META } from "@/components/ui/typography";

// ─────────────────────────────────────────────────────────────────────────────
// 사진 크게 보기 (DECIDED 2026-10-11, 사용자: "이거 클릭하면 더 큰 이미지로 볼 수 있도록").
//
// 히어로의 사진 넷은 칸이 280px 안팎이라 단체 사진의 얼굴이 읽히지 않습니다. 누르면
// 원본(1200×900)을 화면에 맞춰 띄웁니다. 좌우 화살표(버튼, 키보드)로 넘기고, 바깥을
// 누르거나 Esc로 닫습니다. 스크롤 잠금, inert, 포커스 가두기와 되돌리기는 PartnerModal과
// 같은 순서입니다. 바탕은 밝은 판 없이 사이트 바탕을 어둡게 덮습니다.
// ─────────────────────────────────────────────────────────────────────────────
export type LightboxPhoto = { src: string; alt: string; width: number; height: number; caption?: string };

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
const ROUND = "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#070B1F]/70 text-white/80 backdrop-blur-sm transition hover:bg-white/10 hover:text-white active:scale-95";

export default function PhotoLightbox({ photos, index, onIndex, onClose, labels }: {
  photos: LightboxPhoto[];
  /** 열린 사진. null이면 닫혀 있습니다. */
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  labels: { close: string; prev: string; next: string };
}) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const open = index !== null;
  const n = photos.length;
  useBodyScrollLock(open);

  // 키 핸들러가 매 렌더의 index를 읽도록 ref에 둡니다. 효과는 열릴 때 한 번만 겁니다
  // (사진을 넘길 때마다 inert와 포커스를 다시 걸지 않게).
  const state = useRef({ index, onIndex, onClose, n });
  state.current = { index, onIndex, onClose, n };

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      const s = state.current;
      if (e.key === "Escape") return s.onClose();
      if (s.index !== null && s.n > 1 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        return s.onIndex((s.index + (e.key === "ArrowRight" ? 1 : s.n - 1)) % s.n);
      }
      if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (nodes.length === 0) return e.preventDefault();
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const inerted = Array.from(document.querySelectorAll<HTMLElement>("header, main, footer"));
    inerted.forEach((el) => el.setAttribute("inert", ""));
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      inerted.forEach((el) => el.removeAttribute("inert"));
      window.clearTimeout(id);
      opener?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;
  const photo = index !== null ? photos[index] : null;
  const step = (d: number) => index !== null && onIndex((index + d + n) % n);

  return createPortal(
    <AnimatePresence>
      {photo && index !== null && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div aria-hidden onClick={onClose} className="absolute inset-0 cursor-zoom-out touch-none bg-[#070B1F]/90 backdrop-blur-sm" />

          {/* figure는 사진만큼만 자리를 잡습니다. 그 밖을 누르면 뒤의 바탕이 받아 닫힙니다. */}
          {/* 폭은 원본 폭, 화면 폭, "높이 80dvh에 맞는 폭" 중 가장 작은 값입니다. 폭을 여기서 정해야 사진이 비율대로 섭니다
              (figure에 폭이 없으면 max-w-full이 기댈 데가 없어 사진이 0으로 접힙니다).
              dvh: 폰 주소창이 펼쳐진 상태에서도 사진과 아래 한 줄이 화면 안에 섭니다(PartnerModal과 같은 이유). */}
          <figure
            className="pointer-events-none relative z-10 flex w-full flex-col items-center"
            style={{ maxWidth: `min(${photo.width}px, calc(80dvh * ${photo.width} / ${photo.height}))` }}
          >
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 1264px) 100vw, 1200px"
              // 눌러서 연 사진이라 바로 받습니다. 기본값(lazy)이면 빈 틀이 먼저 보입니다.
              loading="eager"
              className="pointer-events-auto h-auto w-full rounded-2xl border border-white/10 object-contain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
            />
            <figcaption className={`mt-3 flex items-center gap-2.5 ${META} text-white/85`}>
              {photo.caption && <span className="font-bold text-white">{photo.caption}</span>}
              {n > 1 && <span className="tabular-nums text-white/70">{index + 1} / {n}</span>}
            </figcaption>
          </figure>

          <button ref={closeRef} type="button" onClick={onClose} aria-label={labels.close} className={`absolute right-3 top-3 z-20 sm:right-6 sm:top-6 ${ROUND}`}>
            <svg aria-hidden width="16" height="16" viewBox="0 0 15 15" fill="none"><path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          </button>
          {n > 1 && (
            <>
              <button type="button" onClick={() => step(-1)} aria-label={labels.prev} className={`absolute left-3 top-1/2 z-20 -translate-y-1/2 sm:left-6 ${ROUND}`}>
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
              </button>
              <button type="button" onClick={() => step(1)} aria-label={labels.next} className={`absolute right-3 top-1/2 z-20 -translate-y-1/2 sm:right-6 ${ROUND}`}>
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
