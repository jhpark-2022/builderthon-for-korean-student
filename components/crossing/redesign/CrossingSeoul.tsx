"use client";

// DECIDED 2026-11-15 (사용자: "https://naru.community/crossing 이거 대로 내 version update 해줘", "전부 그대로"):
// naru.community에 다른 기여자가 올린 /crossing 판을 그대로 옮겼습니다(코드는 GitHub에 없었고, 배포된 화면과 번들에서 되살림).
// 그 판은 2026-11-11 main(7d5e673)에 다음을 더한 것입니다. 11/12~11/14의 포스터 히어로, 로고 띠, 사실 목록 dedupe, Builder session,
// 둘이 한 팀 등록은 이 판으로 되돌렸습니다.
//   히어로      날짜 줄 "2026.12.17–12.21, 서울", 캐치프레이즈 두 줄과 sub 세 줄, 버튼(56px). 버튼 아래 한 줄은 없음.
//   닷새 카드   날마다 "일정"(번호 목록, 연사 카드), Day 2, 3의 "멘토"(확정된 이름과 소속), 미션과 Day 1 "들고 갈 것"은 접는 줄.
//               하루 일정 모달과 세션 펼치기는 없앴습니다. 스크롤에 따라 노선이 칠해지고 지난 정거장이 한 번 커집니다.
//   함께하는 곳 주최, 출제사, 8월부터 함께한 곳(AXMOS와 다섯 곳), 후원(캡션)과 끝의 점선 "후원 문의" 칸. 그 아래 미디어, 등록.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import {
  naru,
  naruLinks,
  openChatLabels,
  register as registerCopy,
  decemberPartners,
  problemSetters,
  type PartnerLogo,
} from "@/data/naru";
import {
  DECEMBER_CITY,
  DECEMBER_ENDS_AT,
  DECEMBER_EVENT_NAME,
  DECEMBER_STARTS_AT,
  decemberEventLabel,
  formatDecemberDayWithWeekday,
} from "@/lib/naruDates";
import { TIMETABLE_OPEN } from "@/lib/crossingOps";
import { VOTE_BUTTON_OPEN } from "@/lib/crossingVote";
import { useCrossingRegisterOptional } from "@/components/crossing/RegisterProvider";
import PhotoLightbox, { warmPhoto } from "@/components/shared/PhotoLightbox";
import MobileChatBar from "@/components/shared/MobileChatBar";
import MediaSection from "@/components/shared/MediaSection";
import OpenChatLink from "@/components/ui/OpenChatLink";
import { SiteFooter } from "@/components/home/shared";
import { copy as C } from "./copy";
import {
  DISPLAY, TITLE, HEADING, BODY, META, INK, SOFT, NAVY, RULE, FRAME, BTN, BTN_GHOST, LINK, Lines, formatDotRange,
} from "@/components/shared/redesign";

/** 히어로와 등록 블록의 버튼은 한 단 큽니다(56px). */
const BTN_BIG = "!min-h-[56px] !rounded-[12px] px-8 !text-[1.125rem]";
const BTN_LOCKED = `${BTN} w-full cursor-not-allowed gap-2 border border-dashed ${RULE} bg-transparent ${SOFT}`;
const SPONSOR_MAIL = naruLinks.contact;

