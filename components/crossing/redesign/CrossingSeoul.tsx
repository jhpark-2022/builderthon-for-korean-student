"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { type Phrase, links as coreLinks } from "@/data/dictionaryCore";
import { trackOpenChat } from "@/lib/openChatCount";
import {
  naru,
  naruLinks,
  openChatLabels,
  register as registerCopy,
  decemberPartners,
  partnerGroup,
  partnerLogo,
} from "@/data/naru";
import { DECEMBER_EVENT_NAME, decemberEventLabel, formatDecemberDateLine, formatDecemberDayWithWeekday } from "@/lib/naruDates";
import { TIMETABLE_OPEN } from "@/lib/crossingOps";
import { VOTE_BUTTON_OPEN } from "@/lib/crossingVote";
import { useCrossingRegisterOptional } from "@/components/crossing/RegisterProvider";
import DayFlowModal from "@/components/crossing/DayFlowModal";
import PhotoLightbox, { warmPhoto } from "@/components/shared/PhotoLightbox";
import MobileChatBar from "@/components/shared/MobileChatBar";
import OpenChatLink from "@/components/ui/OpenChatLink";
import { SiteFooter } from "@/components/home/shared";
import { copy as C } from "./copy";
import { DISPLAY, TITLE, HEADING, BODY, META, INK, SOFT, NAVY, RULE, FRAME, BTN, BTN_GHOST, LINK, Lines } from "@/components/shared/redesign";

const BTN_LOCKED = `${BTN} w-full cursor-not-allowed gap-2 border border-dashed ${RULE} bg-transparent ${SOFT}`;

