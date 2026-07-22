"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links, partnerIntros, partnerIntroTBC, type Phrase } from "@/data/dictionary";
import {
  categoryMeta,
  days,
  schedule,
  type BEvent,
  type DayMeta,
} from "@/data/schedule";
import Chapter from "./Chapter";
import EventModal from "@/components/EventModal";
import PartnerModal, { type PartnerInfo } from "@/components/PartnerModal";
import ChatGlyph from "@/components/ChatGlyph";
import { loadOwnResult } from "@/lib/quizResult";
import { parseResultId } from "@/lib/quizScore";
import { RESULTS } from "@/data/quiz";
import { useRegister, type RegisterPreset } from "@/lib/RegisterContext";


// glass panel wrapper
function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-9 ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children, color = "violet", className = "" }: { children: React.ReactNode; color?: "violet" | "cyan" | "emerald"; className?: string }) {
  const map = {
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  } as const;
  return (
    <span className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${map[color]} ${className}`}>
      {children}
    </span>
  );
}

// Renders a plain string with every "→" arrow recoloured a bright violet, so
// the day-flow sentence reads as a clearly-arrowed progression. Splits on the
// arrow and interleaves coloured spans; all other text is unchanged.
// Optical logo sizing. Capping every mark at the same HEIGHT is what made the
// wall look ragged: a two-line lockup and a long thin wordmark set to the same
// height carry wildly different visual weight (the wordmark ends up three times
// the area). So we hold the rendered AREA roughly constant instead — for a mark
// of aspect r drawn at height h the area goes as r·h², hence h = √(A / r).
//
// The clamp keeps it sane at the extremes: without a floor a 8:1 wordmark like
// INNOVATE 360 would shrink to a hairline, and without a ceiling a square crest
// would overflow the tile. Anything still too wide is caught by `max-w-full`,
// which letterboxes it down — that only pushes it further toward equal area.
// Dimensions must describe the INK, not the shipped canvas, so every caller
// passes the trimmed art (see scripts/process-partner-logos.py).
function opticalHeight(w: number, h: number, area: number, min: number, max: number) {
  return Math.round(Math.min(max, Math.max(min, Math.sqrt(area / (w / h)))));
}

// A single partner logo on a clean white chip. Full-colour marks (crests,
// gradients) read best on a light tile against the dark section, and a missing
// file just shows an empty white chip rather than a broken-image icon.
// `onOpen` makes the tile a button that opens the company-intro modal (takes
// precedence — sponsor/mentor tiles use this instead of linking out); `url`
// makes it a link; `badge` shows a small role/stage pill; `big` gives square
// marks more presence.
function LogoTile({
  src, alt, w, h, url, badge, onOpen,
}: {
  src: string; alt: string; w: number; h: number;
  url?: string; badge?: string;
  onOpen?: (el: HTMLElement) => void;
}) {
  // Tile is h-20 (80px); 44px max leaves the mark breathing room inside it.
  const boxH = opticalHeight(w, h, 2000, 24, 44);
  const inner = (
    <>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        // Logos are tiny static brand marks (all ≤512px, pre-shrunk): skip the
        // image optimizer and load eagerly so they appear instantly instead of
        // popping in one-by-one via lazy-load + on-demand optimization.
        unoptimized
        loading="eager"
        style={{ height: boxH }}
        className="w-auto max-w-full object-contain"
      />
      {badge && (
        <span className="absolute right-1.5 top-1.5 rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-white/75">
          {badge}
        </span>
      )}
    </>
  );
  // Uniform dark card that matches the rest of the site's glass cards — the logos
  // are pre-rendered as white silhouettes (transparent bg), so they read cleanly
  // on this dark tile with no background block behind them.
  const cls =
    "group relative flex h-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]";
  if (onOpen) {
    return (
      <button
        type="button"
        onClick={(e) => onOpen(e.currentTarget)}
        className={`${cls} cursor-pointer`}
        aria-label={alt}
      >
        {inner}
      </button>
    );
  }
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls} aria-label={alt}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

type Tfn = (p: Phrase) => string;

// Read off links.partnership so the address can never drift from the mailto.
const PARTNER_EMAIL = links.partnership.replace(/^mailto:/, "").split("?")[0];

// Kept identical to EventModal's list so every dialog traps focus the same way.
const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

// ─────────────────────────────────────────────────────────────────────────────
// HOOK CARDS — the two-up entry point, rendered in the hero and reused verbatim
// as the mid-page CTA bands (after 혜택, after FAQ). One component, one style:
// the bands are the same cards, not a second design.
//
// Card 1 (violet, primary) opens the register modal ALREADY set to solo +
// matching, because that's exactly what its copy promises. Card 2 is the quiz,
// kept as a light aside; for a visitor who already took it, it deep-links to
// their saved result instead ("내 결과 보기").
//
// The register card carries `register.reassure` under its CTA — the same line in
// all three placements, from one key.
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// OPEN-CHAT LINK — the third CTA, for the visitor who isn't ready to register.
//
// Deliberately the lowest-hierarchy element wherever it appears: no border, no
// fill, no pill. It sits directly under a register CTA, and the moment it reads
// as a peer it starts taking clicks from the conversion it exists to catch. If
// this ever looks like a button, that's the bug.
//
// `src` tags where the click came from so the funnel can be read per placement.
// ─────────────────────────────────────────────────────────────────────────────
function OpenChatLink({
  t,
  src,
  className = "",
}: {
  t: Tfn;
  src: "band" | "footer";
  className?: string;
}) {
  if (!links.openChat) return null;
  return (
    // Ghost CHIP, not a bare underlined line. At text-white/45 with a hairline
    // underline this read as a footnote and was skipped — which defeats the
    // point, since this is the only offer on the page for someone who has read
    // everything and still isn't ready to register. Same ghost treatment as the
    // nav's open-chat button, so the two are recognisably the same door.
    //
    // Still deliberately NOT a fill: it sits under the violet register pill and
    // must stay a clear step below it. Border + brighter text is the ceiling.
    <a
      href={links.openChat}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("openchat_click", { src })}
      className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-medium leading-relaxed text-white/75 transition hover:border-white/35 hover:bg-white/10 hover:text-white ${className}`}
    >
      <ChatGlyph className="h-4 w-4 shrink-0" />
      {t(dict.register.openChatCta)}
      <span aria-hidden className="text-white/50">→</span>
    </a>
  );
}

