"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import LocaleToggle from "@/components/LocaleToggle";

const anchors = [
  { id: "about",    label: dict.nav.about },
  { id: "join",     label: dict.nav.join },
  { id: "benefits", label: dict.nav.benefits },
  { id: "program",  label: dict.nav.program },
  { id: "speakers", label: dict.nav.speakers },
  // Lands on the partner pitch (#why-partner / "For partners"); the logo wall
  // (#builders) follows immediately below it.
  { id: "why-partner", label: dict.nav.builders },
  { id: "faq",      label: dict.nav.faq },
];

export default function JourneyNav() {
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#06040f]/85" : "bg-transparent"}`}>
      <nav className="flex h-20 w-full items-center justify-between px-6 sm:px-10">
        {/* LEFT group — brand logo + anchor links, kept together on the left edge. */}
        <div className="flex items-center">
          <a href="#top" className="flex items-center gap-2.5">
            {/* Official Zero100 lockup (icon + wordmark) leads the brand; the event
                is "Zero100 Builderthon". The "Builderthon" suffix is hidden on the
                narrowest screens so the brand, EN/KR toggle and View Program CTA all
                fit, and returns from the sm breakpoint up. */}
            <Image
              src="/partners/zero100-wordmark.png"
              alt="Zero100"
              width={602}
              height={127}
              priority
              className="h-6 w-auto opacity-90 brightness-0 invert"
            />
            <span className="hidden text-lg font-black tracking-wide text-white/90 sm:inline sm:text-xl">Builderthon</span>
          </a>
          <div className="hidden items-center gap-5 lg:ml-10 lg:flex">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="relative text-sm font-medium text-white/70 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-violet-400/70 after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
              >
                {t(a.label)}
              </a>
            ))}
          </div>
        </div>
        {/* RIGHT group — EN/KR toggle, Partner, Register — pinned to the right edge. */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <LocaleToggle />
          <a href={links.partnership} className="hidden shrink-0 whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 md:inline-flex">
            {t(dict.nav.partner)}
          </a>
          {/* Primary CTA stays reachable on every screen — compact on mobile so
              the funnel never disappears below lg.
              TODO: point href at the real registration form when it exists. */}
          <a href="#" className="inline-flex shrink-0 items-center rounded-full bg-violet-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-500 sm:px-5 sm:text-sm">
            {t(dict.nav.register)}
          </a>
        </div>
      </nav>
    </header>
  );
}
