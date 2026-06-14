"use client";

import { useCallback, useRef, useState } from "react";

import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import { categoryMeta, days, schedule, type BEvent, type Category } from "@/data/schedule";
import Reveal from "./Reveal";
import EventModal from "./EventModal";

const legendOrder: Category[] = ["main","ambassador","dinner","meetup","empowerment","network","build"];
const SLOTS_PER_DAY = Math.max(...days.map((d) => schedule.filter((e) => e.day === d.day).length));

export default function Timetable() {
  const { t } = useLocale();
  const [active, setActive] = useState<BEvent | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const handleClose = useCallback(() => setActive(null), []);

  return (
    <section id="program" className="relative scroll-mt-20 py-28 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-700/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-board px-5 sm:px-8 lg:px-12">
        <Reveal>
          <span className="mb-6 border border-violet-500/30 bg-violet-500/10 text-violet-300">
            {t(dict.program.tag)}
          </span>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight text-white">
              {t(dict.program.heading)}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-white/45 lg:text-base">
              {t(dict.program.intro)}
            </p>
          </div>
        </Reveal>

        <div className="mt-3 h-px w-full bg-white/[0.06]" />
        <p className="mt-4 text-xs text-white/25 xl:hidden">{t(dict.program.swipeHint)}</p>

        <Reveal delay={0.06}>
          <div className="timetable-scroll mt-4 flex gap-4 overflow-x-auto pb-4 xl:grid xl:grid-cols-6 xl:overflow-visible xl:pb-0">
            {days.map((day) => {
              const dayEvents = schedule.filter((e) => e.day === day.day);
              const fillerCount = Math.max(0, SLOTS_PER_DAY - dayEvents.length);
              return (
                <div key={day.day} className="flex min-w-[240px] flex-col xl:min-w-0">
                  {/* Day header */}
                  <div className="flex h-14 items-center rounded-t-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/15 border border-violet-500/20 px-4">
                    <div className="flex w-full items-baseline justify-between">
                      <h3 className="text-sm font-bold text-violet-300">{t(dict.program.dayLabel)} {day.day}</h3>
                      <span className="text-xs text-white/35">{day.date}</span>
                    </div>
                  </div>
                  {/* Theme */}
                  <div className="flex h-12 items-center rounded-b-xl border-x border-b border-white/[0.06] bg-white/[0.02] px-4">
                    <p className="line-clamp-1 text-xs font-bold text-white/70">{t(day.theme)}</p>
                  </div>

                  <div className="mt-3 flex flex-1 flex-col gap-3">
                    {dayEvents.map((ev) => {
                      const meta = categoryMeta[ev.category];
                      const isMain = ev.category === "main";
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => { triggerRef.current = e.currentTarget; setActive(ev); }}
                          className="group relative flex h-[188px] w-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-500/25 hover:bg-white/[0.06]"
                          aria-label={`${t(ev.title)} — ${t(dict.program.tapHint)}`}
                        >
                          <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl" style={{ backgroundColor: meta.dot }} />
                          <div className="flex items-center gap-1.5 pl-2">
                            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: meta.dot }}>
                              {isMain && <span className="text-amber-400 mr-0.5">★</span>}
                              {t(meta.label)}
                            </span>
                            <span className="ml-auto flex items-center gap-1.5">
                              {ev.confirmed && (
                                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                                  {t(dict.program.confirmedBadge)}
                                </span>
                              )}
                              <span className="text-[11px] text-white/25">{ev.timeOfDay}</span>
                            </span>
                          </div>
                          <h4 className="mt-2 line-clamp-2 pl-2 text-[15px] font-bold leading-snug text-white">{t(ev.title)}</h4>
                          <p className="mt-1.5 line-clamp-2 pl-2 text-[12px] leading-relaxed text-white/40">{t(ev.summary)}</p>
                          <span className="mt-auto pl-2 pt-2 text-[11px] font-semibold text-violet-400 opacity-0 transition-opacity group-hover:opacity-100">
                            {t(dict.program.tapHint)} →
                          </span>
                        </button>
                      );
                    })}
                    {Array.from({ length: fillerCount }).map((_, i) => (
                      <div key={`filler-${day.day}-${i}`} aria-hidden className="hidden h-[188px] xl:block" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Legend */}
        <Reveal delay={0.08}>
          <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-start gap-3 border-b border-white/[0.06] pb-5">
              <span className="text-amber-400">★</span>
              <p className="text-sm text-white/60">
                <span className="font-bold text-white">{t(categoryMeta.main.label)}</span> — {t(categoryMeta.main.blurb)}
              </p>
            </div>
            <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {legendOrder.filter((c) => c !== "main").map((cat) => {
                const meta = categoryMeta[cat];
                return (
                  <div key={cat} className="flex items-start gap-2.5">
                    <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.dot }} />
                    <p className="text-[13px] text-white/45">
                      <span className="font-bold text-white/80">{t(meta.label)}</span> — {t(meta.blurb)}
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
