"use client";


import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import Reveal from "./Reveal";

export default function FooterCTA() {
  const { t } = useLocale();

  return (
    <footer className="px-6 pb-12 pt-8 sm:px-10">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/[0.08] to-cyan-500/5 p-12 text-center sm:p-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[80px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        </div>
        <Reveal>
          <h2 className="relative mx-auto max-w-3xl text-[clamp(1.8rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-white">
            {t(dict.footer.heading)}
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg">
            {t(dict.footer.blurb)}
          </p>
          <div className="relative mt-10 flex justify-center">
            <a href={links.program}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/30 transition hover:-translate-y-0.5 hover:shadow-violet-500/50">
              {t(dict.footer.ctaProgram)} →
            </a>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold tracking-widest text-white">SMU × ZERO100 BUILDERTHON</p>
          <p className="mt-1 text-xs text-white/35">{t(dict.footer.hostedBy)}</p>
        </div>
        <p className="text-xs text-white/25">© 2026 {t(dict.footer.rights)}</p>
      </div>
    </footer>
  );
}