function HookCards({
  t,
  ownResultId,
  openRegister,
  className = "",
  chatSrc,
  stacked = false,
}: {
  t: Tfn;
  ownResultId: string | null;
  openRegister: (preset?: RegisterPreset) => void;
  className?: string;
  // Which placement this instance is, for the open-chat link's funnel tag.
  // `null` renders no open-chat link at all — used by the hero, where the nav
  // now carries a permanent open-chat button in the same viewport and a second
  // link two hundred pixels below it was the same offer twice.
  chatSrc: "band" | null;
  // Force a single vertical column (no 2-up grid) — used in the hero's narrow
  // right column, where two cards side by side would be too cramped.
  stacked?: boolean;
}) {
  // "조급한 Mistral" for a visitor who already took the test. Derived from the
  // same saved id the CTA links to, so the greeting can never name a different
  // type than the link opens. Unparseable/unknown ids fall back to first-visit
  // copy rather than greeting someone as "undefined".
  const parsed = ownResultId ? parseResultId(ownResultId) : null;
  const ownName =
    parsed && RESULTS[parsed.mbti]
      ? t(RESULTS[parsed.mbti].variants[parsed.identity].name)
      : null;

  return (
    <div className={className}>
      <div className={`grid gap-3 ${stacked ? "" : "sm:grid-cols-2"}`}>
        {/* The WHOLE card is the button — the CTA used to be a text link inside a
            dead card, so the obvious tap target (the card) did nothing. One
            <button> keeps it a single tab stop and rules out nested interactives;
            the pill inside is a styled span, not another control. */}
        <button
          type="button"
          onClick={() => openRegister({ joinType: "solo", wantsMatching: true })}
          className="group flex flex-col items-start gap-2 rounded-2xl border border-violet-400/25 bg-violet-400/[0.07] p-4 text-left transition hover:border-violet-400/45 hover:bg-violet-400/[0.11]"
        >
          <p className="text-xs font-medium text-white/60">{t(dict.register.hookRegisterQ)}</p>
          {/* Same gradient + glow as the nav register button, so the primary
              action looks identical wherever it appears. */}
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,92,255,0.4)] transition group-hover:-translate-y-0.5 group-hover:shadow-[0_0_28px_rgba(124,92,255,0.6)]">
            {t(dict.register.hookRegisterCta)}
            {/* Effort estimate as a chip rather than words in the label — the
                label is already the longest thing in the card, and "3분" reads
                faster as a badge than as a clause. */}
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide">
              {t(dict.register.hookRegisterMinutes)}
            </span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
          {/* The four objections, immediately under the button that acts on them.
              One key, so the hero card and both mid-page bands always agree. */}
          <p className="text-xs leading-relaxed text-white/60">{t(dict.register.reassure)}</p>
          <p className="text-[11px] leading-relaxed text-white/45">{t(dict.register.hookRegisterSub)}</p>
        </button>
        {/* Card 2 — the aside. Copy only: it must stay a visual step below the
            register card, so nothing here gains a fill, a border weight or a
            pill. `ownName` is null until after mount (loadOwnResult is
            client-only), so the first render always matches the server's. */}
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
          <p className="text-xs font-medium text-white/60">
            {ownName
              ? t(dict.register.hookQuizQReturn).replace("{name}", ownName)
              : t(dict.register.hookQuizQ)}
          </p>
          <a
            href={ownResultId ? `/quiz?r=${ownResultId}` : "/quiz"}
            className="group inline-flex w-fit items-center gap-1.5 text-sm font-bold text-violet-100 transition hover:text-white"
          >
            <span aria-hidden>✦</span>
            {t(ownName ? dict.register.hookQuizCtaReturn : dict.register.hookQuizCta)}
          </a>
          {/* First-visit only — a returning visitor has already seen the joke
              and is here for their result, not the disclaimer. */}
          {!ownName && (
            <p className="text-xs leading-relaxed text-white/40">{t(dict.register.hookQuizNote)}</p>
          )}
        </div>
      </div>
      {/* Third CTA — under both cards, quieter than either. Absent in the hero:
          the nav's open-chat button is already on screen there. */}
      {chatSrc && (
        <div className="mt-3 text-center">
          <OpenChatLink t={t} src={chatSrc} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO LAUNCH PANEL — Countdown ↔ Problem Statement 전환 탭
//
// 행사 시작(LAUNCH_AT, 2026-08-22 KST) 전:  실시간 D-day 카운트다운을 보여준다.
// 행사 시작 후:                             같은 자리에서 Problem Statement 로 전환.
//
// 지금은 기획 단계라 두 뷰를 모두 만들어 시각 확인이 가능하도록 수동 토글 탭을 노출한다
// (`PREVIEW_TABS = true`). 실제 퍼블리시 시점에는 `PREVIEW_TABS = false` 로만 바꾸면
// 탭이 사라지고, LAUNCH_AT 을 기준으로 카운트다운 → Problem 이 자동 전환된다.
// ─────────────────────────────────────────────────────────────────────────────

// 빌더톤 시작(현지 8/22 00:00, KST=UTC+9 기준 → 08/21 15:00 UTC).
const LAUNCH_AT = new Date("2026-08-22T00:00:00+09:00").getTime();
// 기획/디자인 컨펌 단계에서만 true. 퍼블리시 시 false 로 바꾸면 탭이 숨겨지고
// 날짜(LAUNCH_AT)에 따라서만 뷰가 결정된다.
const PREVIEW_TABS = false;

type LaunchView = "countdown" | "problem";

function useCountdown(target: number) {
  // SSR/첫 렌더에서 hydration mismatch 를 피하려고 0 으로 시작, 마운트 후 실제 값으로.
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const done = remaining !== null && remaining <= 0;
  const total = remaining ?? 0;
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { ready: remaining !== null, done, days, hours, minutes, seconds };
}

function CountdownView({ t }: { t: Tfn }) {
  const { ready, done, days, hours, minutes, seconds } = useCountdown(LAUNCH_AT);
  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { v: days, label: t(dict.hero.countdownUnitDays) },
    { v: hours, label: t(dict.hero.countdownUnitHours) },
    { v: minutes, label: t(dict.hero.countdownUnitMinutes) },
    { v: seconds, label: t(dict.hero.countdownUnitSeconds) },
  ];

  if (done) {
    return (
      <Glass className="text-center">
        <p className="text-lg font-bold text-white">{t(dict.hero.countdownStarted)}</p>
      </Glass>
    );
  }

  return (
    <div className="text-center">
      <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
        {/* Gentle, slow pulse (~2.4s) instead of animate-ping's snappy 1s scale,
            which read as too fast / twitchy on mobile. */}
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-[softPulse_2.4s_ease-in-out_infinite] rounded-full bg-violet-400/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
        </span>
        {/* Short label on mobile ("Begins in"), full line from sm up. */}
        <span className="sm:hidden">{t(dict.hero.countdownEyebrowShort)}</span>
        <span className="hidden sm:inline">{t(dict.hero.countdownEyebrow)}</span>
        <span className="text-white/40">· {t(dict.hero.countdownLive)}</span>
      </p>
      <div className="mx-auto grid w-fit grid-cols-4 gap-1.5 sm:gap-2.5">
        {units.map((u, i) => (
          <div
            key={u.label}
            className="w-14 rounded-xl border border-white/10 bg-white/[0.04] px-1.5 py-2.5 sm:w-16 sm:px-2 sm:py-3.5"
          >
            <div className="bg-gradient-to-b from-white to-white/60 bg-clip-text font-black tabular-nums text-transparent text-[clamp(1.4rem,5vw,2.25rem)] leading-none">
              {/* 첫 칸(days)은 자릿수 그대로, 나머지는 2자리 고정 */}
              {ready ? (i === 0 ? u.v : pad(u.v)) : "—"}
            </div>
            <div className="mt-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-white/50 sm:text-[0.65rem]">
              {u.label}
            </div>
          </div>
        ))}
      </div>
      {/* What the ticking clock actually costs you — deliberately about what
          registering gets you sooner, not about seats running out. There is no
          cap and no deadline yet, so "선착순 / 마감 임박 / 잔여석" would be an
          invented pressure; every clause below is something we already do.
          Static text: it must not animate alongside the seconds.
          TODO: 매칭 '등록 순서' 운영 방침 확정 시 "일찍 등록할수록 매칭 풀이
          넓어요"로 강화 가능 */}
      <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-white/55">
        {t(dict.hero.countdownUrgency)}
      </p>
    </div>
  );
}

function ProblemView({ t }: { t: Tfn }) {
  return (
    <Glass className="text-left">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow color="violet">✦ {t(dict.hero.problemEyebrow)}</Eyebrow>
        <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-widest text-violet-200">
          {t(dict.hero.problemPlaceholderBadge)}
        </span>
      </div>
      <h3 className="text-[clamp(1.35rem,3.5vw,2rem)] font-bold leading-tight tracking-tight text-white">
        {t(dict.hero.problemHeading)}
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
        {t(dict.hero.problemBody)}
      </p>
      {/* 실제 문제 카드가 들어갈 자리 — 확정 시 채워질 플레이스홀더 슬롯 3개 */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-dashed border-white/12 bg-white/[0.02]"
            aria-hidden
          />
        ))}
      </div>
    </Glass>
  );
}