const LOCK = (
  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

/** 문장마다 줄을 나눕니다(일정 줄의 설명, 맨 아래 등록 문장). */
const splitSentences = (text: string) => text.split(/(?<=[.?!])\s+/);

/** 노선의 정거장. Day 4는 도착(성과 공유회)이라 로고의 접안점과 같은 주황입니다. 스크롤로 지나간 정거장은 칠해지고 한 번 커집니다. */
function Stop({ arrive, passed = false, size = "md" }: { arrive: boolean; passed?: boolean; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-2 w-2" : "h-3 w-3";
  return (
    <span
      aria-hidden
      className={`relative z-10 block shrink-0 rounded-full transition-colors duration-300 motion-reduce:transition-none motion-reduce:animate-none ${passed ? "animate-[naruStopPop_520ms_cubic-bezier(0.16,1,0.3,1)]" : ""} ${s} ${
        arrive ? `bg-naru-orange ${passed ? "ring-4 ring-naru-orange/25" : ""}` : `border-[1.5px] border-naru-navy ${passed ? "bg-naru-navy" : "bg-[#FCFBF8]"}`
      }`}
    />
  );
}

/** 접히는 칸. 높이를 grid-rows로 열고 닫고, 닫혀 있는 동안은 inert라 탭으로 들어가지 않습니다. */
function Collapse({ id, open, className = "", children }: { id: string; open: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      id={id}
      inert={!open}
      className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none [html[data-motion=off]_&]:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} ${className}`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** 접는 줄의 머리. 제목과 오른쪽 ∨. */
function ToggleRow({ id, open, onToggle, title, lang }: { id: string; open: boolean; onToggle: () => void; title: string; lang?: string }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={id}
      onClick={onToggle}
      className="-my-2 flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-naru-navy"
    >
      <span lang={lang} className={`min-w-0 break-keep ${BODY} font-semibold ${INK}`}>{title}</span>
      <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${SOFT} transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

/** Day 1 "들고 갈 것". 열면 라벨이 붙은 목록 둘. */
function Disclosure({ id, title, groups }: { id: string; title: string; groups: { label: string; items: string[] }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <ToggleRow id={id} open={open} onToggle={() => setOpen((v) => !v)} title={title} />
      <Collapse id={id} open={open}>
        <div className="grid gap-4 pt-3 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.label}>
              <p className={`${META} font-semibold ${INK}`}>{g.label}</p>
              <ul className={`mt-1 flex flex-col gap-1 ${META} ${SOFT}`}>
                {g.items.map((it) => (
                  <li key={it} className="break-keep">{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
}

/** 화면에 들어오면 보이고, 화면 아래로 다시 나가면 숨깁니다(위로 지나간 것은 그대로). */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const enter = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShown(true); }, { rootMargin: "0px 0px -22% 0px" });
    const leave = new IntersectionObserver(([e]) => { if (!e.isIntersecting && e.boundingClientRect.top > 0) setShown(false); });
    enter.observe(el);
    leave.observe(el);
    return () => { enter.disconnect(); leave.disconnect(); };
  }, []);
  return { ref, shown };
}

const ROW_REVEAL =
  "origin-top transition-[opacity,clip-path,transform,filter] duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 translate-y-6 scale-[0.985] blur-[2px] [clip-path:inset(0_0_100%_0)] data-[shown=true]:translate-y-0 data-[shown=true]:scale-100 data-[shown=true]:blur-0 data-[shown=true]:opacity-100 data-[shown=true]:[clip-path:inset(0_0_0_0)] motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-0 motion-reduce:opacity-100 motion-reduce:[clip-path:none] motion-reduce:transition-none [html[data-motion=off]_&]:translate-y-0 [html[data-motion=off]_&]:scale-100 [html[data-motion=off]_&]:blur-0 [html[data-motion=off]_&]:opacity-100 [html[data-motion=off]_&]:[clip-path:none] [html[data-motion=off]_&]:transition-none";

/** 닷새 카드 안의 한 줄(일정, 미션, 멘토). 왼쪽 이름, 오른쪽 내용. */
function DetailRow({ label, first, children }: { label: string; first?: boolean; children: ReactNode }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-shown={shown} className={`group grid gap-1.5 py-4 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-5 ${ROW_REVEAL} ${first ? "" : `border-t ${RULE}`}`}>
      <dt className={`${META} font-semibold text-caption sm:pt-[3px]`}>{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/** 위 줄들을 담는 목록. 위 선이 왼쪽에서 그어집니다. */
function DetailList({ children }: { children: ReactNode }) {
  const { ref, shown } = useReveal<HTMLDListElement>();
  return (
    <dl
      ref={ref}
      data-shown={shown}
      className={`relative mt-5 max-w-[42rem] border-b ${RULE} lg:max-w-none before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left before:scale-x-0 before:bg-[#E3E0D8] before:transition-transform before:duration-700 before:ease-out data-[shown=true]:before:scale-x-100 motion-reduce:before:scale-x-100 [html[data-motion=off]_&]:before:scale-x-100`}
    >
      {children}
    </dl>
  );
}

const ITEM_REVEAL =
  "transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 translate-y-3 blur-[3px] data-[shown=true]:translate-y-0 data-[shown=true]:blur-0 data-[shown=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:blur-0 motion-reduce:opacity-100 motion-reduce:transition-none [html[data-motion=off]_&]:translate-y-0 [html[data-motion=off]_&]:blur-0 [html[data-motion=off]_&]:opacity-100 [html[data-motion=off]_&]:transition-none";

/** 단계 이름. 화면에 들어오면 한 글자씩 쳐집니다. 읽는 사람에게는 aria-label로 한 번에. */
function TypeHeading({ text, className = "" }: { text: string; className?: string }) {
  const { ref, shown } = useReveal<HTMLHeadingElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    if (!shown) { setN(still ? text.length : 0); return; }
    if (still) { setN(text.length); return; }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
  }, [shown, text]);
  const typing = shown && n < text.length;
  return (
    <h3 ref={ref} aria-label={text} className={className}>
      <span aria-hidden>{text.slice(0, n)}</span>
      <span aria-hidden className={`ml-0.5 inline-block w-[2px] translate-y-[3px] bg-naru-navy align-baseline ${typing ? "h-[1em] animate-pulse" : "h-0"}`} />
      <span aria-hidden className="invisible">{text.slice(n)}</span>
    </h3>
  );
}

function RevealItem({ className = "", style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  const { ref, shown } = useReveal<HTMLLIElement>();
  return (
    <li ref={ref} data-shown={shown} style={style} className={`${ITEM_REVEAL} ${className}`}>
      {children}
    </li>
  );
}

/** 목록 하나. 한 번 화면에 들어오면 group의 data-shown이 켜집니다. */
function RevealGroup({ as: Tag = "ul", className = "", children }: { as?: "ul" | "ol"; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement & HTMLOListElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} data-shown={shown} className={`group ${className}`}>
      {children}
    </Tag>
  );
}

