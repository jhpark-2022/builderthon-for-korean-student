"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import { useRegister } from "@/lib/RegisterContext";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { isScrollLocked } from "@/lib/useBodyScrollLock";
import LocaleToggle from "@/components/LocaleToggle";
import ChatGlyph from "@/components/ChatGlyph";
import ReturningGreeting from "./ReturningGreeting";

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
  // Shared with the bottom bars and the back-to-top button (lib/useScrollDirection):
  // on a phone this header is two rows tall and, together with the bottom rail,
  // was taking a quarter of an in-app browser's viewport. Scrolling DOWN — the
  // gesture that means "show me more page" — slides it out; scrolling up brings
  // it straight back. Desktop is untouched: the translate only applies below lg.
  const chromeHidden = useScrollDirection();

  useEffect(() => {
    const onScroll = () => {
      // The scroll lock parks <body> at `position: fixed`, so `window.scrollY`
      // reads 0 for as long as a modal is open. Taking that at face value would
      // strip the header back to its top-of-page styling behind the backdrop and
      // then snap it back on close. Hold the last real reading instead.
      if (isScrollLocked()) return;
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

  // backdrop-blur once scrolled: at 85% the bar was legible on desktop, but the
  // mobile section rail below doubles its height and page text kept reading
  // through between the two rows. The blur separates bar from page without
  // making it a solid slab.
  return (
    <header
      // focus-within pins it open: a keyboard user tabbing into the nav must not
      // have it slide away under them. `lg:!translate-y-0` keeps the desktop bar
      // fixed in place no matter what the scroll signal says.
      className={`fixed inset-x-0 top-0 z-50 focus-within:translate-y-0 lg:!translate-y-0 ${
        reduce ? "" : "transition-all duration-300 lg:duration-500"
      } ${scrolled ? "bg-[#06040f]/85 backdrop-blur-md" : "bg-transparent"} ${
        chromeHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* 52px in the two-row band, h-20 from xl: the tall bar was designed for a
          desktop row of seven anchor links, but below that it carries a logo, a
          chip or two and the language toggle — and it sits above a second row.
          Together with the rail's tightened padding this takes the two-row header
          from ~145px to ~105px — about a quarter of that chrome back. Touch
          targets inside are unchanged (44px minimums), and the nav CTAs that
          appear from lg are ~43px tall, so they still clear the 52px bar.
          Tracks the anchor row's breakpoint (`lg` → `xl`, 2026-08-03) so the bar
          is tall exactly when it has a row of links to hold — and so
          scroll-padding-top in globals.css only ever needs two bands. */}
      <nav className="flex h-[52px] w-full items-center justify-between px-6 sm:px-10 xl:h-20">
        {/* LEFT group — brand logo + anchor links, kept together on the left edge. */}
        <div className="flex items-center">
          <a href="#top" className="flex items-center gap-2.5 leading-none">
            {/* Official Zero100 lockup (icon + wordmark) leads the brand; the event
                is "Zero100 AI Builderthon". The "AI Builderthon" suffix is hidden
                on the narrowest screens so the brand, EN/KR toggle and View Program
                CTA all fit, and returns from the sm breakpoint up. */}
            <Image
              src="/partners/zero100-wordmark.png"
              alt="Zero100"
              width={602}
              height={127}
              priority
              className="h-7 w-auto opacity-90 brightness-0 invert sm:h-8"
            />
            {/* items-center centres the text box, but Hangul glyphs sit high in
                that box (no descenders) so "AI 빌더톤" reads as floating above the
                Zero100 wordmark. Nudge it down only for Korean; Latin already
                lines up. */}
            {/* The suffix is part of a lockup, so it must never wrap
                (whitespace-nowrap) and it yields whenever the bar is tight
                rather than pushing anything off-screen.
                It drops below `sm` in both locales, and ENGLISH drops it again
                from `xl` to 1500px. That second band is where the anchor row
                appears, and the EN labels are the longer set — "AI Builderthon"
                is 163px against "AI 빌더톤"'s 89px, and the EN anchor row is
                577px against 509px. Measured with the suffix forced on: at 1400
                the two nav groups touch (0px between them) and the lockup still
                overflows its own flex item by 18px, at 1440 the gap is 15px, at
                1500 it is 75px. Below that the lockup printed on top of the first
                two links; the zero100 wordmark alone carries the brand there.
                KR fits from `xl` with 42px to spare, so it needs no second band.
                Re-measure before touching 1500 — it is the EN row width, not a
                round number. */}
            <span className={`hidden items-center whitespace-nowrap text-lg font-black leading-none tracking-wide text-white/90 sm:inline-flex sm:text-xl ${locale === "ko" ? "translate-y-[2px]" : "xl:hidden min-[1500px]:inline-flex"}`}>{t(dict.nav.brandSuffix)}</span>
          </a>
          {/* ANCHOR ROW — `xl` (1280), not `lg` (1024). See the note on the
              section rail below: between 1024 and 1279 this row does not fit
              next to the brand and the two CTAs in either locale, and flex
              silently crushed the brand to make room. */}
          <div className="hidden items-center gap-5 xl:ml-10 xl:flex">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                // whitespace-nowrap: a nav label is a single target and must stay
                // on one line. The Korean labels are the longer set and were
                // breaking apart at the narrow end of `lg` — "참가 대상" split at
                // its space and the row turned into two ragged lines of syllables.
                className="relative whitespace-nowrap text-sm font-medium text-white/70 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-violet-400/70 after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
              >
                {t(a.label)}
              </a>
            ))}
            {/* Quiz — an anchor-weight text link after FAQ, not a button. It has
                to be reachable from the nav (there was no path at all), but it
                sits under the open-chat ghost button and two under the register
                pill, which is the order these three should always be in. */}
            <a
              href="/quiz"
              onClick={() => track("quiz_click", { src: "nav" })}
              className="relative whitespace-nowrap text-sm font-medium text-violet-200/80 transition hover:text-violet-100 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-violet-400/70 after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
            >
              {t(dict.nav.quizNav)}
            </a>
          </div>
        </div>
        {/* RIGHT group — open chat + EN/KR toggle, with the register button
            appearing as soon as the visitor scrolls off the hero.
 
            "파트너십 문의" USED TO LIVE HERE and was moved to the footer. This
            bar is seen by every visitor on every screen, and the two audiences
            want opposite things: a student wants a way in, a company wants an
            email address. Spending the most valuable slot on the smaller
            audience cost the larger one a door. Companies still reach it from
            the footer CTA (a full pill, more prominent than this ever was) and
            from the partner section. */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Returning quiz-taker greeting — sits to the LEFT of open chat.
              Compact single-line pill; renders nothing for first-time visitors.
              Desktop-only, so the mobile bar stays uncluttered.
              Held back to 1700px: it used to appear at `xl`, the same breakpoint
              where the brand suffix returns, and the two together overran the bar
              for anyone who had taken the quiz (~210px pill + ~130px suffix).
              Of the two the brand lockup wins, so the pill waits for the width.
              1700 rather than `2xl` because at 1536 — a very common effective
              width, 1920 at 125% scaling — the row fits only exactly: the FAQ
              link ends at the pixel the pill starts. This is the width where the
              two groups stop touching. */}
          <span className="hidden min-[1700px]:inline-flex">
            <ReturningGreeting compact />
          </span>
          {/* Open chat — visible from first paint, NOT scroll-revealed. Someone
              who lands and isn't ready to register should find the low-commitment
              door immediately, not after proving they'll scroll.
 
              Emphasized violet-tinted outline while unregistered: a soft violet
              glow + brighter text so the low-commitment door actually draws the
              eye — but still an OUTLINE, not a fill, so it stays one tier below
              the solid register pill (no two competing primaries). Once
              registered the roles swap: registration is done ("등록 완료 ✓"), so
              the next real action is the chat, and this becomes the filled
              control. See the registered branch below. */}
          {/* Phone/tablet path to the quiz. The anchor row above is `xl:flex`, so
              without this there is no route to /quiz from the header at all
              below xl. Kept to a compact chip rather than a new hamburger — the
              header's minimalism is the point, and one more sheet to open is one
              more reason not to. Tracks the anchor row's breakpoint: if that
              moves, this moves with it or the quiz loses its only header route. */}
          <a
            href="/quiz"
            onClick={() => track("quiz_click", { src: "nav_mobile" })}
            aria-label={t(dict.nav.quizNav)}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 text-xs font-bold text-violet-100/90 transition hover:border-violet-300/50 hover:bg-violet-500/20 hover:text-white xl:hidden"
          >
            <span aria-hidden>✦</span>
          </a>
          {links.openChat && (
            <a
              href={links.openChat}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(dict.nav.openChatAria)}
              onClick={() => track("openchat_click", { src: "nav" })}
              className={
                registered
                  ? "hidden shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(124,92,255,0.6)] lg:inline-flex"
                  : "hidden shrink-0 items-center gap-1.5 rounded-full border border-violet-400/45 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-100 shadow-[0_0_18px_rgba(124,92,255,0.28)] transition hover:-translate-y-0.5 hover:border-violet-300/70 hover:bg-violet-500/25 hover:text-white hover:shadow-[0_0_26px_rgba(124,92,255,0.45)] lg:inline-flex"
              }
            >
              <ChatGlyph className="h-4 w-4" />
              {t(dict.nav.openChat)}
            </a>
          )}
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
                // Unregistered: the bar's single top-level action — gradient fill
                // + soft violet glow so it outranks everything else here.
                //
                // Registered: it stops being an action and becomes a STATUS.
                // Promoting open chat while leaving this a matching violet pill
                // produced two identical primaries and swapped nothing, so this
                // recedes to a quiet outline. It stays clickable (it opens the
                // "how do I change my details" panel) — it just no longer claims
                // to be the thing to do next.
                // Hidden below lg: on mobile the sticky bottom register bar
                // already carries this action, so a second one in the nav is
                // redundant. Shows from lg up, where there's no bottom bar.
                className={
                  registered
                    ? "hidden shrink-0 items-center rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-3.5 py-2 text-xs font-semibold text-emerald-200/90 transition hover:bg-emerald-400/15 sm:px-5 sm:py-2.5 sm:text-sm lg:inline-flex"
                    : "hidden shrink-0 items-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(124,92,255,0.6)] sm:px-5 sm:py-2.5 sm:text-sm lg:inline-flex"
                }
              >
                {registered ? t(dict.register.navRegistered) : t(dict.nav.register)}
              </motion.button>
            )}
          </AnimatePresence>
          {/* Language last — it's a setting, not an action, so it sits after
              both CTAs rather than between the brand and them. */}
          <LocaleToggle />
        </div>
      </nav>
      {/* ── Section rail (below `xl` only) ────────────────────────────────────
          The anchor row above is `xl:flex`, so on a phone the header carried the
          brand, the quiz chip and the language toggle and nothing else — while
          the page itself runs ~27,000px on a 390px screen. A visitor who wanted
          the programme or the FAQ had one tool: scrolling, or the back-to-top
          button. This is that missing route.

          THE BOUNDARY MOVED `lg` → `xl` (2026-08-03). The inline row appeared at
          1024 but did not FIT until ~1200 (KR) / ~1280 (EN): brand 171 + row 509
          /577 + the two CTAs 324 + rail padding came to 1139px (KR) and 1201px
          (EN) inside a 1024px bar. Nothing wrapped, because every label is
          whitespace-nowrap — instead flex shrank the one item that could give,
          the brand link, and at 1024 the zero100 wordmark was crushed from 171px
          to 50px while the EN/KR toggle sat off the right edge. Measured, both
          locales, before and after. So 1024–1279 now gets the same two-row
          treatment as a phone: compact bar + this rail, which reaches every
          section the inline row does. Do not move this back to `lg` without
          re-measuring the widest locale — the row is the constraint, not the
          breakpoint name.

          Deliberately a scrollable rail, not a hamburger sheet: the same chips
          the desktop bar uses, laid on their side, so nothing new has to be
          opened or learned (the header's minimalism was the reason a menu was
          turned down before, and it still holds).

          Appears only once the hero is behind you — the same `scrolled` latch
          the register button uses. On the first screen the hero's own CTAs are
          the point and this would just be a second row of chrome.

          `scroll-padding-top` in globals.css accounts for the extra height on
          this breakpoint, so an anchor jump doesn't park a heading underneath. */}
      {scrolled && (
        <div className="xl:hidden">
          <div className="flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]{display:none}">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                // min-h stays 44px — the row got shorter by losing padding around
                // it, never by shrinking the thing a thumb has to hit.
                className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border border-white/12 bg-white/[0.06] px-3 text-[0.7rem] font-semibold text-white/75 backdrop-blur transition active:scale-[0.97]"
              >
                {t(a.label)}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
