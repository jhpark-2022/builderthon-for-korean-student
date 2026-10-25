"use client";

// 매니페스토를 사이트 안에서 넘겨 보는 뷰어.
//
// DECIDED 2026-10-25 (사용자: "매니페스토 내려받는게 아니라, 웹사이트에서 그냥 스와이핑해서 페이지 넘겨서 볼 수 있게"):
// 내려받기 버튼 대신 PDF의 쪽을 이미지로 뽑아(public/naru/manifesto/{ko,en}-N.jpg) 옆으로 넘깁니다.
// 폰 폭에 A4 한 장이면 본문 글자가 작아서, 쪽을 누르면 전체 화면으로 커지고 거기서도 넘기고 확대해 읽습니다.
// 넘기기는 라이브러리 없이 가로 스크롤 스냅입니다. 손가락 스와이프, 트랙패드, 키보드(←, →, Esc)가 같은 길로 갑니다.
// PDF가 바뀌면 이미지도 다시 뽑습니다:
//   pdftoppm -png -scale-to-x 1400 -scale-to-y -1 <pdf> public/naru/manifesto/ko  (영문은 en) 후 sips로 jpeg 82.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "@vercel/analytics";
import { BODY, META } from "@/components/ui/typography";

const PAGES = { ko: 6, en: 8 } as const;
// 뽑은 이미지의 크기(1400 x 1982, A4 비율).
const W = 1400;
const H = 1982;

type Props = { locale: "ko" | "en"; t: (p: { ko: string; en: string }) => string };

