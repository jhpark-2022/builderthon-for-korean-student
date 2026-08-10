"use client";

import Image from "next/image";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links, partnerIntros, partnerIntroTBC, partnerArticles, type Phrase } from "@/data/dictionary";
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
import { RESULTS, QUESTIONS, type MbtiKey } from "@/data/quiz";
import { useRegister, type RegisterPreset } from "@/lib/RegisterContext";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { useBodyScrollLock, isScrollLocked } from "@/lib/useBodyScrollLock";


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

// Renders `**…**` spans in a dictionary string as emphasized text. Copy that
// needs one emphasized phrase per locale would otherwise have to be split into
// separate ko/en fragments, which drifts out of sync; keeping the marker inline
// keeps each locale a single readable sentence.
function Emph({ text, className = "font-semibold text-white" }: { text: string; className?: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className={className}>{part}</strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

// LinkedIn glyph + link — shown ONLY on mentor / judge / speaker cards that
// carry a confirmed public URL (never invented). Opens in a new tab with
// noopener; stopPropagation keeps a click off any surrounding button/card.
function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 8.98h4V21H3zM9 8.98h3.83v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.34c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.81V21H9z" />
    </svg>
  );
}

function LinkedInLink({ url, label, className = "" }: { url: string; label: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label={`${label} · LinkedIn`}
      className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/60 transition after:absolute after:-inset-2 after:content-[''] hover:border-[#0a66c2]/60 hover:bg-[#0a66c2]/15 hover:text-[#7cb8f5] ${className}`}
    >
      <LinkedInIcon className="h-3.5 w-3.5" />
    </a>
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
//
// TWO CALLERS ONLY, both of which draw marks inside a VISIBLE container: the
// white partner-wall chip (LogoTile) and the Zero100 companion band tile. The
// hero confirmed-partner strip used this too and no longer does — with no tile
// to measure a mark against, bounding-box area let width run free and the
// widest wordmarks dominated their tier. It sizes by measured optical mass
// instead; see stripHeight().
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
  src, alt, w, h, url, badge, onOpen, area = 2000,
}: {
  src: string; alt: string; w: number; h: number;
  url?: string; badge?: string;
  // Target bounding-box area in px², the axis opticalHeight sizes on. The
  // default is right for a mark that is ONE line of ink at ordinary density.
  // Two things break that assumption, and this prop exists for those two only:
  //
  //   1. STACKED LOCKUPS. A stacked mark splits the same box across two rows,
  //      so at equal area each row is drawn at roughly half the height of a
  //      single-line neighbour and the mark reads small no matter how much area
  //      you give the box — exactly what happened to Brand Boost (BRAND over
  //      BOOST). RAISE `area`.
  //   2. SOLID SILHOUETTES NEXT TO LINE-DRAWN MARKS. Area is the box, not the
  //      ink in it. A filled silhouette turns nearly the whole box into ink; a
  //      crest drawn in thin lines fills maybe half of it. Side by side at equal
  //      area the silhouette reads a size larger — the SMU lion against the NUS
  //      and NTU seals in the organizers grid. LOWER `area` for the silhouette.
  //
  // Both are cases where equal area gives unequal perceived size, which is what
  // this prop corrects. It is NOT a knob for "this one looks a bit small": if a
  // single-line mark of ordinary density looks wrong here, the rule itself is
  // wrong. And a correction is local to the grid that motivated it — the same
  // mark elsewhere sits next to different neighbours.
  area?: number;
  onOpen?: (el: HTMLElement) => void;
}) {
  // Tile is h-20 (80px); 44px max leaves the mark breathing room inside it.
  const boxH = opticalHeight(w, h, area, 24, 44);
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
    // Ghost CHIP, not a bare underlined line. At text-white/60 with a hairline
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

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE STICKY BAR — open chat + register. Phone only.
//
// Appears once the hero is behind you (~120vh) and hides again over the closing
// section, so it can never sit on top of the footer's copy-email button. Hidden
// outright while the register modal is open. The <body> gets bottom padding for
// the bar's height from first paint, so revealing it shifts nothing.
// ─────────────────────────────────────────────────────────────────────────────
function MobileStickyBar({
  t,
  openRegister,
  registerOpen,
}: {
  t: Tfn;
  openRegister: (preset?: RegisterPreset) => void;
  registerOpen: boolean;
}) {
  const [past, setPast] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  // Same signal the header and the FAB use — the three move as one surface, so
  // the page never settles at a height that only some of them agreed on.
  const chromeHidden = useScrollDirection();

  useEffect(() => {
    // `isScrollLocked` guard: a frozen page reports scrollY 0, which would pull
    // this bar down behind an open modal and snap it back on close.
    const onScroll = () => {
      if (isScrollLocked()) return;
      setPast(window.scrollY > window.innerHeight * 1.2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The closing section carries the partnership CTA and the copyable email.
  // Covering either with a fixed bar is the one failure mode worth an observer.
  useEffect(() => {
    const end = document.getElementById("closing") ?? document.querySelector("footer");
    if (!end) return;
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { rootMargin: "0px 0px -20% 0px" });
    io.observe(end);
    return () => io.disconnect();
  }, []);

  // `chromeHidden` is the only condition that comes back on its own (scroll up);
  // the other three are states of the page, not of the gesture.
  const shown = past && !atEnd && !registerOpen && !chromeHidden;

  return (
    <div
      aria-label={t(dict.stickyBar.aria)}
      className={`fixed inset-x-0 bottom-0 z-40 sm:hidden ${shown ? "pointer-events-auto" : "pointer-events-none"}`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div
        // p-1 rather than p-1.5: the rail lost ~8px of its own height without
        // touching either button, both of which stay at h-12 (48px).
        // focus-within overrides the hidden transform so tabbing into the bar
        // can never scroll it away from under the keyboard.
        className={`mx-3 flex items-center gap-2 rounded-full border border-white/12 bg-[#0b0817]/92 p-1 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.9)] backdrop-blur-md transition duration-300 focus-within:translate-y-0 focus-within:opacity-100 ${
          shown ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        }`}
      >
        {/* OPEN CHAT sits FIRST, register second — the pair reads low-commitment →
            commitment, and the primary keeps the wider, brighter slot on the right
            where the thumb rests. The quiz chip that used to hold this slot is
            gone: the funnel's low-friction entrance is the open chat, and the quiz
            already has two permanent doors (the nav's ✦ chip, in view at all
            times, and the hook card in the 혜택 band). Open chat had none on a
            phone — the nav's open-chat button is `lg`-only, so between the hero
            and the footer there was no way in at all.
            ICON + LABEL, never icon alone: a bare speech bubble in a dark pill is
            not a recognisable KakaoTalk affordance, and this is the one CTA a
            hesitant visitor is looking for by name. */}
        {links.openChat && (
          <a
            href={links.openChat}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(dict.nav.openChatAria)}
            onClick={() => track("openchat_click", { src: "sticky" })}
            className="flex h-12 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-violet-400/35 bg-violet-500/10 px-3.5 text-xs font-bold text-violet-100"
          >
            <ChatGlyph className="h-4 w-4 shrink-0" />
            {t(dict.nav.openChat)}
          </a>
        )}
        <button
          type="button"
          onClick={() => openRegister()}
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,92,255,0.4)]"
        >
          {t(dict.stickyBar.register)}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ HOOK PARTS — all three read from data/quiz.ts. Nothing here invents a
// type name, an emoji or a gradient: if the quiz data changes these follow.
// ─────────────────────────────────────────────────────────────────────────────

// Five type glyphs in an overlapping stack, last tile a "?" — the curiosity gap
// the old card had no way to show. Fans out on hover (stagger 40ms); under
// prefers-reduced-motion the transforms simply never apply.
const PEEK_TYPES: MbtiKey[] = ["ENTP", "INFP", "ISTJ", "ESFP"];

function QuizEmojiStack({ compact = false }: { compact?: boolean }) {
  const size = compact ? "h-6 w-6 text-[0.7rem]" : "h-7 w-7 text-[0.8rem]";
  return (
    <span aria-hidden className="flex items-center">
      {PEEK_TYPES.map((k, i) => (
        <span
          key={k}
          style={{ marginLeft: i === 0 ? 0 : -8, transitionDelay: `${i * 40}ms` }}
          className={`inline-flex ${size} items-center justify-center rounded-full border border-white/15 bg-[#120d22] shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform duration-300 motion-safe:group-hover:translate-x-[var(--fan)]`}
        >
          {RESULTS[k].emoji}
        </span>
      ))}
      <span
        style={{ marginLeft: -8, transitionDelay: `${PEEK_TYPES.length * 40}ms` }}
        className={`inline-flex ${size} items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/20 font-black text-violet-100 transition-transform duration-300 motion-safe:group-hover:translate-x-[var(--fan)]`}
      >
        ?
      </span>
    </span>
  );
}

// The teaser line: one REAL variant name at a time, swapped every 2.5s. Uses the
// same names the result screen prints, so nothing here can be a name a taker
// will never see. Static under reduced motion.
function QuizTypeShuffle({ t }: { t: Tfn }) {
  const reduce = useReducedMotion();
  const names = useMemo(
    () => PEEK_TYPES.map((k) => t(RESULTS[k].variants.T.name)),
    [t],
  );
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % names.length), 2500);
    return () => clearInterval(id);
  }, [reduce, names.length]);
  return (
    <p className="mt-1 text-xs text-white/50">
      {t(dict.register.hookQuizShufflePrefix)}{" "}
      <span
        key={reduce ? "static" : i}
        className="font-semibold text-violet-200/90 motion-safe:animate-[quizNameSwap_2.5s_ease-in-out_infinite]"
      >
        {names[reduce ? 0 : i]}
      </span>
    </p>
  );
}

// A ~72px 9:16 mock of the shareable result card, tilted -4°. Built from the
// type's own accent gradient + emoji rather than an image, so it costs no
// request and cannot go stale against the real card.
function QuizResultPeek({ mbti, className = "" }: { mbti?: MbtiKey; className?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    // A visitor with a saved result gets THEIR card, held still. Rotating
    // sample types next to "무대 체질 Suno님, …" showed a Grok card beside a
    // greeting naming Suno — the one place this mock must not be decorative.
    if (reduce || mbti) return;
    const id = setInterval(() => setI((n) => (n + 1) % PEEK_TYPES.length), 3000);
    return () => clearInterval(id);
  }, [reduce, mbti]);
  const r = RESULTS[mbti ?? PEEK_TYPES[reduce ? 0 : i]];
  return (
    <span
      aria-hidden
      className={`relative block w-[72px] shrink-0 -rotate-[4deg] overflow-hidden rounded-lg border border-white/15 bg-[#0c0a18] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.8)] ${className}`}
      style={{ aspectRatio: "9 / 16" }}
    >
      <span
        key={r.mbti}
        className={`absolute inset-0 flex flex-col items-center justify-center gap-1 px-1 ${
          mbti ? "" : "motion-safe:animate-[quizPeekFade_3s_ease-in-out_infinite]"
        }`}
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br text-sm ${r.accent}`}>
          {r.emoji}
        </span>
        <span className="text-[0.4rem] font-bold leading-tight text-white/85">{r.model}</span>
        <span className="text-[0.35rem] font-semibold tracking-wider text-white/55">{r.mbti}</span>
      </span>
    </span>
  );
}

function HookCards({
  t,
  ownResultId,
  openRegister,
  className = "",
  chatSrc,
  stacked = false,
  withQuestion = false,
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
  // Fold the quiz's real Q1 INTO the quiz card, so the question and the card
  // are one thing rather than a card followed by a separate question block
  // further down the page. Only the 혜택 band uses it: the hero has no room and
  // repeating the same question in three placements would read as a loop.
  // Ignored for a returning visitor — they have a result; re-asking Q1 as the
  // headline of their card would be a step backwards.
  withQuestion?: boolean;
}) {
  // The hero is the one place the register CTA must be unambiguously the
  // biggest thing on screen, and there the two cards sit one above the other.
  // `compact` strips the quiz card's two tallest ornaments there and nowhere
  // else. If this ever stops tracking `stacked`, re-measure both cards.
  const compact = stacked;
  // Q1 answered inline. Handing the choice to /quiz via ?q1= means the bar
  // starts at 1/14 instead of throwing the answer away and asking again.
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const q1 = QUESTIONS[0];
  const askQ = withQuestion && !ownResultId;
  const choose = (side: "a" | "b") => {
    if (picked) return;
    setPicked(side);
    track("quiz_click", { src: "hook_q1" });
    const go = () => { window.location.href = `/quiz?q1=${side}`; };
    if (reduce) go(); else window.setTimeout(go, 300);
  };
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
      {/* items-start only in the question variant. Folding Q1 in roughly doubles
          the quiz card's height, and a stretched grid row would blow the
          register card up to match it — leaving the page's primary CTA as a
          box that is half empty space, which reads as the weaker of the two.
          Letting each card keep its own height costs a ragged bottom edge and
          buys back the hierarchy. */}
      <div className={`grid gap-3 ${stacked ? "" : "sm:grid-cols-2"} ${askQ ? "items-start" : ""}`}>
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
          <p className="text-[11px] leading-relaxed text-white/60">{t(dict.register.hookRegisterSub)}</p>
        </button>
        {/* Card 2 — the quiz. Promoted from a text link inside a dead panel to a
            whole-card link: the tap target was ~20px and the copy read as a
            disclaimer, which is most of why 6 of 115 weekly visitors tried it.
            It is still a clear step below the register card — outline and glass
            only, never the violet gradient + glow, which stays the register
            button's alone. `ownName` is null until after mount (loadOwnResult is
            client-only), so the first render always matches the server's. */}
        {askQ ? (
        // Question variant: the card holds real controls, so it cannot itself be
        // a link (a <button> inside an <a> is invalid and unusable by keyboard).
        <div className="flex min-h-[56px] flex-col gap-2 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="break-keep text-sm font-bold leading-snug text-white">
                {t(dict.register.hookQuizQBig)}
              </p>
              <QuizTypeShuffle t={t} />
            </div>
            <QuizResultPeek className="hidden shrink-0 sm:block" />
          </div>
          <QuizEmojiStack />
          {/* The question itself — this is the whole point of the variant. */}
          <p className="mt-1 break-keep text-xs font-semibold leading-relaxed text-white/85">{t(q1.text)}</p>
          <div className="grid gap-2">
            {(["a", "b"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => choose(side)}
                aria-pressed={picked === side}
                className={`flex min-h-[44px] items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                  picked === side
                    ? "border-violet-400/60 bg-violet-500/15"
                    : "border-white/12 bg-white/[0.03] hover:border-violet-400/35 hover:bg-white/[0.06]"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.6rem] font-black transition ${
                    picked === side ? "border-violet-300 bg-violet-400 text-[#120d22]" : "border-white/25 text-white/50"
                  }`}
                >
                  {picked === side ? "✓" : side.toUpperCase()}
                </span>
                <span className="break-keep text-xs leading-relaxed text-white/80">{t(q1[side].label)}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a
              href="/quiz"
              onClick={() => track("quiz_click", { src: "hook_skip" })}
              // -my-3 py-3: 44px of touch height without moving the line visually.
              className="-my-3 inline-flex min-h-[44px] items-center py-3 text-xs font-semibold text-violet-200/80 underline-offset-4 transition hover:text-violet-100 hover:underline"
            >
              {t(dict.miniQuiz.cta)}
            </a>
            <span className="text-[11px] text-white/55">{t(dict.register.hookQuizMeta)}</span>
          </div>
          <p className="text-xs leading-relaxed text-white/55">{t(dict.register.hookQuizNote)}</p>
        </div>
        ) : (
        <a
          href={ownResultId ? `/quiz?r=${ownResultId}` : "/quiz"}
          onClick={() => track("quiz_click", { src: "hook_card" })}
          className={`group flex min-h-[56px] flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-left transition hover:border-violet-400/35 hover:bg-white/[0.07] active:scale-[0.99] ${compact ? "gap-1.5" : "gap-2"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="break-keep text-sm font-bold leading-snug text-white">
                {ownName
                  ? t(dict.register.hookQuizQReturn).replace("{name}", ownName)
                  : t(dict.register.hookQuizQBig)}
              </p>
              {/* Rotating REAL variant names — the single most concrete thing the
                  quiz has, and it was nowhere on the home page. */}
              {!ownName && !compact && <QuizTypeShuffle t={t} />}
            </div>
            {/* 9:16 story-card mock, rebuilt from the same type data the real
                result card uses — no new asset.
                NOT in the hero: with the peek and the teaser line this card came
                out 300px tall against the register card's 172, and in the hero
                the two are stacked, so the aside was physically the bigger of
                the two. The mid-page bands lay them side by side and have the
                room, so that is where the visual assets earn their space. */}
            {!compact && <QuizResultPeek mbti={parsed?.mbti} className="hidden shrink-0 sm:block" />}
          </div>
          <QuizEmojiStack compact={compact} />
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/10 px-4 text-sm font-bold text-violet-100 transition group-hover:border-violet-300/60 group-hover:bg-violet-500/20 group-hover:text-white ${compact ? "py-1.5" : "py-2"}`}>
            {t(ownName ? dict.register.hookQuizCtaReturn : dict.register.hookQuizCtaBig)}
            {!ownName && (
              <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide">
                {t(dict.register.hookQuizMeta)}
              </span>
            )}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
          {/* First-visit only — a returning visitor has already seen the joke
              and is here for their result, not the disclaimer. */}
          {!ownName && (
            <p className="text-xs leading-relaxed text-white/55">{t(dict.register.hookQuizNote)}</p>
          )}
        </a>
        )}
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

// 빌더톤이 실제로 시작하는 순간. Day 1 오프닝이 열리는 8/22 오후 1시,
// 싱가포르 현지 시각입니다(SGT=UTC+8 → 08/22 05:00 UTC).
//
// 직전 값은 "2026-08-22T00:00:00+09:00", 즉 한국 시각 자정이었습니다. 두 군데가
// 틀렸습니다: 행사는 싱가포르에서 열리므로 기준 시간대가 KST가 아니라 SGT이고,
// 시작은 자정이 아니라 오후 1시입니다(schedule.ts Day 1의 hours "1PM–4:30PM",
// 입장 12:40). 결과적으로 시계가 실제보다 14시간 이르게 0을 찍었습니다.
//
// 오프셋을 문자열에 박아두는 것이 핵심입니다. 오프셋 없이 쓰면 이 코드를 읽는
// 브라우저의 시간대로 해석되어, 서울에서 보는 시계와 싱가포르에서 보는 시계가
// 서로 다른 순간을 가리킵니다.
//
// dict.hero.countdownStartsAt이 같은 시각을 글로 말합니다. 하나를 고치면
// 반드시 다른 하나도 고치세요.
const LAUNCH_AT = new Date("2026-08-22T13:00:00+08:00").getTime();
// 등록 마감. 시작(오후 1시)보다 세 시간 늦은 오후 4시입니다 — Day 1 오프닝이
// 1PM–4:30PM이라 그 자리에 온 사람도 마감 전까지는 등록할 수 있습니다.
//
// 이 세 시간 때문에 상수가 따로 필요합니다. 패널은 LAUNCH_AT에 카운트다운에서
// Problem 뷰로 넘어가는데, 카운트다운에만 마감 안내를 두면 정작 마감 직전
// 세 시간 동안 안내가 사라집니다. 그래서 Problem 뷰가 이 값을 보고 "아직
// 등록할 수 있어요" 밴드를 띄우고, 오후 4시가 지나면 스스로 내립니다.
//
// dict.hero.countdownDeadline / problemRegistrationOpen이 이 시각을 글로
// 말합니다. 하나를 고치면 반드시 함께 고치세요. LAUNCH_AT과 마찬가지로
// 오프셋(+08:00)을 문자열에 박아둡니다.
const REGISTRATION_CLOSES_AT = new Date("2026-08-22T16:00:00+08:00").getTime();
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
        <span className="text-white/55">· {t(dict.hero.countdownLive)}</span>
      </p>
      <div className="mx-auto grid w-fit grid-cols-4 gap-1.5 sm:gap-2.5">
        {units.map((u, i) => (
          <div
            key={u.label}
            className="w-14 rounded-xl border border-white/10 bg-white/[0.04] px-1 py-2.5 sm:w-16 sm:py-3.5"
          >
            {/* whitespace-nowrap과 좁은 px는 장식이 아니라 버그 수정입니다.
                "00"은 나올 수 있는 두 자리 중 가장 넓은 조합이고(비례폭 서체에서
                1은 좁고 0은 넓습니다), 예전 여백(px-1.5 sm:px-2)으로는 폭이
                딱 맞아떨어져서 조금만 넓은 서체를 만나면 넘쳤습니다. 넘치면
                줄바꿈이 일어나 두 자리가 세로로 쌓입니다. 그래서 다른 숫자는
                멀쩡한데 00에서만 무너져 보였습니다.

                Pretendard가 아직 안 왔을 때(font-display: swap) 쓰이는 폴백이나
                브라우저 최소 글꼴 크기 설정처럼, 글자만 커지고 타일은 그대로인
                상황이 실제로 있습니다. 그래서 두 겹으로 막습니다: nowrap이
                세로 쌓임 자체를 불가능하게 하고, 넓어진 안쪽 폭이 애초에
                넘칠 일을 없앱니다. tabular-nums는 숫자가 바뀔 때 폭이
                출렁이지 않게 하는 별개의 장치이니 함께 두세요. */}
            <div className="whitespace-nowrap bg-gradient-to-b from-white to-white/60 bg-clip-text font-black tabular-nums text-transparent text-[clamp(1.4rem,5vw,2.25rem)] leading-none">
              {/* 첫 칸(days)은 자릿수 그대로, 나머지는 2자리 고정 */}
              {ready ? (i === 0 ? u.v : pad(u.v)) : "—"}
            </div>
            <div className="mt-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-white/50 sm:text-[0.65rem]">
              {u.label}
            </div>
          </div>
        ))}
      </div>
      {/* 시계가 가리키는 순간을 글로. 카운트다운은 "얼마나 남았나"만 말하고
          "언제인가"는 말하지 않아서, 달력에 넣으려는 사람은 Day 1 카드까지
          내려가야 했습니다. 위 히어로의 날짜 줄은 8일 기간(08.22–08.29)이라
          시작 시각을 대신하지 못합니다. */}
      <p className="mt-3.5 text-xs font-semibold text-white/75">
        {t(dict.hero.countdownStartsAt)}
      </p>
      {/* 등록 마감. 시계는 "시작까지"만 세고 있어서, 언제까지 등록해야 하는지는
          이 줄이 없으면 사이트 어디에도 없습니다. 시작 시각 바로 아래에 두되
          알약 배지로 한 단계 띄웁니다 — 위 줄은 달력에 넣을 정보이고, 이 줄은
          지금 행동해야 하는 정보라 무게가 달라야 합니다.
          마감(오후 4시)이 시작(오후 1시)보다 늦은 이유는 dictionary 쪽 주석 참고. */}
      <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-[0.7rem] font-semibold text-violet-100">
        {t(dict.hero.countdownDeadline)}
      </p>
      {/* What the ticking clock actually costs you — deliberately about what
          registering gets you sooner, not about seats running out. The line
          above is a date, not a scarcity device: there is no cap, so
          "선착순 / 마감 임박 / 잔여석" would still be an invented pressure;
          every clause below is something we already do.
          Static text: it must not animate alongside the seconds.
          TODO: 매칭 '등록 순서' 운영 방침 확정 시 "일찍 등록할수록 매칭 풀이
          넓어요"로 강화 가능 */}
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/55">
        {t(dict.hero.countdownUrgency)}
      </p>
    </div>
  );
}

function ProblemView({ t }: { t: Tfn }) {
  // 오프닝이 열린 뒤(=이 뷰가 보이기 시작한 뒤)에도 등록은 오후 4시까지 열려
  // 있습니다. 시계를 그대로 재사용해 마감이 지나면 밴드가 스스로 사라지게 합니다
  // — 새로고침을 기다리지 않고 그 초에 내려갑니다. ready는 SSR/첫 렌더에서
  // false라 hydration mismatch도 막아줍니다.
  const { ready, done } = useCountdown(REGISTRATION_CLOSES_AT);
  const registrationOpen = ready && !done;

  return (
    <Glass className="text-left">
      {/* 문제 카드 위에 붙는 마감 밴드. 바이올렛이 아니라 앰버인 건 아래
          Eyebrow·"공개 예정" 배지가 이미 바이올렛이기 때문입니다. 같은 색을
          세 번 쓰면 어느 것이 시간에 쫓기는 정보인지 구분이 사라집니다. */}
      {registrationOpen && (
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[0.7rem] font-semibold text-amber-100">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-[softPulse_2.4s_ease-in-out_infinite] rounded-full bg-amber-300/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
          </span>
          {t(dict.hero.problemRegistrationOpen)}
        </p>
      )}
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
// attend. Read off the explicit data flag rather than category === "build" —
// that category held a scheduled 4-hour on-site track (the Day 5 Quickathon)
// until the Day-5 networking pivot (2026-08-03), and the next scheduled build
// session would break the inference again. See BEvent.selfPaced.
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
    <p className="flex items-start gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3.5 py-3 text-xs leading-relaxed text-white/60">
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
      <span className="mt-auto pl-2 pt-3 text-xs font-semibold text-violet-300/75 transition group-hover:text-violet-300">
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
  // A half-on-site day: carries the amber dot the in-person days use, at a
  // lighter weight — the day has an on-site half, it just isn't an on-site day.
  // No day is "mixed" at the moment (Day 3·4 were, until their mentoring went
  // online-first); kept for the next one that is.
  if (day.dayMode === "mixed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-2 py-0.5 text-[0.68rem] font-semibold text-amber-100/80">
        <span aria-hidden className="text-amber-300/70">●</span>{t(dict.program.mixedLabel)}
      </span>
    );
  // Day 3·4: online unless your mentor offers F2F. Same neutral pill as 온라인,
  // no amber and no dot — the amber treatments above are "there is somewhere to
  // be", and here there isn't one for most people. Only the wording changes,
  // which is exactly the size of the correction.
  if (day.dayMode === "online-default")
    return (
      <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-semibold text-white/60">
        {t(dict.program.onlineDefaultLabel)}
      </span>
    );
  return (
    <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-semibold text-white/60">
      {t(dict.program.onlineLabel)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 정거장 원칙 — the 8-day arc as a route, not a calendar.
//
// The grid below shows eight cards of equal weight, which reads as eight days of
// obligation however many sentences say otherwise. A route says it structurally:
// two terminals you have to be at, six stops you choose. Sits directly above the
// grid so the grid is read through it.
//
// Everything is derived from days[].mandatory — see the note in dict.program.
// ─────────────────────────────────────────────────────────────────────────────

// The node keyword. days[].theme is "오프닝 · 문제 공개" / "크래시코스 (집중)";
// a stop label needs the head of that, without the parenthetical. Derived rather
// than duplicated so the strip can never drift from the card heading below it.
//
// `days[].stopLabel` overrides the derivation where the head of the theme isn't
// the reason to get off. Day 3·4's theme is "자율 빌드 · 멘토링", so the derived
// keyword was 자율 빌드 — but self-paced build is not something you turn up for;
// the 1:1 mentoring is. Day 6 carries the same override since the mentoring went
// daily across Day 3–7 (2026-08-09).
const stopKeyword = (theme: string) =>
  theme.split("·")[0].replace(/\([^)]*\)/g, "").trim();

function RouteMap({ t, onOpen }: { t: Tfn; onOpen: (n: number) => void }) {
  const r = dict.program.route;
  return (
    <div className="mt-10">
      {/* TWO ROWS OF FOUR ON MOBILE, one row of eight from sm up.
          This was a horizontally scrolling single row, on the theory that a route
          which wraps stops being a route. That theory lost to a fact: at 375px the
          strip cut off around Day 5, so Day 8 — the ★ terminal this device exists
          to show — was invisible until you scrolled it. A route map whose
          destination is off-screen by default is worse than a wrapped one.
          Both anchors are now on screen at 375px with no scrolling.

          Implementation: the eight days are split into two <ol>s of four. Below sm
          they stack; from sm up they sit side by side and read as the original
          single line of eight. Each row owns its own rail, inset so the two halves
          join seamlessly on desktop (see the rail comments). */}
      <div className="flex flex-col sm:flex-row">
        {[days.slice(0, 4), days.slice(4, 8)].map((row, rowIdx) => (
        <Fragment key={rowIdx}>
        {/* Mobile-only elbow between the rows. The rail can't be drawn across a
            flex-direction change, and a plain arrow says "continues below" just
            as well as a bent line would. sm:hidden — on desktop the rails meet. */}
        {rowIdx === 1 && (
          <div aria-hidden className="flex flex-col items-center justify-center py-1.5 sm:hidden">
            <span className="h-4 w-px bg-gradient-to-b from-white/5 to-white/25" />
            <svg viewBox="0 0 12 8" className="h-2 w-3 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l5 5 5-5" />
            </svg>
          </div>
        )}
        <ol
          aria-label={rowIdx === 0 ? t(r.ariaLabel) : undefined}
          // pb-9: the mentoring band below lives in this padding. It is padding
          // rather than a sibling block because the band has to be positioned
          // against the SAME box the nodes are (percentages of a four-up row),
          // and on desktop both rows stretch to one height so the two halves of
          // the band land on one line.
          className="relative flex flex-1 items-start pb-9"
        >
          {/* The rail. Ends are inset by half a column (12.5% of a four-up row) so
              it runs node-centre to node-centre. On desktop the INNER ends run to
              the edge instead, so row 1's rail meets row 2's and the eight stops
              read as one unbroken line. top-4 is the centre of the h-8 node row. */}
          <span
            aria-hidden
            className={`pointer-events-none absolute top-4 h-px bg-gradient-to-r from-rose-300/40 via-white/15 to-rose-300/40 ${
              rowIdx === 0
                ? "left-[12.5%] right-[12.5%] sm:right-0"
                : "left-[12.5%] right-[12.5%] sm:left-0"
            }`}
          />
          {/* ── Day 3–7 멘토링 밴드 ────────────────────────────────────────
              DECIDED 2026-08-09: 멘토링은 Day 3–7 닷새 매일, 팀 단위 1시간 예약제로
              열립니다. 노선도는 Day 3·4 노드에만 "1:1 멘토링" 키워드를 달고 있어서
              멘토링이 이틀짜리로 읽혔는데, 다섯 날 카드에 같은 문장을 다섯 번 적는
              대신 구조로 말합니다 — Day 3 노드에서 Day 7 노드까지 이어지는 보조 레일.

              기하: 한 행은 네 칸이고 노드 중심은 12.5% · 37.5% · 62.5% · 87.5%입니다.
              그래서 Day 3 = 첫 행의 62.5%, Day 7 = 둘째 행의 62.5%(= right 37.5%).
              모바일에서는 두 행이 위아래로 끊기므로 각 조각이 자기 행의 마지막/첫
              노드 중심까지만 가고, 데스크톱(sm+)에서는 위 레일과 같은 규칙으로 안쪽
              끝을 행 가장자리까지 늘려 두 조각이 한 줄로 이어집니다.

              메인 레일보다 얇고(h-[3px] vs h-px지만 색이 훨씬 진합니다) 색이 다릅니다 —
              emerald는 이 사이트에서 멘토링 섹션의 색이라, 범례의 rose(필참)·
              violet(스포트라이트)와 층이 겹치지 않습니다. 범례에 넣지 않는 이유는
              dict.program.route.mentoringBand 주석에 있습니다. */}
          <span
            aria-hidden
            // 안쪽 끝의 라운딩은 데스크톱에서 뗍니다 — 둥근 끝 두 개가 행 경계에서
            // 맞닿으면 이어진 레일에 잘록한 이음매가 생깁니다.
            className={`pointer-events-none absolute bottom-7 h-[5px] rounded-full bg-emerald-400/60 ${
              rowIdx === 0
                ? "left-[62.5%] right-[12.5%] sm:right-0 sm:rounded-r-none"
                : "left-[12.5%] right-[37.5%] sm:left-0 sm:rounded-l-none"
            }`}
          />
          {/* 라벨은 둘째 행 조각에만 답니다. 첫 행 조각은 데스크톱에서 폭이 한 칸
              반(62.5%→100%), 모바일에서는 한 칸(Day 3→4)뿐이라 이 문장이 들어갈
              자리가 없습니다 — 같은 색 레일이 이어지는 것으로 충분하고, 스크린리더는
              아래 aria-label이 구간을 말로 받습니다. */}
          {rowIdx === 1 && (
            <span
              role="img"
              aria-label={t(r.mentoringBandAria)}
              // 두 폭 모두 "밴드와 같은 중심"을 만들려고 잡은 값이지, 밴드와 같은
              // 구간이 아닙니다.
              //  · 모바일: 이 행의 밴드는 12.5%→62.5%, 중심은 37.5%. 컨테이너를
              //    0→75%로 두면 중심이 같고 칩이 조각보다 넓어도(영문 라벨이 그렇습니다)
              //    잘리거나 줄바꿈되지 않습니다.
              //  · 데스크톱: 밴드가 두 행에 걸쳐 있는데 라벨은 한 행 안에서만 위치를
              //    잡을 수 있어서, 왼쪽으로 37.5%(= 첫 행에 있는 조각의 폭)만큼 넘겨
              //    컨테이너를 밴드 전체와 같은 구간으로 만듭니다. 그래야 라벨이 오른쪽
              //    3분의 1이 아니라 진짜 중앙(Day 5 언저리)에 섭니다.
              className="pointer-events-none absolute bottom-0 left-0 right-[25%] flex justify-center sm:left-[-37.5%] sm:right-[37.5%]"
            >
              {/* whitespace-nowrap + justify-center: 칩이 조각보다 넓어지면 양쪽으로
                  똑같이 넘칩니다. 줄바꿈되어 밴드 아래 두 줄이 되는 것보다 낫습니다. */}
              {/* 범례(0.66rem)·정거장 이름(0.68rem)보다 한 급 큽니다. 이 줄은
                  범례 항목이 아니라 다섯 날을 덮는 사실 하나라, 주변 잔글씨와
                  같은 크기면 각주로 읽힙니다. */}
              <span className="whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-400/[0.1] px-2.5 py-1 text-[0.72rem] font-semibold leading-none text-emerald-100">
                {t(r.mentoringBand)}
              </span>
            </span>
          )}
          {row.map((d) => {
            const anchor = d.mandatory === true;
            // 세 번째 층이 아니라 두 번째입니다: 필참(anchor) → 스포트라이트 →
            // 나머지. anchor가 이미 참이면 spotlight는 무시합니다(같은 정거장이
            // 두 가지로 그려질 일은 없지만, 우선순위를 코드에 남겨둡니다).
            const spot = !anchor && d.spotlight === true;
            // 싱가포르에 몸이 있어야 하는 날. "pending"(장소 미확정)은 일부러
            // 제외합니다 — 마커는 "여기로 오세요"라는 약속인데, 아직 어디로 갈지
            // 모르는 날에 그 약속을 하면 안 됩니다. 지금은 해당 날이 없습니다.
            const onSite = d.dayMode === "offline";
            return (
              <li key={d.day} className="relative flex-1">
                <button
                  type="button"
                  onClick={() => onOpen(d.day)}
                  className="group flex w-full flex-col items-center gap-1.5 px-1 py-1 text-center"
                  // 마커는 aria-hidden이라 스크린리더에는 안 보입니다. 눈으로 읽는
                  // 사람이 얻는 정보를 여기서 말로 채웁니다.
                  aria-label={`Day ${d.day} · ${t(d.theme)}${onSite ? ` · ${t(dict.program.offlineLabel)}` : ""}${onSite && d.venueLogo ? ` · ${d.venueLogo.name}` : ""}`}
                >
                  {/* Fixed-height row so both node sizes share one centreline and
                      the rail passes through every node at the same height. */}
                  <span className="relative flex h-8 items-center justify-center">
                    {/* 현장 마커. ABSOLUTE인 것이 핵심입니다 — 흐름에 넣으면 모든
                        노드가 아래로 밀리는데, 레일은 <ol> 기준 top-4에 절대
                        배치돼 있어서 함께 내려오지 않습니다. 레일이 노드를 관통하는
                        정렬이 깨지느니 마커를 띄웁니다.

                        핀 아이콘이 아니라 그날의 장소 로고입니다. 핀은 "현장"
                        하나만 말하는데 그건 아래 카드의 뱃지가 이미 하는 말이고,
                        노선도에서 알고 싶은 것은 어느 문으로 가느냐입니다.

                        박스는 h-4 × w-14 고정에 object-contain입니다. 폭을 고정해
                        두는 것이 핵심이에요 — 모바일에서 한 칸이 ~86px이라 마크가
                        제 비율대로 늘어나면 옆 칸을 침범합니다. 덕분에 FOUNDRY처럼
                        가로로 긴 워드마크는 폭에, aws처럼 정사각에 가까운 마크는
                        높이에 맞춰 각자 들어갑니다.

                        max-w-none이 없으면 안 됩니다. Tailwind preflight의
                        `img { max-width: 100% }`에서 100%는 이 이미지의 컨테이닝
                        블록, 즉 노드 하나짜리 span(w-7 또는 w-6)입니다 — 그대로
                        두면 로고가 27~32px로 눌려서 필참일과 선택일의 마크 크기가
                        제각각이 됩니다.

                        alt는 비워 둡니다. 장소 이름은 버튼의 aria-label이 이미
                        말하고 있어서, 여기에 또 넣으면 두 번 읽힙니다. */}
                    {onSite && d.venueLogo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.venueLogo.src}
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute -top-5 left-1/2 h-4 w-14 max-w-none -translate-x-1/2 object-contain opacity-45 transition group-hover:opacity-90"
                      />
                    )}
                    {anchor ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-300/50 bg-rose-400/25 text-[0.6rem] text-rose-100 shadow-[0_0_0_4px_rgba(10,6,20,0.85)] transition group-hover:bg-rose-400/40">
                        <span aria-hidden>★</span>
                      </span>
                    ) : spot ? (
                      // 필참보다 한 치수 작고 점보다 두 치수 큽니다. ★를 쓰지 않고
                      // 색도 rose가 아닌 violet인 것은 의도적입니다 — ★와 rose는
                      // 노선도에서 오직 "필참"만 뜻해야 하고, 이 날은 선택일입니다.
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-300/60 bg-violet-400/20 shadow-[0_0_0_4px_rgba(10,6,20,0.85)] transition group-hover:bg-violet-400/40">
                        <span aria-hidden className="h-2 w-2 rounded-full bg-violet-200" />
                      </span>
                    ) : (
                      <span className="h-3 w-3 rounded-full border border-white/35 bg-[#0a0614] shadow-[0_0_0_4px_rgba(10,6,20,0.85)] transition group-hover:border-violet-300/70 group-hover:bg-violet-400/30" />
                    )}
                  </span>
                  <span
                    className={`text-[0.62rem] font-bold leading-none ${
                      anchor ? "text-rose-200" : spot ? "text-violet-200" : "text-white/45"
                    }`}
                  >
                    {t(dict.program.dayLabel)} {d.day}
                  </span>
                  {/* 정거장 이름의 밝기 규칙은 하나입니다: 필참·스포트라이트는
                      굵은 흰색, 나머지 선택일(Day 2·3·4·6)은 같은 회색.
                      세션이 있는 날/자율일 같은 기준으로 흐리게 하는 로직은 없고,
                      만들지도 마세요 — 노드의 층(필참 / 놓치면 아까운 / 선택)이
                      이 페이지가 쓰는 유일한 위계입니다. Day 6이 유독 흐려 보인다면
                      그건 규칙이 아니라 이웃 탓입니다(양옆 Day 5·7이 둘 다 굵은
                      흰색이라 대비가 큽니다).
                      /60 → /75 (2026-08-10, 모바일 폴리시): 굵기 차이만으로도
                      위계는 서므로, 대비를 낮추는 일까지 색이 겹쳐 할 필요는
                      없었습니다. 작은 화면에서 0.68rem·/60은 읽히지 않습니다. */}
                  <span
                    className={`break-keep text-[0.68rem] leading-tight transition ${
                      anchor || spot
                        ? "font-bold text-white"
                        : "text-white/75 group-hover:text-white"
                    }`}
                  >
                    {d.stopLabel ? t(d.stopLabel) : stopKeyword(t(d.theme))}
                  </span>
                  {/* 필참 배지는 흐름에서 빠져 있습니다 (absolute, 2026-08-09).
                      보이는 자리는 전과 같지만 — 정거장 이름 바로 아래 —
                      행 높이에는 더하지 않습니다. 이 배지를 다는 날은 Day 1·8
                      둘뿐인데, 흐름 안에 있으면 그 두 칸이 행 전체를 24px 키우고,
                      행 바닥에 붙는 Day 3–7 멘토링 밴드가 정거장 이름에서
                      그만큼 멀어져 허공에 뜬 선처럼 보였습니다. 배지가 넘치는
                      구간(Day 1·8 칸)과 밴드·라벨이 지나는 구간(Day 3–7)은
                      가로로 겹치지 않아, 넘쳐도 부딪히지 않습니다. */}
                  {anchor && (
                    <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 text-[0.58rem] font-bold leading-none text-rose-200">
                      {t(dict.program.mandatoryBadge)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        </Fragment>
        ))}
      </div>

      {/* 범례 한 줄. 노선도 아래에 남은 유일한 잔글씨입니다.
          행선지 줄("→ 결과 공유회: 기업·업계 전문가 앞 검증")이 여기 있었고,
          세 자리를 거쳐 결국 아래 원칙 문단으로 합쳐졌습니다 (2026-08-10).
          (1) 좌우 양끝 정렬: Day 3–7 밴드가 생기자 밴드 오른쪽 끝 바로 아래에
          서고, 앞의 화살표까지 오른쪽을 가리켜 밴드가 그리로 이어지는 것처럼
          읽혔습니다. (2) 오른쪽 정렬로 한 줄 아래: 빈 자리에 혼자 떠서 툭
          튀어나왔습니다. (3) 범례 끝에 구분선으로 붙이기: 네 번째 범례로 읽혔고,
          모바일에서는 어차피 줄이 넘어가 한 줄이 늘었습니다.
          합친 이유는 자리 때문만이 아닙니다 — 원칙 문단이 "이 무대"라고 쓰는데
          그 무대의 이름을 대는 문장이 바로 이 줄이었습니다. 한 문장 안에 있어야
          지시어가 자기 앞의 말을 가리킵니다.
          범례 세 줄은 그대로 둡니다. 스포트라이트가 붙는 날이 둘(Day 5·7)뿐이라
          노드에 직접 라벨을 다는 안도 검토했지만, 그 자리는 필참 배지의 자리이고
          선택일에 배지 비슷한 것을 달면 의무로 읽힙니다(schedule.ts spotlight
          주석의 결정). 게다가 지금 그 아래는 멘토링 밴드가 지나갑니다. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5 text-[0.66rem] text-rose-200/85">
          <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-rose-300/50 bg-rose-400/25 text-[0.42rem] text-rose-100">★</span>
          {t(r.legendMandatory)}
        </span>
        <span className="flex items-center gap-1.5 text-[0.66rem] text-white/50">
          <span aria-hidden className="h-2 w-2 rounded-full border border-white/35" />
          {t(r.legendOptional)}
        </span>
        {/* 세 번째 모양. 스와치는 노선도의 스포트라이트 노드를 그대로 줄인 것이라
            둘이 같은 것임이 눈으로 이어집니다. */}
        <span className="flex items-center gap-1.5 text-[0.66rem] text-violet-200/85">
          <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-violet-300/60 bg-violet-400/20">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-200" />
          </span>
          {t(r.legendSpotlight)}
        </span>
      </div>

      {/* The principle, then what the optional stops actually are. Two lines, one
          claim: "you choose" on top, "and here's why they're worth choosing"
          underneath. The second is a step quieter so the thesis still leads, but
          not a footnote — it is the line that stops "선택" being read as
          "skippable filler".
          첫 줄이 행선지("결과 공유회 = 기업·업계 전문가 앞 검증")까지 안고
          있습니다 — 위 범례 옆에 따로 서 있던 줄을 여기로 합쳤습니다 (2026-08-10).
          mt-5 → mt-4: 그 줄이 사라지며 위쪽 여백이 한 칸 헐거워졌습니다. */}
      <div className="mx-auto mt-4 max-w-3xl text-center">
        <p className="break-keep text-[13px] font-semibold leading-relaxed text-white/80 sm:text-sm">
          {t(r.principle)}
        </p>
        <p className="mt-2.5 break-keep text-xs leading-relaxed text-white/60 sm:text-[13px]">
          {t(r.optionalValue)}
        </p>
      </div>
    </div>
  );
}

// One benefit card. Collapses to two bullets ON MOBILE ONLY.
//
// Desktop must render exactly what it rendered before, so the extra points are
// never removed from the DOM — they are `hidden sm:flex`, which means the phone
// hides them and every other viewport (and every crawler and screen reader in
// desktop layout) sees the full list. The toggle itself is `sm:hidden`, so above
// the breakpoint there is no button, no tab stop and no aria state at all.
//
// The tap target is a transparent overlay across the whole card rather than a
// small "더 보기" link: on a phone the card IS the control, and a 4mm link at the
// bottom of a card is a worse target than the 200px block above it. The label row
// stays visible as the affordance — an overlay with no visible cue is a card that
// silently eats taps.
function BenefitCard({
  item,
  t,
}: {
  item: (typeof dict.benefits.items)[number];
  t: Tfn;
}) {
  const [open, setOpen] = useState(false);
  const listId = `benefit-${item.num}-points`;
  const hidden = item.points.length - 2;
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/25 hover:bg-white/[0.05]">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15 text-sm font-black text-cyan-200">{item.num}</span>
      <h3 className="mt-4 text-lg font-bold text-white">{t(item.title)}</h3>
      <ul id={listId} className="mt-3 space-y-2">
        {item.points.map((p, i) => (
          <li
            key={i}
            className={`items-start gap-2 text-sm leading-relaxed text-white/70 ${
              i > 1 && !open ? "hidden sm:flex" : "flex"
            }`}
          >
            <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
            {t(p)}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <>
          <span
            aria-hidden
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-cyan-200/70 sm:hidden"
          >
            {t(open ? dict.benefits.collapse : dict.benefits.expand)}
            <svg
              viewBox="0 0 12 8"
              className={`h-2 w-3 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 1l5 5 5-5" />
            </svg>
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={listId}
            className="absolute inset-0 rounded-2xl sm:hidden"
          >
            <span className="sr-only">
              {t(item.title)}, {t(open ? dict.benefits.collapse : dict.benefits.expand)}
            </span>
          </button>
        </>
      )}
    </div>
  );
}

