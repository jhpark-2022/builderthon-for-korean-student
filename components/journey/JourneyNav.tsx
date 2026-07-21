"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import { useRegister } from "@/lib/RegisterContext";
import LocaleToggle from "@/components/LocaleToggle";

const anchors = [
  { id: "about",    label: dict.nav.about },
  { id: "join",     label: dict.nav.join },
  { id: "benefits", label: dict.nav.benefits },
  { id: "program",  label: dict.nav.program },
  { id: "speakers", label: dict.nav.speakers },
  // The "For partners" pitch chapter (#why-partner) was removed, so this now
  // lands directly on the partner/logo wall.
  { id: "builders", label: dict.nav.builders },
  { id: "faq",      label: dict.nav.faq },
];

export default function JourneyNav() {
  const { t, locale } = useLocale();
  const reduce = useReducedMotion();
  const { openRegister, registered } = useRegister();
  const [scrolled, setScrolled] = useState(false);
  // Reveal the register button as soon as the visitor leaves the hero — the same
  // scrollY > 40 threshold that tints the bar. It used to wait on an
  // IntersectionObserver over #about, which broke the most likely first action on
  // the page: the hero's primary CTA jumps straight to #program, so #about is
  // never scrolled through and the register button never appeared at all. Once
  // shown it stays shown (latched below), so it never flickers on scroll-up.
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 40;
      setScrolled(past);
      if (past) setShowRegister(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Anchor jumps (the hero CTA → #program) normally emit a scroll event, but
    // not in every context — a backgrounded tab coalesces them away. Since that
    // exact path is what used to hide this button entirely, re-check on
    // hashchange too rather than depend on scroll alone.
    window.addEventListener("hashchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#06040f]/85" : "bg-transparent"}`}>
      <nav className="flex h-20 w-full items-center justify-between px-6 sm:px-10">
        {/* LEFT group — brand logo + anchor links, kept together on the left edge. */}
        <div className="flex items-center">
          <a href="#top" className="flex items-center gap-2.5 leading-none">
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
              className="h-7 w-auto opacity-90 brightness-0 invert sm:h-8"
            />
            {/* items-center centres the text box, but Hangul glyphs sit high in
                that box (no descenders) so "빌더톤" reads as floating above the
                Zero100 wordmark. Nudge it down only for Korean; Latin already
                lines up. */}
            <span className={`hidden items-center text-lg font-black leading-none tracking-wide text-white/90 sm:inline-flex sm:text-xl ${locale === "ko" ? "translate-y-[2px]" : ""}`}>{t(dict.nav.brandSuffix)}</span>
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
        {/* RIGHT group — EN/KR toggle + Partner, with the register button
            appearing as soon as the visitor scrolls off the hero. */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <LocaleToggle />
          <a href={links.partnership} className="hidden shrink-0 whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 md:inline-flex">
            {t(dict.nav.partner)}
          </a>
          {/* Scroll-revealed register CTA — fades/slides in once the hero is
              scrolled past, then persists. Opens the shared register modal. */}
          <AnimatePresence>
            {showRegister && (
              <motion.button
                type="button"
                onClick={() => openRegister()}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: 12 }}
                transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex shrink-0 items-center rounded-full bg-violet-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-500 sm:px-5 sm:text-sm"
              >
                {registered ? t(dict.register.navRegistered) : t(dict.nav.register)}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
}