/**
 * Day 2, 3의 미션. 제목 줄을 누르면 조건 넷과 확인 방법이 펼쳐집니다(2026-11-09 사용자: "클릭하면 펼쳐지게").
 * 아래 한 문단은 받는 것과 때, 올리는 곳. "시간표 페이지"만 링크입니다.
 */
function MissionCard({ id, title, listLabel, rows, reward, upload, href }: { id: string; title: string; listLabel: string; rows: { text: string; check: string }[]; reward: string; upload: string; href: string }) {
  const [open, setOpen] = useState(false);
  const m = upload.match(/시간표 페이지|timetable page/);
  const linkCls = `font-semibold ${NAVY} underline decoration-naru-navy/30 underline-offset-[3px] transition-colors hover:decoration-naru-navy`;
  return (
    <div>
      <ToggleRow id={id} open={open} onToggle={() => setOpen((v) => !v)} title={title} />
      <Collapse id={id} open={open}>
        <div className="pt-2">
          <ul aria-label={listLabel}>
            {rows.map((r) => (
              <li key={r.text} className={`flex flex-col gap-0.5 border-b ${RULE} py-2 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4`}>
                <span className={`flex gap-2 break-keep ${META} ${INK}`}><span aria-hidden className="text-caption">☐</span>{r.text}</span>
                {r.check && <span className={`ml-6 shrink-0 ${META} text-caption sm:ml-0`}>{r.check}</span>}
              </li>
            ))}
          </ul>
          <p className={`mt-3 break-keep ${META} ${SOFT}`}>
            {reward}{" "}
            {m ? <>{upload.slice(0, m.index)}<Link href={href} className={linkCls}>{m[0]}</Link>{upload.slice(m.index! + m[0].length)}</> : upload}
          </p>
        </div>
      </Collapse>
    </div>
  );
}

/** 로고마다 비율이 달라 높이를 맞추면 납작한 로고가 커 보입니다. 같은 넓이로 맞춘 뒤 칸에 넘치지 않게 자릅니다. */
function logoSize(l: { w: number; h: number; boost?: boolean }, area: number, maxH: number, maxW: number) {
  const r = l.w / l.h;
  let w = Math.sqrt(area * (l.boost ? 1.2 : 1) * r);
  let h = w / r;
  if (h > maxH) { h = maxH; w = h * r; }
  if (w > maxW) { w = maxW; h = w / r; }
  return { width: Math.round(w), height: Math.round(h) };
}

const CARD = "flex h-[5.5rem] items-center justify-center rounded-2xl px-3 ring-1 ring-[#E3E0D8] lg:h-24";
const CARD_LINK = "transition-colors hover:bg-[#F6F4EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy";
// DECIDED 2026-11-15 (모바일 점검): 폰에서는 로고 아래에 설명을 둡니다. 옆에 두면 설명이 좁은 칸에서 "곳" 한 글자로 줄을 넘겼습니다.
// 연사 사진도 폰에서는 4:5 한 장(글 높이만큼 늘어나 긴 띠가 되던 것).
const BANNER = "flex min-h-[5rem] flex-col items-start gap-3 rounded-2xl sm:flex-row sm:items-center sm:gap-5 bg-[#F0EEE8] px-5 py-4 transition-colors hover:bg-[#E9E6DE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy lg:px-7";
/** 줄마다 칸 수가 같고, 남는 마지막 줄은 가운데로 모입니다. 칸 너비는 gap-3(0.75rem) 기준입니다. */
const ROW5 = "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-3rem)/5)]";
const ROW4 = "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-2.25rem)/4)]";

/** 후원사 한 칸. 로고는 카드 가운데, 맡은 일은 카드 아래 한 줄. 링크가 있으면 카드가 링크입니다. */
function PartnerCell({ l, caption, area, maxH, className = "" }: { l: PartnerLogo; caption?: string; area: number; maxH: number; className?: string }) {
  const logo = <Image src={l.src} alt={l.name} width={l.w} height={l.h} unoptimized style={logoSize(l, area, maxH, 140)} className="block" />;
  return (
    <div className={className}>
      {l.url ? (
        <a href={l.url} target="_blank" rel="noopener noreferrer" className={`${CARD} ${CARD_LINK}`}>{logo}</a>
      ) : (
        <div className={CARD}>{logo}</div>
      )}
      {caption && <p className={`mt-2 break-keep text-center ${META} text-caption`}>{caption}</p>}
    </div>
  );
}

/** 주최, 8월부터 함께한 곳처럼 따로 빼는 한 줄. 회색 띠에 로고와 한 줄 설명. */
function Banner({ href, external, logo, note, onClick }: { href: string; external?: boolean; logo: ReactNode; note: string; onClick?: () => void }) {
  const body = (
    <>
      <span className="shrink-0">{logo}</span>
      <span className={`min-w-0 flex-1 break-keep ${BODY} ${INK}`}>{note}</span>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={BANNER}>{body}</a>
  ) : (
    <Link href={href} onClick={onClick} className={BANNER}>{body}</Link>
  );
}