const LOCK = (
  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

/** 노선의 정거장. Day 4는 도착(성과 공유회)이라 로고의 접안점과 같은 주황입니다. */
function Stop({ arrive, size = "md" }: { arrive: boolean; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-2 w-2" : "h-3 w-3";
  return (
    <span
      aria-hidden
      className={`relative z-10 block shrink-0 rounded-full ${s} ${arrive ? "bg-naru-orange" : "border-[1.5px] border-naru-navy bg-[#FCFBF8]"}`}
    />
  );
}

/** 미션과 "들고 갈 것"을 펼치는 줄. 열면 라벨이 붙은 목록 둘. */
function Disclosure({ id, label, title, groups, mission }: { id: string; label: string; title: string; groups: { label: string; items: string[] }[]; mission: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border ${RULE} bg-[#FFFFFF]`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-naru-navy"
      >
        <span className={`shrink-0 ${META} font-bold ${mission ? "text-[#845185]" : "text-caption"}`}>{label}</span>
        <span className={`min-w-0 flex-1 break-keep ${META} font-semibold ${INK} sm:text-[1.0625rem]`}>{title}</span>
        <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${SOFT} transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div id={id} hidden={!open} className={`border-t ${RULE} px-4 pb-4 pt-3`}>
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.label}>
              <p className={`${META} font-bold ${INK}`}>{g.label}</p>
              <ul className={`mt-1.5 flex flex-col gap-1 ${META} ${SOFT}`}>
                {g.items.map((it) => (
                  <li key={it} className="flex gap-2 break-keep"><span aria-hidden className="text-caption">–</span>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Day 2, 3의 미션. 접지 않고 다 보이는 카드(docs/mission-card-brief.md D1, 2026-11-08 사용자: 날마다의 미션이 더 자세히 보이게).
 * 줄마다 왼쪽은 조건, 오른쪽은 어떻게 확인하는지 칩 하나(D2). 폰에서는 칩이 조건 아래로. ☐는 버튼이 아니라 글자(D3)이고 상태를 저장하지 않습니다.
 * 아래 두 줄은 받는 것과 때, 올리는 곳. "지원"이 무엇인지는 적지 않습니다(brand 8장, D5).
 * DECIDED 2026-11-09 (사용자, 스크린숏: "클릭하면 펼쳐지게"): D1을 되돌려 처음에는 제목 줄만 보이고, 누르면 조건 넷과 아래 두 줄이 펼쳐집니다.
 */
function MissionCard({ id, label, title, listLabel, rows, reward, upload, href }: { id: string; label: string; title: string; listLabel: string; rows: { text: string; check: string }[]; reward: string; upload: string; href: string }) {
  const [open, setOpen] = useState(false);
  // "시간표 페이지"(EN "timetable page")만 링크로 그립니다. 글은 copy.ts와 data/naru.ts에 문장 그대로 둡니다.
  const m = upload.match(/시간표 페이지|timetable page/);
  const linkCls = `font-semibold ${NAVY} underline decoration-naru-navy/30 underline-offset-[3px] transition-colors hover:decoration-naru-navy`;
  return (
    <div className={`rounded-xl border ${RULE} bg-[#FFFFFF]`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-naru-navy"
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={`shrink-0 ${META} font-bold text-[#845185]`}>{label}</span>
          <span className={`min-w-0 break-keep ${META} font-semibold ${INK} sm:text-[1.0625rem]`}>{title}</span>
        </span>
        <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${SOFT} transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div id={id} hidden={!open} className="px-4 pb-4">
      <ul aria-label={listLabel} className={`border-t ${RULE}`}>
        {rows.map((r) => (
          <li key={r.text} className={`flex flex-col gap-1.5 border-b ${RULE} py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4`}>
            <span className={`flex gap-2 break-keep ${META} ${INK}`}><span aria-hidden className="text-caption">☐</span>{r.text}</span>
            {r.check && <span className={`ml-6 w-fit shrink-0 rounded-full bg-[#F0EEE8] px-2.5 py-0.5 ${META} ${SOFT} sm:ml-0`}>{r.check}</span>}
          </li>
        ))}
      </ul>
      <p className={`mt-3 break-keep ${META} font-semibold ${INK}`}>{reward}</p>
      <p className={`mt-1 break-keep ${META} ${SOFT}`}>
        {m ? <>{upload.slice(0, m.index)}<Link href={href} className={linkCls}>{m[0]}</Link>{upload.slice(m.index! + m[0].length)}</> : upload}
      </p>
      </div>
    </div>
  );
}

type PartnerLogo = { name: string; src: string; w: number; h: number; url?: string; square?: boolean; boost?: boolean };

/** 로고마다 비율이 달라 높이를 맞추면 납작한 로고가 커 보입니다. 같은 넓이로 맞춘 뒤 칸에 넘치지 않게 자릅니다. */
function logoSize(l: { w: number; h: number; boost?: boolean }, area: number, maxH: number, maxW: number) {
  const r = l.w / l.h;
  let w = Math.sqrt(area * (l.boost ? 1.2 : 1) * r);
  let h = w / r;
  if (h > maxH) { h = maxH; w = h * r; }
  if (w > maxW) { w = maxW; h = w / r; }
  return { width: Math.round(w), height: Math.round(h) };
}

const CARD = "flex h-[5.5rem] items-center justify-center rounded-2xl bg-[#FFFFFF] px-3 ring-1 ring-[#E3E0D8] lg:h-24";
const CARD_LINK = "transition-colors hover:bg-[#F6F4EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy";
const BANNER = "flex min-h-[5rem] items-center gap-5 rounded-2xl bg-[#F0EEE8] px-5 py-4 transition-colors hover:bg-[#E9E6DE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy lg:px-7";
/** 줄마다 칸 수가 같고, 남는 마지막 줄은 가운데로 모입니다. 칸 너비는 gap-3(0.75rem) 기준입니다. */
const ROW5 = "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-3rem)/5)]";
const ROW4 = "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-2.25rem)/4)]";

/** 후원사 한 칸. 로고는 흰 카드 가운데, 맡은 일은 카드 아래 한 줄. 링크가 있으면 카드가 링크입니다. */
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

/** 로고 띠의 로고 하나(2026-11-11 P2). 넓이는 #partners와 같은 방식(logoSize), 높이는 데스크톱 28px까지, 폰은 그 0.8배(22px 안팎). */
// DECIDED 2026-11-12 (docs/poster-phone-brief.md Q6): 로고 띠의 묶음은 id로, Day 4의 아산나눔재단은 로고 src로 찾습니다.
// 하나라도 없으면 모듈을 읽을 때 throw해서 빌드가 멈춥니다.
const BAND = {
  venue: partnerGroup("venue"),
  asan: partnerLogo("venue", "/partners/logos/white/trimmed/asan-nanum.png"),
  tech: partnerGroup("tech"),
  coupon: partnerGroup("coupon"),
  award: partnerGroup("award"),
};

function BandLogo({ l }: { l: PartnerLogo }) {
  const s = logoSize(l, 2600, 28, 130);
  const img = (
    <Image
      src={l.src}
      alt={l.name}
      width={l.w}
      height={l.h}
      unoptimized
      style={{ "--bw": `${s.width}px`, "--bh": `${s.height}px` } as React.CSSProperties}
      className="block h-[calc(var(--bh)*0.8)] w-[calc(var(--bw)*0.8)] lg:h-[var(--bh)] lg:w-[var(--bw)]"
    />
  );
  return l.url ? (
    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy">{img}</a>
  ) : (
    <span className="inline-flex min-h-[44px] items-center">{img}</span>
  );
}

/** 주최, 메인 후원처럼 따로 빼는 한 줄. 회색 띠에 로고, 한 줄 설명, 바깥으로 나가는 표시. */
function Banner({ href, external, logo, note, onClick }: { href: string; external?: boolean; logo: React.ReactNode; note: string; onClick?: () => void }) {
  const body = (
    <>
      <span className="shrink-0">{logo}</span>
      <span className={`min-w-0 flex-1 break-keep ${META} ${SOFT}`}>{note}</span>
      <span aria-hidden className={`shrink-0 ${META} ${SOFT}`}>↗</span>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={BANNER}>{body}</a>
  ) : (
    <Link href={href} onClick={onClick} className={BANNER}>{body}</Link>
  );
}

export default function CrossingSeoul() {
  const { t, locale } = useLocale();
  const reg = useCrossingRegisterOptional();
  const regState = reg?.state ?? "not_open";
  const d = naru.december;
  const stages = d.stages;
  const hero = naru.eventHero;
  const photos = hero.photos.filter((p) => !!p.src).slice(0, 4);

  const [photoOpen, setPhotoOpen] = useState<number | null>(null);
  const [flowDay, setFlowDay] = useState<number | null>(null);
  // 2026-11-09: 설명이 펼쳐진 세션(그날의 dayOffset). 한 번에 하나.
  const [openSession, setOpenSession] = useState<number | null>(null);
  const [mentorsDay, setMentorsDay] = useState<number | null>(null);
  const mentorsShown = d.mentors.filter((m) => m.confirmed);

  const name = locale === "en" ? (DECEMBER_EVENT_NAME?.en ?? decemberEventLabel(locale)) : (DECEMBER_EVENT_NAME?.ko ?? decemberEventLabel(locale));
  const note = t(regState === "open" ? C.noteOpen : C.noteShort);

  // DECIDED 2026-11-12 (사용자, docs/poster-phone-brief.md Q4): 히어로는 640px 아래에서 버튼 하나. 둘째 행동(열기 전 등록 폼 먼저 보기,
  // 열린 뒤 오픈채팅)은 등록 줄 dd 끝의 LINK(heroSecondLink)로. 640px부터는 두 버튼. 맨 아래 #register(naru-december)는 그대로.
  const ctas = (src: "naru-hero" | "naru-december", noteId?: string) => {
    const second = src === "naru-hero" ? "max-sm:hidden" : "";
    return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {regState === "open" && (
        <button
          type="button"
          onClick={() => { track("naru_cta", { src, to: reg?.registered ? "registered" : "register" }); reg?.openRegister(); }}
          className={`${BTN} bg-naru-navy text-[#fff] hover:bg-[#1D338A]`}
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
          className={`!min-h-[48px] !rounded-[10px] max-sm:w-full ${regState === "open" ? second : ""}`}
        />
      )}
      {regState === "not_open" && (
        <button
          type="button"
          aria-describedby={noteId}
          onClick={() => { track("naru_cta", { src, to: "register-preview" }); reg?.openRegister(); }}
          className={`${BTN_GHOST} max-sm:w-full ${second}`}
        >
          {t(src === "naru-hero" ? C.heroPreviewCta : C.previewCta)}
        </button>
      )}
      {regState === "closed" && <span className={`${BTN_GHOST} cursor-default ${SOFT}`}>{t(registerCopy.closed)}</span>}
    </div>
    );
  };
  // 폰(640px 아래) 히어로 등록 줄 끝의 둘째 행동. track 이름과 aria-describedby는 버튼과 같습니다.
  const heroSecondLink =
    regState === "not_open" ? (
      <button
        type="button"
        onClick={() => { track("naru_cta", { src: "naru-hero", to: "register-preview" }); reg?.openRegister(); }}
        className={LINK}
      >
        {t(C.heroPreviewCta)}
      </button>
    ) : regState === "open" && coreLinks.openChat ? (
      <a href={coreLinks.openChat} target="_blank" rel="noopener noreferrer" onClick={() => trackOpenChat("naru-hero")} className={LINK}>
        {t(openChatLabels.join)}
      </a>
    ) : null;

  const timetable = d.stages[1].timetableCta;

  return (
    <>
      <main id="main" tabIndex={-1} className="naru-min12 bg-[#FCFBF8] focus:outline-none">
        {/* ── 히어로 ─────────────────────────────────────────────── */}
        <section id="top" aria-labelledby="hero-title" className="pt-[calc(var(--site-header-height,96px)+28px)] lg:pt-[calc(var(--site-header-height,96px)+40px)]">
          <div className={FRAME}>
            <p className={`${HEADING} tabular-nums ${INK}`}>{formatDecemberDateLine(locale)}</p>
            <h1 id="hero-title" lang={locale} className={`mt-2 break-keep ${DISPLAY} ${NAVY}`}>
              {name}<span aria-hidden className="text-naru-orange">.</span>
            </h1>

            <div className="mt-6 grid gap-8 lg:mt-7 lg:grid-cols-12 lg:gap-10">
              {/* DECIDED 2026-11-11 (사용자, docs/poster-first-brief.md P1): 카카오톡 방에 링크만 올리기로 해 폰 첫 화면이 포스터 몫을 합니다.
                  캐치프레이즈 아래 문단(C.sub, C.naruLine) 대신 사실 넷(어디서, 누가, 받는 것, 등록). 버튼은 폰에서 사실 위, 데스크톱에서 아래.
                  버튼 아래 등록 한 줄(hero-register-note)은 등록 줄이 같은 말이라 뺐고, 미리 보기 버튼의 aria-describedby는 그 dd를 가리킵니다. */}
              <div className="flex flex-col lg:col-span-7 lg:pt-1">
                <p className={`break-keep ${HEADING} ${INK}`}>
                  <span className="block">{t(hero.catch)}</span>
                  <span className="block"><Lines text={t(C.catchAnswer)} /></span>
                </p>
                {/* DECIDED 2026-11-12 (사용자): 캐치프레이즈 아래 이 닷새가 무엇인지 한 줄. */}
                <p className={`mt-3 break-keep ${BODY} ${SOFT}`}>
                  <Lines text={t(C.heroLine)} />
                </p>
                <div className="mt-6 lg:order-last lg:mt-6">
                  {ctas("naru-hero")}
                  {/* 2026-11-12 (사용자: 등록 날짜는 버튼에): 등록 줄을 빼면서 폰의 둘째 행동(Q4)은 버튼 바로 아래 링크로. */}
                  {heroSecondLink && <div className="mt-1 sm:hidden">{heroSecondLink}</div>}
                </div>
                <dl className={`mt-7 border-t ${RULE} lg:mt-5`}>
                  {[
                    // DECIDED 2026-11-12 (사용자): 넷째 줄은 등록 대신 멘토(posterFacts). 여는 날은 히어로 미리 보기 버튼(heroPreviewCta)이 말합니다.
                    ...C.heroFactKeys.map((k, i) => ({ k, sub: naru.eventHero.posterFacts[i]?.sub, v: C.heroFacts[i], id: undefined as string | undefined })),
                  ].map((f) => (
                    <div key={f.k.en} className={`grid gap-1 border-b ${RULE} py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-4 lg:py-2.5`}>
                      <dt className={`${META} font-bold ${INK} sm:pt-[0.1rem]`}>
                        {t(f.k)}
                        {/* 2026-11-12 (사용자): 멘토를 만나는 날은 줄 이름 아래에. */}
                        {f.sub && <span className={`ml-2 font-normal tabular-nums ${SOFT} sm:ml-0 sm:block`}>{t(f.sub)}</span>}
                      </dt>
                      <dd id={f.id} className={`break-keep ${BODY} ${SOFT}`}>
                        <Lines text={t(f.v)} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {photos.length > 0 && (
                <figure className="lg:col-span-5">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onPointerEnter={() => warmPhoto(photos[0].src)}
                    onClick={() => setPhotoOpen(0)}
                    className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[18px] bg-[#F6F4EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy"
                  >
                    <Image src={photos[0].src} alt={t(photos[0].alt)} fill priority sizes="(max-width: 1023px) 100vw, 470px" className="object-cover" />
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

        {/* ── 로고 띠 ─────────────────────────────────────────────── */}
        {/* DECIDED 2026-11-11 (사용자, docs/poster-first-brief.md P2, D2): 로고가 1440에서 네 번째 화면, 폰에서 여섯 번째 화면에 있어
            무대가 진짜라는 사실이 첫 화면 근처에 없었습니다. 함께하는 곳의 줄(같은 날 뒤 사용자: 메인 후원은 빼고 공간 후원을 Day 1~4로, 기술과 크레딧)을
            상자 없이 한 단으로. 크기(logoSize)와 흰 실루엣의 잉크 처리(globals.css)는 #partners와 같고, 나머지는 "전체 보기"로. #partners 장은 그대로.
            디캠프는 "공간 후원" 이름과 함께, Lovable은 원래 색(brand 10장, 2026-11-10 표기 조건). 폰은 가로 스크롤. */}
        <section id="sponsors-band" aria-labelledby="sponsors-band-title" className="mt-10 lg:mt-8">
          <div className={FRAME}>
            <h2 id="sponsors-band-title" className="sr-only">{t(decemberPartners.heading)}</h2>
            <div className={`border-y ${RULE}`}>
              <div>
                {/* DECIDED 2026-11-12 (사용자: "조금 더 채워져있으면 좋겠고"): 데스크톱은 두 줄 모두 묶음 사이를 고르게 벌려 폭을 채웁니다.
                    같은 날 (사용자, docs/poster-phone-brief.md Q5): lg 아래는 가로 스크롤 대신 두 칸 격자. 공간 후원은 두 칸을 다 쓰는 첫 줄,
                    나머지 다섯 묶음은 두 칸씩, 아래 글은 두 줄까지, "전체 보기"는 맨 끝 줄. lg부터는 두 줄 그대로. */}
                <ul className="grid grid-cols-2 items-start gap-x-6 gap-y-5 py-4 lg:flex lg:w-full lg:flex-wrap lg:justify-between lg:gap-x-10 lg:gap-y-3">
                  {/* DECIDED 2026-11-11 (사용자, 스크린숏: "매인후원은 안나오게, 그리고 day 1 to 4 공간들이 보이게"): 메인 후원을 빼고,
                      공간 후원을 Day 1~4 순서로 날 이름과 함께. 장소는 닷새 카드와 같은 데이터(stages의 logo, Day 3은 venueText).
                      Day 4는 MARU180과 그 공간을 내준 아산나눔재단. 디캠프는 "공간 후원" 이름 아래 그대로(2026-11-10 표기 조건). */}
                  <li className="col-span-2 min-w-0 lg:shrink-0">
                    <p className={`${META} font-bold ${INK}`}>{t(BAND.venue.label)}</p>
                    {/* 같은 날 뒤 (사용자: "keep 후원, 자연스럽게 공간들이 이어지도록 from day 1 to 4. 중간에 zoom 부분은 빼줘"): 장소가 있는 날만,
                        가는 선으로 이어 한 줄로. 날 이름은 로고 아래. */}
                    <div className="mt-1 flex flex-wrap items-start gap-x-6 gap-y-2 lg:flex-nowrap lg:gap-0">
                      {stages.filter((st) => st.dayOffset >= 1 && st.dayOffset <= 4 && st.logo).map((st, k) => (
                        <div key={st.dayOffset} className="flex items-start">
                          {k > 0 && <span aria-hidden className="mt-[22px] hidden h-px shrink-0 bg-naru-navy/25 lg:mx-5 lg:block lg:w-10" />}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-x-4">
                              {st.dayOffset === 4 && <BandLogo l={BAND.asan} />}
                              <BandLogo l={st.logo as PartnerLogo} />
                            </div>
                            <span className={`-mt-1.5 whitespace-nowrap ${META} tabular-nums ${SOFT}`}>{t(d.dayLabel)} {st.dayOffset}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </li>
                  <li className="min-w-0 lg:shrink-0">
                    <p className={`${META} font-bold ${INK}`}>{t(BAND.tech.label)}</p>
                    <div className="mt-1 flex flex-col">
                      <div className="flex items-center gap-x-5">
                        {BAND.tech.logos.map((l) => <BandLogo key={l.name} l={l} />)}
                      </div>
                      {BAND.tech.bandNote && <span className={`-mt-1.5 break-keep ${META} ${SOFT} lg:whitespace-nowrap`}>{t(BAND.tech.bandNote)}</span>}
                    </div>
                  </li>
                  <li className="order-last col-span-2 lg:order-none lg:shrink-0 lg:self-center lg:ml-auto">
                    <a href="#partners" className={`${LINK} whitespace-nowrap`}>{t(C.partnersAll)}</a>
                  </li>
                  {/* DECIDED 2026-11-11 (사용자: "200만원 for the 과정을 모두 함께하는 사람, 참여자모두에게 트레바리 후원, 그리고 수상팀 readray 크래딧 후원",
                      같은 날 뒤 "상금 후원 로고는 빼주고", "맨토 내용 needs to be at the same row with the 트레바리 and readray"):
                      둘째 줄은 상금(로고 없이 금액), 트레바리, Readray, 함께하는 멘토(Bloom, 가짜연구소). 로고 아래에는 누가 무엇을 받는지.
                      금액과 기간은 Gmail의 후원 회신 그대로(data/naru.ts bandNote). 따로 된 #mentors 장은 이 묶음으로 옮기며 없앴습니다. */}
                  {/* 데스크톱은 둘째 줄을 여기서 시작. lg 아래 격자에서는 숨김. */}
                  <li aria-hidden className="hidden lg:block lg:h-0 lg:basis-full" />
                  <li className="min-w-0 lg:shrink-0">
                    <p className={`${META} font-bold ${INK}`}>{t(d.bandPrize.label)}</p>
                    <div className="mt-1 flex flex-col">
                      <span className={`flex min-h-[44px] items-center ${BODY} font-bold tabular-nums ${INK}`}>{t(d.bandPrize.amount)}</span>
                      <span className={`-mt-1.5 break-keep ${META} ${SOFT} lg:whitespace-nowrap`}>{t(d.bandPrize.note)}</span>
                    </div>
                  </li>
                  {[BAND.coupon, BAND.award].map((g) => {
                    return (
                      <li key={g.id} className="min-w-0 lg:shrink-0">
                        <p className={`${META} font-bold ${INK}`}>{t(g.label)}</p>
                        <div className="mt-1 flex flex-col">
                          <div className="flex items-center gap-x-5">
                            {g.logos.map((l) => <BandLogo key={l.name} l={l} />)}
                          </div>
                          {g.bandNote && <span className={`-mt-1.5 break-keep ${META} ${SOFT} lg:whitespace-nowrap`}>{t(g.bandNote)}</span>}
                        </div>
                      </li>
                    );
                  })}
                  <li className="min-w-0 lg:shrink-0">
                    <p className={`${META} font-bold ${INK}`}>{t(C.mentorsStripLabel)}</p>
                    <div className="mt-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-x-5 lg:flex-nowrap">
                        {d.mentorSources.map((l) => (
                          <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy">
                            <Image src={l.src} alt={l.label ? "" : l.name} width={l.w} height={l.h} unoptimized className="block h-6 w-auto lg:h-7" />
                            {l.label && <span className={`whitespace-nowrap ${BODY} font-bold ${INK}`}>{t(l.label)}</span>}
                          </a>
                        ))}
                      </div>
                      <span className={`-mt-1.5 break-keep ${META} ${SOFT} lg:whitespace-nowrap`}>{t(d.mentorBandNote)}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 닷새 ─────────────────────────────────────────────── */}
        <section id="december" aria-labelledby="december-title" className="mt-14 lg:mt-20">
          <div className={FRAME}>
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
              <h2 id="december-title" className={`break-keep ${TITLE} ${NAVY} lg:col-span-5`}>{t(C.programHeading)}</h2>
              {/* DECIDED 2026-11-11 (docs/poster-first-brief.md P4, D3): 히어로에서 내려온 정체성 세 줄(C.sub, brand 6장)이 리드의 첫 문단. */}
              <div className="flex flex-col gap-4 lg:col-span-7 lg:pt-2">
                <p className={`break-keep ${BODY} ${INK}`}><Lines text={t(C.sub)} /></p>
                <p id="mentoring" className={`break-keep ${BODY} ${SOFT}`}><Lines text={t(C.scheduleLead)} /></p>
              </div>
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

            <ol id="schedule" className="relative mt-8 lg:mt-10">
              <span aria-hidden className="absolute bottom-10 left-[5px] top-10 w-px bg-naru-navy/25 lg:left-[calc(11rem+5px)]" />
              {stages.map((s, i) => {
                const mentorsOn = s.mentorsCta && d.mentors.some((m) => m.confirmed);
                // DECIDED 2026-11-08 (docs/mission-card-brief.md D1): 미션은 접는 띠 대신 펼친 카드. Day 1 "들고 갈 것" 띠는 그대로 Disclosure.
                const strip = s.milestone ? (
                  <MissionCard
                    id={`mission-${s.dayOffset}`}
                    label={`★ ${t(d.milestoneLabel)}`}
                    title={t(C.milestone[s.dayOffset] ?? s.milestone)}
                    listLabel={t(C.milestoneConditionsLabel)}
                    rows={(C.conditions[s.dayOffset] ?? s.milestoneDetail?.conditions ?? []).map((c, j) => {
                      const k = s.milestoneDetail?.checks?.[j];
                      return { text: t(c), check: k ? t(C.checkLabels[k]) : "" };
                    })}
                    reward={t(s.dayOffset === 3 ? C.milestoneRewardLast : C.milestoneReward)}
                    upload={t(C.milestoneUpload)}
                    href={`/crossing/team?day=${s.dayOffset}`}
                  />
                ) : s.submit ? (
                  <Disclosure
                    id={`carry-${s.dayOffset}`}
                    mission={false}
                    label={t(d.carryLabel)}
                    title={t(C.carryTitle)}
                    groups={[
                      { label: t(d.carryDetail.todoLabel), items: C.carryTodo.map(t) },
                      { label: t(d.carrySubmitLabel), items: C.carrySubmit.map(t) },
                    ]}
                  />
                ) : null;
                return (
                  <li key={s.dayOffset} id={`day-${s.dayOffset}`} className={`relative grid scroll-mt-28 gap-x-10 border-b ${RULE} py-6 pl-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:py-7 lg:pl-0`}>
                    <span aria-hidden className="absolute left-0 top-[36px] lg:left-[11rem] lg:top-[48px]"><Stop arrive={s.dayOffset === 4} /></span>
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
                      <h3 className={`break-keep ${HEADING} ${INK}`}>{t(s.title)}</h3>
                      <p className={`mt-2 max-w-[42rem] break-keep ${BODY} ${SOFT} lg:max-w-none`}><Lines text={t(C.line[s.dayOffset] ?? s.line)} /></p>
                      {(s.session || s.chips.length > 0) && (
                        <p className={`mt-4 flex flex-wrap gap-x-5 gap-y-1 ${META} text-caption`}>
                          {/* DECIDED 2026-11-09 (사용자, 스크린숏: "각 세션 클릭하면 세션 설명이 나오게"): 세션 이름이 버튼이고, 누르면 아래에 설명이 펼쳐집니다. */}
                          {s.session && (s.session.detail?.length ? (
                            <button
                              type="button"
                              aria-expanded={openSession === s.dayOffset}
                              aria-controls={`session-${s.dayOffset}`}
                              onClick={() => setOpenSession((v) => (v === s.dayOffset ? null : s.dayOffset))}
                              className="-my-2 inline-flex items-center gap-1.5 rounded-md py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-naru-navy"
                            >
                              {t(d.sessionLabel)}{" "}
                              <span lang="en" className={`font-semibold ${INK} underline decoration-naru-navy/30 decoration-dotted underline-offset-[4px]`}>{t(s.session.title)}</span>
                              <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${openSession === s.dayOffset ? "rotate-180" : ""}`}>
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                          ) : (
                            <span>{t(d.sessionLabel)} <span lang="en" className={`font-semibold ${INK}`}>{t(s.session.title)}</span></span>
                          ))}
                          {(C.chips[s.dayOffset] ?? s.chips).map((c, j) => <span key={j}>{t(c)}</span>)}
                        </p>
                      )}
                      {s.session?.detail?.length ? (
                        <div id={`session-${s.dayOffset}`} hidden={openSession !== s.dayOffset} className={`mt-3 max-w-[42rem] rounded-xl border ${RULE} bg-[#FFFFFF] px-4 py-3.5`}>
                          <p lang="en" className={`${META} font-bold ${INK}`}>{t(s.session.title)}</p>
                          <ul className={`mt-1.5 flex flex-col gap-1.5 ${META} ${SOFT}`}>
                            {(C.sessionDetail[s.dayOffset] ?? s.session.detail).map((x, j) => (
                              <li key={j} className="break-keep leading-[1.65]">{t(x)}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {strip && <div className="mt-5 max-w-[42rem] lg:max-w-none">{strip}</div>}
                      {(s.flow?.length || s.matchCta || mentorsOn) && (
                        <div className="mt-3 flex flex-wrap gap-x-6">
                          {s.flow && s.flow.length > 0 && (
                            <button type="button" aria-haspopup="dialog" onClick={() => setFlowDay(i)} className={LINK}>{t(C.dayFlowLabel)}</button>
                          )}
                          {mentorsOn && (
                            <button type="button" aria-haspopup="dialog" onClick={() => setMentorsDay(i)} className={LINK}>{t(d.mentorsCtaLabel)}</button>
                          )}
                          {s.matchCta && (
                            <Link href={s.matchCta.href} onClick={() => track("naru_cta", { src: "day1", to: "match" })} className={LINK}>{t(C.matchLabel)}</Link>
                          )}
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
                    <h3 className={`${META} font-bold ${INK}`}>{t(naru.teaser.eyebrow)}</h3>
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
                    <h3 className={`${META} font-bold ${INK}`}>{t(main.label)}</h3>
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
                    <h3 className={`${META} font-bold ${INK}`}>{t({ ko: "후원", en: "Sponsors and partners" })}</h3>
                    <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-5">
                      {others.map(({ l, caption }) => (
                        <PartnerCell key={l.name} l={l} caption={caption} area={2600} maxH={42} className={ROW4} />
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </section>

        {/* ── 등록 ─────────────────────────────────────────────── */}
        {regState !== "closed" && (
          <section id="register" aria-labelledby="register-title" className="mt-14 pb-16 lg:mt-20 lg:pb-20">
            <div className={FRAME}>
              <div className="rounded-[22px] bg-[#FFFFFF] px-6 py-10 ring-1 ring-[#E3E0D8] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                <h2 id="register-title" className={`break-keep ${TITLE} ${INK}`}><Lines text={note} /></h2>
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

      {(() => {
        const st = flowDay != null ? stages[flowDay] : null;
        return (
          <DayFlowModal
            onClose={() => setFlowDay(null)}
            heading={t(C.dayFlowLabel)}
            closeLabel={t(d.dayFlowClose)}
            day={st && st.flow ? {
              dayLabel: `${t(d.dayLabel)} ${st.dayOffset}`,
              date: formatDecemberDayWithWeekday(locale, st.dayOffset),
              title: t(st.title),
              lead: t(C.line[st.dayOffset] ?? st.line),
              venue: st.logo,
              venueText: st.venueText && t(st.venueText),
              venueNote: st.venueNote && t(st.venueNote),
              rows: st.flow.map((r, k) => ({
                time: r.time, what: t(C.flow[st.dayOffset]?.[k] ?? r.what), where: r.where && t(r.where), href: r.href,
                speaker: r.speaker && {
                  photo: r.speaker.photo, name: t(r.speaker.name), role: t(r.speaker.role),
                  agendaLabel: t(C.speakerLabel[`${st.dayOffset}-${k}`] ?? r.speaker.agendaLabel),
                  agenda: (C.speakerAgenda[`${st.dayOffset}-${k}`] ?? r.speaker.agenda).map(t),
                },
              })),
            } : null}
          />
        );
      })()}

      {(() => {
        const st = mentorsDay != null ? stages[mentorsDay] : null;
        const ms = mentorsShown;
        return (
          <DayFlowModal
            onClose={() => setMentorsDay(null)}
            heading={t(C.mentorsTalkLabel)}
            closeLabel={t(d.dayFlowClose)}
            day={st ? { dayLabel: `${t(d.dayLabel)} ${st.dayOffset}`, date: formatDecemberDayWithWeekday(locale, st.dayOffset), title: t(d.mentorsHeading), lead: t(C.mentorsIntro), rows: [] } : null}
          >
            {/* DECIDED 2026-11-09 (사용자, 멘토 브리프 장 스크린숏: "이거대로 update"): 세 묶음, 묶음마다 설명 뒤 따옴표 여럿. 끝에 점수 없는 자리 한 줄. */}
            <ol className="grid gap-2.5">
              {d.mentorsTalk.map((x, j) => (
                <li key={j} className="flex flex-col gap-1.5 rounded-xl card-sunken px-4 py-3.5">
                  <p className={`text-[0.9375rem] font-bold leading-snug ${INK}`}>{t(C.mentorsTalkTitles[j] ?? x.title)}</p>
                  <p className={`break-keep ${META} ${SOFT}`}>{t(C.mentorsTalkBody[j])}</p>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {x.quotes.map((q, k) => (
                      <li key={k} className={`break-keep ${META} font-semibold ${NAVY}`}>{t(q)}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <p className={`mt-3 break-keep ${META} font-bold ${INK}`}>{t(C.mentorsTalkNote)}</p>
            <p className={`mt-7 border-t ${RULE} pt-5 ${META} font-bold ${INK}`}>{t(d.mentorsListLabel)}</p>
            <p className={`mt-1 break-keep ${META} ${SOFT}`}>{t(C.mentorsListNote)}</p>
            <ul className="mt-2 flex flex-col">
              {ms.map((m) => (
                <li key={m.name.ko} className={`flex flex-col gap-0.5 border-b ${RULE} py-3.5 last:border-b-0`}>
                  <p className={`text-[0.9375rem] font-bold ${INK}`}>{t(m.name)}</p>
                  {t(m.org) && <p className={`break-keep ${META} ${SOFT}`}>{t(m.org)} <span className="text-caption">{t(m.role)}</span></p>}
                  {m.bio && <p className={`break-keep ${META} text-caption`}>{t(m.bio)}</p>}
                </li>
              ))}
            </ul>
          </DayFlowModal>
        );
      })()}
    </>
  );
}
