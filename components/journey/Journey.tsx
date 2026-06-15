"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links, type Phrase } from "@/data/dictionary";
import {
  categoryMeta,
  days,
  schedule,
  type BEvent,
  type Category,
} from "@/data/schedule";
import Chapter from "./Chapter";
import EventModal from "@/components/EventModal";

const legendOrder: Category[] = ["main","ambassador","dinner","meetup","empowerment","network","build"];

// glass panel wrapper
function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-9 ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children, color = "violet" }: { children: React.ReactNode; color?: "violet" | "cyan" | "emerald" }) {
  const map = {
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  } as const;
  return (
    <span className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${map[color]}`}>
      {children}
    </span>
  );
}

type Tfn = (p: Phrase) => string;

// Count-up for the partner-facing traction stats. Honest by construction:
// animates once when scrolled into view, and only ever counts to the real
// value. Fully disabled under prefers-reduced-motion (renders the final number
// immediately). Callers pass only purely-numeric stats; anything with a prefix
// like "~100" is rendered as static text and never reaches this component.
function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  // Start at 0 on both server and the first client render so hydration matches
  // regardless of the client's reduced-motion state (useReducedMotion is false
  // during SSR). The real value is applied in the effect below, post-hydration.
  const [n, setN] = useState(0);

  useEffect(() => {
    // Reduced motion: skip the animation, snap straight to the final value.
    if (reduce) {
      setN(value);
      return;
    }
    if (!inView) return;
    let raf = 0;
    let start: number | null = null;
    const duration = 900;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {/* Animated digits are decorative; expose the real final value to AT so a
          screen reader never announces a mid-animation number. */}
      <span aria-hidden="true">{n}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

// A single program event card. Shared by the desktop column grid and the mobile
// day accordion so both stay in sync. Height is only fixed on desktop (xl) to
// keep columns even; on mobile cards hug their content.
function EventCard({ ev, t, onSelect }: { ev: BEvent; t: Tfn; onSelect: (e: BEvent, el: HTMLElement) => void }) {
  const meta = categoryMeta[ev.category];
  const isMain = ev.category === "main";
  // Day 2–5 side sessions are not mandatory — joined freely via RSVP.
  const optional = ev.day >= 2 && ev.day <= 5 && !isMain;
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
          {optional ? (
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-[0.7rem] font-semibold text-white/55">
              {t(dict.program.optionalBadge)}
            </span>
          ) : (
            <span className="text-xs text-white/65">{ev.timeOfDay}</span>
          )}
        </span>
      </div>
      <h4 className="mt-2 pl-2 text-base font-bold leading-snug text-white">{t(ev.title)}</h4>
      <p className="mt-1.5 pl-2 text-sm leading-relaxed text-white/45">{t(ev.summary)}</p>
      <span className="mt-auto pl-2 pt-3 text-xs font-semibold text-violet-300/40 transition group-hover:text-violet-300">
        {t(dict.program.tapHint)} →
      </span>
    </button>
  );
}

// Builder-companion logos that scroll in an infinite marquee band. These are
// the Zero100 network partners. Source logos from zero100.org were full-res
// SVGs (~13MB total); they're downscaled to ~100px-tall transparent WebPs in
// /public/partners/zero100/ (~220KB total) since they only render ~36px tall.
// They're light-on-transparent already, so they render as-is on the dark band —
// no invert. To add one: add a WebP there and append { src, alt } here.
// Order here = order on screen.
const companions: { src?: string; alt?: string }[] = [
  { src: "/partners/zero100/01-translink-investment.webp", alt: "Translink Investment" },
  { src: "/partners/zero100/02-wilt-venture-builder.webp", alt: "Wilt Venture Builder" },
  { src: "/partners/zero100/03-popup-studio.webp", alt: "Popup Studio" },
  { src: "/partners/zero100/04-dcamp.webp", alt: "D.CAMP" },
  { src: "/partners/zero100/05-startup-alliance.webp", alt: "Startup Alliance" },
  { src: "/partners/zero100/06-KAIA.webp", alt: "KAIA" },
  { src: "/partners/zero100/07-venturesquare.webp", alt: "Venture Square" },
  { src: "/partners/zero100/08-mysc.webp", alt: "MYSC" },
  { src: "/partners/zero100/09-eventus.webp", alt: "EventUs" },
  { src: "/partners/zero100/10-82Startup.webp", alt: "82Startup" },
  { src: "/partners/zero100/11-hyeockshin.webp", alt: "혁신의숲" },
  { src: "/partners/zero100/12-mission.webp", alt: "Mission" },
  { src: "/partners/zero100/13-code.presso.webp", alt: "Codepresso" },
  { src: "/partners/zero100/14-themiilk.webp", alt: "TheMiilk" },
  { src: "/partners/zero100/15-career-day.webp", alt: "Career Day" },
  { src: "/partners/zero100/16-andar.webp", alt: "andar" },
  { src: "/partners/zero100/17-ceo-suite.webp", alt: "CEO SUITE" },
  { src: "/partners/zero100/18-yj.webp", alt: "YJ" },
  { src: "/partners/zero100/19-brand-worker-partners.webp", alt: "Brand Worker Partners" },
  { src: "/partners/zero100/20-habit-factory.webp", alt: "Habit Factory" },
  { src: "/partners/zero100/21-nuldam.webp", alt: "Nuldam" },
  { src: "/partners/zero100/22-hanyeo.webp", alt: "Hanyeo" },
  { src: "/partners/zero100/23-twigfarm.webp", alt: "Twigfarm" },
  { src: "/partners/zero100/24-kowork.webp", alt: "Kowork" },
  { src: "/partners/zero100/25-one-dgree-labs.webp", alt: "One Degree Labs" },
];

// A horizontally-scrolling wall of confirmed builder-companion logos. The track
// holds the list twice and translates -50%, so the loop is seamless; the global
// prefers-reduced-motion rule freezes it for motion-sensitive users, and it
// pauses on hover. Empty slots render a tasteful "logo coming" frame.
function CompanionMarquee({ t }: { t: Tfn }) {
  const row = [...companions, ...companions];
  return (
    <div className="relative mt-10">
      {/* edge fades so logos dissolve into the band rather than hard-cut */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0814]/55 to-transparent sm:w-28" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0814]/55 to-transparent sm:w-28" />
      <div className="group overflow-hidden">
        {/* margin (not flex gap) on each tile so the -50% loop is pixel-seamless */}
        <div className="marquee-track marquee-left group-hover:[animation-play-state:paused]">
          {row.map((c, i) => (
            <div
              key={i}
              aria-hidden={!c.src}
              className="mr-4 flex h-24 w-44 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 sm:mr-5 sm:h-28 sm:w-52"
            >
              {c.src ? (
                // plain img keeps it simple for the duplicated marquee track;
                // logos are already light-on-transparent, so no invert needed.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.src}
                  alt={c.alt ?? ""}
                  loading="lazy"
                  className="max-h-9 w-auto max-w-[82%] object-contain opacity-70 transition group-hover:opacity-100"
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
const HERO_VIDEO = {
  enabled: true,
  webm: "/hero/hero.webm",
  mp4: "/hero/hero.mp4",
  poster: "/hero/hero-poster.jpg",
};

function HeroVideo() {
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
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={HERO_VIDEO.poster}
        className="h-full w-full object-cover"
      >
        <source src={HERO_VIDEO.webm} type="video/webm" />
        <source src={HERO_VIDEO.mp4} type="video/mp4" />
      </video>
      {/* legibility scrim — darker top so the headline reads; fades to nothing
          toward the bottom so the mask hands off cleanly to the WebGL field */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0814]/85 via-[#0a0814]/68 to-transparent" />
    </div>
  );
}

export default function Journey() {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<BEvent | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(1); // mobile program accordion
  // Remember the card that opened the modal so focus returns to it on close
  // (document.activeElement is unreliable in Safari — see EventModal).
  const triggerRef = useRef<HTMLElement | null>(null);
  const selectEvent = (ev: BEvent, el?: HTMLElement | null) => {
    triggerRef.current = el ?? null;
    setActive(ev);
  };
  // Desktop grid: tallest day determines the shared row count so every column
  // gets the same number of card slots and rows line up across all six days.
  const maxEvents = Math.max(...days.map((d) => schedule.filter((e) => e.day === d.day).length));

  return (
    <main className="relative z-10">
      {/* ── CH 0 · HERO ─────────────────────────────────────────────── */}
      <Chapter id="top" align="center" background={<HeroVideo />}>
        <div className="mt-10 sm:mt-12">
          <Eyebrow>✦ {t(dict.hero.eyebrow)}</Eyebrow>
        </div>
        {/* clamp caps trimmed (8rem->7.1rem, 3rem->2.65rem) so the 18px root
            bump doesn't enlarge the hero headline — it stays ~its current size
            while the rest of the site grows. */}
        <h1 className="text-[clamp(2.65rem,11vw,7.1rem)] font-black leading-[0.88] tracking-tight drop-shadow-[0_4px_40px_rgba(124,58,237,0.5)]">
          <span className="block text-white">{t(dict.hero.titleLine1)}</span>
          {/* pb-[0.15em]: bg-clip-text only paints the gradient inside the line
              box; with the tight leading the box cut off g/p descenders, so they
              rendered transparent ("Singapore." looked clipped). The padding
              extends the paint box below the baseline. */}
          <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text pb-[0.15em] text-transparent">
            {t(dict.hero.titleLine2)}
          </span>
        </h1>
        <p className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-base">
          <span className="font-semibold">{t(dict.hero.dates)}</span>
          <span className="h-3.5 w-px bg-white/40" />
          <span className="text-white/75">{t(dict.hero.location)}</span>
        </p>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]">
          {t(dict.hero.blurb)}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={links.program} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_50px_rgba(124,58,237,0.7)]">
            {t(dict.hero.ctaProgram)}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <a href={links.partnership} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10">
            {t(dict.hero.ctaPartner)}
          </a>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { num: "~100", label: t(dict.hero.statParticipants) },
            { num: "6",    label: t(dict.hero.statDays) },
            { num: "EN",   label: t(dict.hero.statLanguage) },
          ].map((s, i) => (
            <motion.div
              key={s.num}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.12 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Glass className="!p-3 transition duration-300 hover:border-violet-400/25 hover:bg-white/[0.06] sm:!p-5">
                <div className="text-2xl font-black text-white sm:text-4xl">{s.num}</div>
                <div className="mt-1 text-xs text-white/70 sm:text-sm">{s.label}</div>
              </Glass>
            </motion.div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center gap-2 text-[0.7rem] tracking-[0.3em] text-white/40">
          {t(dict.hero.scroll).toUpperCase()}
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </Chapter>

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
          <p className="mx-auto mt-6 max-w-2xl border-t border-white/10 pt-5 text-center text-sm leading-relaxed text-white/55">
            {t(dict.about.gapNote)}
          </p>
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
              <p className="mt-2 text-sm leading-relaxed text-white/60">{t(c.body)}</p>
            </Glass>
          ))}
        </div>
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
        <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
          <Glass>
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
          <Glass>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{t(dict.whoWhat.getTitle)}</h3>
            <ul className="mt-4 space-y-3">
              {dict.whoWhat.get.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
                  <span aria-hidden className="mt-[1px] shrink-0 text-emerald-300">✦</span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </Glass>
        </div>
        <p className="mt-5 text-center text-xs text-white/40">{t(dict.whoWhat.disclaimer)}</p>
      </Chapter>

      {/* ── CH 3 · PROGRAM ─────────────────────────────────────────── */}
      {/* Full-width translucent program band — a dark violet tint that dims the
          WebGL field for legibility while still letting the background dots show
          through. Top & bottom fade out so it blends into the journey. */}
      <section id="program" className="relative w-full bg-[#0a0814]/55 py-20 sm:py-28">
        {/* soft fade at top & bottom edges */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0814]/55 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0814]/55 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1700px] px-6 sm:px-10">
          <div className="text-center">
            <Eyebrow>{t(dict.program.tag)}</Eyebrow>
            <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
              {t(dict.program.heading)}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
              {t(dict.program.intro)}
            </p>
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-3.5 text-xs leading-relaxed text-emerald-100/85">
              {t(dict.program.rsvpNote)}
            </div>
            <p className="mt-4 text-xs text-white/35 xl:hidden">{t(dict.program.swipeHint)}</p>
          </div>

          {/* Pre-program — optional vibe-coding crash course, still being
              arranged. Sits above the 6-day grid because it runs before the
              main event; framed as optional + planned (honest, not confirmed). */}
          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-violet-400/20 bg-violet-500/[0.06] p-6 text-left sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-violet-200">
              {t(dict.program.crashLabel)}
            </span>
            <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">{t(dict.program.crashHeading)}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{t(dict.program.crashBlurb)}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {dict.program.crashSteps.map((s) => (
                <div key={s.step} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-violet-300/80">{s.step}</span>
                  <p className="mt-1 text-sm font-bold text-white">{t(s.title)}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/50">{t(s.body)}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/40">{t(dict.program.crashNote)}</p>
          </div>

          {/* Desktop (xl+): one column per day, laid out on a real grid with
              subgrid rows so every card slot lines up horizontally across all
              six days — no more ragged columns when a card runs taller.
              Row 1 = the day header+theme block; rows 2…(1+maxEvents) = card
              slots. Days with fewer sessions simply leave trailing slots empty. */}
          <div
            className="mt-12 hidden gap-5 xl:grid xl:grid-cols-6"
            style={{ gridTemplateRows: `auto repeat(${maxEvents}, auto)` }}
          >
            {days.map((day) => {
              const evs = schedule.filter((e) => e.day === day.day);
              return (
                <div
                  key={day.day}
                  className="grid grid-rows-subgrid gap-3"
                  style={{ gridRow: `1 / span ${1 + maxEvents}` }}
                >
                  {/* header + theme, kept visually attached as one block */}
                  <div className="flex flex-col">
                    <div className="flex h-12 items-center rounded-t-xl border border-violet-400/15 bg-gradient-to-r from-violet-500/12 to-indigo-500/8 px-4">
                      <div className="flex w-full items-baseline justify-between">
                        <h3 className="text-sm font-bold text-violet-200/90">{t(dict.program.dayLabel)} {day.day}</h3>
                        <span className="text-xs text-white/65">{day.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-1 min-h-[2.75rem] items-center rounded-b-xl border-x border-b border-white/[0.06] bg-white/[0.03] px-4 py-2">
                      <p className="text-xs font-bold leading-snug text-white/70">{t(day.theme)}</p>
                    </div>
                  </div>
                  {evs.map((ev) => (
                    <EventCard key={ev.id} ev={ev} t={t} onSelect={selectEvent} />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Mobile / tablet (<xl): vertical accordion, one row per day, so the
              whole 6-day arc is scannable without horizontal scrolling. */}
          <div className="mt-8 space-y-3 xl:hidden">
            {days.map((day) => {
              const evs = schedule.filter((e) => e.day === day.day);
              const open = openDay === day.day;
              return (
                <div key={day.day} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setOpenDay(open ? null : day.day)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/15 text-violet-200">
                      <span className="text-[0.62rem] font-semibold uppercase leading-none opacity-70">{t(dict.program.dayLabel)}</span>
                      <span className="text-base font-black leading-none">{day.day}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-white">{t(day.theme)}</span>
                      <span className="mt-0.5 block text-xs text-white/65">{day.date} · {evs.length} {t(dict.program.sessions)}</span>
                    </span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition ${open ? "rotate-45 border-violet-400 text-violet-300" : ""}`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 px-3 pb-3">
                          {evs.map((ev) => (
                            <EventCard key={ev.id} ev={ev} t={t} onSelect={selectEvent} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <Glass className="mt-8 bg-white/[0.10] text-left">
            <div className="flex items-start gap-3 border-b border-white/10 pb-4">
              <span className="text-amber-300">★</span>
              <p className="text-sm text-white/65">
                <span className="font-bold text-white">{t(categoryMeta.main.label)}</span> — {t(categoryMeta.main.blurb)}
              </p>
            </div>
            <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {legendOrder.filter((c) => c !== "main").map((cat) => {
                const meta = categoryMeta[cat];
                return (
                  <div key={cat} className="flex items-start gap-2.5">
                    <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.dot }} />
                    <p className="text-sm text-white/50">
                      <span className="font-bold text-white/85">{t(meta.label)}</span> — {t(meta.blurb)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Glass>
        </div>
      </section>

      {/* ── CH 3.5 · TRACTION / FOR PARTNERS ───────────────────────── */}
      {/* overflow-x-clip contains the oversized w-[140%] vignette below so it
          no longer widens the page (no horizontal scroll / distorted mobile
          captures). Only the horizontal axis is clipped, so the scrim's
          vertical bleed into neighbouring sections is untouched. */}
      <Chapter id="why-partner" align="center" className="overflow-x-clip">
        {/* soft dark scrim so this sponsor-facing section stays calm + readable
            over the field (the only content section without a dark backing) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] h-[150%] w-[140%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(7,6,18,0.78) 0%, rgba(7,6,18,0.45) 42%, rgba(7,6,18,0) 75%)",
          }}
        />
        <div className="text-center">
          <Eyebrow color="cyan">{t(dict.traction.tag)}</Eyebrow>
          <h2 className="text-[clamp(1.8rem,5vw,3.25rem)] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
            {t(dict.traction.heading)}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
            {t(dict.traction.intro)}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {dict.traction.stats.map((s) => {
            // Only count up purely-numeric values; "~100" and friends stay static.
            const numeric = /^\d+$/.test(s.num);
            return (
              <Glass key={s.num} className="!p-5 text-center transition duration-300 hover:border-violet-400/25 hover:bg-white/[0.06]">
                <div className="text-2xl font-black text-white sm:text-3xl">
                  {numeric ? <CountUp value={parseInt(s.num, 10)} /> : s.num}
                </div>
                <div className="mt-1.5 text-xs leading-snug text-white/70">{t(s.label)}</div>
              </Glass>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 text-left md:grid-cols-2">
          <Glass>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{t(dict.traction.wantTitle)}</h3>
            <ol className="mt-4 space-y-3">
              {dict.traction.wants.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
                  <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-bold text-cyan-300">{i + 1}</span>
                  {t(item)}
                </li>
              ))}
            </ol>
          </Glass>
          <Glass>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">{t(dict.traction.getTitle)}</h3>
            <ul className="mt-4 space-y-3">
              {dict.traction.gets.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  {t(item)}
                </li>
              ))}
            </ul>
          </Glass>
        </div>

        <p className="mt-5 text-center text-xs text-white/40">{t(dict.traction.note)}</p>
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
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">{t(dict.partners.note)}</p>

          {/* Organizer + Founding network. Both marks are clean white-on-
              transparent (the KOMOS lion trimmed to its bounding box so it fills
              the box, and the Zero100 circle icon extracted from their white
              wordmark — no more baked-in blue chip), so both render identically
              as crisp white icons. */}
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            {[
              { label: t(dict.partners.organizerLabel), img: "/komos-lion-trim.png", name: "KOMOS",   desc: t(dict.partners.organizerDesc), w: 377, h: 195, url: undefined as string | undefined },
              { label: t(dict.partners.networkLabel),   img: "/partners/zero100-icon.png",  name: "Zero100", desc: t(dict.partners.networkDesc),   w: 600, h: 600, url: "https://www.zero100.org" },
            ].map((o) => {
              const inner = (
                <>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">{o.label}</span>
                  <div className="mt-4 flex items-center gap-4">
                    {/* fixed optical box so both marks share one height and the
                        name text lines up across the two cards regardless of the
                        lion's wide aspect vs the Zero100 circle */}
                    <span className="flex h-10 w-[72px] shrink-0 items-center justify-center">
                      <Image src={o.img} alt={o.name} width={o.w} height={o.h} className="max-h-8 w-auto max-w-full object-contain brightness-0 invert" />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-lg font-bold text-white">
                        {o.name}
                        {o.url && <span aria-hidden className="text-white/30 transition group-hover:text-white/70">↗</span>}
                      </p>
                      <p className="text-sm text-white/50">{o.desc}</p>
                    </div>
                  </div>
                </>
              );
              const cls = "group block rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition";
              return o.url ? (
                <a key={o.name} href={o.url} target="_blank" rel="noopener noreferrer" className={`${cls} hover:border-white/20 hover:bg-white/[0.06]`}>{inner}</a>
              ) : (
                <div key={o.name} className={cls}>{inner}</div>
              );
            })}
          </div>

          {/* Wordmark partner wall — every logo capped to a single 28px cap-height
              so they read at one consistent weight regardless of source aspect ratio. */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { src: "/partners/processed/popup-studio.png", alt: "Popup Studio", w: 476, h: 134, url: "https://popupstudio.ai" as string | undefined },
              { src: "/partners/processed/codepresso.png",   alt: "Codepresso",   w: 361, h: 113, url: "https://codepresso.io" },
            ].map((b) => {
              const inner = (
                <Image src={b.src} alt={b.alt} width={b.w} height={b.h} className="max-h-11 w-auto max-w-full object-contain opacity-75 brightness-0 invert transition duration-300 group-hover:opacity-100" />
              );
              const cls = "group flex h-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 transition duration-300 hover:border-white/20 hover:bg-white/[0.06]";
              return b.url ? (
                <a key={b.alt} href={b.url} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              ) : (
                <div key={b.alt} className={cls}>{inner}</div>
              );
            })}
          </div>

          <a href="https://www.alchemy.com/" target="_blank" rel="noopener noreferrer"
            className="group mt-6 flex h-20 items-center justify-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-6 transition hover:bg-emerald-400/10 sm:w-1/2">
            <Image src="/partners/processed/alchemy.png" alt="" width={480} height={422} className="h-9 w-9 shrink-0 object-contain brightness-0 invert opacity-90" />
            <span className="font-bold text-white">Alchemy</span>
            <span aria-hidden className="text-white/40 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-300">↗</span>
          </a>
          <p className="mt-2 text-xs text-emerald-300/70">{t(dict.partners.confirmedSub)}</p>

          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-white/40">{t(dict.partners.partnersLabel)}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {[
              { n: "AWS",     url: "https://aws.amazon.com" },
              { n: "OpenAI",  url: "https://openai.com" },
              { n: "Workato", url: "https://www.workato.com" },
              { n: "LG CNS",  url: "https://www.lgcns.com" },
              { n: "Lovable", url: "https://lovable.dev" },
            ].map(({ n, url }) => (
              <a
                key={n}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-16 min-w-[8.5rem] flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 transition duration-300 hover:border-violet-400/30 hover:bg-violet-400/[0.04]"
              >
                <span className="text-sm font-semibold uppercase tracking-wide text-white/40 transition group-hover:text-white/60">{n}</span>
                <span aria-hidden className="text-white/20 transition group-hover:text-violet-300/70">↗</span>
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40">{t(dict.partners.inDiscussionNote)}</p>
        </div>
      </Chapter>

      {/* ── CH 4.5 · BUILDER COMPANIONS (logo marquee) ─────────────── */}
      {/* Full-width band echoing the program band's dark tint + edge fades, so
          the scrolling logo wall reads as part of the journey rather than a
          tacked-on strip. */}
      <section id="companions" className="relative w-full bg-[#0a0814]/55 py-16 sm:py-20">
        <div aria-hidden className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0a0814]/55 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0814]/55 to-transparent" />
        <div className="relative">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
              {t(dict.partners.companionsHeading)}
            </h2>
            <p className="mx-auto mt-3 text-sm leading-relaxed text-white/55">
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
            <a href={links.program} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-9 py-4 text-base font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5">
              {t(dict.footer.ctaProgram)}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a href={links.partnership} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-9 py-4 text-base font-semibold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10">
              {t(dict.nav.partner)}
            </a>
          </div>
        </div>

        {/* credits — pinned to the very bottom of the final screen */}
        <div className="mx-auto w-full max-w-3xl border-t border-white/10 pt-8 text-center">
          <p className="text-sm font-bold tracking-widest text-white">SMU × ZERO100 BUILDERTHON</p>
          <p className="mt-2 text-xs text-white/40">{t(dict.footer.hostedBy)}</p>
          <p className="mt-4 text-xs text-white/35">© 2026 {t(dict.footer.rights)}</p>
        </div>
      </section>

      <EventModal event={active} onClose={() => setActive(null)} triggerRef={triggerRef} />
    </main>
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
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/40 transition ${isOpen ? "rotate-45 border-violet-400 text-violet-300" : ""}`}>
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