/** 닷새 노선을 스크롤에 맞춰 칠합니다. 화면 가운데를 지난 정거장 수(passed)와 칠한 선(fillRef의 scaleY). */
function useRouteProgress(count: number) {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const stopRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [passed, setPassed] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const list = listRef.current;
      const fill = fillRef.current;
      if (!list || !fill) return;
      const mid = window.innerHeight / 2;
      const r = list.getBoundingClientRect();
      const span = r.height - 80;
      const p = span > 0 ? Math.min(1, Math.max(0, (mid - (r.top + 40)) / span)) : 0;
      fill.style.transform = `scaleY(${p})`;
      let n = 0;
      for (let i = 0; i < count; i++) {
        const el = stopRefs.current[i];
        if (el && el.getBoundingClientRect().top + 6 <= mid) n = i + 1;
      }
      setPassed(n);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count]);
  return { listRef, fillRef, stopRefs, passed };
}

/** Day 2, 3 카드의 멘토 줄에 서는 분(data/naru.ts december.mentors의 ko 이름, 확정된 분만). */
const MENTORS_BY_DAY: Record<number, string[]> = {
  2: ["허수진 님", "김규리 님", "강상우 님", "식품 기업 기획파트장"],
  3: ["최우현 님", "강정민 님", "조동현 님", "이민재 님"],
};