// Headline counts, all computed from days[].mandatory / dayMode. Sits directly
// under the heading because "how much of my August is this" is the first
// question, and three numbers answer it faster than the amber box below can.
function ProgramStats({ t }: { t: Tfn }) {
  const s = dict.program.stats;
  const required = days.filter((d) => d.mandatory === true).length;
  // Two stats, not three. An 온라인 count sat here and pulled against the point:
  // this rule exists to answer "how many days do I owe you", and online-vs-on-site
  // is a different question that modeNote already answers in full. Required and
  // optional are also a clean complement (2 + 6 = 8), so the pair reads as the
  // whole programme; a third number turned it into a stat dump.
  const rows = [
    { key: "required", n: required, label: s.mandatory, strong: true },
    { key: "optional", n: days.length - required, label: s.optional, strong: false },
  ];
  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <dl className="flex items-stretch justify-center">
        {rows.map((row, i) => (
          <Fragment key={row.key}>
            {/* Bracket opacity, not bg-white/12: the repo's fine alphas are all
                arbitrary values and /12 is off Tailwind's default scale, so it
                compiled to nothing and the rule read as three floating numbers. */}
            {i > 0 && <span aria-hidden className="mx-5 h-9 w-px self-center bg-white/[0.14] sm:mx-9" />}
            <div className="flex flex-col items-center px-1">
              <dd className={`text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-none ${row.strong ? "text-rose-200" : "text-white"}`}>
                {row.n}
                <span className="ml-0.5 text-[0.5em] font-bold">{t(s.unit)}</span>
              </dd>
              <dt className={`mt-1.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] ${row.strong ? "text-rose-300/80" : "text-white/50"}`}>
                {t(row.label)}
              </dt>
            </div>
          </Fragment>
        ))}
      </dl>
      <p className="mt-3 break-keep text-center text-xs leading-relaxed text-white/55">{t(s.note)}</p>
    </div>
  );
}

