"use client";

// 매니페스토를 사이트 안에서 넘겨 보는 뷰어.
//
// DECIDED 2026-10-25 (사용자: "매니페스토 내려받는게 아니라, 웹사이트에서 그냥 스와이핑해서 페이지 넘겨서 볼 수 있게"):
// 내려받기 버튼 대신 PDF의 쪽을 이미지로 뽑아(public/naru/manifesto/{ko,en}-N.jpg) 옆으로 넘깁니다.
// 폰 폭에 A4 한 장이면 본문 글자가 작아서, 쪽을 누르면 전체 화면으로 커지고 거기서도 넘기고 확대해 읽습니다.
// 넘기기는 라이브러리 없이 가로 스크롤 스냅입니다. 손가락 스와이프, 트랙패드, 키보드(←, →, Esc)가 같은 길로 갑니다.
// 원본은 docs/manifesto-web/{ko,en}.html입니다. 고친 뒤 이미지를 다시 뽑습니다:
//   Chrome --headless --no-pdf-header-footer --print-to-pdf로 PDF, pdftoppm -scale-to-x 2400(ko-N)과 1000(ko-s-N)으로 PNG,
//   크림 #FCFBF8을 곱해(PIL ImageChops.multiply) jpeg 88. 쪽 수가 바뀌면 아래 PAGES도 바꿉니다.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "@vercel/analytics";
import { BODY, META } from "@/components/ui/typography";

const PAGES = { ko: 6, en: 7 } as const;
// 이미지를 다시 뽑으면 올립니다. 파일 이름이 같아 브라우저가 옛 쪽을 보여 주지 않게.
const V = "20261030";
// 뽑은 이미지의 크기. 2026-10-25 (사용자: "너무 흐린데"): 1400px 한 벌을 next/image가 다시 줄이고 눌러 글자가 흐렸습니다.
// 넘기는 줄은 1000px(-s-), 전체 화면은 2400px 원본을 최적화 없이(unoptimized) 그대로 씁니다.
const SMALL = { w: 1000, h: 1416 };
const LARGE = { w: 2400, h: 3397 };

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
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-naru-surface/80 text-white/85 backdrop-blur-sm transition hover:border-white/30 hover:text-white disabled:pointer-events-none disabled:opacity-30 ${className}`}
    >
      <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 ${dir === "prev" ? "rotate-180" : ""}`}><path d="M4.5 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