// The hero slot that swaps between Countdown and Problem Statement.
function HeroLaunchPanel({ t, reduce }: { t: Tfn; reduce: boolean }) {
  // 기본 뷰는 날짜로 결정: 시작 전이면 countdown, 시작 후면 problem.
  // 마운트 후에만 Date.now() 를 읽어 hydration mismatch 를 피한다.
  const [view, setView] = useState<LaunchView>("countdown");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setView(Date.now() >= LAUNCH_AT ? "problem" : "countdown");
  }, []);

  const tabs: { key: LaunchView; label: string }[] = [
    { key: "countdown", label: t(dict.hero.countdownTabLabel) },
    { key: "problem", label: t(dict.hero.problemTabLabel) },
  ];

  return (
    // Centred/limited on mobile; fills the right column from lg up.
    <div className="mx-auto w-full max-w-xl lg:max-w-none">
      {/* 미리보기 탭 — 퍼블리시 시 PREVIEW_TABS=false 로 숨김 */}
      {PREVIEW_TABS && (
        <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm">
          {tabs.map((tab) => {
            const active = view === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setView(tab.key)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 font-semibold transition ${
                  active ? "bg-white/90 text-[#0a0814]" : "text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* mounted 전에는 SSR 기본값(countdown)만 렌더 → hydration 안정 */}
          {view === "countdown" || !mounted ? <CountdownView t={t} /> : <ProblemView t={t} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Self-paced build is not a session: no start time, nowhere to be, nothing to
// attend. Read off the explicit data flag rather than category === "build",
// because that category ALSO holds the Day 5 Quickathon, which is a scheduled
// 4-hour on-site track. See BEvent.selfPaced.
const isSelfPaced = (ev: BEvent) => ev.selfPaced === true;
// Everything on this day a participant actually has to show up for.
const realSessions = (dayNum: number) =>
  schedule.filter((e) => e.day === dayNum && !isSelfPaced(e));
const dayHasSelfPaced = (dayNum: number) =>
  schedule.some((e) => e.day === dayNum && isSelfPaced(e));
// A day with NO real sessions (Day 6): nothing to count, and no online /
// in-person mode to report either.
const dayIsSelfPaced = (dayNum: number) =>
  dayHasSelfPaced(dayNum) && realSessions(dayNum).length === 0;

// Self-paced build as a quiet, NON-INTERACTIVE line — no badge, no
// "자세히 보기", nothing to click. Rendered as a session card it read as one
// more thing to turn up for, and on an 8-day programme that is what tips
// "exciting" into "exhausting". There is nothing to open because there is
// nothing to attend.
function SelfPacedNote({ t }: { t: Tfn }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3.5 py-3 text-xs leading-relaxed text-white/45">
      <span aria-hidden className="mt-[1px] text-white/25">◇</span>
      {t(dict.program.selfPacedNote)}
    </p>
  );
}

// A single program event card. Shared by the desktop column grid and the mobile
// day accordion so both stay in sync. Height is only fixed on desktop (xl) to
// keep columns even; on mobile cards hug their content.
function EventCard({ ev, t, onSelect }: { ev: BEvent; t: Tfn; onSelect: (e: BEvent, el: HTMLElement) => void }) {
  const meta = categoryMeta[ev.category];
  const isMain = ev.category === "main";
  const offline = ev.mode === "offline";
  // "mixed" (1:1 mentoring — in person or online depending on the mentor) gets
  // its own neutral badge: an amber "현장" would promise F2F to everyone.
  const byMentor = ev.mode === "mixed";
  const selfPaced = isSelfPaced(ev);
  return (
    <button
      type="button"
      onClick={(e) => onSelect(ev, e.currentTarget)}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-white/[0.06] xl:min-h-[148px]"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] opacity-70" style={{ backgroundColor: meta.dot }} />
      <div className="flex flex-wrap items-center gap-1.5 pl-2">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: meta.dot }}>
          {isMain && <span className="mr-0.5 text-amber-300">★</span>}{t(meta.label)}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {ev.confirmed && (
            <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[0.7rem] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
              {t(dict.program.confirmedBadge)}
            </span>
          )}
          {selfPaced ? (
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-1.5 py-0.5 text-[0.7rem] font-semibold text-white/60">
              {t(dict.program.selfPacedLabel)}
            </span>
          ) : byMentor ? (
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-1.5 py-0.5 text-[0.7rem] font-semibold text-white/60">
              {t(dict.program.byMentorLabel)}
            </span>
          ) : offline ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[0.7rem] font-bold text-amber-200">
              <span aria-hidden>●</span>{t(dict.program.offlineLabel)}
            </span>
          ) : (
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-1.5 py-0.5 text-[0.7rem] font-semibold text-white/60">
              {t(dict.program.onlineLabel)}
            </span>
          )}
        </span>
      </div>
      <h4 className="mt-2 pl-2 text-base font-bold leading-snug text-white">{t(ev.title)}</h4>
      <p className="mt-1.5 pl-2 text-sm leading-relaxed text-white/70">{t(ev.summary)}</p>
      <span className="mt-auto pl-2 pt-3 text-xs font-semibold text-violet-300/60 transition group-hover:text-violet-300">
        {t(dict.program.tapHint)} →
      </span>
    </button>
  );
}

// Small mode/mandatory pill helpers for the clean day cards + day modal.
function DayModeBadge({ day, t, selfPaced = false }: { day: DayMeta; t: Tfn; selfPaced?: boolean }) {
  // Checked before dayMode: a fully self-paced day's dayMode is "online" in the
  // data, and that badge is the misleading one being replaced.
  if (selfPaced)
    return (
      <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-semibold text-white/60">
        {t(dict.program.selfPacedLabel)}
      </span>
    );
  if (day.dayMode === "offline")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[0.68rem] font-bold text-amber-200">
        <span aria-hidden>●</span>{t(dict.program.offlineLabel)}
      </span>
    );
  if (day.dayMode === "pending")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-amber-400/30 bg-amber-400/[0.06] px-2 py-0.5 text-[0.68rem] font-bold text-amber-200/90">
        {t(dict.program.pendingLabel)}
      </span>
    );
  return (
    <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-semibold text-white/60">
      {t(dict.program.onlineLabel)}
    </span>
  );
}

// One clean summary card per day (deck-style). Opens the day detail modal on
// click rather than exploding every session inline — keeps the arc scannable.
function DayCard({ day, t, onOpen }: { day: DayMeta; t: Tfn; onOpen: (n: number) => void }) {
  const evCount = realSessions(day.day).length;
  const allSelfPaced = dayIsSelfPaced(day.day);
  return (
    <button
      type="button"
      onClick={() => onOpen(day.day)}
      className="group relative flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-violet-300/70">{t(dict.program.dayLabel)}</span>
          <span className="text-2xl font-black leading-none text-white">{day.day}</span>
        </span>
        <span className="text-[0.7rem] text-white/55">{day.date} · {t(day.weekday)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {day.mandatory && (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[0.68rem] font-bold text-rose-200">
            <span aria-hidden>★</span>{t(dict.program.mandatoryBadge)}
          </span>
        )}
        <DayModeBadge day={day} t={t} selfPaced={allSelfPaced} />
      </div>
      <h4 className="mt-3 text-[15px] font-bold leading-snug text-white">{t(day.theme)}</h4>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">{t(day.summary)}</p>
      <span className="mt-auto pt-4 text-xs font-semibold text-violet-300/60 transition group-hover:text-violet-300">
        {evCount === 0
          ? t(dict.program.noSessions)
          : `${evCount} ${t(evCount === 1 ? dict.program.session : dict.program.sessions)}`}{" "}
        · {t(dict.program.tapHint)} →
      </span>
    </button>
  );
}

// Day detail modal — opened from a DayCard. Lists that day's sessions as the
// shared EventCard; tapping a session opens the full EventModal on top.
function DayModal({
  dayNum,
  onClose,
  onSelectEvent,
  eventOpen,
  t,
}: {
  dayNum: number | null;
  onClose: () => void;
  onSelectEvent: (e: BEvent, el: HTMLElement) => void;
  // True while an EventModal is stacked on top of this one. Both dialogs listen
  // for Escape on `document`, so without this one press closed BOTH — you'd
  // land back on the page instead of the day you were reading, and the two
  // focus-restores raced each other down to <body>.
  eventOpen: boolean;
  t: Tfn;
}) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Read through a ref, not the effect deps: putting `eventOpen` in the deps
  // would tear down and re-run this effect every time an event dialog opens,
  // which fires the cleanup's focus-restore and bounces focus back to the day
  // card mid-interaction.
  const eventOpenRef = useRef(eventOpen);
  eventOpenRef.current = eventOpen;
  // Same reason: `onClose` is an inline arrow from the parent, so it's a new
  // function on every render. With it in the deps the effect tore down and
  // re-ran on every re-render — including the one caused by opening an event
  // dialog — and each re-run re-captured `opener` from whatever happened to
  // have focus at that moment. By the time the dialog actually closed, the
  // original day card was long forgotten and focus fell to <body>.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Same open/close lifecycle as EventModal and RegisterModal — ESC, Tab focus
  // trap, body scroll lock, inert background, initial focus and focus
  // restoration. This dialog only had ESC + scroll lock, so Tab walked straight
  // out into the page behind it and closing dropped focus back to <body>: with
  // a keyboard you could open a day, tab away into content you couldn't see,
  // and never find your way back to the day card you came from.
  useEffect(() => {
    if (dayNum == null) return;
    const opener = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      // The event dialog on top owns the keyboard while it's open.
      if (eventOpenRef.current) return;
      if (e.key === "Escape") {
        onCloseRef.current();
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
        } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const inerted = Array.from(
      document.querySelectorAll<HTMLElement>("header, main, footer")
    );
    inerted.forEach((el) => el.setAttribute("inert", ""));
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      inerted.forEach((el) => el.removeAttribute("inert"));
      window.clearTimeout(id);
      opener?.focus?.();
    };
  }, [dayNum]);

  if (!mounted) return null;
  const day = dayNum != null ? days.find((d) => d.day === dayNum) : null;
  const evs = day ? realSessions(day.day) : [];

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
          <div aria-hidden onClick={onClose} className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-modal-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.985 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[85vh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0c0a18] shadow-2xl sm:rounded-3xl"
          >
            <span aria-hidden className="h-[2px] w-full shrink-0 bg-gradient-to-r from-accent to-accent-strong" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t(dict.modal.close)}
              className="absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
                <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <div className="overflow-y-auto px-6 pt-8 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-9 sm:py-9">
              <div className="flex flex-wrap items-center gap-2 pr-12">
                <span className="rounded-full border border-violet-400/25 bg-violet-500/12 px-3 py-1 text-xs font-bold text-violet-200">
                  {t(day.phase)}
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  {t(dict.program.dayLabel)} {day.day} · {day.date} · {t(day.weekday)}
                </span>
                {day.mandatory && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-xs font-bold text-rose-200">
                    <span aria-hidden>★</span>{t(dict.program.mandatoryBadge)}
                  </span>
                )}
                <DayModeBadge day={day} t={t} selfPaced={dayIsSelfPaced(day.day)} />
              </div>
              <h3 id="day-modal-title" className="mt-5 text-[24px] font-bold leading-tight text-white sm:text-[30px]">{t(day.theme)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{t(day.summary)}</p>
              <div className="mt-6 grid gap-3">
                {evs.map((ev) => (
                  <EventCard key={ev.id} ev={ev} t={t} onSelect={onSelectEvent} />
                ))}
                {day && dayHasSelfPaced(day.day) && <SelfPacedNote t={t} />}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Builder-companion logos that scroll in an infinite marquee band. These are
// the Zero100 network partners. Source logos from zero100.org were full-res
// SVGs (~13MB total); they're downscaled to ~100px-tall transparent WebPs in
// /public/partners/zero100/ (~220KB total) since they only render ~36px tall.
// They're light-on-transparent already, so they render as-is on the dark band —
// no invert. To add one: add a trimmed WebP there and append { src, alt, w, h }
// here — w/h are the file's own pixel dimensions and must describe the INK, as
// the band sizes every mark to equal area from them (see opticalHeight).
// Order here = order on screen.
const companions: { src?: string; alt?: string; w?: number; h?: number }[] = [
  { src: "/partners/zero100/01-translink-investment.webp", alt: "Translink Investment", w: 338, h: 100 },
  { src: "/partners/zero100/02-wilt-venture-builder.webp", alt: "Wilt Venture Builder", w: 203, h: 100 },
  // Popup Studio's old logo removed here — the current mark lives in the
  // confirmed-partner card below. D.CAMP / 혁신의숲 / Career Day / Brand Worker
  // Partners were 2024-event supporters with no ongoing tie to this builderthon,
  // so they're excluded from the network wall to avoid implying participation.
  // Startup Alliance and MYSC are in at the network's own request (they were
  // missing), and UKF stands in for 82Startup as the better-known mark.
  { src: "/partners/zero100/05-startup-alliance.webp", alt: "Startup Alliance", w: 268, h: 100 },
  { src: "/partners/zero100/06-KAIA.webp", alt: "KAIA", w: 263, h: 100 },
  { src: "/partners/zero100/07-venturesquare.webp", alt: "Venture Square", w: 354, h: 100 },
  { src: "/partners/zero100/08-mysc.webp", alt: "MYSC", w: 256, h: 100 },
  { src: "/partners/zero100/09-eventus.webp", alt: "EventUs", w: 212, h: 100 },
  { src: "/partners/zero100/26-ukf.webp", alt: "United Korean Founders", w: 310, h: 100 },
  { src: "/partners/zero100/12-mission.webp", alt: "Mission", w: 401, h: 100 },
  { src: "/partners/zero100/13-code.presso.webp", alt: "Codepresso", w: 509, h: 100 },
  { src: "/partners/zero100/14-themiilk.webp", alt: "TheMiilk", w: 427, h: 100 },
  { src: "/partners/zero100/16-andar.webp", alt: "andar", w: 368, h: 100 },
  { src: "/partners/zero100/17-ceo-suite.webp", alt: "CEO SUITE", w: 489, h: 100 },
  { src: "/partners/zero100/18-yj.webp", alt: "YJ", w: 98, h: 100 },
  { src: "/partners/zero100/20-habit-factory.webp", alt: "Habit Factory", w: 560, h: 75 },
  { src: "/partners/zero100/21-nuldam.webp", alt: "Nuldam", w: 443, h: 100 },
  { src: "/partners/zero100/22-hanyeo.webp", alt: "Hanyeo", w: 329, h: 100 },
  { src: "/partners/zero100/23-twigfarm.webp", alt: "Twigfarm", w: 370, h: 100 },
  { src: "/partners/zero100/24-kowork.webp", alt: "Kowork", w: 478, h: 100 },
  { src: "/partners/zero100/25-one-dgree-labs.webp", alt: "One Degree Labs", w: 122, h: 100 },
  // This builderthon's own partner slide (host · organizers · confirmed
  // sponsors) rides in the same band, so every logo on that slide appears here
  // too. These read from white/trimmed/ — the same marks as the partner wall
  // above, cropped to their alpha bbox. Several ship with transparent padding
  // baked into the canvas (Brand Boost filled 40%x30% of its file), which made
  // them render visibly smaller than the tightly-cropped zero100 logos beside
  // them. See scripts/process-partner-logos.py.
  { src: "/partners/logos/white/trimmed/drimaes.png", alt: "Drimaes", w: 332, h: 50 },
  { src: "/partners/logos/white/trimmed/popup-studio.png", alt: "Popup Studio", w: 512, h: 245 },
  { src: "/partners/logos/white/trimmed/smu-lion.png", alt: "SMU KSA", w: 292, h: 173 },
  { src: "/partners/logos/white/trimmed/nus.png", alt: "NUS Korea Society", w: 512, h: 512 },
  { src: "/partners/logos/white/trimmed/ntu-ksa.png", alt: "NTU KSA", w: 318, h: 382 },
  { src: "/partners/logos/white/trimmed/aws.png", alt: "AWS", w: 512, h: 306 },
  { src: "/partners/logos/white/trimmed/innovate360.png", alt: "INNOVATE 360", w: 455, h: 54 },
  { src: "/partners/logos/white/trimmed/life.png", alt: "L^IFE", w: 900, h: 352 },
  { src: "/partners/logos/white/trimmed/bzcf.png", alt: "BZCF", w: 465, h: 156 },
  { src: "/partners/logos/white/trimmed/korean-association.png", alt: "Korean Association in Singapore", w: 443, h: 90 },
  { src: "/partners/logos/white/trimmed/onword.png", alt: "Onword Lab", w: 900, h: 92 },
  { src: "/partners/logos/white/trimmed/remited.png", alt: "REmited", w: 512, h: 105 },
  { src: "/partners/logos/white/trimmed/brandboost.png", alt: "Brand Boost", w: 205, h: 81 },
  { src: "/partners/logos/white/trimmed/hashed.png", alt: "Hashed", w: 355, h: 90 },
];

// A horizontally-scrolling wall of confirmed builder-companion logos. The track
// holds the list twice and translates -50%, so the loop is seamless; the global
// prefers-reduced-motion rule freezes it for motion-sensitive users, and it
// pauses on hover. Empty slots render a tasteful "logo coming" frame.
function CompanionMarquee({ t }: { t: Tfn }) {
  // Two rows: the network is split in half so each row shows distinct logos,
  // and they scroll in opposite directions (left / right) for a livelier band.
  const mid = Math.ceil(companions.length / 2);
  const rows = [
    { items: companions.slice(0, mid), dir: "marquee-left" },
    { items: companions.slice(mid), dir: "marquee-right" },
  ];
  return (
    <div className="relative mt-10">
      {/* edge fades so logos dissolve into the band rather than hard-cut */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0814]/55 to-transparent sm:w-28" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0814]/55 to-transparent sm:w-28" />
      {/* decorative logo wall (two duplicated tracks) — hidden from AT to avoid
          announcing the names twice; the "Builder Network" heading conveys it */}
      <div aria-hidden className="group flex flex-col gap-4 overflow-hidden sm:gap-5">
        {rows.map((r, ri) => {
          // each track holds its half twice so the -50% translate loops seamlessly
          const track = [...r.items, ...r.items];
          return (
            <div key={ri} className={`marquee-track ${r.dir} group-hover:[animation-play-state:paused]`}>
              {track.map((c, i) => (
                <div
                  key={i}
                  aria-hidden={!c.src}
                  className="mr-4 flex h-24 w-44 shrink-0 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.05] px-6 sm:mr-5 sm:h-28 sm:w-52"
                >
                  {c.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.src}
                      alt=""
                      // Same equal-area rule as the partner wall above, sized up
                      // for the taller band tile — see opticalHeight().
                      style={{ height: c.w && c.h ? opticalHeight(c.w, c.h, 3000, 28, 56) : undefined }}
                      className="w-auto max-w-[82%] object-contain opacity-95 transition group-hover:opacity-100"
                    />
                  ) : (
                    // placeholder logo frame — neutral, claims no specific company
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-white/15 text-white/20">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5 12.5 7 7 12.5 1.5 7 7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Hero background video ──────────────────────────────────────────────────
// Scoped to the hero only (the rest of the page keeps the WebGL field). It's a
// standard autoplay/muted/loop/playsInline background video — muted is what
// lets it autoplay; playsInline stops iOS going fullscreen; the poster shows
// before the video loads or if it fails.
//
// PLACEHOLDER STATE: `enabled: false`, so the live hero is unchanged (WebGL).
// To turn it on, drop a web-optimised clip into /public/hero/ as hero.webm
// (+ hero.mp4 fallback) and a still frame hero-poster.jpg, then set
// enabled: true. Keep each video file ~1–2MB (see /public/hero/README.md).
// metal-human — chrome/liquid-metal humanoid loop (GetLayers, no watermark).
// Source master is 4K mp4 + 2K poster (see /public/hero/metal-human*). No webm
// variant ships with this asset, so we serve the mp4 alone.
// TODO: transcode a web-optimised ~1–2MB clip (+ webm) for production — the 4K
// master is heavy for an autoplaying hero background.
const HERO_VIDEO = {
  enabled: true,
  webm: "",
  mp4: "/hero/metal-human.mp4",
  poster: "/hero/metal-human-poster.jpg",
};

function HeroVideo({ blur }: { blur?: MotionValue<string> }) {
  if (!HERO_VIDEO.enabled) return null; // placeholder: keep the WebGL background
  return (
    // The whole layer fades to transparent over its bottom third (mask) so the
    // video dissolves into the fixed WebGL field behind it — no hard seam where
    // the hero ends and the next chapter begins.
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 96%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 96%)",
      }}
    >
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        poster={HERO_VIDEO.poster}
        // Scroll-driven blur (sharp → soft as the hero scrolls away).
        style={blur ? { filter: blur } : undefined}
        // The figure is centred in-frame; object-center keeps it centred on both
        // portrait and landscape crops.
        className="h-full w-full object-cover object-center"
      >
        {HERO_VIDEO.webm && <source src={HERO_VIDEO.webm} type="video/webm" />}
        <source src={HERO_VIDEO.mp4} type="video/mp4" />
      </motion.video>
      {/* legibility scrim — darker top so the headline reads; fades to nothing
          toward the bottom so the mask hands off cleanly to the WebGL field */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0814]/85 via-[#0a0814]/68 to-transparent" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO CONFIRMED-PARTNER STRIP — the deck cover's "CONFIRMED PARTNERS" band.
//
// HONESTY RULE (same as the partner wall): only partners whose participation is
// CONFIRMED may appear here. The Zero100 network marquee stays out — those are
// network companions, not partners of this event — as does anything still in
// discussion.
//
// STRUCTURE: the strip mirrors the partner section's own 주최 → 주관 → 후원
// tiering rather than dumping every mark into one anonymous row, so the hero
// answers "who is running this" and "who is backing it" as separate questions —
// which is the whole point of showing logos this early.
//
// Assets are the same trimmed white silhouettes the partner wall uses — no new
// files. They're above the fold, so they load eagerly (never lazily).
// ─────────────────────────────────────────────────────────────────────────────
type StripLogoSpec = { src: string; alt: string; w: number; h: number };

const confirmedPartnerTiers: { label: Phrase; items: StripLogoSpec[] }[] = [
  {
    // 주최 · HOST — the AXMOS collective.
    label: dict.hero.partnersHost,
    items: [
      { src: "/partners/logos/white/trimmed/translink.png",    alt: "Translink Investment", w: 330, h: 91 },
      { src: "/partners/logos/white/trimmed/wilt.png",         alt: "Wilt Venture Builder", w: 309, h: 148 },
      { src: "/partners/logos/white/trimmed/codepresso.png",   alt: "Codepresso",           w: 456, h: 91 },
      { src: "/partners/logos/white/trimmed/drimaes.png",      alt: "Drimaes",              w: 332, h: 50 },
      { src: "/partners/logos/white/trimmed/popup-studio.png", alt: "Popup Studio",         w: 512, h: 245 },
    ],
  },
  {
    // 주관 · 운영 — the student associations actually running the event.
    label: dict.hero.partnersOrganizers,
    items: [
      { src: "/partners/logos/white/trimmed/smu-lion.png", alt: "SMU KSA",           w: 292, h: 173 },
      { src: "/partners/logos/white/trimmed/nus.png",      alt: "NUS Korea Society", w: 512, h: 512 },
      { src: "/partners/logos/white/trimmed/ntu-ksa.png",  alt: "NTU KSA",           w: 318, h: 382 },
    ],
  },
  {
    // 후원 · SPONSORS — confirmed only; the deck lists no in-discussion sponsors.
    // AWS and Hashed lead: they are the two marks a visitor recognises without
    // being told, so they do the most work in a first-screen band. The rest keep
    // the partner section's order. (Only the hero strip is ordered this way —
    // the section itself stays grouped by what each sponsor provides.)
    label: dict.hero.partnersSponsors,
    items: [
      { src: "/partners/logos/white/trimmed/aws.png",                alt: "AWS",                             w: 512, h: 306 },
      { src: "/partners/logos/white/trimmed/hashed.png",             alt: "Hashed",                          w: 355, h: 90 },
      { src: "/partners/logos/white/trimmed/innovate360.png",        alt: "INNOVATE 360",                    w: 455, h: 54 },
      { src: "/partners/logos/white/trimmed/life.png",               alt: "L^IFE",                           w: 900, h: 352 },
      { src: "/partners/logos/white/trimmed/bzcf.png",               alt: "BZCF",                            w: 465, h: 156 },
      { src: "/partners/logos/white/trimmed/korean-association.png", alt: "Korean Association in Singapore",  w: 443, h: 90 },
      { src: "/partners/logos/white/trimmed/onword.png",             alt: "Onword Lab",                      w: 900, h: 92 },
      { src: "/partners/logos/white/trimmed/remited.png",            alt: "REmited",                         w: 512, h: 105 },
      { src: "/partners/logos/white/trimmed/brandboost.png",         alt: "Brand Boost",                     w: 205, h: 81 },
    ],
  },
];

// One logo, sized by the same equal-area rule as the partner wall (see
// opticalHeight). The band was originally tuned to 14–24px, which turned out to
// be past "understated" and into "unreadable" — a wordmark like WILT VENTURE
// BUILDER lost its subtitle entirely. 22–38px is still a thin strip but the
// marks are legible at a glance, which is the only reason they're here.
function StripLogo({ src, alt, w, h }: StripLogoSpec) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      // Above the fold: never lazy-load. These are the same small pre-shrunk
      // static marks the partner wall uses, so there's nothing to optimize.
      // fetchPriority="low" is the counterweight: 14 eager images at default
      // priority pushed hero LCP from ~0.97s to ~1.56s on throttled Slow 4G /
      // 4x CPU by crowding the critical path. Low priority keeps them eager (no
      // pop-in on fast connections) but yields the pipe to the hero itself.
      loading="eager"
      fetchPriority="low"
      decoding="async"
      title={alt}
      // Band widened from 12–19px. Equal-AREA sizing (see opticalHeight), so a
      // square crest and a long wordmark grow by the same visual weight rather
      // than the same pixel height — that's what keeps a row from going ragged
      // as it scales. Ceilings verified against the two places this can break:
      // the 9-logo 후원 row wrapping on a laptop, and the phone marquee.
      style={{ height: opticalHeight(w, h, 1400, 16, 26) }}
      // The marks are white silhouettes and the hero video runs bright behind
      // them on phones, where the strip sits over the figure — a plain opacity
      // knock-back made them vanish there. The dark drop-shadow keeps them
      // legible on both the dark desktop area and the bright mobile band.
      // max-w is the backstop for the widest wordmarks: it letterboxes them
      // down instead of letting one mark blow out its row's width.
      className="w-auto max-w-[8.5rem] shrink-0 object-contain opacity-50 grayscale drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] transition duration-300 group-hover:opacity-80"
    />
  );
}

// The small 주최 / 주관 / 후원 caption that leads each tier.
function StripTierLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 whitespace-nowrap text-[0.55rem] font-bold uppercase tracking-[0.16em] text-violet-200/60 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
      {children}
    </span>
  );
}

// Thin confirmed-partner logo band at the bottom of the hero, above the scroll
// hint — grouped 주최 → 주관 → 후원 like the partner section. Desktop lays the
// tiers out inline and lets them wrap; below sm it reuses the site's marquee
// animation as a slow auto-scroll (17 marks can't fit a phone width) with the
// tier captions riding inline in the same track. Tapping anywhere jumps to the
// full partner section — individual intro modals stay there, not here.
function HeroPartnerStrip({ t }: { t: Tfn }) {
  // Layout split: mobile always gets the single-line auto-scroll marquee (it
  // keeps moving even under reduced motion — see the marquee-hero exemption in
  // globals.css — because a frozen line would park 주관/후원 off-screen). From
  // sm up it's the stacked 주최 / 주관 / 후원 tiers instead.

  // One flat sequence for the marquee: caption, then that tier's marks, repeated.
  const marqueeItems = confirmedPartnerTiers.flatMap((tier) => [
    { label: t(tier.label) },
    ...tier.items,
  ]) as ({ label: string } | StripLogoSpec)[];

  // The seamless loop needs the track duplicated (translate -50% lands back on
  // an identical copy), but that doubles the above-fold element count for a
  // payoff nobody can see until the animation has run for a while. Ship one copy
  // in the first paint and duplicate right after mount: on throttled mobile the
  // 17 tiers-worth of marks are already the heaviest thing in the hero, and
  // rendering 34 of them up front measurably pushed LCP out. The second copy
  // appends off-screen to the right, so the swap is invisible.
  const [looped, setLooped] = useState(false);
  useEffect(() => setLooped(true), []);

  return (
    // Non-clickable: kept the `group` wrapper so the hover highlight still plays,
    // but it's a div (not a link) so the strip no longer jumps to #builders.
    <div className="group mt-4 block w-full rounded-2xl py-1.5 sm:mt-5">
      <p className="text-center text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/55 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] transition group-hover:text-white/80">
        {t(dict.hero.partnersLabel)}
      </p>
      {/* The two facts that make these logos mean something — folded into the
          strip's caption rather than added as a separate line, since it's the
          same claim ("these partners are really involved") in specifics.
          Hidden below sm: the phone hero is already tall, and this is the one
          line here that is a nice-to-have rather than an objection-remover. */}
      <p className="mt-1.5 hidden text-center text-xs leading-relaxed text-white/50 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:block">
        {t(dict.hero.heroNameValue)}
      </p>

      {/* ≥sm — one row per tier, caption centred above its own marks. The tiers
          used to run inline (caption, then marks, then the next caption) which
          read as one long undifferentiated line: the whole point of the tiering
          is that 주최 / 주관 / 후원 are answers to different questions, and a
          vertical stack is what makes them read that way. */}
      {/* Gaps are deliberately tight: stacking three tiers and enlarging the
          marks already added ~160px to a hero that overflows a laptop viewport,
          so every row here is spaced to the minimum that still separates them. */}
      <div className="mt-2.5 hidden flex-col items-center gap-2 sm:flex">
        {confirmedPartnerTiers.map((tier) => (
          <div key={tier.label.en} className="flex flex-col items-center gap-1">
            <StripTierLabel>{t(tier.label)}</StripTierLabel>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
              {tier.items.map((p) => (
                <StripLogo key={p.alt} {...p} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* <sm — slow auto-scroll, always (even under reduced motion). The track
          holds the list twice and translates -50%, so the loop is seamless.
          marquee-hero is exempt from the reduced-motion kill in globals.css, so
          it keeps moving here — a frozen single line would hide half the tiers
          off the right edge with no way to reach them. */}
      <div aria-hidden className="mt-4 overflow-hidden sm:hidden">
        {/* marquee-hero only once the track is duplicated — animating a single
            copy would scroll half the marks off and never bring them back. */}
        <div className={`marquee-track ${looped ? "marquee-hero" : ""}`}>
          {(looped ? [...marqueeItems, ...marqueeItems] : marqueeItems).map((it, i) => (
            <div key={i} className="mr-6 flex shrink-0 items-center">
              {"label" in it ? <StripTierLabel>{it.label}</StripTierLabel> : <StripLogo {...it} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile-only sticky register bar. Below lg the nav's register button is easy to
// miss once the visitor is deep in the page, so registration gets a permanent
// bottom rail from the moment #about scrolls past. Latched on: once shown it
// stays, so it can't flicker on scroll-up.
function MobileRegisterBar() {
  const reduce = useReducedMotion();
  const { openRegister, registered } = useRegister();
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const about = document.getElementById("about");
      // Fires once #about's TOP has passed the top of the viewport — i.e. the
      // visitor is reading the "why" and has left the hero for good. Waiting for
      // its BOTTOM would be far too late: on a phone #about is ~2400px tall, so
      // the bar wouldn't show until three screens of scrolling in. If the section
      // isn't in the DOM for any reason, fall back to a plain scroll depth so the
      // bar can never be permanently missing.
      const past = about
        ? about.getBoundingClientRect().top < 0
        : window.scrollY > window.innerHeight;
      if (past) setVisible(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 24 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          // z-40 keeps it under the ScrollToTop button (z-50), which is offset
          // ~5.25rem UP on this breakpoint (a vertical band above the bar), so
          // the bar can use the full screen width — no right-side reservation.
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#06040f]/90 px-4 pt-3 backdrop-blur lg:hidden"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
        >
          {/* Register keeps the full remaining width (flex-1); the chat icon is
              a fixed 48px square beside it, so adding it costs the primary CTA
              nothing but its own width. The row still sits inside pr-20, which
              is what keeps both clear of the ScrollToTop button. */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openRegister()}
              // Same role swap as the nav: once registered this is a status,
              // not the next action, so the chat icon beside it carries the fill.
              className={
                registered
                  ? "inline-flex flex-1 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-5 py-3 text-sm font-semibold text-emerald-200/90 transition active:scale-[0.99]"
                  : "inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,92,255,0.4)] transition active:scale-[0.99]"
              }
            >
              {registered ? t(dict.register.navRegistered) : t(dict.nav.register)}
            </button>
            {/* Icon-only, so aria-label is the ONLY name a screen reader gets —
                it is not optional here. Promoted to the violet fill once
                registered, matching the nav's role swap. */}
            {links.openChat && (
              <a
                href={links.openChat}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(dict.nav.openChatAria)}
                onClick={() => track("openchat_click", { src: "mobile-bar" })}
                className={
                  registered
                    ? "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(124,92,255,0.4)] transition active:scale-95"
                    : "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/75 transition active:scale-95"
                }
              >
                <ChatGlyph className="h-5 w-5" />
              </a>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Fixed bottom-right "back to top" button. Hidden near the top of the page and
// fades in once the visitor has scrolled down ~1.5 viewports. Respects
// prefers-reduced-motion (jumps instantly instead of smooth-scrolling).
function ScrollToTop() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={toTop}
          aria-label="Scroll to top"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          // Below lg the sticky register bar owns the bottom edge, so this sits
          // above it (bar height + safe area). Unconditional at that breakpoint
          // rather than wired to the bar's state: both appear at essentially the
          // same scroll depth, and an offset with no bar just reads as margin.
          // From lg up there's no bar, so it returns to the normal corner.
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/40 bg-violet-600/85 text-violet-100 shadow-[0_6px_24px_rgba(124,58,237,0.3)] transition hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-violet-500 hover:text-white sm:right-8 lg:bottom-8"
        >
          {/* upward chevron */}
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Journey() {
  const { t } = useLocale();
  const { openRegister, registered } = useRegister();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<BEvent | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null); // day detail modal
  const [activePartner, setActivePartner] = useState<PartnerInfo | null>(null); // sponsor/mentor intro modal
  // Remember the card that opened the modal so focus returns to it on close
  // (document.activeElement is unreliable in Safari — see EventModal).
  const triggerRef = useRef<HTMLElement | null>(null);
  const partnerTriggerRef = useRef<HTMLElement | null>(null);
  // Open the company-intro modal for a logo tile. `name` is the tile's `alt`;
  // copy comes from partnerIntros, falling back to the "coming soon" blurb.
  const openPartner = (name: string, stage: Phrase, el?: HTMLElement | null, url?: string) => {
    partnerTriggerRef.current = el ?? null;
    setActivePartner({ name, desc: partnerIntros[name] ?? partnerIntroTBC, stage, url });
  };
  const selectEvent = (ev: BEvent, el?: HTMLElement | null) => {
    triggerRef.current = el ?? null;
    setActive(ev);
  };

  // Returning quiz-taker? Load their durable result post-mount (null on SSR +
  // first render so the CTA label matches the server output → no hydration
  // mismatch; it just swaps to "내 결과 보기" once read).
  const [ownResultId, setOwnResultId] = useState<string | null>(null);
  useEffect(() => {
    const r = loadOwnResult();
    if (r) setOwnResultId(r.resultId);
  }, []);

  // Desktop grid: tallest day determines the shared row count so every column
  // gets the same number of card slots and rows line up across all six days.

  // Hero split — as the hero scrolls out, the two columns fly apart to the
  // left/right screen edges and fade, so the screen "opens" onto what's below.
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Columns fly apart from the first scroll (0) but slide out slowly, over the
  // first 35% of the hero, so the motion is gentle. Fade tracks alongside.
  const leftX = useTransform(heroProgress, [0, 0.35], [0, -500]);
  const rightX = useTransform(heroProgress, [0, 0.35], [0, 500]);
  const heroFadeWide = useTransform(heroProgress, [0, 0.35], [1, 0]);
  // The ±500px horizontal fly-apart only makes sense in the lg+ two-up layout,
  // where the columns actually sit side by side. Below lg they stack into one
  // centred column, so translating them left/right just throws the content off
  // both screen edges and overlaps them (it looked broken on phones). Gate the
  // x-shift on the desktop layout; mobile keeps only the gentle opacity fade.
  const [isWide, setIsWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  // Apply the horizontal split on the wide (two-up) layout only — it stays on
  // even under reduced-motion (by explicit request), so this is NOT gated on
  // `reduce`. Below lg the columns stack, so no horizontal shift there.
  const splitX = isWide;
  // Background video blurs early — in step with the columns flying apart — so the
  // whole hero softens as soon as the visitor starts scrolling.
  // NOTE: this scroll-linked `filter: blur()` on the (playing) hero video repaints
  // the video every frame and can cause scroll jank on weaker devices. It was
  // removed once for that reason, then restored by request. By request it also
  // stays on under reduced-motion (not gated on `reduce`).
  const bgBlur = useTransform(heroProgress, [0, 0.15], ["blur(0px)", "blur(10px)"]);
  // The scroll-linked opacity FADE is a DESKTOP effect (it plays as the two
  // columns fly apart). On mobile the hero stacks into one tall column with the
  // Countdown/Problem panel at the bottom — so scrolling to reach it is exactly
  // what the fade reacts to, dimming the panel before you can read it. Gate the
  // fade on the wide layout so mobile keeps the hero fully opaque and readable.
  // The background blur stays on everywhere (kept on mobile by request) — it's
  // behind the content, so it doesn't hurt readability.
  const heroFade = isWide ? heroFadeWide : undefined;

  return (
    <main className="relative z-10">
      <ScrollToTop />
      <MobileRegisterBar />
      {/* ── CH 0 · HERO ─────────────────────────────────────────────── */}
      <Chapter
        id="top"
        align="center"
        wide
        background={<HeroVideo blur={bgBlur} />}
        footer={
          <motion.div
            style={{ opacity: heroFade }}
            // Hidden on mobile — the stacked mobile hero is already tall and the
            // scroll affordance is obvious there; the ticker just adds clutter.
            className="pointer-events-none hidden flex-col items-center gap-2 text-[0.7rem] tracking-[0.3em] text-white/60 lg:flex"
          >
            {t(dict.hero.scroll).toUpperCase()}
            <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/50 to-transparent" />
          </motion.div>
        }
      >
        {/* Two-up hero: copy + CTAs hugging the left screen edge, the Countdown ↔
            Problem panel hugging the right edge. Stacks to a single centred column
            below lg. The small px gutters keep text off the very edge.
            heroRef anchors the scroll-parallax: the two columns drift up at
            different speeds and fade as the hero scrolls out. */}
        <div ref={heroRef} className="grid items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-14 lg:px-0">
          {/* LEFT — headline, meta, blurb, CTAs. Centred on mobile, left-aligned
              and pushed to the left edge from lg up. */}
          <motion.div style={{ x: splitX ? leftX : undefined, opacity: heroFade }} className="text-center lg:pl-10 lg:text-left xl:pl-16">
            {/* The returning-quiz-taker greeting lives only in the nav now
                (compact, desktop-only), so there's no hero greeting — it stays
                off mobile entirely and never shows twice on desktop. */}
            <div className="mt-10 sm:mt-12 lg:mt-0">
              {/* Smaller on phones so the long eyebrow line doesn't crowd the
                  narrow column; back to the default size from sm up. */}
              <Eyebrow className="!text-[0.55rem] sm:!text-xs">{t(dict.hero.eyebrow)}</Eyebrow>
            </div>
            {/* clamp caps trimmed (8rem->7.1rem, 3rem->2.65rem) so the 18px root
                bump doesn't enlarge the hero headline — it stays ~its current size
                while the rest of the site grows. */}
            <h1 className="text-[clamp(2.65rem,11vw,7.1rem)] font-black leading-[1.05] tracking-tight drop-shadow-[0_4px_40px_rgba(124,58,237,0.5)] lg:text-[clamp(2.65rem,6vw,5.5rem)]">
              <span className="block text-white">{t(dict.hero.titleLine1)}</span>
              {/* pb-[0.15em]: bg-clip-text only paints the gradient inside the line
                  box; with the tight leading the box cut off g/p descenders, so they
                  rendered transparent ("Singapore." looked clipped). The padding
                  extends the paint box below the baseline. */}
              <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text pb-[0.15em] text-transparent">
                {t(dict.hero.titleLine2)}
              </span>
            </h1>
            <p className="mt-8 flex items-center justify-center gap-2 whitespace-nowrap text-[0.65rem] text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:gap-3 sm:text-base lg:justify-start">
              <span className="font-semibold">{t(dict.hero.dates)}</span>
            </p>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-base lg:mx-0">
              {t(dict.hero.blurb)}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
              <a href={links.program} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_50px_rgba(124,58,237,0.7)] sm:px-8 sm:py-4 sm:text-base">
                {t(dict.hero.ctaProgram)}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
              {/* This used to mirror a "파트너십 문의" button in the nav, hidden at
                  md+ to avoid duplicating it. That nav button is gone (the slot
                  went to open chat — see JourneyNav), so nothing is duplicated
                  any more and the md:hidden gate is now the only reason a
                  desktop visitor doesn't see a partnership CTA above the fold.
                  Kept as-is deliberately: the nav's audience was moved to
                  students on purpose, and the footer carries a full partnership
                  pill for companies. Drop `md:hidden` if that ever needs undoing. */}
              <a href={links.partnership} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10 sm:px-8 sm:py-4 sm:text-base md:hidden">
                {t(dict.hero.ctaPartner)}
              </a>
            </div>

            {/* Mobile only — the hook cards sit in the stacked hero below the
                CTAs. On lg+ they move to the right column, above the countdown
                (see below), so this copy is hidden there to avoid duplication. */}
            <HookCards
              t={t}
              ownResultId={ownResultId}
              openRegister={openRegister}
              className="mx-auto mt-5 max-w-xl lg:hidden"
              chatSrc={null}
            />
          </motion.div>

          {/* RIGHT — hook cards ABOVE the Countdown ↔ Problem Statement panel,
              pushed to the right edge. Slides right (opposite the left column) as
              the hero scrolls out. Desktop only: on mobile these are pulled out
              (hook cards into the left stack above; the panel into #launch below)
              so the stacked hero doesn't get too tall / buried under the fade. */}
          <motion.div style={{ x: splitX ? rightX : undefined, opacity: heroFade }} className="hidden lg:block lg:pr-10 xl:pr-16">
            {/* One shared-width, right-aligned column: the hook cards and the
                countdown/problem panel line up to the same max-width so the
                stack reads as a single unit rather than mismatched widths. */}
            <div className="ml-auto w-full max-w-sm">
              {/* Stacked (not 2-up) in the narrower right column. */}
              <HookCards
                t={t}
                ownResultId={ownResultId}
                openRegister={openRegister}
                className="mb-5"
                chatSrc={null}
                stacked
              />
              <HeroLaunchPanel t={t} reduce={!!reduce} />
            </div>
          </motion.div>
        </div>

        {/* Confirmed-partner logo band, spanning under both hero columns and
            above the pinned scroll hint.

            Deliberately NOT wired to heroFade like the columns are. That curve
            starts dropping on the first pixel of scroll and is gone by 35% of
            the hero, which made the strip the shortest-lived thing on the page —
            it sits lowest, so it is the last thing to come into view and the
            first thing the fade erased. It just scrolls away with the page
            instead, which also keeps one more element off the scroll-linked
            repaint path. */}
        <div className="px-6 sm:px-10 lg:px-10 xl:px-16">
          <HeroPartnerStrip t={t} />
        </div>
      </Chapter>

      {/* ── Countdown ↔ Problem Statement · MOBILE-ONLY standalone section ──
          On desktop the panel lives in the hero's right column (above); on
          mobile it gets its own section between the hero and About so it's
          readable and not buried in a tall stacked hero. */}
      <section id="launch" className="w-full px-6 py-12 lg:hidden">
        <HeroLaunchPanel t={t} reduce={!!reduce} />
      </section>

      {/* ── CH 1 · ABOUT ───────────────────────────────────────────── */}
      <Chapter id="about" align="center">
        <div className="text-center">
          <Eyebrow>{t(dict.about.tag)}</Eyebrow>
          <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
            {t(dict.about.heading)}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
            {t(dict.about.intro)}
          </p>
        </div>

        {/* the problem, in numbers — faint violet weight so it reads as "the
            gap" distinct from the lighter "shift" belief cards below */}
        <div className="mt-10 rounded-3xl border border-violet-400/15 bg-violet-950/20 p-6 sm:p-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
            {t(dict.about.gapTag)}
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {dict.about.gap.map((s) => (
              <div key={s.num} className="text-center">
                <div className="text-3xl font-black text-white sm:text-4xl">{s.num}</div>
                <p className="mx-auto mt-2 max-w-[15rem] text-xs leading-relaxed text-white/70">{t(s.label)}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl border-t border-white/10 pt-5 text-center text-sm leading-relaxed text-white/70">
            {t(dict.about.gapNote)}
          </p>

          {/* Press — outside coverage of the very gap this block just described,
              so it sits with the claim rather than after the chapter's closing
              vision funnel. One slim full-width row per article (logo · title ·
              date · outbound), not a card, so it reads as a citation. Add
              entries to dict.about.press to extend. */}
          <div className="mx-auto mt-6 max-w-2xl">
            <p className="text-center text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/40">
              {t(dict.about.pressTag)}
            </p>
            {dict.about.press.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center transition hover:border-violet-400/30 hover:bg-white/[0.06]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt={p.outlet} className="h-4 w-auto max-w-[5.5rem] shrink-0 object-contain opacity-70" />
                <span className="text-sm font-semibold text-white/90">{t(p.title)}</span>
                <span className="text-xs text-white/40">{t(p.date)}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 transition group-hover:text-violet-200">
                  {t(dict.about.pressCta)}
                  <span aria-hidden>↗</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* the answer — the shift we're building */}
        <p className="mt-12 text-center text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
          {t(dict.about.shiftTag)}
        </p>
        <div className="mt-5 grid gap-4 text-left md:grid-cols-3">
          {dict.about.cards.map((c) => (
            <Glass key={c.kicker.en} className="!p-6 transition hover:border-violet-400/40 hover:bg-white/[0.07]">
              <span className="text-xs font-bold tracking-[0.2em] text-violet-300">{t(c.kicker)}</span>
              <h3 className="mt-3 text-lg font-bold text-white">{t(c.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{t(c.body)}</p>
            </Glass>
          ))}
        </div>

        {/* The vision funnel used to sit here, at the end of this chapter. It
            is now its own section between the FAQ and the footer, where it reads
            as a closing note rather than a second ending inside the chapter that
            opens the page. One line keeps the idea present. */}
        <p className="mx-auto mt-10 max-w-2xl text-sm font-medium leading-relaxed text-violet-100/80">
          {t(dict.about.visionOneLiner)}
        </p>

      </Chapter>

      {/* ── CH 2 · WHO SHOULD JOIN / WHAT YOU GET ──────────────────── */}
      <Chapter id="join" align="center">
        <div className="text-center">
          <Eyebrow color="emerald">{t(dict.whoWhat.tag)}</Eyebrow>
          <h2 className="text-[clamp(1.8rem,5vw,3.25rem)] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
            {t(dict.whoWhat.heading)}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
            {t(dict.whoWhat.intro)}
          </p>
        </div>
        {/* "얻어가는 것" used to sit beside this list, repeating the benefits
            chapter that follows immediately after. This chapter now does one
            job — who it's for, and why the usual reasons not to join don't
            apply — and the next chapter answers "what do I get". */}
        <Glass className="mx-auto mt-10 max-w-2xl text-left">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">{t(dict.whoWhat.whoTitle)}</h3>
          <ul className="mt-4 space-y-3">
            {dict.whoWhat.who.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                {t(item)}
              </li>
            ))}
          </ul>
        </Glass>
        <p className="mt-5 text-center text-xs text-white/65">{t(dict.whoWhat.disclaimer)}</p>
      </Chapter>

      {/* ── CH 2.5 · WHY JOIN (benefits) + INCENTIVES ──────────────── */}
      <Chapter id="benefits" align="center">
        <Eyebrow color="cyan">{t(dict.benefits.tag)}</Eyebrow>
        <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
          {t(dict.benefits.heading)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75">{t(dict.benefits.intro)}</p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {dict.benefits.items.map((it) => (
            <div key={it.num} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/25 hover:bg-white/[0.05]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15 text-sm font-black text-cyan-200">{it.num}</span>
              <h3 className="mt-4 text-lg font-bold text-white">{t(it.title)}</h3>
              <ul className="mt-3 space-y-2">
                {it.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-white/70">
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                    {t(p)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Participation flow */}
        <div className="mt-12 text-left">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">{t(dict.benefits.flowTitle)}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            {dict.benefits.flow.map((f, i) => (
              <div key={i} className="flex items-center gap-2 sm:flex-1">
                <div className="flex w-full items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-center text-sm font-semibold text-white">{t(f)}</div>
                {i < dict.benefits.flow.length - 1 && <span aria-hidden className="shrink-0 text-white/30">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/55">{t(dict.benefits.flowNote)}</p>
        </div>

        {/* The incentives block (certificate + perks, every line hedged) used to
            sit here. It doubled the 수료증 card above and read as a wall of
            "협의 중"; the CTA band below is what it was really holding up. */}
        <div className="mt-10 text-left">
          {/* Mid-page CTA band — the same hook cards as the hero. Someone who
              has just read what they get shouldn't have to scroll back to the
              top (or all the way to the footer) to act on it. */}
          <HookCards
            t={t}
            ownResultId={ownResultId}
            openRegister={openRegister}
            className="mx-auto mt-10 max-w-xl"
            chatSrc="band"
          />
        </div>
      </Chapter>

      {/* ── CH 3 · PROGRAM ─────────────────────────────────────────── */}
      {/* Full-width translucent program band — a dark violet tint that dims the
          WebGL field for legibility while still letting the background dots show
          through. Top & bottom fade out so it blends into the journey. */}
      <section id="program" className="relative w-full bg-[#0a0814]/45 py-14 sm:py-20 lg:py-28">
        {/* soft fade at top & bottom edges */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0814]/45 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0814]/45 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1700px] px-6 sm:px-10">
          <div className="text-center">
            <Eyebrow>{t(dict.program.tag)}</Eyebrow>
            <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
              {t(dict.program.heading)}
            </h2>
            {/* No day-by-day summary paragraph here — the eight cards below ARE
                the arc, and spelling it out in prose first read as clutter. */}
            {/* Two separate notes, in this order on purpose. First: how much of
                this is settled — read before the cards, it stops eight tidy day
                boxes being taken for a finished timetable. Second: how little of
                it you actually have to attend. */}
            <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-white/50">
              {t(dict.program.pendingNote)}
            </p>
            <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-3.5 text-xs leading-relaxed text-amber-100/85">
              {t(dict.program.modeNote)}
            </div>
          </div>

          {/* Two Labs, four clean day cards each. Tapping a card opens the day
              detail modal (that day's sessions) instead of exploding all ~18
              sessions inline — the 8-day arc stays scannable. */}
          <div className="mt-12 space-y-8">
            {[days.slice(0, 4), days.slice(4, 8)].map((group) => (
              <div key={group[0].day}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-sm font-bold uppercase tracking-[0.14em] text-violet-200">{t(group[0].phase)}</span>
                  <span aria-hidden className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {group.map((day) => (
                    <DayCard key={day.day} day={day} t={t} onOpen={setActiveDay} />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CH 3.2 · SPEAKER SESSIONS (Day 1·5·8) ──────────────────── */}
      {/* Speaker names + photos are transcribed from the internal deck — public
          naming/likeness to be confirmed with the user (flagged in the handoff). */}
      <Chapter id="speakers" align="center">
        <Eyebrow>{t(dict.speakers.tag)}</Eyebrow>
        <h2 className="text-[clamp(1.9rem,5vw,3.5rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
          {t(dict.speakers.heading)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75">{t(dict.speakers.intro)}</p>
        <div className="mt-10 grid gap-5 text-left sm:grid-cols-3">
          {/* keyed by index, not `img` — one speaker can hold two sessions
              (박희덕: Day 7 간담회 + Day 8 키노트) and so reuse the same photo */}
          {dict.speakers.people.map((s, si) => (
            <div key={si} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/25 hover:bg-white/[0.05]">
              <span className="text-xs font-bold uppercase tracking-wide text-violet-300/80">{t(s.day)}</span>
              <p className="mt-4 text-base font-semibold leading-snug text-white">{t(s.topic)}</p>
              <ul className="mt-4 space-y-2">
                {s.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-white/70">
                    <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-violet-300/70" />
                    {t(p)}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                <Image src={s.img} alt={t(s.name)} width={200} height={200} className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{t(s.name)}</p>
                  <p className="mt-0.5 text-xs leading-snug text-white/60">{t(s.role)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-white/55">{t(dict.speakers.tbcNote)}</p>
      </Chapter>

      {/* ── CH 3.3 · MENTORING PHILOSOPHY ──────────────────────────── */}
      <Chapter id="mentoring" align="center">
        <Eyebrow color="emerald">{t(dict.mentoring.tag)}</Eyebrow>
        <h2 className="text-[clamp(1.9rem,5vw,3.5rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
          {t(dict.mentoring.heading)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75">{t(dict.mentoring.intro)}</p>
        <div className="mt-8 grid gap-4 text-left lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-300/80">{t(dict.mentoring.personaLabel)}</p>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-white">{t(dict.mentoring.persona)}</p>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-6">
            <p className="text-sm font-bold text-amber-200">{t(dict.mentoring.asideLabel)}</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/80">{t(dict.mentoring.aside)}</p>
          </div>
        </div>
        <div className="mt-6 text-left">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">{t(dict.mentoring.asksTitle)}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dict.mentoring.asks.map((a, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/15 text-xs font-black text-emerald-200">{i + 1}</span>
                <h4 className="mt-3 text-sm font-bold text-white">{t(a.title)}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-white/65">{t(a.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </Chapter>

      {/* ── CH 4 · PARTNERS ────────────────────────────────────────── */}
      <Chapter id="builders" align="center">
        {/* Contained dark backing box (not full-width) to lift readability over
            the bright background field. */}
        <div className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/10 bg-[#0a0814]/80 p-8 sm:p-12">
          <Eyebrow>{t(dict.partners.tag)}</Eyebrow>
          <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
            {t(dict.partners.heading)}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">{t(dict.partners.note)}</p>

          {/* ── Tier 1 · 주최 · HOST (the AXMOS collective) ─────────────────
              Full-colour marks on white chips, matching the deck's structure
              slide. Wilt Venture Builder has no public site link on hand → no
              anchor (honest, not an invented URL). */}
          <div className="mt-9 text-left">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{t(dict.partners.hostLabel)}</p>
              <p className="text-xs text-white/50">{t(dict.partners.hostNote)}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { src: "/partners/logos/white/trimmed/translink.png",    alt: "Translink Investment", w: 330, h: 91,  url: "https://translinkinvestment.com" as string | undefined },
                { src: "/partners/logos/white/trimmed/wilt.png",         alt: "Wilt Venture Builder", w: 309, h: 148, url: undefined },
                { src: "/partners/logos/white/trimmed/codepresso.png",   alt: "Codepresso",           w: 456, h: 91,  url: "https://codepresso.io" },
                { src: "/partners/logos/white/trimmed/drimaes.png",      alt: "Drimaes",              w: 332, h: 50,  url: "https://www.drimaes.com" },
                { src: "/partners/logos/white/trimmed/popup-studio.png", alt: "Popup Studio",         w: 512, h: 245, url: "https://popupstudio.ai" },
              ].map(({ url, ...l }) => (
                <LogoTile
                  key={l.alt}
                  {...l}
                  onOpen={(el) => openPartner(l.alt, dict.partners.stageConfirmed, el, url)}
                />
              ))}
            </div>
          </div>

          {/* ── Tier 2 · 주관 · 운영 · ORGANIZERS (the student associations) ── */}
          <div className="mt-8 text-left">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{t(dict.partners.organizersLabel)}</p>
              <p className="text-xs text-white/50">{t(dict.partners.organizersNote)}</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { src: "/partners/logos/white/trimmed/smu-lion.png", alt: "SMU KSA",           w: 292, h: 173, badge: t(dict.partners.roleLead) },
                { src: "/partners/logos/white/trimmed/nus.png",      alt: "NUS Korea Society", w: 512, h: 512, badge: t(dict.partners.roleOps) },
                { src: "/partners/logos/white/trimmed/ntu-ksa.png",  alt: "NTU KSA",           w: 318, h: 382, badge: t(dict.partners.roleOps) },
                // No intro modal here: the associations write their own copy and
                // haven't yet, and the generic fallback ("파트너십이 확정되는 대로")
                // reads wrong for the people actually running the event.
              ].map((l) => <LogoTile key={l.alt} {...l} />)}
            </div>
          </div>

          {/* ── Tier 3 · 후원 · SPONSORS ──────────────────────────────────
              Mirrors the deck's partner slide exactly: one confirmed row, each
              logo captioned with what that sponsor actually provides. The old
              "협의 중" tier and the separate 멘토사 tier were folded away — the
              deck lists no in-discussion sponsors, and 멘토링 is just another
              role caption here. */}
          <div className="mt-8 border-t border-white/10 pt-8 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{t(dict.partners.sponsorsLabel)}</p>

            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-emerald-200">
              {t(dict.partners.sponsorConfirmedLabel)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { cat: t(dict.partners.catVenue),     src: "/partners/logos/white/trimmed/aws.png",                alt: "AWS",                             w: 512, h: 306 },
                { cat: t(dict.partners.catVenue),     src: "/partners/logos/white/trimmed/innovate360.png",        alt: "INNOVATE 360",                    w: 455, h: 54 },
                { cat: t(dict.partners.catVenue),     src: "/partners/logos/white/trimmed/life.png",               alt: "L^IFE",                           w: 900, h: 352 },
                { cat: t(dict.partners.catMarketing), src: "/partners/logos/white/trimmed/bzcf.png",               alt: "BZCF",                            w: 465, h: 156 },
                { cat: t(dict.partners.catJudges),    src: "/partners/logos/white/trimmed/korean-association.png", alt: "Korean Association in Singapore",  w: 443, h: 90 },
                { cat: t(dict.partners.catMentoring), src: "/partners/logos/white/trimmed/onword.png",             alt: "Onword Lab",                      w: 900, h: 92 },
                { cat: t(dict.partners.catMentoring), src: "/partners/logos/white/trimmed/remited.png",            alt: "REmited",                         w: 512, h: 105 },
                { cat: t(dict.partners.catGoods),     src: "/partners/logos/white/trimmed/brandboost.png",         alt: "Brand Boost",                     w: 205, h: 81 },
                { cat: t(dict.partners.catOverall),   src: "/partners/logos/white/trimmed/hashed.png",             alt: "Hashed",                          w: 355, h: 90 },
              ].map(({ cat, ...l }) => (
                <div key={l.alt} className="flex flex-col gap-1.5">
                  <LogoTile {...l} onOpen={(el) => openPartner(l.alt, dict.partners.stageConfirmed, el)} />
                  <span className="text-center text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/40">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-left text-xs text-white/60">{t(dict.partners.stageNote)}</p>
        </div>
      </Chapter>

      {/* ── CH 4.5 · BUILDER COMPANIONS (logo marquee) ─────────────── */}
      {/* Full-width band echoing the program band's dark tint + edge fades, so
          the scrolling logo wall reads as part of the journey rather than a
          tacked-on strip. */}
      <section id="companions" className="relative w-full bg-[#0a0814]/55 py-12 sm:py-16 lg:py-20">
        <div aria-hidden className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0a0814]/55 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0814]/55 to-transparent" />
        <div className="relative">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
              {t(dict.partners.companionsHeading)}
            </h2>
            <p className="mx-auto mt-3 text-sm leading-relaxed text-white/75">
              {t(dict.partners.companionsSub)}
            </p>
          </div>
          <CompanionMarquee t={t} />
        </div>
      </section>

      {/* ── CH 5 · FAQ ─────────────────────────────────────────────── */}
      <Chapter id="faq" align="center">
        <Eyebrow>{t(dict.faq.tag)}</Eyebrow>
        <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
          {t(dict.faq.heading)}
        </h2>
        <Glass className="mt-8 text-left">
          <FAQList />
        </Glass>
        {/* Second CTA band — the last objection has just been answered, so this
            is the other natural moment to act. */}
        <HookCards
          t={t}
          ownResultId={ownResultId}
          openRegister={openRegister}
          className="mx-auto mt-10 max-w-xl"
          chatSrc="band"
        />
      </Chapter>

      {/* ── CH 5.5 · VISION FUNNEL ─────────────────────────────────────
          Moved out of the 취지 chapter: this is the "what it grows into" note,
          which lands better as the last thing read before the closing CTA than
          as a coda inside the chapter that opens the page. */}
      <Chapter id="vision" align="center">
        {/* Vision funnel — how the eight days keep going, from a participant's
            seat: the event, the rhythm after it, the ladder up, and where that
            leads. Step 1 is highlighted as the "START". */}
        <div className="mt-14 rounded-3xl border border-violet-400/15 bg-violet-950/20 p-6 sm:p-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
            {t(dict.about.visionTag)}
          </p>
          <h3 className="mx-auto mt-3 max-w-2xl text-center text-xl font-bold leading-snug text-white sm:text-2xl">
            {t(dict.about.visionHeading)}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-white/70">
            {t(dict.about.visionIntro)}
          </p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {dict.about.visionSteps.map((s, i) => {
              const start = i === 0;
              return (
                <li
                  key={s.num}
                  className={`relative flex flex-col rounded-2xl border p-4 text-left ${
                    start
                      ? "border-violet-400/50 bg-violet-500/15"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                      start ? "bg-violet-500 text-white" : "bg-white/10 text-white/80"
                    }`}
                  >
                    {s.num}
                  </span>
                  {start && (
                    <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-violet-400/20 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-violet-200">
                      ★ START
                    </span>
                  )}
                  <p className="mt-2 text-sm font-bold leading-snug text-white">{t(s.title)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/65">{t(s.body)}</p>
                </li>
              );
            })}
          </ol>

          {/* Continuity note (small), then the bridge into the closing register
              CTA that follows immediately below — hence the bridge outranks the
              note typographically. The button reuses the nav/footer pill style
              rather than introducing another CTA treatment. */}
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-white/55">
            {t(dict.about.visionNote)}
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="max-w-2xl text-center text-base font-bold leading-snug text-white sm:text-lg">
              {t(dict.about.visionBridge)}
            </p>
            <button
              type="button"
              onClick={() => openRegister()}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-violet-600/90 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              {t(registered ? dict.register.navRegistered : dict.nav.register)}
              {!registered && (
                <span aria-hidden className="transition-transform duration-300 hover:translate-x-1">→</span>
              )}
            </button>
          </div>
        </div>
      </Chapter>

      {/* ── CH 6 · FOOTER ──────────────────────────────────────────── */}
      <section id="closing" className="relative flex min-h-screen w-full flex-col px-6 py-16 sm:px-10">
        {/* soft dark scrim so the closing CTA + credits stay readable over the field */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[1]"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 45%, rgba(7,6,18,0.82) 0%, rgba(7,6,18,0.5) 42%, rgba(7,6,18,0) 78%)",
          }}
        />
        {/* hero CTA block — vertically centred */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_40px_rgba(124,58,237,0.4)]">
            {t(dict.footer.heading)}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65">{t(dict.footer.blurb)}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {/* Primary CTA → opens the register modal (it used to be href="#",
                a dead link that silently swallowed the page's last CTA). Mirrors
                the nav button's registered-label swap. */}
            <button
              type="button"
              onClick={() => openRegister()}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-9 py-4 text-base font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5"
            >
              {t(registered ? dict.register.navRegistered : dict.nav.register)}
              {!registered && (
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              )}
            </button>
            <a href={links.partnership} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-9 py-4 text-base font-semibold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10">
              {t(dict.nav.partner)}
            </a>
          </div>

          {/* Third CTA — the page's last chance to keep someone who scrolled all
              the way here without registering. Still a text link. */}
          <OpenChatLink t={t} src="footer" className="mt-5" />

          {/* mailto: only opens whatever mail client the visitor's device has
              configured — on a desktop without one, or inside some in-app
              browsers, the button does nothing at all and the inquiry is simply
              lost. Show the address as selectable text with a copy button so
              there's always a way to reach us. */}
          <PartnerEmailFallback t={t} />
        </div>

        {/* credits — pinned to the very bottom of the final screen */}
        <div className="mx-auto w-full max-w-3xl border-t border-white/10 pt-8 text-center">
          <p className="text-sm font-bold tracking-widest text-white">ZERO100 BUILDERTHON</p>
          <p className="mt-2 text-xs text-white/65">{t(dict.footer.hostedBy)}</p>
          <p className="mt-4 text-xs text-white/55">© 2026 {t(dict.footer.rights)}</p>
        </div>
      </section>

      <DayModal dayNum={activeDay} onClose={() => setActiveDay(null)} onSelectEvent={selectEvent} eventOpen={active != null} t={t} />
      <EventModal event={active} onClose={() => setActive(null)} triggerRef={triggerRef} />
      <PartnerModal partner={activePartner} onClose={() => setActivePartner(null)} triggerRef={partnerTriggerRef} />
    </main>
  );
}


// Copyable partnership address — the fallback for when `mailto:` goes nowhere.
// Uses the clipboard API where available and falls back to selecting the text,
// so "copy" never silently fails.
function PartnerEmailFallback({ t }: { t: Tfn }) {
  const [copied, setCopied] = useState(false);
  const addrRef = useRef<HTMLSpanElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PARTNER_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context / permission) — select the text so
      // the visitor can copy it by hand instead of getting nothing.
      const node = addrRef.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  return (
    <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/50">
      <span>{t(dict.footer.partnerFallback)}</span>
      <span ref={addrRef} className="select-all font-medium text-white/75">
        {PARTNER_EMAIL}
      </span>
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        {t(copied ? dict.footer.copied : dict.footer.copy)}
      </button>
    </p>
  );
}

// FAQ accordion (kept inside Journey for a single client component tree)
function FAQList() {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/10">
      {dict.faq.items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-base font-semibold text-white">{t(item.q)}</span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition ${isOpen ? "rotate-45 border-violet-400 text-violet-300" : ""}`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.28, ease: [0.22,1,0.36,1] }} className="overflow-hidden">
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-white/70">{t(item.a)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
