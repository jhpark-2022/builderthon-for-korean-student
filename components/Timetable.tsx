"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import {
  categoryMeta,
  days,
  schedule,
  type BEvent,
  type Category,
} from "@/data/schedule";
import Reveal from "./Reveal";
import EventModal from "./EventModal";

const legendOrder: Category[] = [
  "main",
  "ambassador",
  "dinner",
  "meetup",
  "empowerment",
  "network",
  "build",
];

// Most days hold 3 events; we pad shorter columns to this count with subtle
// fillers so every column lines up to the same height (no jagged bottoms).
const SLOTS_PER_DAY = Math.max(
  ...days.map((d) => schedule.filter((e) => e.day === d.day).length)
);

export default function Timetable() {
  const { t } = useLocale();
  const [active, setActive] = useState<BEvent | null>(null);
  // The card that opened the modal, captured on click so focus can return to it
  // reliably (cross-browser) when the modal closes.
  const triggerRef = useRef<HTMLElement | null>(null);
  // Stable identity so EventModal's effect doesn't re-run (and re-capture the
  // focus opener) on every parent re-render, e.g. a locale toggle while open.
  const handleClose = useCallback(() => setActive(null), []);

  return (
    <section id="program" className="relative scroll-mt-24 bg-page py-24 sm:py-28">
      {/* Wide board container — the visual centerpiece */}
      <div className="mx-auto max-w-board px-5 sm:px-8 lg:px-12">
        {/* Title + subtitle */}
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
            {t(dict.program.tag)}
          </span>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-navy">
              {t(dict.program.heading)}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-muted lg:text-base">
              {t(dict.program.intro)}
            </p>
          </div>
        </Reveal>

        {/* Horizontal divider */}
        <Reveal delay={0.04}>
          <div className="mt-6 h-px w-full bg-line" />
        </Reveal>

        {/* swipe hint (small screens only) */}
        <p className="mt-4 text-xs font-medium text-ink-faint xl:hidden">
          {t(dict.program.swipeHint)}
        </p>

        {/* Board: 6 equal columns on xl+, horizontal scroll below */}
        <Reveal delay={0.06}>
          <div className="timetable-scroll mt-3 flex gap-5 overflow-x-auto pb-4 xl:mt-5 xl:grid xl:grid-cols-6 xl:gap-6 xl:overflow-visible xl:pb-0">
            {days.map((day) => {
              const dayEvents = schedule.filter((e) => e.day === day.day);
              const fillerCount = Math.max(0, SLOTS_PER_DAY - dayEvents.length);
              return (
                <div
                  key={day.day}
                  className="flex min-w-[256px] flex-col sm:min-w-[268px] xl:min-w-0"
                >
                  {/* Navy day header bar — fixed height */}
                  <div className="flex h-[58px] items-center rounded-t-2xl bg-gradient-to-br from-navy to-navy-deep px-4">
                    <div className="flex w-full items-baseline justify-between">
                      <h3 className="text-[15px] font-bold tracking-wide text-white">
                        {t(dict.program.dayLabel)} {day.day}
                      </h3>
                      <span className="text-xs font-medium text-white/60">
                        {day.date} · {t(day.weekday)}
                      </span>
                    </div>
                  </div>

                  {/* Theme label — fixed height, clamped */}
                  <div className="flex h-[56px] items-center rounded-b-2xl border-x border-b border-line bg-surface px-4">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-navy">
                      {t(day.theme)}
                    </p>
                  </div>

                  {/* Stacked event cards — uniform height */}
                  <div className="mt-4 flex flex-1 flex-col gap-3.5">
                    {dayEvents.map((ev) => {
                      const meta = categoryMeta[ev.category];
                      const isMain = ev.category === "main";
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            triggerRef.current = e.currentTarget;
                            setActive(ev);
                          }}
                          className="group relative flex h-[196px] w-full flex-col overflow-hidden rounded-xl border border-line bg-surface p-5 text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-ink-faint/40 hover:shadow-card-hover"
                          aria-label={`${t(ev.title)} — ${t(dict.program.tapHint)}`}
                        >
                          {/* left category accent */}
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 w-[3px]"
                            style={{ backgroundColor: meta.dot }}
                          />
                          <div className="flex items-center gap-1.5 pl-1.5">
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide"
                              style={{ color: meta.dot }}
                            >
                              {isMain && (
                                <span className="text-gold" aria-hidden>
                                  ★
                                </span>
                              )}
                              {t(meta.label)}
                            </span>
                            <span className="ml-auto flex items-center gap-1.5">
                              {ev.confirmed && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                                  <svg
                                    width="8"
                                    height="8"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                    aria-hidden
                                  >
                                    <path
                                      d="M1.5 5.2 4 7.5 8.5 2.5"
                                      stroke="currentColor"
                                      strokeWidth="1.6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {t(dict.program.confirmedBadge)}
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-ink-faint">
                                {ev.timeOfDay}
                              </span>
                            </span>
                          </div>
                          <h4 className="mt-2 line-clamp-2 pl-1.5 text-[17px] font-bold leading-snug text-navy">
                            {t(ev.title)}
                          </h4>
                          <p className="mt-1.5 line-clamp-2 pl-1.5 text-[13px] leading-relaxed text-ink-muted">
                            {t(ev.summary)}
                          </p>
                          <span className="mt-auto inline-flex items-center gap-1 pt-3 pl-1.5 text-[11px] font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 group-focus-visible:opacity-100">
                            {t(dict.program.tapHint)} →
                          </span>
                        </button>
                      );
                    })}

                    {/* Invisible spacers keep shorter columns aligned without
                        drawing a placeholder-looking box. */}
                    {Array.from({ length: fillerCount }).map((_, i) => (
                      <div
                        key={`filler-${day.day}-${i}`}
                        aria-hidden
                        className="hidden h-[196px] xl:block"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Wide legend card */}
        <Reveal delay={0.08}>
          <div className="mt-10 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
            {/* Main session highlight row */}
            <div className="flex items-start gap-3 border-b border-line pb-5">
              <span className="mt-0.5 text-lg text-gold" aria-hidden>
                ★
              </span>
              <p className="text-sm text-ink sm:text-[15px]">
                <span className="font-bold text-navy">
                  {t(categoryMeta.main.label)}
                </span>{" "}
                — {t(categoryMeta.main.blurb)}
              </p>
            </div>

            {/* Category grid */}
            <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {legendOrder
                .filter((c) => c !== "main")
                .map((cat) => {
                  const meta = categoryMeta[cat];
                  return (
                    <div key={cat} className="flex items-start gap-2.5">
                      <span
                        className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: meta.dot }}
                      />
                      <p className="text-[13px] leading-relaxed text-ink-muted">
                        <span className="font-bold text-navy">
                          {t(meta.label)}
                        </span>{" "}
                        — {t(meta.blurb)}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </Reveal>
      </div>

      <EventModal event={active} onClose={handleClose} triggerRef={triggerRef} />
    </section>
  );
}
