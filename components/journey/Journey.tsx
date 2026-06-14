"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
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
    <div className={`rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-9 ${className}`}>
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
    <span className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur ${map[color]}`}>
      {children}
    </span>
  );
}

type Tfn = (p: { ko: string; en: string }) => string;

// A single program event card. Shared by the desktop column grid and the mobile
// day accordion so both stay in sync. Height is only fixed on desktop (xl) to
// keep columns even; on mobile cards hug their content.
function EventCard({ ev, t, onSelect }: { ev: BEvent; t: Tfn; onSelect: (e: BEvent) => void }) {
  const meta = categoryMeta[ev.category];
  const isMain = ev.category === "main";
  return (
    <button
      type="button"
      onClick={() => onSelect(ev)}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.10] p-4 text-left backdrop-blur-md transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.16] xl:min-h-[180px]"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: meta.dot }} />
      <div className="flex flex-wrap items-center gap-1.5 pl-2">
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: meta.dot }}>
          {isMain && <span className="mr-0.5 text-amber-300">★</span>}{t(meta.label)}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {ev.confirmed && (
            <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
              {t(dict.program.confirmedBadge)}
            </span>
          )}
          <span className="text-[11px] text-white/30">{ev.timeOfDay}</span>
        </span>
      </div>
      <h4 className="mt-2 pl-2 text-[15px] font-bold leading-snug text-white">{t(ev.title)}</h4>
      <p className="mt-1.5 pl-2 text-[12px] leading-relaxed text-white/45">{t(ev.summary)}</p>
      <span className="mt-auto pl-2 pt-3 text-[11px] font-semibold text-violet-300 opacity-0 transition group-hover:opacity-100">
        {t(dict.program.tapHint)} →
      </span>
    </button>
  );
}

export default function Journey() {
  const { t } = useLocale();
  const [active, setActive] = useState<BEvent | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(1); // mobile program accordion

  return (
    <main className="relative z-10">
      {/* ── CH 0 · HERO ─────────────────────────────────────────────── */}
      <Chapter id="top" align="center">
        <div className="mt-10 sm:mt-12">
          <Eyebrow>✦ {t(dict.hero.eyebrow)}</Eyebrow>
        </div>
        <h1 className="text-[clamp(3rem,11vw,8rem)] font-black leading-[0.88] tracking-tight drop-shadow-[0_4px_40px_rgba(124,58,237,0.5)]">
          <span className="block text-white">{t(dict.hero.titleLine1)}</span>
          <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
            {t(dict.hero.titleLine2)}
          </span>
        </h1>
        <p className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/80 sm:text-base">
          <span className="font-semibold">{t(dict.hero.dates)}</span>
          <span className="h-3.5 w-px bg-white/30" />
          <span className="text-white/55">{t(dict.hero.location)}</span>
        </p>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65">
          {t(dict.hero.blurb)}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={links.program} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_50px_rgba(124,58,237,0.7)]">
            {t(dict.hero.ctaProgram)} →
          </a>
          <a href={links.partnership} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white/85 backdrop-blur transition hover:bg-white/10">
            {t(dict.hero.ctaPartner)}
          </a>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { num: "~100", label: t(dict.hero.statParticipants) },
            { num: "6",    label: t(dict.hero.statDays) },
            { num: "EN",   label: t(dict.hero.statLanguage) },
          ].map((s) => (
            <Glass key={s.num} className="!p-4 sm:!p-5">
              <div className="text-2xl font-black text-white sm:text-3xl">{s.num}</div>
              <div className="mt-1 text-xs text-white/50 sm:text-sm">{s.label}</div>
            </Glass>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-white/40">
          {t(dict.hero.scroll).toUpperCase()}
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </Chapter>

      {/* ── CH 1 · ABOUT ───────────────────────────────────────────── */}
      <Chapter id="about" align="left">
        <Eyebrow>{t(dict.about.tag)}</Eyebrow>
        <h2 className="max-w-2xl text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
          {t(dict.about.heading)}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
          {t(dict.about.intro)}
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
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
      <section id="program" className="relative w-full bg-[#0a0814]/55 py-20 backdrop-blur-[2px] sm:py-28">
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
            <p className="mt-3 text-xs text-white/35 xl:hidden">{t(dict.program.swipeHint)}</p>
          </div>

          {/* Desktop (xl+): immersive 6-column grid, one column per day. */}
          <div className="mt-10 hidden gap-4 xl:grid xl:grid-cols-6">
            {days.map((day) => {
              const evs = schedule.filter((e) => e.day === day.day);
              return (
                <div key={day.day} className="flex flex-col">
                  <div className="flex h-14 items-center rounded-t-xl border border-violet-400/25 bg-gradient-to-r from-violet-500/25 to-indigo-500/15 px-4 backdrop-blur">
                    <div className="flex w-full items-baseline justify-between">
                      <h3 className="text-sm font-bold text-violet-200">{t(dict.program.dayLabel)} {day.day}</h3>
                      <span className="text-xs text-white/40">{day.date}</span>
                    </div>
                  </div>
                  <div className="flex min-h-[3rem] items-center rounded-b-xl border-x border-b border-white/10 bg-white/[0.10] px-4 py-2 backdrop-blur-md">
                    <p className="text-xs font-bold leading-snug text-white/80">{t(day.theme)}</p>
                  </div>
                  <div className="mt-3 flex flex-1 flex-col gap-3">
                    {evs.map((ev) => (
                      <EventCard key={ev.id} ev={ev} t={t} onSelect={setActive} />
                    ))}
                  </div>
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
                <div key={day.day} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setOpenDay(open ? null : day.day)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/15 text-violet-200">
                      <span className="text-[8px] font-semibold uppercase leading-none opacity-70">{t(dict.program.dayLabel)}</span>
                      <span className="text-base font-black leading-none">{day.day}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-white">{t(day.theme)}</span>
                      <span className="mt-0.5 block text-xs text-white/40">{day.date} · {evs.length} {t(dict.program.sessions)}</span>
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
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 px-3 pb-3">
                          {evs.map((ev) => (
                            <EventCard key={ev.id} ev={ev} t={t} onSelect={setActive} />
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
                    <p className="text-[13px] text-white/50">
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
      <Chapter id="why-partner" align="center">
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
          {dict.traction.stats.map((s) => (
            <Glass key={s.num} className="!p-5 text-center">
              <div className="text-2xl font-black text-white sm:text-3xl">{s.num}</div>
              <div className="mt-1.5 text-xs leading-snug text-white/55">{t(s.label)}</div>
            </Glass>
          ))}
        </div>

        <div className="mt-4 grid gap-4 text-left md:grid-cols-2">
          <Glass>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{t(dict.traction.wantTitle)}</h3>
            <ol className="mt-4 space-y-3">
              {dict.traction.wants.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
                  <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-[11px] font-bold text-cyan-300">{i + 1}</span>
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
        <div className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/10 bg-[#0a0814]/80 p-8 backdrop-blur-xl sm:p-12">
          <Eyebrow>{t(dict.partners.tag)}</Eyebrow>
          <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
            {t(dict.partners.heading)}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">{t(dict.partners.note)}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { label: t(dict.partners.organizerLabel), img: "/komos-lion-white.png", name: "KOMOS", desc: t(dict.partners.organizerDesc), w: 690, h: 439 },
              { label: t(dict.partners.networkLabel),   img: "/partners/processed/zero100.png", name: "Zero100", desc: t(dict.partners.networkDesc), w: 225, h: 225 },
            ].map((o) => (
              <div key={o.name} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">{o.label}</span>
                <div className="mt-4 flex items-center gap-4">
                  <Image src={o.img} alt={o.name} width={o.w} height={o.h} className="h-10 w-10 rounded-lg object-contain brightness-0 invert" />
                  <div>
                    <p className="text-lg font-bold text-white">{o.name}</p>
                    <p className="text-sm text-white/50">{o.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { src: "/partners/processed/popup-studio.png", alt: "Popup Studio", w: 476, h: 134 },
              { src: "/partners/processed/codepresso.png",   alt: "Codepresso",   w: 361, h: 113 },
            ].map((b) => (
              <div key={b.alt} className="flex h-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6">
                <Image src={b.src} alt={b.alt} width={b.w} height={b.h} className="h-9 w-auto max-w-[70%] object-contain brightness-0 invert opacity-70" />
              </div>
            ))}
          </div>

          <a href="https://www.alchemy.com/" target="_blank" rel="noreferrer"
            className="group mt-6 flex h-20 items-center justify-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-6 transition hover:bg-emerald-400/10 sm:w-1/2">
            <Image src="/partners/processed/alchemy.png" alt="Alchemy" width={480} height={422} className="h-8 w-auto object-contain brightness-0 invert opacity-80" />
            <span className="font-bold text-white">Alchemy</span>
            <span className="text-white/40 group-hover:text-emerald-300">↗</span>
          </a>
          <p className="mt-2 text-xs text-emerald-300/70">{t(dict.partners.confirmedSub)}</p>

          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-white/40">{t(dict.partners.partnersLabel)}</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {["Workato","OpenAI","AWS"].map((n) => (
              <div key={n} className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03]">
                <span className="font-bold text-white/45">{n}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40">{t(dict.partners.inDiscussionNote)}</p>
        </div>
      </Chapter>

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
        {/* hero CTA block — vertically centred */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_40px_rgba(124,58,237,0.4)]">
            {t(dict.footer.heading)}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65">{t(dict.footer.blurb)}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href={links.program} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-9 py-4 text-base font-bold text-white shadow-[0_8px_40px_rgba(124,58,237,0.5)] transition hover:-translate-y-0.5">
              {t(dict.footer.ctaProgram)} →
            </a>
            <a href={links.partnership} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-9 py-4 text-base font-semibold text-white/85 backdrop-blur transition hover:bg-white/10">
              {t(dict.nav.partner)}
            </a>
          </div>
        </div>

        {/* credits — pinned to the very bottom of the final screen */}
        <div className="mx-auto w-full max-w-3xl border-t border-white/10 pt-8 text-center">
          <p className="text-sm font-bold tracking-widest text-white">SMU × ZERO100 BUILDERTHON</p>
          <p className="mt-2 text-xs text-white/40">{t(dict.footer.hostedBy)}</p>
          <p className="mt-4 text-xs text-white/25">© 2026 {t(dict.footer.rights)}</p>
        </div>
      </section>

      <EventModal event={active} onClose={() => setActive(null)} />
    </main>
  );
}

// FAQ accordion (kept inside Journey for a single client component tree)
function FAQList() {
  const { t } = useLocale();
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
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-base font-semibold text-white">{t(item.q)}</span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/40 transition ${isOpen ? "rotate-45 border-violet-400 text-violet-300" : ""}`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }} className="overflow-hidden">
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-white/60">{t(item.a)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
