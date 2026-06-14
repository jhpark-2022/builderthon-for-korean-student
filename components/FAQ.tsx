"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useLocale } from "@/lib/LocaleContext";
import { dict } from "@/data/dictionary";
import Reveal from "./Reveal";

export default function FAQ() {
  const { t } = useLocale();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-20 py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 bottom-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-violet-700/8 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-3xl px-6 sm:px-10">
        <Reveal>
          <span className="mb-6 border border-violet-500/30 bg-violet-500/10 text-violet-300">
            {t(dict.faq.tag)}
          </span>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight text-white">
            {t(dict.faq.heading)}
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.02] px-2">
            {dict.faq.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="px-2">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-semibold text-white">{t(item.q)}</span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all duration-300 ${isOpen ? "rotate-45 border-violet-500 text-violet-400" : ""}`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-10 text-sm leading-relaxed text-white/50">{t(item.a)}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
