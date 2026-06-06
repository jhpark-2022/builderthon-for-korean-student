"use client";

import Image from "next/image";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import Reveal from "./Reveal";

export default function FooterCTA() {
  const { t } = useLocale();

  return (
    <footer id="closing" className="relative scroll-mt-24 px-5 pb-12 pt-8 sm:px-8">
      {/* Navy closing band — the single dark accent panel */}
      <div className="relative mx-auto max-w-board overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-navy-deep">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[36vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#2f6df0,transparent_60%)] opacity-20 blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>

        <div className="relative px-5 py-24 text-center sm:px-8 sm:py-28">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.06] tracking-tight text-white">
              {t(dict.footer.heading)}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              {t(dict.footer.blurb)}
            </p>

            <div className="mt-10 flex justify-center">
              <a
                href={links.program}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-navy shadow-soft transition hover:bg-page sm:w-auto"
              >
                {t(dict.footer.ctaProgram)}
                <span aria-hidden>→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Footer base */}
      <div className="mx-auto mt-10 flex max-w-board flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/komos-lion-navy.png"
            alt="KOMOS"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-[0.16em] text-navy">
              SMU × ZERO100 BUILDERTHON
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {t(dict.footer.hostedBy)}
            </p>
          </div>
        </div>
        <p className="text-xs text-ink-faint">© 2026 {t(dict.footer.rights)}</p>
      </div>
    </footer>
  );
}