function useSnapIndex(ref: React.RefObject<HTMLDivElement | null>, count: number, active = true) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const slides = Array.from(el.querySelectorAll<HTMLElement>(":scope > [data-slide]"));
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      setIndex(Math.min(best, count - 1));
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref, count, active]);
  const go = useCallback((i: number, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    const s = el.querySelectorAll<HTMLElement>(":scope > [data-slide]")[Math.max(0, Math.min(count - 1, i))];
    if (!s) return;
    el.scrollTo({ left: s.offsetLeft - (el.clientWidth - s.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  }, [ref, count]);
  return { index, go };
}

function Arrow({ dir, onClick, disabled, label, className = "" }: { dir: "prev" | "next"; onClick: () => void; disabled: boolean; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0B1430]/80 text-white/85 backdrop-blur-sm transition hover:border-white/30 hover:text-white disabled:pointer-events-none disabled:opacity-30 ${className}`}
    >
      <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 ${dir === "prev" ? "rotate-180" : ""}`}><path d="M4.5 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

export default function ManifestoViewer({ locale, t }: Props) {
  const count = PAGES[locale];
  const srcs = Array.from({ length: count }, (_, i) => `/naru/manifesto/${locale}-${i + 1}.jpg`);
  const alt = (i: number) => t({ ko: `나루 매니페스토 ${i + 1}쪽`, en: `NARU manifesto, page ${i + 1}` });

  const inline = useRef<HTMLDivElement>(null);
  const full = useRef<HTMLDivElement>(null);
  const a = useSnapIndex(inline, count);
  const [open, setOpen] = useState(false);
  // 전체 화면 트랙은 열릴 때 생기므로 open이 바뀌면 다시 붙습니다.
  const b = useSnapIndex(full, count, open);
  const opener = useRef<HTMLElement | null>(null);

  // 로케일이 바뀌면 첫 쪽으로.
  useEffect(() => { a.go(0, false); }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAt = (i: number, from: HTMLElement) => {
    opener.current = from;
    setOpen(true);
    track("naru_cta", { src: "join", to: "manifesto-view" });
    requestAnimationFrame(() => b.go(i, false));
  };
  const close = useCallback(() => {
    setOpen(false);
    a.go(b.index, false);
    opener.current?.focus();
  }, [a, b.index]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") b.go(b.index + 1);
      else if (e.key === "ArrowLeft") b.go(b.index - 1);
    };
    window.addEventListener("keydown", onKey);
    full.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, close, b]);

  const prevLabel = t({ ko: "앞 쪽", en: "Previous page" });
  const nextLabel = t({ ko: "다음 쪽", en: "Next page" });
  const counter = (i: number) => `${i + 1} / ${count}`;

  return (
    <div className="mt-[27px] lg:mt-[32px]">
      {/* 쪽은 가운데에 서고 양옆 쪽이 조금 보여 넘길 수 있다는 것을 말합니다. */}
      <div
        ref={inline}
        role="region"
        aria-roledescription="carousel"
        aria-label={t({ ko: "매니페스토 쪽 넘겨 보기", en: "Manifesto pages" })}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); a.go(a.index + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); a.go(a.index - 1); }
        }}
        className="-mx-[22.5px] flex snap-x snap-mandatory gap-[12px] overflow-x-auto overscroll-x-contain pb-[4px] [scrollbar-width:none] focus-visible:outline-none sm:mx-0 sm:gap-[16px] sm:[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] [&::-webkit-scrollbar]:hidden"
      >
        {/* 첫 쪽과 끝 쪽도 가운데에 서도록 양끝에 빈 칸. 폭 % 는 패딩 없는 트랙 폭 기준입니다. */}
        <span aria-hidden className="w-[calc((100%-min(78vw,420px))/2-12px)] shrink-0 sm:w-[calc((100%-420px)/2-16px)]" />
        {srcs.map((src, i) => (
          <button
            data-slide
            key={src}
            type="button"
            onClick={(e) => openAt(i, e.currentTarget)}
            aria-label={`${alt(i)}, ${t({ ko: "크게 보기", en: "open full screen" })}`}
            className="w-[min(78vw,420px)] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            style={{ opacity: i === a.index ? 1 : 0.55 }}
          >
            <Image src={src} alt="" width={W} height={H} sizes="(min-width: 640px) 420px, 78vw" loading={i < 2 ? "eager" : "lazy"} className="block h-auto w-full" />
          </button>
        ))}
        <span aria-hidden className="w-[calc((100%-min(78vw,420px))/2-12px)] shrink-0 sm:w-[calc((100%-420px)/2-16px)]" />
      </div>
      <div className="mt-[16px] flex items-center justify-center gap-[16px]">
        <Arrow dir="prev" onClick={() => a.go(a.index - 1)} disabled={a.index === 0} label={prevLabel} />
        <span aria-live="polite" className={`${META} min-w-[3.5rem] tabular-nums text-white/70`}>{counter(a.index)}</span>
        <Arrow dir="next" onClick={() => a.go(a.index + 1)} disabled={a.index === count - 1} label={nextLabel} />
      </div>
      <p className={`mt-[8px] ${META} text-white/50`}>{t({ ko: "쪽을 누르면 크게 봅니다", en: "Tap a page to read it full screen" })}</p>

      {/* 전체 화면. 폰은 폭에 맞춰 세로로 스크롤하며 읽고, 데스크톱은 높이에 맞춥니다. 손가락으로 확대할 수 있습니다. */}
      {/* 포털: 이 블록을 감싼 Reveal의 transform 안에서는 fixed가 화면이 아니라 그 상자를 기준으로 잡힙니다. */}
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={t({ ko: "매니페스토", en: "Manifesto" })} className="fixed inset-0 z-[1000] flex flex-col bg-[#070B1F]/95 backdrop-blur-sm">
          <div className="flex shrink-0 items-center justify-between px-[16px] py-[10px]">
            <span aria-live="polite" className={`${META} tabular-nums text-white/70`}>{counter(b.index)}</span>
            <button type="button" onClick={close} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 ${BODY} text-white/85 transition hover:border-white/30 hover:text-white`}>
              {t({ ko: "닫기", en: "Close" })}
              <span aria-hidden>×</span>
            </button>
          </div>
          <div
            ref={full}
            tabIndex={-1}
            className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
          >
            {srcs.map((src, i) => (
              <div key={src} data-slide className="flex h-full w-full shrink-0 snap-center justify-center overflow-y-auto px-[8px] pb-[16px] sm:px-[24px]">
                <Image src={src} alt={alt(i)} width={W} height={H} sizes="(min-width: 640px) 70vh, 100vw" loading={Math.abs(i - b.index) <= 1 ? "eager" : "lazy"} className="h-auto w-full max-w-[900px] self-start rounded-lg sm:h-full sm:w-auto sm:max-w-full sm:object-contain" />
              </div>
            ))}
          </div>
          <Arrow dir="prev" onClick={() => b.go(b.index - 1)} disabled={b.index === 0} label={prevLabel} className="absolute left-[16px] top-1/2 hidden -translate-y-1/2 sm:flex" />
          <Arrow dir="next" onClick={() => b.go(b.index + 1)} disabled={b.index === count - 1} label={nextLabel} className="absolute right-[16px] top-1/2 hidden -translate-y-1/2 sm:flex" />
        </div>,
        document.body,
      )}
    </div>
  );
}
