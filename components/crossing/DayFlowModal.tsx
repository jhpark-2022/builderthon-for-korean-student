"use client";

// DECIDED 2026-11-05 (사용자, 스크린숏: "이런식으로 싫음. 클릭하면 보이는 식으로 like 8월 처럼"): docs/day-flow-brief.md 안 B.
// /crossing Day 카드의 "하루의 흐름 →"을 누르면 그날의 줄이 이 모달에 열립니다. 껍데기(포털, 배경, 포커스 가둠, 뒤 화면 inert,
// 스크롤 잠금, 폰에서는 아래에서 올라오는 시트)는 8월 DayModal(components/journey/Journey.tsx)과 같고, 줄 목록은 8월 RunOfShow의
// 모양(폰은 시각을 위에, sm부터 시각 칸 + 무엇)입니다. 필참 표시는 없습니다(전원 전부 참여). 시각이 정해지지 않은 줄은 시각을 그리지 않습니다(D2).
// 같은 날 앞선 카드 안 접는 띠(안 A)는 이 모달이 대신합니다.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { META, BODY, SUBTITLE } from "@/components/ui/typography";

// 2026-11-09 (사용자: "조여준 파트너님 얼굴이 여기 있으면 좋겠어", "opening session 어젠다가 디테일하게"): 세션 줄에 연사 카드(사진, 이름, 직함, 나눌 이야기).
export type DayFlowSpeaker = { photo: string; name: string; role: string; agendaLabel: string; agenda: string[] };
export type DayFlowRow = { time?: string; what: string; where?: string; href?: string; speaker?: DayFlowSpeaker };
export type DayFlowContent = { dayLabel: string; date: string; title: string; lead: string; rows: DayFlowRow[]; venue?: { src: string; name: string; w: number; h: number }; venueText?: string; venueNote?: string };

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

export default function DayFlowModal({
  day,
  onClose,
  heading,
  closeLabel,
  children,
}: {
  day: DayFlowContent | null;
  onClose: () => void;
  heading: string;
  closeLabel: string;
  // 2026-11-06: 줄 목록 대신 다른 본문(멘토 명단)을 같은 껍데기에 담을 때.
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const open = day != null;
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onCloseRef.current();
      if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
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

  return createPortal(
    <AnimatePresence>
      {day && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div aria-hidden onClick={onClose} className="absolute inset-0 cursor-default touch-none bg-black/50" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-flow-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.985 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[88dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-naru-surface shadow-2xl sm:rounded-3xl"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
            >
              <svg aria-hidden width="16" height="16" viewBox="0 0 15 15" fill="none">
                <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <div className="overflow-y-auto overscroll-contain px-6 pt-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] text-left sm:px-8 sm:py-8">
              {/* 2026-11-05 (사용자, 스크린숏: "디자인이 진짜 별루임"): 상자 속 상자, 빈 시각 칸, 같은 굵기의 긴 줄, 줄마다 되풀이되는 "현장"을 걷고
                  노선도와 같은 문법의 세로 선 하나에 날마다의 정거장을 찍습니다. 점은 모두 같습니다(같은 날 사용자: "필참 이런게 어디있어 다 참여해야지", 그 전 ★ 필참과 꽉 찬 점).
                  줄의 첫 마디(마침표나 쌍점 앞)가 이름이고 나머지는 작은 글자. 장소는 "현장"이 아닐 때만 작은 꼬리표로 붙습니다. */}
              <p className={`flex flex-wrap items-baseline gap-x-2 pr-12 ${META}`}>
                <span lang="en" className="font-bold text-accent">{day.dayLabel}</span>
                <span className="text-caption">{day.date}</span>
                {/* 2026-11-05 (사용자): 그날 장소의 로고. 카드 머리와 같습니다. */}
                {day.venue && (
                  <span className="inline-flex items-center gap-1.5 self-center">
                    <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-caption"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                    <Image src={day.venue.src} alt={day.venue.name} width={day.venue.w} height={day.venue.h} className="h-[14px] w-auto" />
                  </span>
                )}
                {!day.venue && day.venueText && (
                  <span className="inline-flex items-center gap-1.5 self-center font-bold text-naru-muted">
                    <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-caption"><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                    {day.venueText}
                  </span>
                )}
                {day.venueNote && (
                  <span className="inline-flex items-center gap-1 self-center font-semibold text-naru-muted">
                    <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-caption"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                    {day.venueNote}
                  </span>
                )}
              </p>
              <h3 id="day-flow-title" className={`mt-1.5 pr-12 ${SUBTITLE} font-bold tracking-[-0.01em] text-naru-navy`}>{day.title}</h3>
              {day.lead && <p className={`mt-2 break-keep ${META} leading-[1.65] text-naru-muted`}>{day.lead}</p>}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className={`${META} font-bold text-white/85`}>{heading}</p>
              </div>
              {children ? <div className="mt-4">{children}</div> : (
              <ol className="relative mt-4">
                {/* 세로 선: 첫 점 가운데에서 마지막 점 가운데까지. */}
                <span aria-hidden className="absolute bottom-3 left-[5px] top-2 w-px bg-white/15" />
                {day.rows.map((r, j) => {
                  const cut = r.what.search(/[.:] /);
                  const name = cut > 0 ? r.what.slice(0, cut) : r.what;
                  const detail = cut > 0 ? r.what.slice(cut + 2) : "";
                  const onSite = !r.where || r.where === "현장" || r.where === "On site";
                  return (
                    <li key={j} className="relative pb-5 pl-7 last:pb-0">
                      <span aria-hidden className={`absolute left-0 top-[5px] h-[11px] w-[11px] rounded-full border-2 border-accent bg-naru-surface`} />
                      {r.time && <p className={`${META} font-semibold tabular-nums text-accent`}>{r.time}</p>}
                      <p className={`break-keep ${BODY} font-semibold leading-snug text-white`}>
                        {name}
                      </p>
                      {detail && <p className={`mt-1 break-keep ${META} leading-[1.6] text-naru-muted`}>{detail}</p>}
                      {r.speaker && (
                        <div className="mt-3 rounded-xl card-sunken p-3.5 sm:p-4">
                          <div className="flex items-center gap-3.5">
                            <Image src={r.speaker.photo} alt={r.speaker.name} width={130} height={130} className="h-16 w-16 shrink-0 rounded-full object-cover" />
                            <div className="min-w-0">
                              <p className={`${BODY} font-bold leading-snug text-white`}>{r.speaker.name}</p>
                              <p className={`break-keep ${META} leading-[1.5] text-naru-muted`}>{r.speaker.role}</p>
                            </div>
                          </div>
                          <p className={`mt-3.5 ${META} font-bold text-white/85`}>{r.speaker.agendaLabel}</p>
                          <ul className="mt-1.5 flex flex-col gap-1.5">
                            {r.speaker.agenda.map((a, k) => (
                              <li key={k} className={`relative break-keep pl-3.5 ${META} leading-[1.6] text-naru-muted`}>
                                <span aria-hidden className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-accent" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {!onSite && (
                        <p className={`mt-1.5 inline-flex items-center gap-1 ${META} text-caption`}>
                          <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                          {/* 2026-11-06 (docs/first-click-brief.md F8): 장소가 우리 사이트의 페이지면 그 글자가 링크. */}
                          {r.href ? <Link href={r.href} className="font-semibold text-accent underline decoration-1 underline-offset-[3px]">{r.where}</Link> : r.where}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