export default function ManifestoViewer({ locale, t }: Props) {
  const count = PAGES[locale];
  const srcs = Array.from({ length: count }, (_, i) => `/naru/manifesto/${locale}-${i + 1}.jpg?v=${V}`);
  const thumbs = Array.from({ length: count }, (_, i) => `/naru/manifesto/${locale}-s-${i + 1}.jpg?v=${V}`);
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

  // DECIDED 2026-10-26 (사용자: "3초마다 자동으로 넘어가게", 이어서 "넘기는건 3.5초, 아래 점들과 프로그레스바, 애플처럼"): 넘겨 보는 줄은 3.5초마다 다음 쪽,
  // 끝에서 첫 쪽으로. 시계는 따로 두지 않고 아래 점 줄의 진행 막대 애니메이션이 끝나면 넘깁니다(막대와 넘김이 늘 맞습니다).
  // 멈추는 때(WCAG 2.2.2): 마우스가 올라가 있거나 안에 포커스가 있는 동안(막대가 그 자리에서 멈춤), 손가락으로 한 번 넘긴 뒤(그 뒤로는 계속 멈춤),
  // 전체 화면이 열린 동안, 모션 줄이기 설정. 재생/정지 단추로도 멈춥니다. 쪽이 바뀌면 막대는 처음부터 다시 찹니다.
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);
  const step = (dir: 1 | -1) => a.go((a.index + dir + count) % count);
  const running = playing && !hold && !open;
  const onProgressEnd = () => {
    // 모션 줄이기의 전역 규칙(애니메이션 0.001ms)에서 첫 그림이 곧바로 끝나 넘어가지 않게.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    step(1);
  };

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
      {/* DECIDED 2026-10-26 (사용자: "누르기 전에도 슬라이더 화살표"): 화살표가 넘기는 줄 위 양옆에 섭니다(전체 화면과 같은 자리). 끝에서는 반대쪽 끝으로. */}
      {/* 2026-10-26 (사용자: "아예 잘리는 경계를 넓혀야"): sm부터 넘기는 줄이 글 기둥을 벗어나 화면 폭(양옆 24px 남김, 최대 72rem)까지 넓어집니다.
          옆 쪽이 글 기둥 끝에서 잘리지 않고 화면 쪽으로 이어집니다. html의 overflow-x: clip이 가로 넘침을 막습니다. */}
      <div
        className="relative sm:left-1/2 sm:w-[min(calc(100vw-48px),72rem)] sm:-translate-x-1/2"
        onPointerEnter={(e) => { if (e.pointerType === "mouse") setHold(true); }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") setHold(false); }}
        onFocus={() => setHold(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHold(false); }}
        onTouchStart={() => setPlaying(false)}
      >
      <div
        ref={inline}
        role="region"
        aria-roledescription="carousel"
        aria-label={t({ ko: "매니페스토 쪽 넘겨 보기", en: "Manifesto pages" })}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
        }}
        className="-mx-[22.5px] flex snap-x snap-mandatory gap-[12px] overflow-x-auto overscroll-x-contain pb-[4px] [scrollbar-width:none] focus-visible:outline-none sm:mx-0 sm:gap-[16px] sm:[mask-image:linear-gradient(to_right,rgba(0,0,0,0.35),black_8%,black_92%,rgba(0,0,0,0.35))] [&::-webkit-scrollbar]:hidden"
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
            // 2026-10-26 (사용자: "그라디언트로 빠지는 페이지 너무 금방 사라져"): 양끝 흐림을 14% → 8%로 좁히고 끝도 35%까지만 흐립니다. 옆 쪽 불투명도 0.7 → 0.85.
            style={{ opacity: i === a.index ? 1 : 0.85 }}
          >
            <Image src={thumbs[i]} alt="" width={SMALL.w} height={SMALL.h} unoptimized loading={i < 2 ? "eager" : "lazy"} className="block h-auto w-full" />
          </button>
        ))}
        <span aria-hidden className="w-[calc((100%-min(78vw,420px))/2-12px)] shrink-0 sm:w-[calc((100%-420px)/2-16px)]" />
      </div>
      <Arrow dir="prev" onClick={() => step(-1)} disabled={false} label={prevLabel} className="absolute left-[4px] top-1/2 z-10 -translate-y-1/2 sm:left-[12px]" />
      <Arrow dir="next" onClick={() => step(1)} disabled={false} label={nextLabel} className="absolute right-[4px] top-1/2 z-10 -translate-y-1/2 sm:right-[12px]" />
      </div>
      {/* 애플식 점 줄: 지금 쪽은 길쭉한 알약이 되어 3.5초 동안 차오르고, 나머지는 점. 점을 누르면 그 쪽으로. 오른쪽에 재생/정지. */}
      <div className="mt-[16px] flex items-center justify-center gap-[8px]">
        <div role="group" aria-label={t({ ko: "쪽 고르기", en: "Choose a page" })} className="flex items-center">
          {Array.from({ length: count }, (_, i) => {
            const here = i === a.index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => a.go(i)}
                aria-label={`${alt(i)}${here ? `, ${t({ ko: "지금 쪽", en: "current" })}` : ""}`}
                aria-current={here ? "true" : undefined}
                className="group/dot flex h-11 items-center px-[4px]"
              >
                <span className={`relative block h-[8px] overflow-hidden rounded-full transition-colors duration-300 motion-reduce:transition-none ${here ? "w-[36px] bg-white/20" : "w-[8px] bg-white/30 group-hover/dot:bg-white/60"}`}>
                  {here && (
                    <span
                      key={`fill-${a.index}-${playing ? "p" : "s"}`}
                      className="absolute inset-0 origin-left rounded-full bg-white/85"
                      style={playing
                        ? { animation: "manifestoProgress 3500ms linear forwards", animationPlayState: running ? "running" : "paused" }
                        : { transform: "scaleX(1)" }}
                      onAnimationEnd={onProgressEnd}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          aria-label={t(playing ? { ko: "자동 넘김 멈추기", en: "Pause auto-advance" } : { ko: "자동 넘김 시작", en: "Start auto-advance" })}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3">
            {playing ? <path d="M3.5 2v8M8.5 2v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M3.5 2l6 4-6 4z" fill="currentColor" />}
          </svg>
        </button>
        <span className="sr-only" aria-live={running ? "off" : "polite"}>{counter(a.index)}</span>
      </div>
      <p className={`mt-[8px] ${META} text-white/50`}>{t({ ko: "쪽을 누르면 크게 봅니다", en: "Tap a page to read it full screen" })}</p>

      {/* 전체 화면. 폰은 폭에 맞춰 세로로 스크롤하며 읽고, 데스크톱은 높이에 맞춥니다. 손가락으로 확대할 수 있습니다. */}
      {/* 포털: 이 블록을 감싼 Reveal의 transform 안에서는 fixed가 화면이 아니라 그 상자를 기준으로 잡힙니다. */}
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={t({ ko: "매니페스토", en: "Manifesto" })} className="fixed inset-0 z-[1000] flex flex-col bg-naru-ink/95 backdrop-blur-sm">
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
                <Image src={src} alt={alt(i)} width={LARGE.w} height={LARGE.h} unoptimized loading={Math.abs(i - b.index) <= 1 ? "eager" : "lazy"} className="h-auto w-full max-w-[900px] self-start rounded-lg sm:h-full sm:w-auto sm:max-w-full sm:object-contain" />
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