export default function CrossingSeoul() {
  const { t, locale } = useLocale();
  const reg = useCrossingRegisterOptional();
  const regState = reg?.state ?? "not_open";
  const d = naru.december;
  const stages = d.stages;
  const hero = naru.eventHero;
  const photos = hero.photos.filter((p) => !!p.src).slice(0, 4);

  const [photoOpen, setPhotoOpen] = useState<number | null>(null);
  const route = useRouteProgress(stages.length);

  const name = locale === "en" ? (DECEMBER_EVENT_NAME?.en ?? decemberEventLabel(locale)) : (DECEMBER_EVENT_NAME?.ko ?? decemberEventLabel(locale));
  const note = t(regState === "open" ? C.noteOpen : C.noteShort);

  const ctas = (src: "naru-hero" | "naru-december", noteId?: string) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {regState === "open" && (
        <button
          type="button"
          onClick={() => { track("naru_cta", { src, to: reg?.registered ? "registered" : "register" }); reg?.openRegister(); }}
          className={`${BTN} ${BTN_BIG} bg-naru-navy text-[#fff] hover:bg-[#1D338A]`}
        >
          {t(reg?.registered ? registerCopy.registered : registerCopy.cta)}
        </button>
      )}
      {regState !== "closed" && (
        <OpenChatLink
          t={t}
          src={src}
          label={regState === "open" ? openChatLabels.join : openChatLabels.december}
          variant={regState === "open" ? "secondary" : "hero"}
          className="!min-h-[56px] !rounded-[12px] !px-8 !text-[1.125rem] max-sm:w-full"
        />
      )}
      {regState === "not_open" && (
        <button
          type="button"
          aria-describedby={noteId}
          onClick={() => { track("naru_cta", { src, to: "register-preview" }); reg?.openRegister(); }}
          className={`${BTN_GHOST} ${BTN_BIG} max-sm:w-full`}
        >
          {t(C.previewCta)}
        </button>
      )}
      {regState === "closed" && <span className={`${BTN_GHOST} ${BTN_BIG} cursor-default ${SOFT}`}>{t(registerCopy.closed)}</span>}
    </div>
  );

  const timetable = d.stages[1].timetableCta;

  return (
    <>
      <main id="main" tabIndex={-1} className="naru-min12 bg-[#FCFBF8] focus:outline-none">
        {/* ── 히어로 ─────────────────────────────────────────────── */}
        <section id="top" aria-labelledby="hero-title" className="pt-[calc(var(--site-header-height,96px)+28px)] lg:pt-[calc(var(--site-header-height,96px)+40px)]">
          <div className={FRAME}>
            <p className={`${HEADING} tabular-nums ${INK}`}>{formatDotRange(DECEMBER_STARTS_AT, DECEMBER_ENDS_AT)}, {DECEMBER_CITY[locale === "en" ? "en" : "ko"]}</p>
            <h1 id="hero-title" lang={locale} className={`mt-2 break-keep ${DISPLAY} ${NAVY}`}>
              {name}<span aria-hidden className="text-naru-orange">.</span>
            </h1>

            <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-6 lg:pt-1">
                <p className={`break-keep ${HEADING} ${INK}`}>
                  <span className="block">{t(hero.catch)}</span>
                  <span className="block"><Lines text={t(C.catchAnswer)} /></span>
                </p>
                <p className={`mt-5 max-w-[34rem] break-keep ${BODY} ${SOFT}`}>
                  <Lines text={t(C.sub)} />
                </p>
                <div className="mt-8">{ctas("naru-hero")}</div>
              </div>

              {photos.length > 0 && (
                <figure className="lg:col-span-6 lg:-mt-16">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onPointerEnter={() => warmPhoto(photos[0].src)}
                    onClick={() => setPhotoOpen(0)}
                    className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[18px] bg-[#F6F4EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy"
                  >
                    <Image src={photos[0].src} alt={t(photos[0].alt)} fill priority sizes="(max-width: 1023px) 100vw, 560px" className="object-cover" />
                  </button>
                  <figcaption className={`mt-2 flex items-center justify-between gap-4 ${META} text-caption`}>
                    <Link href={naruLinks.archive} className="inline-flex min-h-[44px] items-center break-keep underline decoration-[#6B6964]/40 underline-offset-4 hover:text-naru-text">
                      {t(C.photosCaption)}
                    </Link>
                    {photos.length > 1 && (
                      <button type="button" onClick={() => setPhotoOpen(0)} className="inline-flex min-h-[44px] shrink-0 items-center font-semibold hover:text-naru-text">
                        {t(C.photosMore(photos.length))}
                      </button>
                    )}
                  </figcaption>
                </figure>
              )}
            </div>
          </div>
        </section>

        {/* ── 닷새 ─────────────────────────────────────────────── */}
        <section id="december" aria-labelledby="december-title" className="mt-14 lg:mt-20">
          <div className={FRAME}>
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
              <h2 id="december-title" className={`break-keep ${TITLE} ${NAVY} lg:col-span-5`}>{t(C.programHeading)}</h2>
              <p id="mentoring" className={`break-keep ${BODY} ${SOFT} lg:col-span-7 lg:pt-2`}><Lines text={t(C.scheduleLead)} /></p>
            </div>

            <dl className={`mt-6 border-t ${RULE}`}>
              {d.facts.map((f, i) => (
                <div key={f.k.en} className={`grid gap-1.5 border-b ${RULE} py-5 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-8 lg:py-6`}>
                  <dt className={`${META} font-bold ${INK} lg:pt-0.5`}>{t(f.k)}</dt>
                  <dd className={`break-keep ${BODY} ${SOFT}`}><Lines text={t(C.facts[i])} /></dd>
                </div>
              ))}
            </dl>

            {/* DECIDED 2026-11-09 (사용자, 스크린숏: "day 2 and 3 두 날다 필요한데, day 3 에만 있으니 오해를 살거 같음. day 1 에도 필요한데"):
                시간표와 미션 올리기 상자를 Day 3 칸 안에서 닷새 목록 위로. 글 기둥(데스크톱 날짜 칸 오른쪽)에 맞춥니다. */}
            {timetable && (
              <div className="mt-8 lg:mt-10 lg:pl-[16rem]">
                <div className="max-w-[42rem] rounded-xl bg-[#F6F4EE] p-4 sm:p-5">
                  {TIMETABLE_OPEN ? (
                    <Link href="/crossing/team" className={`${BTN} w-full bg-naru-navy text-[#fff] hover:bg-[#1D338A]`}>{t(C.timetableLabel)}</Link>
                  ) : (
                    <span role="link" aria-disabled="true" className={BTN_LOCKED}>{LOCK}{t(C.timetableLabel)}</span>
                  )}
                  <p className={`mt-2 ${META} text-caption`}>{t(C.timetableNote)}</p>
                </div>
              </div>
            )}

            <ol ref={route.listRef} id="schedule" className="relative mt-8 lg:mt-10">
              <span aria-hidden className="absolute bottom-10 left-[5px] top-10 w-px bg-naru-navy/25 lg:left-[calc(11rem+5px)]" />
              <span ref={route.fillRef} aria-hidden style={{ transform: "scaleY(0)" }} className="absolute bottom-10 left-[5px] top-10 w-px origin-top bg-naru-navy will-change-transform lg:left-[calc(11rem+5px)]" />
              {stages.map((s, i) => {
                const mentors = s.mentorsCta
                  ? (MENTORS_BY_DAY[s.dayOffset] ?? [])
                      .map((n) => d.mentors.find((m) => m.confirmed && m.name.ko === n))
                      .filter((m): m is NonNullable<typeof m> => !!m)
                  : [];
                const flow = s.flow ?? [];
                const hasDetail = flow.length > 0 || !!s.milestone || !!s.submit || mentors.length > 0;
                return (
                  <li key={s.dayOffset} id={`day-${s.dayOffset}`} className={`relative grid scroll-mt-28 gap-x-10 border-b ${RULE} py-6 pl-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:py-7 lg:pl-0`}>
                    <span ref={(el) => { route.stopRefs.current[i] = el; }} aria-hidden className="absolute left-0 top-[36px] lg:left-[11rem] lg:top-[48px]">
                      <Stop arrive={s.dayOffset === 4} passed={i < route.passed} />
                    </span>
                    {/* 왼쪽 날짜 칸. 큰 Day 번호가 목차 구실을 하고, 긴 날을 읽는 동안 데스크톱에서 따라 내려옵니다. */}
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:sticky lg:top-28 lg:flex-col lg:gap-1.5 lg:self-start">
                      <span className={`${TITLE} tabular-nums ${NAVY}`}>Day {s.dayOffset}</span>
                      <span className={`${BODY} font-semibold tabular-nums ${SOFT}`}>{formatDecemberDayWithWeekday(locale, s.dayOffset)}</span>
                      {s.logo && (
                        <a href={s.logo.url} target="_blank" rel="noopener noreferrer" aria-label={s.logo.name} className="inline-flex min-h-[44px] items-center opacity-80 hover:opacity-100 lg:mt-1">
                          <Image src={s.logo.src} alt="" width={s.logo.w} height={s.logo.h} className="h-[18px] w-auto" />
                        </a>
                      )}
                      {!s.logo && s.venueText && (
                        <span className={`flex flex-col gap-1 ${META} font-semibold ${SOFT} lg:mt-2`}>
                          <span className="inline-flex items-center gap-1.5">
                            <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                            {t(s.venueText)}
                          </span>
                        </span>
                      )}
                      {s.venueNote && (
                        <span className={`inline-flex items-center gap-1.5 ${META} font-semibold ${SOFT} ${s.logo ? "" : "lg:-mt-0.5"}`}>
                          <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                          {t(s.venueNote)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 min-w-0 lg:mt-0 lg:pl-10">
                      <TypeHeading text={t(s.title)} className={`break-keep ${HEADING} ${INK}`} />
                      <p className={`mt-2 max-w-[42rem] break-keep ${BODY} ${SOFT} lg:max-w-none`}><Lines text={t(C.line[s.dayOffset] ?? s.line)} /></p>
                      {hasDetail && (
                        <DetailList>
                          {flow.length > 0 && (
                            <DetailRow label={t({ ko: "일정", en: "Schedule" })} first>
                              <RevealGroup as="ol" className="flex flex-col gap-4">
                                {flow.map((r, k) => {
                                  // "제목. 설명" 꼴의 줄을 제목(굵게)과 설명으로 나눕니다. 설명은 문장마다 한 줄.
                                  const what = t(C.flow[s.dayOffset]?.[k] ?? r.what);
                                  const cut = what.search(/[.:] /);
                                  const head = cut > 0 ? what.slice(0, cut) : what;
                                  const rest = cut > 0 ? what.slice(cut + 2) : "";
                                  const sp = r.speaker;
                                  const key = `${s.dayOffset}-${k}`;
                                  const agenda = C.speakerAgenda[key] ?? sp?.agenda ?? [];
                                  return (
                                    <RevealItem key={k} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
                                      <span aria-hidden className={`${HEADING} tabular-nums ${NAVY}`}>{k + 1}</span>
                                      <div className="min-w-0">
                                        <p className={`break-keep ${BODY} font-semibold ${INK}`}>
                                          {r.where && (
                                            <span className={`font-normal ${SOFT}`}>
                                              {r.href ? (
                                                <Link href={r.href} className={`font-semibold ${NAVY} underline decoration-naru-navy/30 underline-offset-[3px] hover:decoration-naru-navy`}>{t(r.where)}</Link>
                                              ) : t(r.where)}
                                              :{" "}
                                            </span>
                                          )}
                                          {r.time && <span className="mr-2 tabular-nums">{r.time}</span>}
                                          {head}
                                        </p>
                                        {rest && (
                                          <p className={`break-keep ${META} ${SOFT}`}>
                                            {splitSentences(rest).map((x, j) => <span key={j} className="block">{x}</span>)}
                                          </p>
                                        )}
                                        {sp && (
                                          <div className="mt-2 flex gap-4">
                                            {sp.photo && (
                                              <span className="relative aspect-[4/5] w-20 shrink-0 self-start overflow-hidden rounded-xl sm:aspect-auto sm:w-24 sm:self-stretch">
                                                <Image src={sp.photo} alt="" fill sizes="96px" className="object-cover" />
                                              </span>
                                            )}
                                            <div className="min-w-0">
                                              <p className={`break-keep ${META} font-semibold ${INK}`}>
                                                {t(sp.name)} <span className={`font-normal ${SOFT}`}>{t(sp.role)}</span>
                                              </p>
                                              {agenda.length > 0 && (
                                                <ul className={`mt-0.5 flex flex-col ${META} ${SOFT}`}>
                                                  {agenda.map((x, j) => <li key={j} className="break-keep">{t(x)}</li>)}
                                                </ul>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </RevealItem>
                                  );
                                })}
                              </RevealGroup>
                            </DetailRow>
                          )}
                          {s.milestone ? (
                            <DetailRow label={t(d.milestoneLabel)} first={flow.length === 0}>
                              <MissionCard
                                id={`mission-${s.dayOffset}`}
                                title={t(C.milestone[s.dayOffset] ?? s.milestone)}
                                listLabel={t(C.milestoneConditionsLabel)}
                                rows={(C.conditions[s.dayOffset] ?? s.milestoneDetail?.conditions ?? []).map((c, j) => {
                                  const k = s.milestoneDetail?.checks?.[j];
                                  return { text: t(c), check: k ? t(C.checkLabels[k]) : "" };
                                })}
                                reward={t(C.milestoneReward)}
                                upload={t(C.milestoneUpload)}
                                href={`/crossing/team?day=${s.dayOffset}`}
                              />
                            </DetailRow>
                          ) : s.submit ? (
                            <DetailRow label={t(d.carryLabel)} first={flow.length === 0}>
                              <Disclosure
                                id={`carry-${s.dayOffset}`}
                                title={t(C.carryTitle)}
                                groups={[
                                  { label: t(d.carryDetail.todoLabel), items: C.carryTodo.map(t) },
                                  { label: t(d.carrySubmitLabel), items: C.carrySubmit.map(t) },
                                ]}
                              />
                            </DetailRow>
                          ) : null}
                          {mentors.length > 0 && (
                            <DetailRow label={t({ ko: "멘토", en: "Mentors" })}>
                              <RevealGroup className="grid grid-cols-2 gap-x-5 gap-y-3 lg:grid-cols-4">
                                {mentors.map((m, j) => (
                                  <RevealItem key={m.name.ko} style={{ transitionDelay: `${j * 110}ms` }}>
                                    <p className={`break-keep ${META} font-semibold ${INK}`}>{t(m.name)}</p>
                                    {t(m.org) && <p className={`break-keep ${META} ${SOFT}`}>{t(m.org)}</p>}
                                  </RevealItem>
                                ))}
                              </RevealGroup>
                            </DetailRow>
                          )}
                        </DetailList>
                      )}
                      {s.matchCta && (
                        <div className="mt-2 flex flex-wrap gap-x-6">
                          <Link href={s.matchCta.href} onClick={() => track("naru_cta", { src: "day1", to: "match" })} className={LINK}>{t(C.matchLabel)}</Link>
                        </div>
                      )}
                      {s.voteCta && (
                        <div className="mt-5 max-w-[42rem]">
                          {VOTE_BUTTON_OPEN ? (
                            <Link href={s.voteCta.href} className={`${BTN_GHOST} w-full`}>{t(s.voteCta.label)}</Link>
                          ) : (
                            <>
                              <span role="link" aria-disabled="true" className={BTN_LOCKED}>{LOCK}{t(s.voteCta.label)}</span>
                              {s.voteCta.lockedNote && <p className={`mt-2 ${META} text-caption`}>{t(C.voteLocked)}</p>}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ── 남는 것 ─────────────────────────────────────────────── */}
        <section id="gains" aria-labelledby="gains-title" className="mt-14 lg:mt-20">
          <div className={FRAME}>
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
              <h2 id="gains-title" className={`break-keep ${TITLE} ${NAVY} lg:col-span-5`}>{t(C.gainsHeading)}</h2>
              <p className={`break-keep ${HEADING} ${INK} lg:col-span-7 lg:pt-1`}><Lines text={t(C.gainsSpine)} /></p>
            </div>
            <ul className={`mt-6 border-t ${RULE}`}>
              {naru.gains.items.map((it, k) => (
                <li key={it.num} className={`grid gap-x-10 gap-y-2 border-b ${RULE} py-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_auto] lg:items-baseline lg:py-6`}>
                  <h3 className={`break-keep ${BODY} font-bold tracking-[-0.01em] ${INK}`}>{t(C.gainsTitles[k])}</h3>
                  <p className={`break-keep ${BODY} ${SOFT}`}><Lines text={t(C.gainsBodies[k])} /></p>
                  <div className="flex items-center gap-3 sm:col-start-2 lg:col-start-auto">
                    <span aria-hidden className="relative flex items-center gap-[7px]">
                      <span className="absolute inset-x-0 top-1/2 h-px bg-naru-navy/20" />
                      {[0, 1, 2, 3, 4].map((n) => (
                        <span key={n} className={`relative h-2 w-2 rounded-full ${it.days.includes(n) ? (n === 4 ? "bg-naru-orange" : "bg-naru-navy") : "border border-naru-navy/30 bg-[#FCFBF8]"}`} />
                      ))}
                    </span>
                    <span className={`w-[4.75rem] shrink-0 whitespace-nowrap ${META} font-semibold tabular-nums ${NAVY}`}>
                      {it.days.length > 1 && !it.split ? `Day ${Math.min(...it.days)}–${Math.max(...it.days)}` : it.days.map((n) => `Day ${n}`).join(", ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 함께하는 곳 ─────────────────────────────────────────────── */}
        <section id="partners" aria-labelledby="partners-title" className="mt-14 lg:mt-20">
          <div className={FRAME}>
            <h2 id="partners-title" className={`break-keep ${TITLE} ${NAVY}`}>{t(decemberPartners.heading)}</h2>
            {(() => {
              const [main, ...rest] = decemberPartners.groups;
              const others = rest.flatMap((g) => g.logos.map((l) => ({ l: l as PartnerLogo, caption: t(g.label) })));
              const GROUP = `mt-6 border-t ${RULE} pt-6`;
              return (
                <>
                  <div id="naru" className="mt-6">
                    <h3 className={`${HEADING} ${INK}`}>{t(naru.teaser.eyebrow)}</h3>
                    <div className="mt-3">
                      <Banner
                        href={naru.teaser.cta.href}
                        onClick={() => track("naru_cta", { src: "partners", to: "naru-page" })}
                        note={t({ ko: "학생들이 직접 꾸리는 그룹이에요. 이번 닷새를 기획하고 운영해요.", en: "A student-run group. Plans and runs the five days." })}
                        logo={
                          <Image
                            src={locale === "en" ? "/naru/naru-name-en-paper.svg" : "/naru/naru-name-paper.png"}
                            alt={t({ ko: "나루", en: "NARU" })}
                            width={604}
                            height={168}
                            unoptimized={locale === "en"}
                            style={logoSize({ w: 604, h: 168 }, 4200, 36, 150)}
                            className="block"
                          />
                        }
                      />
                    </div>
                  </div>

                  <div className={GROUP}>
                    <h3 className={`${HEADING} ${INK}`}>{t({ ko: "출제사", en: "Problem setters" })}</h3>
                    <div className="mt-3 flex flex-wrap justify-center gap-3">
                      {problemSetters.map((l) => (
                        <PartnerCell key={l.name} l={l} area={l.square ? 5200 : 3000} maxH={l.square ? 68 : 40} className={ROW4} />
                      ))}
                    </div>
                  </div>

                  <div className={GROUP}>
                    <h3 className={`${HEADING} ${INK}`}>{t(main.label)}</h3>
                    {main.lead && (
                      <div className="mt-3">
                        <Banner
                          href={main.lead.url!}
                          external
                          note={t(C.leadNote)}
                          logo={<Image src={main.lead.src} alt={main.lead.name} width={main.lead.w} height={main.lead.h} unoptimized style={logoSize(main.lead, 4200, 36, 150)} className="block" />}
                        />
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap justify-center gap-3">
                      {main.logos.map((l) => (
                        <PartnerCell key={l.name} l={l as PartnerLogo} area={3000} maxH={40} className={ROW5} />
                      ))}
                    </div>
                  </div>

                  <div className={GROUP}>
                    <h3 className={`${HEADING} ${INK}`}>{t({ ko: "후원", en: "Sponsors and partners" })}</h3>
                    <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-5">
                      {others.map(({ l, caption }) => (
                        // DECIDED 2026-11-16 (법무법인 웨이브를 넣으며): 마름모 아래 두 줄 글자인 정사각 로고는 높이 42에서 글자가 읽히지 않아, 출제사 줄처럼 더 큰 넓이와 높이.
                        <PartnerCell key={l.name} l={l} caption={caption} area={l.square ? 4400 : 2600} maxH={l.square ? 64 : 42} className={ROW4} />
                      ))}
                      <div className={ROW4}>
                        <a
                          href={`mailto:${SPONSOR_MAIL}?subject=${encodeURIComponent(t({ ko: "크로싱 서울 후원 문의", en: "Crossing Seoul sponsorship" }))}`}
                          onClick={() => track("naru_mail", { src: "partners_sponsor" })}
                          className={`${CARD} ${CARD_LINK} gap-2 !bg-[#FCFBF8] border border-dashed border-naru-navy/40 !ring-0 ${META} font-bold ${NAVY}`}
                        >
                          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
                            <path d="M3 5.5l7 5.5 7-5.5" />
                          </svg>
                          {t({ ko: "후원 문의", en: "Become a sponsor" })}
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </section>

        {/* ── 미디어(이 행사 기사만) ─────────────────────────────────────── */}
        <MediaSection only="crossing" />

        {/* ── 등록 ─────────────────────────────────────────────── */}
        {regState !== "closed" && (
          <section id="register" aria-labelledby="register-title" className="mt-14 pb-16 lg:mt-20 lg:pb-20">
            <div className={FRAME}>
              <div className="rounded-[22px] px-6 py-10 ring-1 ring-[#E3E0D8] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                <h2 id="register-title" className={`break-keep ${TITLE} ${INK}`}>
                  {splitSentences(note).map((x, j) => <span key={j} className="block">{x}</span>)}
                </h2>
                <div className="mt-8">{ctas("naru-december", "register-title")}</div>
              </div>
            </div>
          </section>
        )}

        <MobileChatBar afterId="gains" endId="site-footer" phone />
      </main>

      <SiteFooter page="crossing" />

      <PhotoLightbox
        photos={photos.map((p) => ({ src: p.src, alt: t(p.alt), width: p.width, height: p.height, caption: p.day && `${t(C.photosCaption)} ${t(p.day)}` }))}
        index={photoOpen}
        onIndex={setPhotoOpen}
        onClose={() => setPhotoOpen(null)}
        labels={{ close: t(hero.photoClose), prev: t(hero.photoPrev), next: t(hero.photoNext) }}
      />
    </>
  );
}