// One clean summary card per day (deck-style). Opens the day detail modal on
// click rather than exploding every session inline — keeps the arc scannable.
function DayCard({ day, t, onOpen }: { day: DayMeta; t: Tfn; onOpen: (n: number) => void }) {
  const allSelfPaced = dayIsSelfPaced(day.day);
  return (
    <button
      type="button"
      onClick={() => onOpen(day.day)}
      // The two anchors carry a rose-tinted border at rest so they read first in
      // a grid of eight. Rose because that is already the 필참 colour on the badge
      // inside them and on the route terminals above — one meaning, one hue. Kept
      // to a border/tint step: a stronger treatment would turn the other six into
      // greyed-out rejects, which is the opposite of "stops you choose".
      className={`group relative flex h-full flex-col rounded-2xl border p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.06] ${
        day.mandatory
          ? "border-rose-400/25 bg-white/[0.055]"
          : "border-white/[0.08] bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-violet-300/70">{t(dict.program.dayLabel)}</span>
          <span className="text-2xl font-black leading-none text-white">{day.day}</span>
        </span>
        <span className="text-[0.7rem] text-white/55">{day.date} · {t(day.weekday)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {day.mandatory ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[0.68rem] font-bold text-rose-200">
            <span aria-hidden>★</span>{t(dict.program.mandatoryBadge)}
          </span>
        ) : (
          /* Same slot as the 필참 pill, deliberately quieter: borderless and
             low-contrast so it registers as a fact about the day rather than
             competing with the two anchors. Every non-required day gets one, so
             the absence of a 선택 pill is itself the signal on Day 1·8. */
          <span className="inline-flex items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.68rem] font-semibold text-white/45">
            {t(dict.program.optionalBadge)}
          </span>
        )}
        <DayModeBadge day={day} t={t} selfPaced={day.selfPacedDay ?? allSelfPaced} />
        {/* Day 3·4 carry self-paced build AND a real session (the 1:1 slot), so
            DayModeBadge resolves them to a plain "온라인" pill — which is the
            exact misread this badge exists to prevent: it reads as a scheduled
            online day when the fixed part is one optional slot. Show the
            self-paced pill ALONGSIDE the mode on those days. Day 6 already
            resolves to self-paced on its own, hence the guard against doubling
            it up. Only Days 3·4·6 have self-paced entries, so this stays rare
            enough to mean something. */}
        {dayHasSelfPaced(day.day) && !(day.selfPacedDay ?? allSelfPaced) && (
          <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-semibold text-white/60">
            {t(dict.program.selfPacedLabel)}
          </span>
        )}
        {/* The booked on-site window, ONLY on days that have one (see
            DayMeta.hours). Same pill as the self-paced badge on purpose — this
            is one more fact about the day, not a new kind of thing, so it gets
            no colour of its own. A day without hours renders NOTHING here: an
            online day has no time to be at, and printing "미정" would invent a
            gap that doesn't exist. `hours` is one string for both locales, so
            only the sr-only label is translated. */}
        {day.hours && (
          <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-semibold text-white/60">
            <span className="sr-only">{t(dict.program.hoursLabel)} </span>
            {day.hours}
          </span>
        )}
      </div>
      <h4 className="mt-3 text-[15px] font-bold leading-snug text-white">{t(day.theme)}</h4>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">{t(day.summary)}</p>
      {/* '올 이유' 한 줄 — 요약(무엇을 하는 날인가) 아래, 세션 카운트 위.
          노선도 아래 문단이 "하나하나 내려설 이유가 있도록 설계했습니다"라고
          주장하는데 카드들이 그걸 증명하지 못하고 있었습니다. 이 줄이 증명입니다.
          에메랄드는 이 페이지에서 '얻는 것'에 쓰는 색(혜택 섹션)이라, 일정 서술과
          가치 제시를 색으로 갈라 놓습니다. 새 토큰은 만들지 않았습니다.
          필참일에는 렌더하지 않습니다 — 갈지 말지 고르는 날이 아니어서, 거기에
          '올 이유'를 붙이면 필참이 설득의 문제로 보입니다. */}
      {day.whyStop && !day.mandatory && (
        <p className="mt-2 flex gap-1.5 break-keep text-[12.5px] font-semibold leading-snug text-emerald-200/85">
          <span aria-hidden className="text-emerald-300/70">→</span>
          {t(day.whyStop)}
        </p>
      )}
      {/* 세션 개수는 뺐습니다 (되돌리지 마세요).
          여덟 장이 격자로 놓인 자리에서 숫자는 점수로 읽힙니다. Day 1이 5, Day 3이
          1이면 "Day 1이 다섯 배 값어치"로 보이는데, 바로 위 문단이 주장하는 것은
          정반대입니다: 나머지 여섯도 하나하나 내려설 이유가 있고, 필참이라고 더
          값진 날인 것도 아닙니다.

          게다가 세는 단위가 서로 다릅니다. Day 1의 다섯은 3시간 반짜리 오후 하나에
          들어 있는 진행 순서고, Day 3의 하나는 1:1 멘토링 슬롯입니다. 같은 낱말로
          세지만 같은 것이 아니라, 방문자가 이 숫자로 답할 수 있는 질문이 없습니다.
          그날 무엇을 하는지는 이미 카드의 제목과 요약이, 시간은 hours 칩이,
          내려설 이유는 whyStop 줄이 말합니다. */}
      <span className="mt-auto pt-4 text-xs font-semibold text-violet-300/75 transition group-hover:text-violet-300">
        {t(dict.program.tapHint)} →
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRE-EVENT BAND — one wide row above Lab 1.
//
// The 13 Aug session runs NINE DAYS before Day 1, so it cannot go in the day
// grid without making the event look like it starts on the 13th. It also does
// not belong in the speakers section: every other card there carries a face and
// a name, and this speaker asked for neither — sitting between two named,
// photographed people is exactly where an unnamed one draws the most attention.
//
// So: a full-width band that reads as a prologue to the eight days, showing only
// what it is and when. The detail lives behind a tap, in the same EventModal the
// day sessions use.
// ─────────────────────────────────────────────────────────────────────────────
function PreEventBand({ t, onOpen }: { t: Tfn; onOpen: (e: BEvent, el: HTMLElement) => void }) {
  const ev = schedule.find((e) => e.day === 0);
  if (!ev) return null;
  return (
    <button
      type="button"
      onClick={(e) => onOpen(ev, e.currentTarget)}
      className="group flex w-full flex-col gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.05] px-5 py-4 text-left transition hover:border-violet-400/40 hover:bg-violet-500/[0.09] sm:flex-row sm:items-center sm:gap-5"
    >
      {/* 칩과 연사 소속 로고를 한 묶음으로 둡니다. 모바일에서 밴드가 세로로
          쌓이는데(flex-col), 둘을 따로 두면 로고가 자기 줄을 차지하면서 제목보다
          커 보입니다 — 여기 묶어두면 어느 폭에서도 "언제 · 누구"가 한 줄입니다. */}
      <span className="flex shrink-0 items-center gap-3">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-violet-200">
          {t(dict.program.preEventTag)}
        </span>
        {/* alt를 채웁니다(노선도 마커와 반대). 이 밴드는 어디에도 회사명을 글로
            적지 않아서, 로고를 비워두면 스크린리더에는 소속이 아예 없습니다. */}
        {ev.speakerLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ev.speakerLogo.src}
            alt={ev.speakerLogo.alt}
            className="h-5 w-auto max-w-[4.5rem] shrink-0 object-contain opacity-65 transition group-hover:opacity-95"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-keep text-[15px] font-bold leading-snug text-white">{t(ev.title)}</span>
        <span className="mt-0.5 block break-keep text-xs leading-relaxed text-white/60">{t(ev.summary)}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-violet-200/80 transition group-hover:text-violet-100">
        {t(dict.program.tapHint)}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
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

  // The event dialog stacks on top of this one, so both hold the lock at the
  // same time — useBodyScrollLock counts depth and only the outer release
  // restores the offset. Declared before the lifecycle effect so the page is
  // unfrozen before focus returns to the day card.
  useBodyScrollLock(dayNum != null);

  // Same open/close lifecycle as EventModal and RegisterModal — ESC, Tab focus
  // trap, inert background, initial focus and focus
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
  }, [dayNum]);

  if (!mounted) return null;
  const day = dayNum != null ? days.find((d) => d.day === dayNum) : null;
  const evs = day ? realSessions(day.day) : [];
  // 진행 순서가 이미 가리키고 있는 세션들. 시간표가 세션 목록을 대신하는 날에는
  // 여기 걸리지 않은 세션만 카드로 남깁니다 (아래 렌더 주석 참고).
  const linkedIds = new Set((day?.runOfShow ?? []).map((r) => r.eventId).filter(Boolean));
  const leftoverEvs = evs.filter((ev) => !linkedIds.has(ev.id));

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
          {/* Backdrop — `touch-none` backs up the scroll lock (see EventModal). */}
          <div aria-hidden onClick={onClose} className="absolute inset-0 cursor-default touch-none bg-black/70 backdrop-blur-sm" />
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
            {/* overscroll-contain: a flick that hits either end stays here
                instead of scrolling the page behind the modal. */}
            <div className="overflow-y-auto overscroll-contain px-6 pt-8 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-9 sm:py-9">
              <div className="flex flex-wrap items-center gap-2 pr-12">
                <span className="rounded-full border border-violet-400/25 bg-violet-500/12 px-3 py-1 text-xs font-bold text-violet-200">
                  {t(day.phase)}
                </span>
                {/* The booked window rides in the same chip as the date — it
                    answers the same question ("when do I turn up") and a second
                    chip would split one answer across two. Appended only when
                    the day has hours; online days keep the chip as it was. */}
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  {t(dict.program.dayLabel)} {day.day} · {day.date} · {t(day.weekday)}
                  {day.hours ? ` · ${day.hours}` : ""}
                </span>
                {day.mandatory && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-xs font-bold text-rose-200">
                    <span aria-hidden>★</span>{t(dict.program.mandatoryBadge)}
                  </span>
                )}
                <DayModeBadge day={day} t={t} selfPaced={day.selfPacedDay ?? dayIsSelfPaced(day.day)} />
              </div>
              <h3 id="day-modal-title" className="mt-5 text-[24px] font-bold leading-tight text-white sm:text-[30px]">{t(day.theme)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{t(day.summary)}</p>
              {day.deliverableDue && <SubmissionBox t={t} />}
              {day.awardsBox && <AwardsBox t={t} />}
              {/* 진행 순서가 있으면 그것이 세션 목록을 대신합니다 — 둘 다 두면
                  같은 세션을 시간표에서 한 번, 카드에서 또 한 번 읽게 됩니다.
                  시간표가 더 나은 이유: 카드에 없는 순간(입장·휴식·네트워킹·정리)
                  까지 담고, 순서와 시각이 보이고, 카드로 가는 길(→)도 그 안에
                  있습니다. 그래서 시간표를 채울 때는 모든 세션이 어느 줄엔가
                  걸려 있어야 합니다 — 안 걸린 세션은 열 방법이 없어집니다. */}
              {day.runOfShow?.length ? (
                <>
                  <RunOfShow rows={day.runOfShow} t={t} onSelectEvent={onSelectEvent} />
                  {/* 시간표에 걸리지 않은 세션만 카드로 남깁니다. 시간표에 있는 걸
                      또 카드로 보여주면 같은 세션을 두 번 읽게 되고, 반대로 아무
                      카드도 안 두면 시간표에 없는 세션은 열 방법이 사라집니다.
                      Day 7의 FDE 오피스아워가 그 경우예요 — 온라인 드롭인이라
                      시각이 없어서 현장 시간표에 넣을 수 없습니다. Day 1은 모든
                      세션이 시간표에 걸려 있어 이 목록이 비고, 아무것도 렌더되지
                      않습니다. */}
                  {leftoverEvs.length > 0 && (
                    <div className="mt-3 grid gap-3">
                      {leftoverEvs.map((ev) => (
                        <EventCard key={ev.id} ev={ev} t={t} onSelect={onSelectEvent} />
                      ))}
                    </div>
                  )}
                  {dayHasSelfPaced(day.day) && (
                    <div className="mt-3">
                      <SelfPacedNote t={t} />
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-6 grid gap-3">
                  {evs.map((ev) => (
                    <EventCard key={ev.id} ev={ev} t={t} onSelect={onSelectEvent} />
                  ))}
                  {day && dayHasSelfPaced(day.day) && <SelfPacedNote t={t} />}
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

// The day's run of show (days[].runOfShow). Two columns: time on the left in a
// fixed-width tabular column so the times stack into a readable ruler, content
// on the right. No new design language — same border/tint/typography as the
// session cards, one step quieter because this is the index, not the content.
//
// A row with an `eventId` is a button that opens that session's modal (the same
// handler the cards use); rows without one are plain text, because there is
// nothing more to show for a break or a doors-open slot. Making every row look
// clickable would promise detail that doesn't exist.
function RunOfShow({
  rows,
  t,
  onSelectEvent,
}: {
  rows: NonNullable<DayMeta["runOfShow"]>;
  t: Tfn;
  onSelectEvent: (e: BEvent, el: HTMLElement) => void;
}) {
  const open = (eventId: string, el: HTMLElement) => {
    const ev = schedule.find((e) => e.id === eventId);
    if (ev) onSelectEvent(ev, el);
  };
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-violet-200/80">
        {t(dict.program.runOfShowTitle)}
      </p>
      <ol className="mt-3 space-y-px">
        {/* key는 index입니다 — 한 세션이 두 블록으로 나뉘어 도는 경우(Day 8의 두
            트랙 발표)가 있어 eventId도, time+label 조합도 유일하지 않습니다. */}
        {rows.map((row, i) => {
          const linked = row.eventId ? schedule.find((e) => e.id === row.eventId) : undefined;
          const body = (
            <>
              {/* tabular-nums + a fixed column: times that don't line up read as
                  a list of strings rather than a schedule. */}
              {/* 빈 time = 위 줄과 같은 블록의 하위 항목. 시각을 지어내지 않으면서
                  "이어지는 순서"임을 보여줍니다 (Day 1의 문제 공개). */}
              <span className="w-[6.5rem] shrink-0 pt-[1px] text-[0.72rem] font-semibold tabular-nums text-white/50 sm:w-[7.5rem] sm:text-xs">
                {row.time || <span aria-hidden className="pl-3 text-white/25">↳</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-keep text-[13px] font-semibold leading-snug text-white/85">
                  {t(row.label)}
                  {(linked || row.href) && (
                    <span aria-hidden className="ml-1.5 text-violet-300/70 transition group-hover:text-violet-300">→</span>
                  )}
                </span>
                {row.note && (
                  <span className="mt-1 block break-keep text-xs leading-relaxed text-white/55">
                    {t(row.note)}
                  </span>
                )}
              </span>
            </>
          );
          return (
            <li key={i} className="border-t border-white/[0.06] first:border-t-0">
              {linked ? (
                <button
                  type="button"
                  onClick={(e) => open(row.eventId!, e.currentTarget)}
                  className="group flex w-full gap-3 rounded-lg px-1.5 py-2.5 text-left transition hover:bg-white/[0.04]"
                >
                  {body}
                  <span className="sr-only">{t(dict.program.runOfShowOpen)}</span>
                </button>
              ) : row.href ? (
                // 세션이 아니라 사이트 안의 다른 페이지로 가는 줄 (/quiz).
                // 링크이므로 button이 아닌 a — 새 탭으로 열지 않습니다(내부 이동).
                <a
                  href={row.href}
                  onClick={() => track("quiz_click", { src: "run_of_show" })}
                  className="group flex w-full gap-3 rounded-lg px-1.5 py-2.5 text-left transition hover:bg-white/[0.04]"
                >
                  {body}
                </a>
              ) : (
                <div className="flex gap-3 px-1.5 py-2.5">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// The Day 7 required-deliverable box. Rose, matching the 필참 badge — this page
// already uses rose for "you don't get to skip this", and inventing a second
// required-colour would make one of them look softer than it is.
//
// Sits directly under the day summary, ABOVE the session cards: it isn't a
// session (there's nowhere to turn up to), and putting it below the cards would
// bury the one thing on Day 7 with a hard consequence.
function SubmissionBox({ t }: { t: Tfn }) {
  const s = dict.program.submission;
  return (
    <div className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-400/[0.07] px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/35 bg-rose-400/12 px-2.5 py-1 text-[0.68rem] font-bold text-rose-100">
          <span aria-hidden>★</span>{t(s.mustBadge)}
        </span>
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-rose-200/80">{t(s.tag)}</span>
      </div>
      <p className="mt-2.5 break-keep text-sm font-bold leading-snug text-white">{t(s.heading)}</p>
      <ul className="mt-3 space-y-2">
        {s.items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-rose-50/85">
            <span
              aria-hidden
              className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-rose-300/30 bg-rose-400/10 text-[0.58rem] font-black text-rose-100"
            >
              {i + 1}
            </span>
            <span className="break-keep">{t(item)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3.5 break-keep border-t border-rose-300/15 pt-3 text-xs leading-relaxed text-rose-100/75">
        {t(s.warning)}
      </p>
    </div>
  );
}

// The Day 8 thematic-awards box. Same shape and position as SubmissionBox above,
// amber where that one is rose: rose on this page means "you don't get to skip
// this", and an award is the opposite of an obligation. Amber is already the
// page's ★ main-track colour, which is the right neighbourhood for a prize.
//
// Each row carries three lines because they answer three different questions and
// readers arrive with different ones: the NAME (what it's called on stage), the
// META (who picks it, how many teams, what you get — the line people scan for),
// and the DESC (what it's actually looking for, in the voice of the event).
// Keep the humour in desc only; a joke in meta makes the conditions look soft.
function AwardsBox({ t }: { t: Tfn }) {
  const a = dict.program.awards;
  return (
    <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/35 bg-amber-400/12 px-2.5 py-1 text-[0.68rem] font-bold text-amber-100">
          <span aria-hidden>★</span>{t(a.countBadge)}
        </span>
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-amber-200/80">{t(a.tag)}</span>
      </div>
      <p className="mt-2.5 break-keep text-sm font-bold leading-snug text-white">{t(a.heading)}</p>
      <ul className="mt-3 space-y-3">
        {a.items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span
              aria-hidden
              className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-400/10 text-[0.58rem] font-black text-amber-100"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="break-keep text-xs font-bold leading-snug text-amber-50">{t(item.name)}</p>
              <p className="mt-0.5 break-keep text-[0.68rem] leading-relaxed text-amber-100/60">{t(item.meta)}</p>
              <p className="mt-1 break-keep text-xs leading-relaxed text-amber-50/85">{t(item.desc)}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3.5 break-keep border-t border-amber-300/15 pt-3 text-xs leading-relaxed text-amber-100/75">
        {t(a.note)}
      </p>
    </div>
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
  { src: "/partners/logos/white/trimmed/popup-studio.png", alt: "Popup Studio", w: 512, h: 245 },
  { src: "/partners/logos/white/trimmed/drimaes.png", alt: "Drimaes", w: 332, h: 50 },
  { src: "/partners/logos/white/trimmed/smu-lion.png", alt: "SMU KSA", w: 292, h: 173 },
  { src: "/partners/logos/white/trimmed/nus.png", alt: "NUS Korea Society", w: 512, h: 512 },
  { src: "/partners/logos/white/trimmed/ntu-ksa.png", alt: "NTU KSA", w: 318, h: 382 },
  { src: "/partners/logos/white/trimmed/aws.png", alt: "AWS", w: 512, h: 306 },
  { src: "/partners/logos/white/trimmed/innovate360.png", alt: "INNOVATE 360", w: 455, h: 54 },
  { src: "/partners/logos/white/trimmed/life.png", alt: "L^IFE", w: 900, h: 352 },
  { src: "/partners/logos/white/trimmed/bzcf.png", alt: "BZCF", w: 465, h: 156 },
  { src: "/partners/logos/white/trimmed/korean-association.png", alt: "Korean Association in Singapore", w: 443, h: 90 },
  { src: "/partners/logos/white/trimmed/onword-lab.png", alt: "Onword Lab", w: 900, h: 92 },
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
// ONE clip, server-rendered, on every screen. Two mobile variants were tried and
// reverted: a poster-only phone hero (killed the point of the hero) and a 480×360
// phone cut (visibly soft at 3× DPR). Measured on Slow 4G — the pessimistic end of
// what our visitors use — the full file lands in 4.3s vs the small cut's 2.1s and
// neither delays anything: the poster paints immediately, the clip is decorative,
// and LCP (1.67s) and CLS (0.00) are the same either way. Both variants also had to
// mount client-side to pick a source, and a <video> mounted after hydration would
// not start loading in Chrome at all (readyState stuck at 0) — which is the second
// reason this is back to the plain server-rendered element.
const HERO_VIDEO = {
  enabled: true,
  webm: "",
  mp4: "/hero/metal-human.mp4",
  poster: "/hero/metal-human-poster.jpg",
};

// 모집 국면별 히어로 모드 — "journey"=둘러보고 등록(모집 초기), "register"=곧장
// 등록(마감 임박, 8/10 전환). 되돌릴 땐 이 한 줄만.
//
// 전환 이유: 모바일 첫 화면에 등록 진입점이 아예 없었습니다. 주 CTA가 "8일의 여정
// 둘러보기"였고, 등록 버튼을 가진 스티키 바는 히어로 구간에서 숨겨집니다(그 구간의
// CTA는 히어로 자신이 맡는다는 전제였는데, 그 CTA가 등록이 아니었습니다).
// 스티키 바와 네비의 동작은 이 스위치와 무관하게 그대로입니다.
const HERO_PRIMARY: "journey" | "register" = "register";

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
// ── SIZING: equal OPTICAL MASS, with a width wall ────────────────────────────
// WHY NOT ONE FIXED HEIGHT PER TIER (2026-08-10).
//
// The previous rule drew every mark in a tier at the same box height, capped by
// the same max width. It is the obvious rule and it looks wrong, because a
// logo's apparent size is not its bounding box:
//
//   • WEIGHT. Nuldam is a fat rounded wordmark, ONWORD LAB is hairline caps. At
//     the same height Nuldam reads about twice as big.
//   • LOCKUPS. aws is letters over a smile, BRAND BOOST is two stacked lines,
//     싱가포르 한인회 is a crest plus a line of 6pt English. Only part of the box
//     is the name, so the whole thing reads small at any given box height.
//   • THE WIDTH CAP. It only bites the widest wordmarks, and when it bites it
//     drops their height off a cliff — INNOVATE 360 and ONWORD LAB were landing
//     at 11px and 10px next to 26px neighbours. That cliff was most of the
//     visible unevenness.
//
// Equal AREA was tried before this and abandoned (see the note in
// opticalHeight): with no tile to sit in, equal area let width run free and the
// long wordmarks dominated their row. That failure was real, but the diagnosis
// was half right. Area is the correct axis; a raw bounding box is the wrong
// thing to measure, because it counts a hairline mark's whitespace as ink.
//
// So each mark now carries a measured `mass` — the fraction of its trimmed box
// it actually paints, as sqrt(ink coverage × silhouette coverage). Ink alone
// would blow up outlined marks (REmited's pill, L^IFE) that paint almost
// nothing; silhouette alone would shrink the bold ones too far. The geometric
// mean behaves on all 18. `mass × aspect` is then the ink a 1px-tall render
// would lay down, and height solves for a constant target:
//
//     h = H0 · (NORM / (aspect × mass)) ^ STRIP_EXP
//
// STRIP_EXP damps it: 0.5 is exactly equal ink and swings too hard (aws would
// be 2.6× the height of ONWORD LAB), 0 is the old fixed height. 0.35 is where
// a row of these marks reads even.
// The width wall still exists, but it is now the last step rather than a cliff
// — the exponent has already pulled the wide marks most of the way down, so
// the wall trims rather than amputates.
//
// This IS per-mark sizing, which the fixed-box note warned against. The
// difference is that `mass` is measured, not tuned: run
// `python3 scripts/measure-logo-mass.py <name>` and paste the number. There is
// still no hand-picked fudge factor, and there should not be one — if a mark
// looks wrong, re-measure it or move STRIP_EXP and re-check the whole tier.
//
// `w`/`h` are the trimmed art's INK dimensions; they give both the aspect ratio
// used above and the <img> intrinsic size, so the box is reserved before the
// file lands.
type StripBox = {
  h: number;     // ≥sm  base height for a NORM-mass mark, px
  maxW: number;  // ≥sm  width wall, px
  mH: number;    // <sm  base height, px
  mMaxW: number; // <sm  width wall, px
};
type StripLogoSpec = {
  src: string; alt: string; w: number; h: number;
  // sqrt(ink × silhouette) coverage of the trimmed box — see the script above.
  mass: number;
};

// The mark that renders at exactly the tier's base height: aspect × mass ≈ 1.45,
// i.e. a ~4:1 wordmark painting ~36% of its box. That is the middle of this set,
// and it is a FIXED constant on purpose — deriving it from the current line-up
// would resize every existing logo the day a sponsor is added.
const STRIP_NORM = 1.45;
const STRIP_EXP = 0.35;

// Base heights are set so each tier's total rendered width comes out where the
// old fixed box had it (~840px for 후원 on desktop) — this evens the marks out
// without making the strip claim more of the hero, so the wrap points at every
// breakpoint are unchanged. The scale clamps are guard rails for a future mark
// far outside this set; nothing in the current line-up reaches them.
const STRIP_MIN_SCALE = 0.6;
const STRIP_MAX_SCALE = 1.45;
const LEAD_BOX: StripBox = { h: 30, maxW: 160, mH: 24, mMaxW: 128 };
// 후원 sits one step below 주최·주관 — a ~23% smaller base height, same rule.
const SPONSOR_BOX: StripBox = { h: 23, maxW: 122, mH: 18, mMaxW: 98 };

// Rendered height for one mark inside one tier box, at one breakpoint.
function stripHeight(spec: StripLogoSpec, base: number, maxW: number) {
  const aspect = spec.w / spec.h;
  const h = Math.min(
    base * STRIP_MAX_SCALE,
    Math.max(base * STRIP_MIN_SCALE, base * (STRIP_NORM / (aspect * spec.mass)) ** STRIP_EXP),
  );
  // Width wall last: a mark wide enough to still overrun it loses height until
  // it fits, which only pushes it further toward the tier's average mass.
  return Math.round(Math.min(h, maxW / aspect) * 10) / 10;
}

const confirmedPartnerTiers: { label: Phrase; box: StripBox; items: StripLogoSpec[] }[] = [
  {
    // 주최 · HOST — the AXMOS collective.
    label: dict.hero.partnersHost,
    box: LEAD_BOX,
    items: [
      { src: "/partners/logos/white/trimmed/translink.png",    alt: "Translink Investment", w: 330, h: 91,  mass: 0.421 },
      { src: "/partners/logos/white/trimmed/wilt.png",         alt: "Wilt Venture Builder", w: 309, h: 148, mass: 0.513 },
      { src: "/partners/logos/white/trimmed/codepresso.png",   alt: "Codepresso",           w: 456, h: 91,  mass: 0.280 },
      { src: "/partners/logos/white/trimmed/popup-studio.png", alt: "Popup Studio",         w: 512, h: 245, mass: 0.525 },
      { src: "/partners/logos/white/trimmed/drimaes.png",      alt: "Drimaes",              w: 332, h: 50,  mass: 0.507 },
    ],
  },
  {
    // 주관 · 운영 — the student associations actually running the event.
    label: dict.hero.partnersOrganizers,
    box: LEAD_BOX,
    items: [
      { src: "/partners/logos/white/trimmed/smu-lion.png", alt: "SMU KSA",           w: 292, h: 173, mass: 0.465 },
      { src: "/partners/logos/white/trimmed/nus.png",      alt: "NUS Korea Society", w: 512, h: 512, mass: 0.424 },
      { src: "/partners/logos/white/trimmed/ntu-ksa.png",  alt: "NTU KSA",           w: 318, h: 382, mass: 0.670 },
    ],
  },
  {
    // 후원 · SPONSORS — confirmed only; the deck lists no in-discussion sponsors.
    // AWS and Hashed lead: they are the two marks a visitor recognises without
    // being told, so they do the most work in a first-screen band. The rest keep
    // the partner section's order. (Only the hero strip is ordered this way —
    // the section itself stays grouped by what each sponsor provides.)
    label: dict.hero.partnersSponsors,
    box: SPONSOR_BOX,
    items: [
      { src: "/partners/logos/white/trimmed/aws.png",                alt: "AWS",                             w: 512, h: 306, mass: 0.491 },
      { src: "/partners/logos/white/trimmed/hashed.png",             alt: "Hashed",                          w: 355, h: 90,  mass: 0.499 },
      { src: "/partners/logos/white/trimmed/innovate360.png",        alt: "INNOVATE 360",                    w: 455, h: 54,  mass: 0.378 },
      { src: "/partners/logos/white/trimmed/life.png",               alt: "L^IFE",                           w: 900, h: 352, mass: 0.466 },
      { src: "/partners/logos/white/trimmed/bzcf.png",               alt: "BZCF",                            w: 465, h: 156, mass: 0.553 },
      { src: "/partners/logos/white/trimmed/korean-association.png", alt: "Korean Association in Singapore",  w: 443, h: 90,  mass: 0.441 },
      { src: "/partners/logos/white/trimmed/onword-lab.png",         alt: "Onword Lab",                      w: 900, h: 92,  mass: 0.563 },
      { src: "/partners/logos/white/trimmed/remited.png",            alt: "REmited",                         w: 512, h: 105, mass: 0.500 },
      { src: "/partners/logos/white/trimmed/brandboost.png",         alt: "Brand Boost",                     w: 205, h: 81,  mass: 0.454 },
      { src: "/partners/logos/white/trimmed/nuldam.png",             alt: "Nuldam",                          w: 631, h: 136, mass: 0.518 },
    ],
  },
];

// Sort any sponsor list into the hero strip's order. The strip is the single
// source of truth for sponsor sequence (AWS and Hashed lead it — the two marks
// a visitor recognises without being told); anything the strip doesn't list
// keeps its relative position at the end rather than being dropped.
function sortLikeHeroStrip<T extends { src: string }>(rows: T[]): T[] {
  const order = confirmedPartnerTiers
    .find((tier) => tier.label === dict.hero.partnersSponsors)!
    .items.map((i) => i.src);
  const rank = (src: string) => {
    const i = order.indexOf(src);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...rows].sort((a, b) => rank(a.src) - rank(b.src));
}

// One logo, drawn at the height that gives it the same optical mass as the rest
// of its tier (see stripHeight above).
function StripLogo({ src, alt, w, h, mass, box }: StripLogoSpec & { box: StripBox }) {
  // One <img>, two heights. A CSS variable per breakpoint is what lets the phone
  // size be genuinely its own instead of a scaled-down desktop one, without
  // a second element in the DOM (these are 18 above-fold images — duplicating
  // them for a media query is not a trade worth making).
  const spec = { src, alt, w, h, mass };
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      // INK dimensions, for the aspect ratio only — CSS below owns the size.
      // Present so the browser reserves the right box before the file lands.
      width={w}
      height={h}
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
      // This mark's own height, phone value and ≥sm value; `width: auto` then
      // follows the aspect ratio, so flex-wrap still packs the row naturally.
      style={{
        "--sl-h": `${stripHeight(spec, box.mH, box.mMaxW)}px`,
        "--sl-w": `${box.mMaxW}px`,
        "--sl-h-sm": `${stripHeight(spec, box.h, box.maxW)}px`,
        "--sl-w-sm": `${box.maxW}px`,
      } as React.CSSProperties}
      // max-w restates the wall stripHeight() already applied, so it never bites
      // — it is a backstop for a mark whose `mass` was never measured (a wrong
      // mass makes one logo the wrong size; a missing wall would let it run
      // across the row).
      //
      // Opacity raised 50 → 80. At 50 the marks were only legible once the page
      // had scrolled far enough for the strip to sit over the hero scrim's dark
      // end — brightness was an accident of scroll position, not a design, so
      // they looked muddy exactly where they matter most (at rest, first view).
      // The scrim added behind the strip is what makes 80 safe on the bright
      // part of the video; the drop-shadow still carries the thin wordmarks.
      className="h-[var(--sl-h)] w-auto max-w-[var(--sl-w)] shrink-0 object-contain opacity-80 grayscale drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] transition duration-300 group-hover:opacity-100 sm:h-[var(--sl-h-sm)] sm:max-w-[var(--sl-w-sm)]"
    />
  );
}

// The small 주최 / 주관 / 후원 caption that leads each tier.
function StripTierLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 whitespace-nowrap text-[0.55rem] font-bold uppercase tracking-[0.16em] text-violet-200/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
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
  // ONE STATIC LAYOUT AT EVERY WIDTH (2026-08-03).
  //
  // Mobile used to render this as a single-line auto-scroll marquee, on the
  // reasoning that 18 marks can't fit a phone width. They can — they just have to
  // wrap. And the marquee cost the thing the strip exists for: a logo wall earns
  // trust by being SEEN AT ONCE. Three marks sliding past one at a time is a
  // ticker; it reads as decoration, and a visitor who looks away has no idea
  // whether they saw two sponsors or twenty. Sequential exposure is a weak trust
  // signal no matter how many logos are in the queue.
  //
  // So the tier stack below is no longer `hidden sm:flex` — it renders at every
  // width, from the same data, through the same StripLogo and the same tier
  // boxes. Mobile is not a separate layout: it is the same optical-mass rule
  // with the phone half of each StripBox (mH / mMaxW) and tighter gaps, so the
  // 주최·주관 > 후원 hierarchy and the within-tier evenness both survive the
  // smaller scale.
  //
  // Side effects, both good: no animation means nothing to exempt from
  // prefers-reduced-motion (the old marquee deliberately ignored it, because a
  // frozen ticker hides half its content), and the duplicated marquee track is
  // gone so the above-fold image count drops back to one copy.
  return (
    // Non-clickable: kept the `group` wrapper so the hover highlight still plays,
    // but it's a div (not a link) so the strip no longer jumps to #builders.
    // `relative` + the scrim below. The hero's own legibility scrim fades to
    // TRANSPARENT at its bottom edge, which is exactly where this strip sits —
    // so the brightest part of the video was showing through the marks at full
    // strength, and they only sharpened once scrolling carried them up into the
    // dark end of that gradient. This gives the strip its own constant backdrop
    // so legibility no longer depends on scroll position or on which frame of
    // the video happens to be playing. The background scene itself is untouched.
    <div className="group relative mt-4 block w-full rounded-2xl py-1.5 sm:mt-5">
      <div
        aria-hidden
        // No rounding and a long falloff that runs PAST the container on every
        // side: with a tight radius this read as a dark card floating over the
        // video — fine behind the tall three-tier desktop stack, obviously a box
        // behind the single-line mobile marquee. Bleeding the gradient outside
        // the element and fading to transparent well before its edge keeps it a
        // shadow rather than a panel.
        // -inset-x-6 on mobile, not -inset-x-10. The hero rail pads the strip in
        // by px-6 (24px), so a 40px horizontal bleed put this layer 16px past the
        // viewport on each side — that was one of the two sources of the 18px
        // horizontal document overflow (see the overflow changelog). At -6 the
        // glow reaches exactly the screen edge and no further. The gradient is
        // already ~0 alpha out there, so nothing visible changed; from sm up the
        // rail pads by 40px and the original bleed still fits.
        className="pointer-events-none absolute -inset-x-6 -inset-y-6 -z-10 sm:-inset-x-10"
        style={{
          background:
            "radial-gradient(75% 130% at 50% 50%, rgba(6,4,15,0.7) 0%, rgba(6,4,15,0.5) 42%, rgba(6,4,15,0.22) 68%, transparent 88%)",
        }}
      />
      <p className="text-center text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)] transition group-hover:text-white/90">
        {t(dict.hero.partnersLabel)}
      </p>
      {/* ≥sm — one row per tier, caption centred above its own marks. The tiers
          used to run inline (caption, then marks, then the next caption) which
          read as one long undifferentiated line: the whole point of the tiering
          is that 주최 / 주관 / 후원 are answers to different questions, and a
          vertical stack is what makes them read that way. */}
      {/* Gaps are deliberately tight: stacking three tiers and enlarging the
          marks already added ~160px to a hero that overflows a laptop viewport,
          so every row here is spaced to the minimum that still separates them. */}
      {/* Gaps are deliberately tight on mobile: three tiers of wrapped marks in a
          hero that is already stacked will run long otherwise. gap-x-3 + the
          phone box widths (mMaxW) is what lands ~3–4 marks per row at 375px. */}
      <div className="mt-2.5 flex flex-col items-center gap-2">
        {confirmedPartnerTiers.map((tier) => (
          <div key={tier.label.en} className="flex flex-col items-center gap-1">
            <StripTierLabel>{t(tier.label)}</StripTierLabel>
            {/* flex-wrap with one gap for the whole tier. Every mark is capped
                at the same width wall, so no single logo can claim a row to
                itself the way the widest wordmarks used to (DRIMAES had a line
                of its own under bounding-box area sizing). */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:gap-x-6">
              {tier.items.map((p) => (
                <StripLogo key={p.alt} {...p} box={tier.box} />
              ))}
            </div>
          </div>
        ))}
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
  const [atEnd, setAtEnd] = useState(false);
  // Shared with the header and the FAB (lib/useScrollDirection).
  const chromeHidden = useScrollDirection();

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

  // The closing section carries its own register CTA. Two identical buttons, one
  // fixed over the other, is the kind of duplication a visitor reads as a bug —
  // so this bar stands down while that section is on screen. Same observer the
  // phone-width bar already used; this one never had it.
  useEffect(() => {
    const end = document.getElementById("closing") ?? document.querySelector("footer");
    if (!end) return;
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { rootMargin: "0px 0px -20% 0px" });
    io.observe(end);
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && !atEnd && !chromeHidden && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 24 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          // z-40 keeps it under the ScrollToTop button (z-50), which is offset
          // ~5.25rem UP on this breakpoint (a vertical band above the bar), so
          // the bar can use the full screen width — no right-side reservation.
          // pt-2 / pb 0.5rem + safe area: the bar lost ~10px of padding without
          // touching the buttons inside it, which stay at 44px+.
          // `hidden sm:block lg:hidden` — TABLET ONLY. This was `lg:hidden` alone,
          // which meant that below sm it rendered on top of MobileStickyBar (also
          // `sm:hidden`): two fixed bars at bottom-0, two register buttons, and
          // after this change two open-chat buttons as well. The phone rail is the
          // pill bar; this one starts where that one stops.
          className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-white/10 bg-[#06040f]/90 px-4 pt-2 backdrop-blur sm:block lg:hidden"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
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
            {/* No longer icon-only: a bare speech bubble asks the visitor to guess
                which service it opens, and open chat is the funnel's low-friction
                entrance — the thing a hesitant reader looks for BY NAME. The label
                comes from dict.nav.openChat, the same string the desktop nav
                button uses, so the two are recognisably one door. aria-label stays
                for the fuller "카카오톡 오픈채팅방 열기". Promoted to the violet
                fill once registered, matching the nav's role swap. */}
            {links.openChat && (
              <a
                href={links.openChat}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(dict.nav.openChatAria)}
                onClick={() => track("openchat_click", { src: "mobile-bar" })}
                className={
                  registered
                    ? "inline-flex h-12 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,92,255,0.4)] transition active:scale-95"
                    : "inline-flex h-12 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-violet-400/45 bg-violet-500/15 px-4 text-sm font-semibold text-violet-100 shadow-[0_0_18px_rgba(124,92,255,0.28)] transition active:scale-95"
                }
              >
                <ChatGlyph className="h-5 w-5 shrink-0" />
                {t(dict.nav.openChat)}
              </a>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION BACKGROUND TINT — two steps, one token, nothing in between.
//
// INVENTORY (before this was unified), section-level tints only:
//   #program     bg-[#0a0814]/45 + h-24 top/bottom fades
//   #companions  bg-[#0a0814]/55 + h-20 top/bottom fades
//   everything else (Chapter: about · join · benefits · speakers · mentoring ·
//                    builders · faq · vision)  — no tint at all
// Two bands, two opacities, two fade heights. Scrolling from a /45 band into an
// untinted chapter and later into a /55 one produced three different background
// levels, and the eye reads the third as an error rather than a rhythm.
//
// Now: BASE (no tint, WebGL field as-is) or BAND (this one value). 45 and 55
// both collapse into 50 — the midpoint, so neither section moves much — and
// every band gets the SAME fade height, so no band can announce its edge.
// Any new section picks one of the two; a third opacity is the bug.
// The band tint FADES ITSELF at both ends instead of being a flat fill with two
// dark gradients laid over its edges.
//
// The old shape was `bg-[#0a0814]/50` on the whole section plus a `/50`
// top-to-transparent gradient at each edge. That does the opposite of blending:
// at the very edge you get tint AND fade (0.5 over 0.5 ≈ 0.75 alpha), and one
// pixel outside the section you get 0. The edge was the DARKEST part of the band
// and the discontinuity was maximal — which is why the seam was still visible
// entering the speakers chapter, and why simply making the fade taller only made
// the dark strip taller without touching the step.
//
// A single vertical gradient has no step at all: transparent at the boundary,
// full tint 10rem in, held flat through the body, back to transparent. Both band
// sections (#program, #companions) share it, so no edge can drift from another.
const BAND_TINT =
  "bg-[linear-gradient(to_bottom,transparent,rgba(10,8,20,0.5)_10rem,rgba(10,8,20,0.5)_calc(100%_-_10rem),transparent)]";
/**
 * Kept as a no-op so every band section keeps one obvious place to opt into edge
 * treatment, and so the two call sites don't have to change shape. The fading now
 * lives in BAND_TINT itself — see the note there for why overlay gradients could
 * not soften an edge they were painted on top of.
 */
function BandFades() {
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW STRIP — a row of boxes joined by arrows (참여 플로우, 최종 아웃풋).
//
// The arrows used to live INSIDE each box's own flex row: [box →][box →][box].
// Horizontally that looks right, but stacked on a phone it puts the arrow beside
// the box instead of between boxes — and because the arrow takes width, the two
// boxes that carry one end up narrower than the third. Boxes in a column that
// don't share a width read as a rendering bug, which is what this was.
//
// So the children are FLAT: [box, arrow, box, arrow, box]. In a column every box
// is full width and each arrow is its own centred row; in a row from `sm` the
// same elements line up horizontally with the arrows between them, exactly as
// before. One glyph, rotated 90° on phones — a second glyph conditionally
// rendered would be two things to keep in step for no gain.
// ─────────────────────────────────────────────────────────────────────────────
function FlowStrip<T>({
  items,
  render,
  align = "stretch",
  className = "",
}: {
  items: readonly T[];
  render: (item: T, i: number) => React.ReactNode;
  // "stretch" = boxes in a row match the tallest (the output cards carry two
  // lines of copy); "center" = single-line pills that shouldn't grow.
  align?: "stretch" | "center";
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row ${align === "center" ? "sm:items-center" : "sm:items-stretch"} ${className}`}>
      {items.map((item, i) => (
        <Fragment key={i}>
          <div className="w-full sm:flex-1">{render(item, i)}</div>
          {i < items.length - 1 && (
            <span aria-hidden className="shrink-0 self-center rotate-90 leading-none text-white/30 sm:rotate-0">
              →
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

// Fixed bottom-right "back to top" button. Hidden near the top of the page and
// fades in once the visitor has scrolled down ~1.5 viewports. Respects
// prefers-reduced-motion (jumps instantly instead of smooth-scrolling).
function ScrollToTop() {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  // Rides the same scroll signal as the bars. Two reasons: on a phone this button
  // sits directly above the register rail, so a rail that slides away leaving the
  // FAB floating mid-air reads as a stray dot; and hiding it is what guarantees
  // the two can never overlap, whatever the bar's height ends up being.
  const chromeHidden = useScrollDirection();

  useEffect(() => {
    // Same reason as the register rail: don't read a locked page's fake 0.
    const onScroll = () => {
      if (isScrollLocked()) return;
      setVisible(window.scrollY > window.innerHeight * 1.5);
    };
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
          aria-label={t(dict.a11y.scrollTop)}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          // Below lg the register rail owns the bottom edge, so this sits above it
          // (rail height + safe area). The rail got shorter, but the offset stays
          // generous on purpose: it also has to clear the phone-width pill bar,
          // whose height differs, and the FAB now disappears with the rail anyway
          // so an over-generous gap is never seen as dead space.
          // From lg up there's no rail, so it returns to the normal corner.
          // The hide-on-scroll-down is a MOBILE behaviour (max-lg): from lg up there
          // is no bottom rail for this button to keep company with, and a corner
          // control that vanishes while you scroll would be a regression there.
          // Opacity + pointer-events rather than unmounting, so the desktop render
          // path is byte-identical to what it was.
          // The BUTTON is the hit area, the SPAN is the artwork. On a phone the
          // visible disc drops to 32px — this is a utility, and at 48px solid
          // violet it was reading as loudly as the 등록하기 pill and sitting on top
          // of body copy (the 참가 대상 disclaimer, the benefits paragraph, the
          // footer). The tap target stays 44px via the transparent button around
          // it, so the size cut costs nothing in reachability.
          // From lg up nothing changes: 48px, filled violet, same shadow.
          // `!opacity-0`, not `opacity-0`. framer-motion writes `opacity: 1` as an
          // INLINE style from the `animate` prop, and inline beats any class — so
          // the hide-on-scroll-down never actually hid this button. It only went
          // pointer-events:none, which is invisible to the user: the FAB sat on
          // top of the body copy the whole way down the page and merely stopped
          // responding to taps. `!important` is the one thing that outranks an
          // inline style, and it is why this is the only `!` in the file.
          className={`${chromeHidden ? "max-lg:pointer-events-none max-lg:!opacity-0" : ""} group fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] right-6 z-50 flex h-11 w-11 items-center justify-center transition-opacity duration-200 sm:right-8 lg:bottom-8 lg:h-12 lg:w-12`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] text-white/65 backdrop-blur-sm transition group-hover:-translate-y-0.5 group-hover:border-white/35 group-hover:text-white lg:h-12 lg:w-12 lg:border-violet-400/40 lg:bg-violet-600/85 lg:text-violet-100 lg:shadow-[0_6px_24px_rgba(124,58,237,0.3)] lg:group-hover:border-violet-400/60 lg:group-hover:bg-violet-500 lg:group-hover:text-white">
            {/* upward chevron */}
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Journey() {
  const { t } = useLocale();
  const { openRegister, registered, registerOpen } = useRegister();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<BEvent | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null); // day detail modal
  const [activePartner, setActivePartner] = useState<PartnerInfo | null>(null); // sponsor/mentor intro modal
  // ── Mentoring: who belongs where ──────────────────────────────────────────
  // The click-to-filter state that used to live here (activeStage / hoverStage /
  // mentorHoverStage) is gone with the three stage cards: the mentors are now
  // physically grouped into the box they belong to, so there is nothing left to
  // filter. What remains is the one derivation the layout needs — the mentors
  // who belong to NEITHER box, i.e. the Day 1·2 session leads, who ride in the
  // warm-up strip. Computed rather than listed so it follows the data.
  const warmupMentors = dict.mentoring.mentors.filter((m) => m.stages.length === 0);
  // Remember the card that opened the modal so focus returns to it on close
  // (document.activeElement is unreliable in Safari — see EventModal).
  const triggerRef = useRef<HTMLElement | null>(null);
  const partnerTriggerRef = useRef<HTMLElement | null>(null);
  // Open the company-intro modal for a logo tile. `name` is the tile's `alt`;
  // copy comes from partnerIntros, falling back to the "coming soon" blurb.
  // A `stage` argument used to sit between them, and every caller passed the
  // same 확정 — see the note on partners.stageConfirmed in dictionary.ts.
  const openPartner = (name: string, el?: HTMLElement | null, url?: string) => {
    partnerTriggerRef.current = el ?? null;
    setActivePartner({ name, desc: partnerIntros[name] ?? partnerIntroTBC, url, articles: partnerArticles[name] });
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
        // Scroll ticker disabled on all screen sizes (commented out). Restore by
        // re-adding this footer prop:
        // footer={
        //   <motion.div
        //     style={{ opacity: heroFade }}
        //     className="pointer-events-none hidden flex-col items-center gap-2 text-[0.7rem] tracking-[0.3em] text-white/60 lg:flex"
        //   >
        //     {t(dict.hero.scroll).toUpperCase()}
        //     <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/50 to-transparent" />
        //   </motion.div>
        // }
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
            {/* break-keep — without it Korean breaks between syllables and the
                paragraph ended "…남깁니" / "다." with a single orphaned syllable
                on its own line. Wrapping still happens, but only at word
                boundaries. */}
            <p className="mx-auto mt-6 max-w-xl break-keep text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-base lg:mx-0">
              {t(dict.hero.blurb)}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
              {/* ── 주 CTA ────────────────────────────────────────────────
                  HERO_PRIMARY가 무엇이 이 자리에 서는지를 정합니다(파일 상단).
                  두 모드가 같은 시각 위계(보라 그라디언트 필 하나)를 쓰고, 바뀌는
                  것은 그 자리에 오는 행동뿐입니다. */}
              {HERO_PRIMARY === "register" ? (
                <button
                  type="button"
                  onClick={() => {
                    track("register_click", { src: "hero" });
                    openRegister();
                  }}
                  // 네비·푸터와 같은 관례: 이미 등록한 방문자에게 이 버튼은 행동이
                  // 아니라 상태입니다. 라벨이 바뀌고 화살표는 빠집니다(갈 곳이
                  // 없으니까). 클릭은 그대로 열립니다 — 등록 정보를 다시 보려는
                  // 사람에게 문을 잠글 이유가 없습니다.
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_50px_rgba(124,58,237,0.7)] sm:px-8 sm:py-4 sm:text-base"
                >
                  {t(registered ? dict.register.navRegistered : dict.nav.register)}
                  {!registered && (
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  )}
                </button>
              ) : (
                <a href={links.program} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_50px_rgba(124,58,237,0.7)] sm:px-8 sm:py-4 sm:text-base">
                  {t(dict.hero.ctaProgram)}
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
              )}
              {/* 보조: 여정 둘러보기. register 모드에서만 이 자리에 있습니다 —
                  journey 모드에서는 위의 주 CTA가 같은 링크라 두 번 걸릴 이유가
                  없습니다. 고스트 필이라 주 CTA와 경쟁하지 않습니다. */}
              {HERO_PRIMARY === "register" && (
                <a
                  href={links.program}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10 sm:px-8 sm:py-4 sm:text-base"
                >
                  {t(dict.hero.ctaProgram)}
                </a>
              )}
              {/* 파트너십 문의 — journey 모드 전용입니다.
                  This used to mirror a "파트너십 문의" button in the nav, hidden at
                  md+ to avoid duplicating it. That nav button is gone (the slot
                  went to open chat — see JourneyNav), so nothing is duplicated
                  any more and the md:hidden gate is now the only reason a
                  desktop visitor doesn't see a partnership CTA above the fold.
                  Kept as-is deliberately: the nav's audience was moved to
                  students on purpose, and the footer carries a full partnership
                  pill for companies. Drop `md:hidden` if that ever needs undoing.
                  register 모드에서는 히어로에서 빠집니다: 학생 등록 마감 국면에
                  첫 화면의 버튼 자리는 등록·여정·오픈채팅 셋이면 충분하고, 넷째가
                  붙으면 375px에서 두 줄로 접히며 주 CTA의 무게가 흩어집니다.
                  기업용 문의 창구가 사라지는 것은 아닙니다 — 클로징 섹션과 푸터가
                  같은 링크를 그대로 갖고 있습니다. */}
              {HERO_PRIMARY === "journey" && (
                <a href={links.partnership} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10 sm:px-8 sm:py-4 sm:text-base md:hidden">
                  {t(dict.hero.ctaPartner)}
                </a>
              )}
              {/* OPEN CHAT — phones and tablets only (`lg:hidden`). From lg up the
                  nav carries a permanent open-chat button in the same viewport, so
                  a second one here would be the same offer twice (that is why
                  HookCards passes `chatSrc={null}` in the hero). Below lg that nav
                  button does not exist, and the hero — the screen most visitors
                  never scroll past — had no low-commitment door at all.
                  Ghost pill, one tier under the violet 여정 둘러보기 CTA: it is the
                  alternative for someone not ready to act, not a competing primary. */}
              {links.openChat && (
                <a
                  href={links.openChat}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(dict.nav.openChatAria)}
                  onClick={() => track("openchat_click", { src: "hero" })}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-100 transition hover:border-violet-400/55 hover:bg-violet-500/15 lg:hidden"
                >
                  <ChatGlyph className="h-4 w-4 shrink-0" />
                  {t(dict.nav.openChat)}
                </a>
              )}
            </div>

            {/* The mobile hook cards USED to sit here, directly under the CTAs.
                They now render after the partner strip below, so the first swipe
                answers "who is behind this" before it asks for a signup. Nothing
                moved on desktop: that copy is `lg:hidden` and lg+ uses the
                right-column instance, which is untouched. */}
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
          {/* Mobile only — moved here from directly under the hero CTAs so the
              logo wall comes FIRST. On a phone the hero is a vertical stack and
              whatever sits highest is what the first swipe reveals; putting the
              signup hooks above the confirmed partners asked for commitment
              before showing any reason to give it. On lg+ this copy is hidden and
              the right column's instance renders instead — desktop composition is
              unchanged. */}
          <HookCards
            t={t}
            ownResultId={ownResultId}
            openRegister={openRegister}
            className="mx-auto mt-6 max-w-xl lg:hidden"
            chatSrc={null}
          />
        </div>
      </Chapter>

      {/* ── Countdown ↔ Problem Statement · MOBILE-ONLY standalone section ──
          On desktop the panel lives in the hero's right column (above); on
          mobile it gets its own section between the hero and About so it's
          readable and not buried in a tall stacked hero. */}
      {/* pb-4 rather than py-12: this section is `lg:hidden`, so it is a mobile
          block by definition and its bottom padding stacked on top of the About
          chapter's own py-14 — 104px of nothing between the countdown and the
          first line of copy. Top padding is untouched; the gap under the hero is
          doing real work. Desktop never renders this. */}
      <section id="launch" className="w-full px-6 pb-4 pt-12 lg:hidden">
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
              <div key={s.num.en} className="text-center">
                <div className="text-3xl font-black text-white sm:text-4xl">{t(s.num)}</div>
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
            <p className="text-center text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/55">
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
                {/* 로고는 선택입니다 (dict의 PressItem 참고). 흰색 트림 자산이 없는
                    매체는 제호를 텍스트로 냅니다 — 이미지와 같은 높이·불투명도라 한
                    줄 안에서 같은 무게로 읽히고, 색이 남은 로고를 어두운 배경에
                    얹는 것보다 낫습니다. */}
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt={t(p.outlet)} className="h-4 w-auto max-w-[5.5rem] shrink-0 object-contain opacity-70" />
                ) : (
                  <span className="shrink-0 text-sm font-semibold tracking-tight text-white/70">{t(p.outlet)}</span>
                )}
                <span className="text-sm font-semibold text-white/90">{t(p.title)}</span>
                <span className="text-xs text-white/55">{t(p.date)}</span>
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
          {/* The one hard condition, inside the same box as the invitation —
              anyone reading "누구나" needs it in the same glance, not two
              chapters later in the programme section. Day 1 and Day 8 are the
              only `mandatory: true` days in data/schedule.ts; if that ever
              changes, this line changes with it. */}
          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-relaxed text-white/60">
            {t(dict.whoWhat.requirement)}
          </p>
          {/* 준비물 — 조건 바로 다음, 같은 박스 안. 이 페이지에서 유일하게 돈이
              드는 항목이라 등록을 결정하는 그 자리에 있어야 하고, 조건과 같은
              시선 안에 들어와야 "참가비 무료"와 나란히 정직하게 읽힙니다.
              같은 타이포·같은 구분선을 쓰되 mt만 좁혀 한 덩어리로 붙입니다. */}
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {t(dict.whoWhat.prep)}
          </p>
        </Glass>
        <p className="mt-5 text-center text-xs text-white/65">{t(dict.whoWhat.disclaimer)}</p>
      </Chapter>

      {/* ── CH 2.5 · WHY JOIN (benefits) + INCENTIVES ──────────────── */}
      <Chapter id="benefits" align="center">
        <Eyebrow color="cyan">{t(dict.benefits.tag)}</Eyebrow>
        <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
          {t(dict.benefits.heading)}
        </h2>
        {/* ── Q1 spine ──────────────────────────────────────────────────────
            The one thing these eight days leave you, stated before the six cards
            rather than assembled from them. It sits between the heading and the
            intro on purpose: the intro's job is now to say the cards BELOW are
            what make this reachable, which only reads correctly once "this" has
            been named. Tinted panel + three tangible chips — deliberately the
            most emphatic block in the section, because it is the section's
            answer; the cards are the footnotes to it. */}
        <div className="mx-auto mt-7 max-w-3xl rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.06] px-5 py-6 sm:px-7">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-cyan-200/90">{t(dict.benefits.spine.tag)}</p>
          <p className="mx-auto mt-2.5 max-w-2xl break-keep text-[clamp(1.05rem,2.4vw,1.45rem)] font-bold leading-snug text-white">
            {t(dict.benefits.spine.heading)}
          </p>
          {/* The artefacts, not adjectives: what a participant physically holds
              on Day 9. The certificates' conditions stay off these chips — card
              05 and the FAQ carry them, and a looser second wording here would
              quietly lower the bar. Same reason the chip doesn't count them:
              "수료증 2종" would put the number here without the criteria that
              earn it. */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {dict.benefits.spine.tangibles.map((x, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3 py-1 text-xs font-semibold text-cyan-50/90">
                <span aria-hidden className="text-cyan-300/80">✓</span>
                {t(x)}
              </span>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/75">{t(dict.benefits.intro)}</p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {dict.benefits.items.map((it) => (
            <BenefitCard key={it.num} item={it} t={t} />
          ))}
        </div>

        {/* Participation flow */}
        <div className="mt-12 text-left">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">{t(dict.benefits.flowTitle)}</p>
          <FlowStrip
            className="mt-4"
            align="center"
            items={dict.benefits.flow}
            render={(f) => (
              <div className="flex w-full items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-center text-sm font-semibold text-white">{t(f)}</div>
            )}
          />
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
            withQuestion
          />
        </div>
      </Chapter>

      {/* ── CH 3 · PROGRAM ─────────────────────────────────────────── */}
      {/* Full-width translucent program band — a dark violet tint that dims the
          WebGL field for legibility while still letting the background dots show
          through. Top & bottom fade out so it blends into the journey. */}
      <section id="program" className={`relative w-full ${BAND_TINT} py-14 sm:py-20 lg:py-28`}>
        <BandFades />
        <div className="relative mx-auto w-full max-w-[1700px] px-6 sm:px-10">
          <div className="text-center">
            <Eyebrow>{t(dict.program.tag)}</Eyebrow>
            <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
              {t(dict.program.heading)}
            </h2>
            {/* Three numbers before anything else: the first question this section
                gets is "how much of my August does this take", and it used to be
                answerable only by reading the amber box four blocks down. */}
            <ProgramStats t={t} />
            {/* No day-by-day summary paragraph here — the eight cards below ARE
                the arc, and spelling it out in prose first read as clutter. */}
            {/* ── 최종 아웃풋 ────────────────────────────────────────────────
                What a team actually hands in, stated before the eight day-cards
                so they read as steps toward it rather than a calendar. Same
                visual grammar as the benefits flow strip (bordered violet boxes
                joined by →) on purpose: this is the second three-step strip on
                the page and inventing a new one for it would read as a different
                kind of thing. Numbered pills carry ①②③ for the arrows' benefit
                on mobile, where the row becomes a stack and the → sits to the
                right of each box. Boxes stretch to equal height per row. */}
            <div className="mx-auto mt-8 max-w-5xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-300">{t(dict.program.outputTag)}</p>
              <h3 className="mx-auto mt-2 max-w-3xl text-[clamp(1.05rem,2.4vw,1.5rem)] font-bold leading-snug text-white">
                {t(dict.program.outputHeading)}
              </h3>
              <FlowStrip
                className="mt-5 text-left"
                items={dict.program.outputSteps}
                render={(st, i) => (
                  <div className="flex h-full w-full flex-col rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet-400/35 bg-violet-400/10 text-[0.62rem] font-black text-violet-200">
                        {i + 1}
                      </span>
                      <p className="text-sm font-bold leading-snug text-white">{t(st.title)}</p>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">{t(st.body)}</p>
                  </div>
                )}
              />
              <p className="mx-auto mt-3 max-w-3xl text-xs leading-relaxed text-white/55">{t(dict.program.outputNote)}</p>
            </div>
            {/* Two separate notes, in this order on purpose. First: how much of
                this is settled — read before the cards, it stops eight tidy day
                boxes being taken for a finished timetable. Second: how little of
                it you actually have to attend. */}
            {/* Cross-link: the quiz already recommends sessions by type, and
                nothing on the home page said so. Ghost chip — a step under the
                section's own content, two under any register CTA. */}
            <a
              href="/quiz"
              onClick={() => track("quiz_click", { src: "program_chip" })}
              className="group mx-auto mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/[0.08] px-4 py-2.5 text-xs font-semibold text-violet-100/90 transition hover:border-violet-300/45 hover:bg-violet-500/15 hover:text-white"
            >
              <span aria-hidden>✦</span>
              <span className="break-keep">{t(dict.programQuizChip)}</span>
            </a>
            <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-white/50">
              {t(dict.program.pendingNote)}
            </p>
            {/* A labelled list, not a paragraph: this box answers "which days do
                I actually have to show up for", and that is a lookup, not a read.
                Two grid columns rather than inline labels — `auto` sizes the label
                column to the longest label in whichever language is showing, so
                the three answers line up under each other and can be compared in
                one downward glance. Left-aligned inside a centred section for the
                same reason. */}
            <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4 text-left">
              <p className="text-xs font-bold leading-relaxed text-amber-100">
                {t(dict.program.modeNote.lead)}
              </p>
              <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                {dict.program.modeNote.rows.map((row) => (
                  <Fragment key={row.id}>
                    <dt
                      className={`text-xs font-bold leading-relaxed ${
                        row.id === "required" ? "text-amber-200" : "text-amber-100/55"
                      }`}
                    >
                      {t(row.label)}
                    </dt>
                    <dd className="min-w-0 break-keep text-xs leading-relaxed text-amber-100/85">
                      {t(row.body)}
                    </dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          </div>

          {/* The route, immediately above the grid it describes: the eight cards
              are read through it rather than as eight equal obligations. */}
          <RouteMap t={t} onOpen={setActiveDay} />

          {/* Two Labs, four clean day cards each. Tapping a card opens the day
              detail modal (that day's sessions) instead of exploding all ~18
              sessions inline — the 8-day arc stays scannable. */}
          <div className="mt-12 space-y-8">
            {/* Prologue row — before Lab 1, outside the eight days. */}
            <PreEventBand t={t} onOpen={selectEvent} />
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

          {/* ── 체크인 3종 ───────────────────────────────────────────────
              Placed AFTER the eight cards, not before: "a form lands on Day 4
              evening" only means something once Day 4 has gone past the reader's
              eye. Same FlowStrip grammar as the output steps — three boxes joined
              by → — because this is also a sequence, and the arrows carry the
              "questions move from thinking to evidence" claim without a sentence.
              Roles only; the question lists themselves stay in the forms. */}
          <div className="mx-auto mt-12 max-w-5xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-300">{t(dict.program.checkins.tag)}</p>
            <h3 className="mx-auto mt-2 max-w-3xl text-[clamp(1.05rem,2.4vw,1.5rem)] font-bold leading-snug text-white">
              {t(dict.program.checkins.heading)}
            </h3>
            <p className="mx-auto mt-3 max-w-3xl break-keep text-xs leading-relaxed text-white/60">
              {t(dict.program.checkins.intro)}
            </p>
            <FlowStrip
              className="mt-5 text-left"
              items={dict.program.checkins.forms}
              render={(f) => (
                <div className="flex h-full w-full flex-col rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-violet-400/25 bg-violet-500/12 px-2 py-0.5 text-[0.62rem] font-bold text-violet-200">
                      {t(f.when)}
                    </span>
                    <span className="text-[0.62rem] font-semibold text-white/45">{t(f.duration)}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold leading-snug text-white">{t(f.title)}</p>
                  <p className="mt-1.5 break-keep text-xs leading-relaxed text-white/70">{t(f.body)}</p>
                </div>
              )}
            />
            {/* Emerald, not violet: this is the one line here that is an upside
                rather than an instruction, and it should not read as a fourth box. */}
            <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-left">
              <p className="break-keep text-xs leading-relaxed text-emerald-50/85">
                <span className="font-bold text-emerald-200">{t(dict.program.checkins.bonusLabel)}</span>
                {": "}
                {t(dict.program.checkins.bonus)}
              </p>
            </div>
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
        {/* 2-up then 4-up, not 3-up: there are four cards now (한장환's Day 1 AWS
            session joined the keynote), and a 3-column grid left one card orphaned
            on its own row. 4-across keeps them on one line at lg and pairs them
            evenly below that. Revisit if a fifth card ever lands here. */}
        <div className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
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
              <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-4">
                <Image src={s.img} alt={t(s.name)} width={200} height={200} className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
                <div className="min-w-0">
                  <p className="break-keep text-sm font-bold text-white">{t(s.name)}</p>
                  <p className="mt-0.5 break-keep text-xs leading-snug text-white/60">{t(s.role)}</p>
                </div>
                {s.linkedin && <LinkedInLink url={s.linkedin} label={t(s.name)} className="ml-auto" />}
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
        {/* The separation footnote leads now, directly under the intro: it answers
            a worry ("does this affect my score?") that belongs before the names,
            not after them. */}
        <p className="mx-auto mt-4 max-w-3xl break-keep text-xs leading-relaxed text-white/50">{t(dict.mentoring.separationNote)}</p>

        {/* ── Mentors, grouped by what they help you DO ──────────────────────
            This replaced three stage cards sitting above one undivided grid of
            thirteen names, plus a click-to-filter interaction that connected the
            two. The interaction worked, but it was a mechanism a visitor had to
            discover for something the layout can simply be: put the people who
            help you BUILD in one box and the people who help you SELL in
            another, and the mapping needs no affordance at all.

            Which box a card lands in comes from `mentors[].stages` joined against
            each group's own `stages` — no counts, no name lists here. Add or drop
            a mentor in data/dictionary.ts and the boxes rearrange themselves. */}
        <div className="mt-8 text-left">
          {/* Plain section label, not the emerald pill it used to be. The pill's
              green was carrying the word 확정; with that word gone (see
              mentoring.gridLabel) a status colour with no status left to report
              read as a badge whose meaning had been cut out. This matches the
              partner wall's tier labels. */}
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            {t(dict.mentoring.gridLabel)}
          </p>

          {/* Warm-up strip — Day 1·2. A single line, not a box: these two run
              SESSIONS (the AWS talk, the crash course) rather than 1:1 mentoring,
              and a third box their size would claim otherwise. Rendered only if
              somebody actually has no stage, so it disappears on its own if that
              stops being true. */}
          {warmupMentors.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center">
              {/* Centred like the partner panel below it: this strip spans the full
                  width and two names pinned left left the row looking unfinished. */}
              <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/60">
                  {t(dict.mentoring.warmup.label)}
                </span>
                <span className="break-keep text-xs text-white/45">{t(dict.mentoring.warmup.note)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
                {warmupMentors.map((m, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 break-keep text-xs text-white/75">
                    <span className="font-bold text-white">{t(m.name)}</span>
                    <span className="text-white/50">{t(m.org)}</span>
                    {/* 사람 옆에 날짜가 남아 있는 유일한 자리입니다. 이 두 분은
                        1:1 멘토가 아니라 무대 세션의 연사(Day 1 AWS · Day 2
                        크래시코스)라, 날짜가 배정 예고가 아니라 세션 공지입니다.
                        아래 멘토 카드에는 같은 이유로 칩이 없습니다. */}
                    {m.days && (
                      <span className="rounded-full border border-white/12 bg-white/[0.04] px-1.5 py-0.5 text-[0.6rem] font-semibold text-white/55">{m.days}</span>
                    )}
                    {/* 확정 원칙이지만 날짜가 아직 안 잠긴 세션. 지금은 해당자가
                        없습니다 — 새 세션 연사가 들어올 때를 위한 자리입니다. */}
                    {m.daysPending && (
                      <span className="rounded-full border border-dashed border-amber-400/30 bg-amber-400/[0.06] px-1.5 py-0.5 text-[0.6rem] font-semibold text-amber-200/90">
                        {m.daysPending} · {t(dict.mentoring.dayPendingLabel)}
                      </span>
                    )}
                    {m.linkedin && <LinkedInLink url={m.linkedin} label={t(m.name)} />}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* The two boxes. Stacked, not side by side: each holds a full mentor
              grid, and two grids in parallel columns would halve the card width
              for no gain. */}
          <div className="mt-4 space-y-4">
            {dict.mentoring.groups.map((g) => {
              const mentors = dict.mentoring.mentors.filter((m) => m.stages.some((n) => g.stages.includes(n)));
              return (
                <div key={g.id} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4 sm:p-5">
                  {/* Header: what this group is for, then who partners on it. */}
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-200">
                      {t(g.dayRange)}
                    </span>
                    <p className="break-keep text-[15px] font-bold text-white">{t(g.title)}</p>
                    <p className="break-keep text-xs text-emerald-100/70">{t(g.theme)}</p>
                  </div>
                  {/* No max-width. The partner panel and the mentor grid below
                      both span the full box, so a capped paragraph stopped
                      two-thirds of the way across and read as a ragged column
                      floating inside a wider card. These blurbs are three
                      sentences now, so the cap was visible on every line. */}
                  <p className="mt-2 break-keep text-xs leading-relaxed text-white/70">{t(g.sub)}</p>

                  {/* Partner logos. The label above them is not decoration: most of
                      the cards below belong to other companies (REmited · YMX ·
                      T3Q · NTU), and two marks over a list of faces would read as
                      an org chart without it. White trimmed silhouettes — the same
                      assets the hero strip and partner wall use, so no tile is
                      needed on this dark panel. Marks only: each used to carry a
                      day-span chip ("Day 3·4 아이디에이션" / "Day 5–7 FDE 오피스아워"),
                      which repeated what the box heading and the programme already
                      say and turned a two-logo credit into a third schedule. */}
                  {g.partners.length > 0 && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                      {/* Centred, not left-aligned. This panel spans the full box,
                          so two marks pinned to the left edge left a wide empty
                          field to their right and read as an unfinished row rather
                          than a pair. Centring makes the pair the subject. */}
                      <p className="text-center text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/50">
                        {t(g.partnersLabel)}
                      </p>
                      {/* gap-x-14: the separation IS the grouping here — two marks
                          any closer read as one lockup. Each sits in a common
                          fixed-height band because the logos are deliberately
                          DIFFERENT heights (optical sizing — see logoClass in
                          dictionary.ts); the band centres them on one line while
                          the marks keep their own sizes. */}
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
                        {g.partners.map((pt) => (
                          <span key={pt.name} className="flex h-12 items-center sm:h-14">
                            <Image
                              src={pt.logo}
                              alt={pt.name}
                              width={pt.logoW}
                              height={pt.logoH}
                              className={`w-auto max-w-[10rem] shrink-0 object-contain opacity-90 ${pt.logoClass}`}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Who these people are here as. It sits BETWEEN the partner
                      logos and the faces because that adjacency is exactly what
                      would otherwise mislead: two company marks directly above a
                      grid of cards that each print a company name reads as "these
                      are their people", and none of them are. Quiet styling on
                      purpose — it's a qualifier on the grid, not a third heading
                      competing with the box title. */}
                  {g.personalNote && (
                    <div className="mt-4 border-l-2 border-emerald-400/25 pl-3">
                      <p className="break-keep text-xs font-bold text-emerald-100/80">{t(g.personalNote.title)}</p>
                      <p className="mt-1 break-keep text-xs leading-relaxed text-white/55">{t(g.personalNote.body)}</p>
                    </div>
                  )}

                  {/* MOBILE: a swipe row. DESKTOP: the same flex-wrap grid as
                      before — widths mirror the old grid columns (gap-3 = 0.75rem)
                      and the last line stays centred.
                      Twelve mentor cards stacked one per screen was the single
                      largest block on the mobile page; as a snap row they cost one
                      screen instead of twelve. The peek of the next card (75vw +
                      gap) is the whole affordance — no dots, because a dot row is
                      more chrome than the thing it explains.
                      The negative margin + padding lets cards scroll to the screen
                      edge while the first one still lines up with the section. */}
                  <div
                    role="region"
                    aria-label={t(g.theme)}
                    className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-x-visible sm:px-0 sm:pb-0"
                  >
                    {mentors.map((m, i) => {
                      const name = t(m.name);
                      const role = t(m.role);
                      const intro = t(m.intro);
                      return (
                        <div key={i} className="flex w-[75vw] shrink-0 snap-start flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-400/25 hover:bg-white/[0.05] sm:w-[calc((100%-0.75rem)/2)] sm:shrink lg:w-[calc((100%-1.5rem)/3)]">
                          <div className="flex items-start justify-between gap-2">
                            {/* break-keep — Korean breaks between syllables by
                                default, which shreds a 3-syllable name into a
                                vertical column. */}
                            <p className="min-w-0 break-keep text-sm font-bold leading-snug text-white">{name}</p>
                            {m.linkedin && <LinkedInLink url={m.linkedin} label={name} />}
                          </div>
                          <p className="mt-0.5 break-keep text-xs leading-snug text-white/60">
                            {t(m.org)}{role ? ` · ${role}` : ""}
                          </p>
                          {/* One line from the person's own LinkedIn. Clamped from
                              `sm` up only: on a phone the cards are one per row and
                              nothing needs evening out, and the clamp was eating a
                              line off the longer intros. */}
                          {intro && (
                            <p className="mt-2 break-keep text-xs leading-relaxed text-white/50 sm:line-clamp-3">{intro}</p>
                          )}
                          {/* ⛔ NO DAY CHIP (DECIDED 2026-08-09). 이 자리에는
                              "Day 3·4" / "Day 7" 칩이 있었습니다. 멘토링이 Day 3–7
                              닷새 매일 예약제로 돌아가면서, 누가 언제 들어오는지는
                              예약 시스템이 멘토링 전날 공개하는 정보가 됐습니다 —
                              사이트가 미리 약속하는 정보가 아닙니다. 칩을 두면
                              참가자가 특정 멘토를 좇거나 피해서 날짜를 고르게 되고,
                              그건 배정 방식(가능 시간 겹침) 자체를 무너뜨립니다.
                              구간은 박스 헤더의 dayRange 칩 하나가 말합니다.
                              사람 카드에 날짜를 다시 붙이지 마세요. 무대 세션
                              연사(Day 1 AWS · Day 2 크래시코스)만 예외이고, 그건
                              위 워밍업 스트립에서 렌더됩니다. */}
                        </div>
                      );
                    })}
                    {/* A dashed "FDE 오피스아워 · 멘토 명단 공개 예정" card used to close
                        this row (desktop) with a full-width twin below it
                        (mobile) — it stood in for Popup Studio, who send FDEs on
                        rotation rather than an assigned mentor. Both are gone with
                        the `placeholder` field (2026-08-05): the office hours are
                        still described in the box blurb above and scheduled in the
                        programme, so what the card contributed was an empty slot
                        among cards that are otherwise all people. */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── How matching works ────────────────────────────────────────────
            Moved BELOW the grid. It used to sit above it, on the reasoning that
            a reader should know the line-up isn't a menu before reading names.
            Two things changed that: the stage cards now filter this grid, so
            they have to sit next to what they filter — anything wedged between
            them breaks the connection — and "can I pick one?" is a question the
            cards provoke, not one a reader arrives with. Answering it directly
            under the faces is answering it where it is asked. */}
        <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5 text-left sm:p-6">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-200">
            <span aria-hidden className="text-emerald-300/70">◇</span>
            {t(dict.mentoring.matchNote.title)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">
            <Emph text={t(dict.mentoring.matchNote.body)} className="font-bold text-white" />
          </p>
        </div>

        {/* ── Judges subsection (deck p13) · no new nav item ────────────────
            Judge cards, all with face photos. LinkedIn icon only where a
            confirmed URL exists. A judge who is agreed but not locked keeps a
            normal card and adds an amber "협의 중" pill (dict.judges.people[].pending). */}
        <div className="mt-16 border-t border-white/10 pt-12 text-left">
          <div className="text-center">
            <Eyebrow color="violet">{t(dict.judges.tag)}</Eyebrow>
            <h3 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
              {t(dict.judges.heading)}
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75">{t(dict.judges.sub)}</p>
          </div>
          {/* Same flex-wrap + justify-center treatment as the mentor grid above:
              ten judges over three columns left the tenth stranded on its own
              line. Card widths reproduce the grid columns — gap-4 = 1rem, so two
              columns are (100% − 1rem)/2 and three are (100% − 2rem)/3 — and the
              count is never hardcoded, so the last line keeps centring itself as
              judges are added or removed. */}
          {/* Swipe row on mobile, unchanged wrap grid from sm up — same treatment
              and the same reasoning as the mentor rows above. Ten judges is ten
              screens of scrolling otherwise. */}
          <div
            role="region"
            aria-label={t(dict.judges.heading)}
            className="-mx-4 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-x-visible sm:px-0 sm:pb-0"
          >
            {dict.judges.people.map((j, i) => {
              const name = t(j.name);
              return (
                <div key={i} className="flex w-[75vw] shrink-0 snap-start flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/25 hover:bg-white/[0.05] sm:w-[calc((100%-1rem)/2)] sm:shrink lg:w-[calc((100%-2rem)/3)]">
                  <div className="flex items-center gap-3">
                    {/* Face photo when on hand, else initial avatar. */}
                    {j.img ? (
                      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-violet-400/20">
                        <Image src={j.img} alt={name} width={400} height={400} className="h-full w-full object-cover" />
                      </span>
                    ) : (
                      <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-base font-black text-violet-200">
                        {name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        {/* break-keep — see the mentor grid above. */}
                        <p className="min-w-0 break-keep text-sm font-bold leading-snug text-white">{name}</p>
                        {j.linkedin && <LinkedInLink url={j.linkedin} label={name} />}
                      </div>
                      <p className="mt-0.5 break-keep text-xs leading-snug text-white/60">{t(j.org)} · {t(j.role)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex w-fit items-center rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-violet-200/90">
                      {t(j.tag)}
                    </span>
                    {/* Agreed in principle, not locked — same amber dashed pill the
                        mentor grid uses for a pending day, so the two read alike. */}
                    {j.pending && (
                      <span className="inline-flex items-center rounded-full border border-dashed border-amber-400/30 bg-amber-400/[0.06] px-2 py-0.5 text-[0.62rem] font-semibold text-amber-200/90">
                        {t(dict.judges.pendingLabel)}
                      </span>
                    )}
                  </div>
                  {/* Every bio occupies EXACTLY three lines. min-h reserves the third
                      line for the short ones (박희덕·신동혁 ran to two, so their cards
                      sat visibly shorter than 한정필's three and the row looked
                      ragged); line-clamp-3 is the guard on the other side. 4.875em =
                      3 × leading-relaxed (1.625) — in `em`, so it tracks the 13px
                      font size rather than the 18px root and cannot drift if either
                      changes. Same rule the mentor grid above already uses.
                      A bio long enough to CLAMP would lose its tail silently, so
                      keep them within three lines in BOTH languages — English wraps
                      differently and is the tighter constraint. */}
                  {/* The clamp + reserved third line are a DESKTOP device: they keep a row of
                      cards even. On a phone the cards are one per row, nothing needs
                      evening out, and the clamp was silently eating 1–2 lines off 8 of
                      10 bios in English (9 of 10 at 360px). Both rules start at `sm`. */}
                  <p className="mt-3 text-[13px] leading-relaxed text-white/70 sm:line-clamp-3 sm:min-h-[4.875em]">{t(j.bio)}</p>
                </div>
              );
            })}
            {/* The two "추후 공개" placeholder cards that used to close this grid are
                gone: the panel is full at ten judges, so an empty dashed slot read
                as a gap rather than as news. dict.judges.tbcLabel/tbcNote went with
                them — bring both back together if more judges are ever pending. */}
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
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-white/75">{t(dict.partners.note)}</p>

          {/* ── Tier 1 · 주최 · HOST (the AXMOS consortium) ──────────────────
              AXMOS is NOT a sixth company — it's the AX consortium the five host
              companies formed. So the five marks are wrapped in one umbrella
              CARD whose header carries the AXMOS wordmark + one-liner; the header
              is a button that opens the same partner-intro modal as the tiles.
              The header→body containment reads "AXMOS ⊃ these five" at a glance.
              The AXMOS mark is a WHITE silhouette of the brand wordmark (the source
              gradient's darker "AX" half was near-invisible on this panel), matching
              the white member logos below — recoloured from CI/AXMOS.png via its
              alpha channel, trimmed + downscaled. Filename carries "-white" so a
              browser can't serve the earlier colour version from cache. */}
          <div className="mt-9 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{t(dict.partners.hostLabel)}</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.02]">
              {/* Umbrella header — click opens the AXMOS intro modal. */}
              <button
                type="button"
                onClick={(e) => openPartner("AXMOS", e.currentTarget)}
                // No aria-label: it was "AXMOS" while the button's visible text is the
                // consortium tagline, so the accessible name didn't contain the label
                // (WCAG 2.5.3). Without it the name comes from the wordmark's alt plus
                // that tagline — which is both the visible text and more useful.
                className="group flex w-full flex-col items-start gap-1.5 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-left transition hover:bg-white/[0.07] sm:flex-row sm:items-center sm:gap-4"
              >
                <Image
                  src="/partners/logos/axmos-wordmark-white.png"
                  alt="AXMOS"
                  width={750}
                  height={200}
                  unoptimized
                  loading="eager"
                  className="h-7 w-auto shrink-0"
                />
                <span className="text-xs leading-relaxed text-white/60">{t(dict.partners.axmosTagline)}</span>
                <span aria-hidden className="ml-auto hidden shrink-0 text-white/30 transition group-hover:text-white/70 sm:inline">↗</span>
              </button>
              {/* The five member companies inside the umbrella. */}
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { src: "/partners/logos/white/trimmed/translink.png",    alt: "Translink Investment", w: 330, h: 91,  url: "https://translinkinvestment.com" as string | undefined },
                  { src: "/partners/logos/white/trimmed/wilt.png",         alt: "Wilt Venture Builder", w: 309, h: 148, url: "https://www.wiltvb.com/" as string | undefined },
                  { src: "/partners/logos/white/trimmed/codepresso.png",   alt: "Codepresso",           w: 456, h: 91,  url: "https://codepresso.io" },
                  { src: "/partners/logos/white/trimmed/popup-studio.png", alt: "Popup Studio",         w: 512, h: 245, url: "https://popupstudio.ai" },
                  { src: "/partners/logos/white/trimmed/drimaes.png",      alt: "Drimaes",              w: 332, h: 50,  url: "https://www.drimaes.com" },
                ].map(({ url, ...l }) => (
                  <LogoTile
                    key={l.alt}
                    {...l}
                    onOpen={(el) => openPartner(l.alt, el, url)}
                  />
                ))}
              </div>
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
                // area 2000 → 1450 (SMU만, 2026-08-10). 높이로는 34px → 29px,
                // 약 15% 작아집니다. 이 세 칸에서만 두는 예외이고, 이유는 잉크
                // 밀도입니다: SMU 라이온은 통짜 실루엣이라 상자 넓이가 거의 전부
                // 잉크로 바뀌는 반면, 옆의 NUS·NTU는 선으로 그린 인장이라 같은
                // 넓이에서 실제로 칠해지는 면적이 절반쯤입니다. 그래서 규칙대로
                // 같은 area를 주면 라이온만 한 치수 커 보였습니다. 상자 넓이는
                // 같은데 체감 크기가 다른 것이므로, 맞춰야 하는 쪽은 상자가 아니라
                // 눈입니다 — Brand Boost가 스택 락업이라 area를 올린 것과 같은
                // 종류의 보정이고, 방향만 반대입니다.
                // 다른 실루엣 마크에 기계적으로 복사하지 마세요. 이 값은 "인장
                // 두 개 옆에 선 실루엣 하나"라는 이 그리드의 조합에서 나온 값입니다.
                { src: "/partners/logos/white/trimmed/smu-lion.png", alt: "SMU KSA",           w: 292, h: 173, area: 1450, badge: t(dict.partners.roleLead) },
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

            {/* A green "확정 (CONFIRMED)" pill sat here between the label and the
                grid. Removed 2026-08-10 — every sponsor below is confirmed, so
                see the note on dict.partners.sponsorConfirmedLabel. The grid
                keeps the pill's own top margin so the block below the 후원 label
                sits exactly where it did. */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {/* ORDER FOLLOWS THE HERO STRIP — sorted below against
                  `confirmedPartnerTiers`, not hand-ordered here, so the two
                  lists cannot drift apart again. Seeing AWS·Hashed lead the
                  hero and Hashed last down here read as two different rosters.
                  Each logo keeps its own role caption, so the captions are no
                  longer grouped (장소·장소·장소 …) — that grouping was the only
                  thing the old order bought, and matching the hero is worth
                  more than it. */}
              {/* `url` adds the "사이트 방문 ↗" button to the intro modal, exactly as
                  it does for the five host companies above. Every one of these was
                  opened and read before being wired, not inferred from the name —
                  several plausible-looking guesses were wrong:
                  · L^IFE has its OWN domain (life-singapore.com); it is NOT a path
                    under innovate360.sg, even though Innovate 360 runs the space.
                  · REmited's product is 영끌 / REmited AI but the company site is
                    teamremited.com — remited.ai does not resolve (only its blog
                    subdomain does), so it would have shipped as a dead link.
                  · BZCF is bzcf.io (a link hub for the YouTube channel), not a
                    .co.kr; 브랜드부스트 is brandboost.kr, whose own blog describes the
                    구성·공정·단가 → 패킹 flow this tile's caption is about.
                  · 싱가포르 한인회 is singapore.korean.net. korchamsg.org looks right
                    but is KorCham, the chamber of commerce — a different body. */}
              {sortLikeHeroStrip([
                { cat: t(dict.partners.catVenue),     src: "/partners/logos/white/trimmed/aws.png",                alt: "AWS",                             w: 512, h: 306, url: "https://aws.amazon.com/" as string | undefined },
                { cat: t(dict.partners.catVenue),     src: "/partners/logos/white/trimmed/innovate360.png",        alt: "INNOVATE 360",                    w: 455, h: 54,  url: "https://innovate360.sg/" },
                { cat: t(dict.partners.catVenue),     src: "/partners/logos/white/trimmed/life.png",               alt: "L^IFE",                           w: 900, h: 352, url: "https://life-singapore.com/" },
                { cat: t(dict.partners.catMarketing), src: "/partners/logos/white/trimmed/bzcf.png",               alt: "BZCF",                            w: 465, h: 156, url: "https://bzcf.io/" },
                // 한인회's role is the venue plus goodie bags for the mentors — it
                // read 심사위원 지원 until the organizers corrected it, and no judge
                // reaches us through the association. Its intro modal copy
                // (dict["Korean Association in Singapore"]) says the same thing.
                { cat: t(dict.partners.catVenueGoods), src: "/partners/logos/white/trimmed/korean-association.png", alt: "Korean Association in Singapore",  w: 443, h: 90,  url: "https://singapore.korean.net/" },
                // 널담 replaced Fyreflyz here on 2026-08-07. Both rosters (this
                // one and the hero strip) must be edited together — they used to
                // disagree by one mark, which is how Fyreflyz ended up in the
                // strip and missing here for a while.
                //
                // url is nuldam.com, the brand site. NOT the Daniel Food Diary
                // review — that is a source for the *SCAPE outlet, not a partner's
                // own page, and every other tile here links to the company itself.
                { cat: t(dict.partners.catAwards),    src: "/partners/logos/white/trimmed/nuldam.png",             alt: "Nuldam",                          w: 631, h: 136, url: "https://nuldam.com/" },
                { cat: t(dict.partners.catMentoring), src: "/partners/logos/white/trimmed/onword-lab.png",             alt: "Onword Lab",                      w: 900, h: 92,  url: "https://www.onwordlab.com/" },
                { cat: t(dict.partners.catMentoring), src: "/partners/logos/white/trimmed/remited.png",            alt: "REmited",                         w: 512, h: 105, url: "https://teamremited.com/" },
                // area 4000 (default 2000) — BRAND over BOOST is two stacked
                // lines, so the default box drew each line at ~13px next to
                // single-line neighbours running 22–24px, and the mark read as
                // the smallest thing in the grid at nominally the second-tallest
                // box. Doubling the area takes it to ~40×101px, which puts its
                // per-line ink and its width in the same range as the marks that
                // reach the tile's width wall (Nuldam, REmited, 한인회). See the
                // `area` note on LogoTile before adding a second one of these.
                { cat: t(dict.partners.catGoods),     src: "/partners/logos/white/trimmed/brandboost.png",         alt: "Brand Boost",                     w: 205, h: 81,  area: 4000, url: "https://www.brandboost.kr/" },
                { cat: t(dict.partners.catOverall),   src: "/partners/logos/white/trimmed/hashed.png",             alt: "Hashed",                          w: 355, h: 90,  url: "https://www.hashed.com/" },
              ]).map(({ cat, url, ...l }) => (
                <div key={l.alt} className="flex flex-col gap-1.5">
                  <LogoTile {...l} onOpen={(el) => openPartner(l.alt, el, url)} />
                  <span className="text-center text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/55">{cat}</span>
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
      <section id="companions" className={`relative w-full ${BAND_TINT} py-12 sm:py-16 lg:py-20`}>
        <BandFades />
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
        {/* A second CTA band (register + quiz hook cards) used to close this
            chapter. Removed: it was byte-for-byte the band already sitting at the
            end of 혜택 (CH 2), and with the 혜택 band now carrying the mini-quiz
            the repeat read as the page looping rather than as a fresh ask. The
            nav 등록하기 button and the footer CTA are both still one tap away. */}
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
                      {t(dict.about.visionStartBadge)}
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
          <p className="text-sm font-bold tracking-widest text-white">ZERO100 AI BUILDERTHON</p>
          <p className="mt-2 text-xs text-white/65">{t(dict.footer.hostedBy)}</p>
          <p className="mt-4 text-xs text-white/55">© 2026 {t(dict.footer.rights)}</p>
        </div>
      </section>

      <DayModal dayNum={activeDay} onClose={() => setActiveDay(null)} onSelectEvent={selectEvent} eventOpen={active != null} t={t} />
      <EventModal event={active} onClose={() => setActive(null)} triggerRef={triggerRef} />
      <PartnerModal partner={activePartner} onClose={() => setActivePartner(null)} triggerRef={partnerTriggerRef} />
      <MobileStickyBar t={t} openRegister={openRegister} registerOpen={registerOpen} />
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
                  {/* Most answers are a single paragraph and stay one. An item may
                      opt into structure (aGroups / aTail) when its answer contains
                      lists someone LOOKS UP rather than reads — the judging answer
                      does, and as prose it read as a wall. `a` becomes the lead in
                      that case; the shape is otherwise unchanged. */}
                  <div className="pb-5 pr-8">
                    <p className="text-sm leading-relaxed text-white/70">{t(item.a)}</p>
                    {/* items-start, not stretch: groups rarely hold the same
                        number of rows, and a box padded out with dead space to
                        match its neighbour reads as a missing item. Two columns
                        only when there are two boxes to fill them — a lone group
                        in a half-width column looks like its pair failed to load. */}
                    {"aGroups" in item && item.aGroups && (
                      <div className={`mt-4 grid items-start gap-4 ${item.aGroups.length > 1 ? "sm:grid-cols-2" : ""}`}>
                        {item.aGroups.map((g, gi) => (
                          <div key={gi} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
                            <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-violet-200/90">
                              {t(g.label)}
                            </p>
                            <ul className="mt-2.5 space-y-1.5">
                              {g.items.map((x, xi) => (
                                <li key={xi} className="flex gap-2 text-[0.8rem] leading-relaxed text-white/70">
                                  <span aria-hidden className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-violet-300/60" />
                                  <span className="break-keep">{t(x)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Withheld detail → the open chat. Amber, and the only
                        coloured thing in an answer: it is an offer, and it has to
                        out-rank the grey tail line under it or the reader stops
                        at "criteria not published" and never sees where they are.
                        Sits ABOVE the tail for the same reason. */}
                    {"aOpenChat" in item && item.aOpenChat && links.openChat && (
                      <a
                        href={links.openChat}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("openchat_click", { src: "faq_judging" })}
                        className="group mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 transition hover:border-amber-300/45 hover:bg-amber-400/[0.12]"
                      >
                        <ChatGlyph className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                        <span className="break-keep text-xs leading-relaxed text-amber-50/90">
                          {t(item.aOpenChat)}
                          <span aria-hidden className="ml-1.5 text-amber-200/70 transition group-hover:text-amber-100">→</span>
                        </span>
                      </a>
                    )}
                    {"aTail" in item && item.aTail && (
                      <p className="mt-4 text-xs leading-relaxed text-white/55">{t(item.aTail)}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
