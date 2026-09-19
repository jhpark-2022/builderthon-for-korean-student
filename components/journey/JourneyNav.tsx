"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
// AnimatePresence와 motion은 등록 필이 있던 동안만 쓰였습니다 (2026-08-22 청산).
// useReducedMotion은 헤더 자체의 전환에 여전히 필요합니다.
import { useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links, type Phrase } from "@/data/dictionary";
import { useRegisterOptional } from "@/lib/RegisterContext";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { isScrollLocked } from "@/lib/useBodyScrollLock";
import LocaleToggle from "@/components/LocaleToggle";
import MotionToggle from "@/components/ui/MotionToggle";
import ChatGlyph from "@/components/ChatGlyph";
import ReturningGreeting from "./ReturningGreeting";

// The one list every anchor UI reads: the desktop anchor row, the mobile/side
// section rail, and useActiveSection's IntersectionObserver all map over it, so
// a change here propagates everywhere. There is no second hardcoded list.
//
// DECIDED 2026-08-13 (안 A): nav 앵커 연사→멘토링 교체 — 참가자 클릭 가치 기준.
// 링크 8개 폭 예산 유지. 멘토링 챕터(3단계 멘토링 · 멘토진 · 피드백 패널)는 이
// 페이지에서 가장 큰 챕터인데 앵커가 없었고, #speakers는 프로그램 바로 다음이라
// 프로그램 앵커로 닿으며 연사 정보는 Day 카드에도 반복됩니다. #speakers 섹션은
// 그대로 있습니다 — 사라진 것은 앵커뿐입니다.
//
// DECIDED 2026-08-22 (Day 1): 트랙 공개 — 저지먼트, 오토메이션, 출제 기업
// 코드프레소. nav 앵커 참가 대상(#join) → 트랙(#tracks). 등록이 마감된 뒤로
// "참가 대상"은 클릭 가치가 다했고, 지금 이 페이지의 1순위 독자는 이미 들어온
// 참가자입니다. 배열 순서는 페이지 순서를 따라야 하므로 tracks는 benefits 뒤,
// program 앞에 옵니다 — #tracks 섹션이 바로 그 사이에 있습니다.
//
// DECIDED 2026-08-23: 참가자 국면으로 세트를 다시 짭니다. 취지와 혜택이 빠지고
// 연사가 들어왔습니다. 링크 8개 → 7개.
//
// 취지와 혜택은 둘 다 "등록할까"를 고민하는 사람을 설득하는 챕터입니다. 등록이
// 마감된 지금 그 독자는 존재하지 않고, 남은 독자(참가자)에게 저 둘은 이미 읽었거나
// 읽을 이유가 없는 자리예요. 8/13의 연사→멘토링, 8/22의 참가 대상→트랙과 같은
// 기준입니다: 클릭 가치.
//
// 연사가 돌아온 이유는 그 기준이 뒤집혔기 때문입니다. 8/13에는 "프로그램 앵커로
// 닿고 Day 카드에도 반복된다"가 이유였는데, 지금은 Day 1이 지나고 Day 7·8 세션이
// 남아 있어 "누가 언제 오는지"가 실제로 찾는 정보가 됐습니다.
//
// #about과 #benefits 섹션은 그대로 있습니다. 사라진 것은 앵커뿐이고, 라벨 키도
// dict.nav에 보존돼 있습니다.
// DECIDED 2026-08-30: 투표 → 마무리. 행사가 끝나 투표 섹션이 내려갔습니다.
// dict.vote.navLabel은 지우지 않았으니 다음 회차에 되살릴 때 그대로 쓰세요.
//
// DECIDED 2026-08-28 (Day 8): 트랙 → 투표. 라벨과 id를 함께 바꿉니다.
//
// 이 배열의 id는 두 가지 일을 합니다: href(`#${id}`)이자, useActiveSection이
// getElementById로 관찰할 대상이에요. 그래서 섹션 id와 반드시 같아야 합니다
// (Journey.tsx의 Chapter id). 한쪽만 바꾸면 링크는 되는데 현위치 표시가
// 죽거나, 그 반대가 됩니다.
//
// 이 한 줄이 실제로 하는 일: QR을 놓친 사람이 사이트에서 투표를 스스로 찾는 길입니다.
// "트랙"으로 두면 화면 어디에도 "투표"라는 단어가 없어서, 저 자리에 있다는 것을
// 알 방법이 없습니다. dict.nav.tracks는 지우지 않았으니 되돌릴 때 그대로 쓰세요.
// ── DECIDED 2026-09-15 (나루 런칭): 목록이 prop이 됩니다 ────────────────────
// 이 헤더를 이제 두 페이지가 씁니다. /2026-08은 아래 기본 목록을, /는 나루 홈의
// 여섯 챕터를 넘깁니다(data/naru.ts의 nav).
//
// 기본값을 남긴 것이 요점입니다: 아카이브 쪽 호출부(app/2026-08/page.tsx)는
// <JourneyNav /> 그대로라 8월 페이지의 동작이 한 글자도 바뀌지 않습니다.
// 아래 결정 기록은 전부 이 기본 목록에 대한 것이고, 그대로 유효합니다.
export type NavAnchor = { id: string; label: Phrase };

// REMOVED 2026-09-16: { id: "wrap", label: dict.wrap.navLabel }. 그 챕터가
// 페이지에서 내려갔습니다(Journey.tsx의 같은 날짜 주석). 앵커 id는 섹션 id와
// 반드시 짝이라, 섹션 없이 남으면 링크는 아무 데도 가지 않고 현위치 표시가
// 영영 켜지지 않습니다. 라벨 키는 dict.wrap.navLabel에 그대로 있습니다.
const DEFAULT_ANCHORS: NavAnchor[] = [
  { id: "program",   label: dict.nav.program },
  { id: "speakers",  label: dict.nav.speakers },
  { id: "mentoring", label: dict.nav.mentoring },
  // The "For partners" pitch chapter (#why-partner) was removed, so this now
  // lands directly on the partner/logo wall.
  { id: "builders",  label: dict.nav.builders },
  { id: "faq",       label: dict.nav.faq },
];

// ─────────────────────────────────────────────────────────────────────────────
// WHERE AM I — the id of the anchor section currently occupying the viewport.
//
// The rail is the only wayfinding on a phone, and its chips used to look
// identical whether you were in 취지 or in FAQ. That was survivable while an
// anchor tap animated you there (the travel itself told you where you went);
// with jumps now instant below `lg` (globals.css), nothing at all reports
// position. This gives the chips something true to show.
//
// rootMargin pins the decision line near the top of the viewport rather than
// its middle: chapters here are full-screen-tall, so a middle line flips the
// active chip a half screen after you have visibly arrived. -45% at the bottom
// keeps exactly one section qualifying at a time on tall screens.
// ─────────────────────────────────────────────────────────────────────────────
function useActiveSection(enabled: boolean, anchors: NavAnchor[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const nodes = anchors
      .map((a) => document.getElementById(a.id))
      .filter((n): n is HTMLElement => !!n);
    if (!nodes.length) return;
    // Track ratios rather than reacting to each entry: with several sections in
    // view during a fast flick, "last one that fired" is whichever the browser
    // reported last, not the one on screen.
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        });
        let best: string | null = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => {
          if (ratio >= bestRatio) { bestRatio = ratio; best = id; }
        });
        // Keep the last known section when scrolling through a gap (the hero and
        // the closing screen are not anchors) — blanking there reads as a bug.
        if (best) setActive(best);
      },
      { rootMargin: "-96px 0px -45% 0px", threshold: [0, 0.15, 0.4, 0.75] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [enabled, anchors]);
  return active;
}

export default function JourneyNav({
  anchors = DEFAULT_ANCHORS,
  brand = "zero100",
  showQuiz = true,
}: {
  anchors?: NavAnchor[];
  // 어느 이름표를 다는가. 8월 페이지는 Zero100 락업(그 회차의 주최 표기가 그것이라
  // 역사입니다), 나루 홈은 나루 가로 락업입니다.
  // DECIDED 2026-09-15: 홈의 락업은 SVG가 아니라 PNG입니다. 납품된 SVG에는 영문
  // Montserrat만 임베드돼 있고 한글 "나루"는 시스템의 Noto Sans CJK KR을
  // 부릅니다. 그 서체가 없는 기기(대부분의 macOS·Windows)에서는 다른 글자꼴로
  // 그려집니다. 로고 가이드가 금지한 "형태를 건드리는 일"이 방문자 기기에서
  // 저절로 일어나는 셈이라, 글자가 든 로고는 PNG로 씁니다.
  brand?: "zero100" | "naru";
  // 유형 테스트(/quiz) 진입점을 그릴 것인가.
  //
  // DECIDED 2026-09-15: 나루 홈에서 뺍니다. 그 퀴즈는 8월 Day 1의 팀 매칭용
  // AI 유형 테스트입니다. 끝난 이벤트의 도구이고, 12월 이벤트와는 아무 관계가
  // 없어요. 그런데 이 헤더가 두 페이지를 함께 쓰는 바람에 나루 홈에도 따라와
  // 있었고, 오픈채팅 버튼이 lg 아래에서 숨으므로 **폰에서 나루 홈 헤더의 유일한
  // 액션이 8월 퀴즈**였습니다.
  //
  // 이 레포는 같은 판단을 두 번 했습니다. 등록 마감 후 "누를 수 없는 버튼을
  // 회색으로 남기지 않는다"(아래 2026-08-22 결정), 그리고 "파트너십 문의는 이
  // 바에서 가장 값비싼 자리를 작은 독자에게 쓰고 있었다"(2026-08-23). 기준은
  // 클릭 가치입니다.
  //
  // 기본값이 true라 /2026-08은 한 글자도 바뀌지 않습니다. 퀴즈는 그 페이지의
  // 것이고 거기서는 여전히 클릭 가치가 있습니다.
  showQuiz?: boolean;
}) {
  const { t, locale } = useLocale();
  const reduce = useReducedMotion();
  // `registered`만 남습니다 — 등록 진입점은 2026-08-22에 걷어냈지만, 이미 등록한
  // 방문자에게 인사하는 ReturningGreeting은 그대로 살아 있습니다.
  // 나루 홈에는 RegisterProvider가 없으므로(등록 없음) null이 올 수 있습니다.
  const registered = useRegisterOptional()?.registered ?? false;
  const [scrolled, setScrolled] = useState(false);
  // Only observe once the rail exists — before that there is nothing to mark,
  // and the observer would run through the whole hero for nobody.
  const activeSection = useActiveSection(scrolled, anchors);
  // 나루 홈(2026-09-18, 모바일 수정 브리프 7): 칩 일곱이 390px에 들어가지 않아 현위치 칩이
  // 레일 밖에 있을 수 있습니다. 현위치가 바뀌면 그 칩을 레일 가운데로 스크롤합니다(레일만,
  // 페이지는 움직이지 않음). 8월 페이지는 그대로(brand 조건).
  const railRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (brand !== "naru" || !activeSection || !railRef.current) return;
    // 2026-09-19: 홈 레일은 접히므로 가로로 넘칠 것이 없습니다. 넘치지 않으면
    // 아무것도 하지 않습니다(문서를 건드리지 않게).
    if (railRef.current.scrollWidth <= railRef.current.clientWidth + 1) return;
    const chip = railRef.current.querySelector<HTMLElement>(`a[href="#${activeSection}"]`);
    if (!chip) return;
    // 감사 반영 브리프 2.2: 활성 칩을 레일 가운데로. block:nearest라 문서는 움직이지 않습니다.
    chip.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [activeSection, brand, reduce]);
  // Shared with the bottom bars and the back-to-top button (lib/useScrollDirection):
  // on a phone this header is two rows tall and, together with the bottom rail,
  // was taking a quarter of an in-app browser's viewport. Scrolling DOWN — the
  // gesture that means "show me more page" — slides it out; scrolling up brings
  // it straight back. Desktop is untouched: the translate only applies below lg.
  //
  // DECIDED 2026-08-17: 여기에 "멈추면 돌아온다"가 더해졌습니다. 스크롤이 0.9초
  // 멎으면 훅이 스스로 false로 돌아오므로, 읽으려고 멈춘 사람이 등록 버튼을
  // 다시 보려고 위로 긁을 필요가 없습니다. 그 규칙은 훅이 갖고 있고 이 컴포넌트는
  // 그대로 구독만 합니다 — 여기에 별도 타이머를 만들지 마세요. 네 표면이 한 몸으로
  // 움직이는 이유가 신호가 하나라는 점입니다.
  // 나루 홈(감사 반영 브리프 2.1): 아래로 스크롤하면 로고 줄(52px)만 접고 칩 레일은 남깁니다. 위로
  // 스크롤해야 돌아오고, 멈춰 있다고 돌아오지 않습니다(idleReveal false). 8월 페이지는 그 전
  // 그대로(헤더 전체 숨김 + 정지 시 복귀).
  const naru = brand === "naru";
  const chromeHidden = useScrollDirection({ idleReveal: naru ? false : 450 });
  const headerRef = useRef<HTMLElement | null>(null);
  // 헤더 실높이를 scroll-padding-top으로(감사 반영 브리프 2.1). 접힌 상태에서는 레일 높이만큼만
  // 밀어야 앵커 착지가 헤더 아래 잘리지 않습니다. 나루 홈만. 8월 페이지는 globals.css의 고정값.
  useEffect(() => {
    if (!naru) return;
    const root = document.documentElement;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const h = headerRef.current;
      if (!h) return;
      const bottom = Math.max(0, h.getBoundingClientRect().bottom);
      root.style.scrollPaddingTop = `${Math.round(bottom) + 12}px`;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const timer = window.setTimeout(apply, 350);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (headerRef.current && ro) ro.observe(headerRef.current);
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.clearTimeout(timer);
      ro?.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
      root.style.scrollPaddingTop = "";
    };
  }, [naru]);
  // 앵커 클릭의 부드러운 스크롤(감사 반영 브리프 9.4). html { scroll-behavior: smooth }를 뺐으므로
  // 여기서 scrollIntoView로 합니다. prefers-reduced-motion이면 auto. 나루 홈만.
  useEffect(() => {
    if (!naru) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = decodeURIComponent(a.getAttribute("href")!.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [naru]);

  useEffect(() => {
    const onScroll = () => {
      // The scroll lock parks <body> at `position: fixed`, so `window.scrollY`
      // reads 0 for as long as a modal is open. Taking that at face value would
      // strip the header back to its top-of-page styling behind the backdrop and
      // then snap it back on close. Hold the last real reading instead.
      if (isScrollLocked()) return;
      setScrolled(window.scrollY > 40);
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
      ref={headerRef}
      // focus-within pins it open: a keyboard user tabbing into the nav must not
      // have it slide away under them. `lg:!translate-y-0` keeps the desktop bar
      // fixed in place no matter what the scroll signal says.
      className={`fixed inset-x-0 top-0 z-50 focus-within:translate-y-0 lg:!translate-y-0 ${
        reduce ? "" : "transition-all duration-300 lg:duration-500"
      // DECIDED 2026-08-23 (박주형): /85 → /95. 스크롤하면 헤더 뒤로 본문이 —
      // 특히 파트너 로고 월이 — 비쳐 보였습니다. 15%가 통과하고 있었어요.
      //
      // backdrop-blur에만 기대면 안 됩니다. blur는 뒤를 흐릴 뿐 가리지 않아서,
      // 로고처럼 대비가 큰 것은 흐려진 채로 그대로 읽힙니다. 어두운 단색이 기본이고
      // blur는 보조입니다.
      //
      // 두 줄(로고 줄 + 섹션 레일)은 이미 이 배경 하나를 함께 씁니다 — 실측 105px =
      // nav 52 + 레일 53이라 줄 사이에 빈 틈이 없습니다. 여기서 갈라 두지 마세요.
      } ${scrolled ? "bg-[#070B1F]/95 backdrop-blur-md" : "bg-transparent"} ${
        // 나루 홈: 로고 줄(52px)만 접고 레일은 남깁니다(감사 반영 브리프 2.1). 레일이 없는 첫 화면
        // 근처(scrolled false)에서는 topZone이 먼저 막아 hidden이 되지 않습니다.
        chromeHidden ? (naru && scrolled ? "-translate-y-[52px]" : "-translate-y-full") : "translate-y-0"
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
          {brand === "naru" ? (
            /* 나루 가로 락업(이름만, 반전). 어두운 바탕 전용이고 이 사이트는
               바탕이 남색 검정이라 반전이 기본입니다. 로고 가이드: 비율·색·회전·
               그림자 금지. w-auto로 높이만 정합니다. 마스터(원형 배지)를 여기
               쓰지 않는 이유는 최소 가로 120px 규칙 때문입니다. 52px 바에
               들어가는 배지는 그 아래로 내려갑니다.

               DECIDED 2026-09-15: SINGAPORE가 붙은 락업(naru-lockup-rev)에서
               이름만 버전으로 바꿉니다. 실측하니 h-8에서 그 락업 안의
               SINGAPORE 대문자 높이가 3.8px이었습니다. 자간이 넓은 3.8px짜리
               대문자는 글자가 아니라 로고 옆에 낀 회색 때로 보입니다.
               12월 이벤트가 서울이라는 점도 있습니다. 모든 화면 상단에
               SINGAPORE가 박혀 있는 것은 지금 브랜드가 하려는 말과 어긋납니다.
               히어로와 OG의 원형 배지는 288px / 300px이라 그대로 둡니다. */
            <a href="#top" className="flex items-center leading-none">
              <Image
                src="/naru/naru-name-rev.png"
                alt="나루 NARU"
                width={604}
                height={168}
                priority
                className="h-8 w-auto sm:h-9"
              />
            </a>
          ) : (
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
          )}
          {/* ANCHOR ROW — `xl` (1280), not `lg` (1024). See the note on the
              section rail below: between 1024 and 1279 this row does not fit
              next to the brand and the two CTAs in either locale, and flex
              silently crushed the brand to make room. */}
          <div className="hidden items-center gap-5 xl:ml-10 xl:flex">
            {anchors.map((a) => {
              // DECIDED 2026-08-23: 데스크톱 앵커에도 현위치 표시를 답니다.
              // useActiveSection은 원래 폰의 섹션 레일만 쓰고 있었는데, 위치를
              // 알려줄 필요는 화면이 넓다고 없어지지 않습니다. 이 페이지는
              // 1440px에서도 27,000px짜리 한 장이라 앵커 행이 유일한 지도예요.
              //
              // 표시는 레일 칩과 같은 원칙입니다(그쪽 주석 참고): 밝기와 밑줄까지만,
              // 채우지 않습니다. 이건 표지판이지 버튼이 아닙니다.
              // 호버 밑줄과 같은 선을 그대로 켜 두는 방식이라 새 시각 요소가 없어요.
              const here = a.id === activeSection;
              return (
                <a
                  key={a.id}
                  href={`#${a.id}`}
                  // aria-current, not just colour: the marker's meaning has to
                  // survive for someone who can't see the tint.
                  aria-current={here ? "true" : undefined}
                  // whitespace-nowrap: a nav label is a single target and must stay
                  // on one line. The Korean labels are the longer set and were
                  // breaking apart at the narrow end of `lg` — "참가 대상" split at
                  // its space and the row turned into two ragged lines of syllables.
                  className={`relative whitespace-nowrap text-sm font-medium transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-accent/70 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100 focus-visible:after:scale-x-100 ${
                    here ? "text-white after:scale-x-100" : "text-white/70 after:scale-x-0"
                  }`}
                >
                  {t(a.label)}
                </a>
              );
            })}
            {/* Quiz — an anchor-weight text link after FAQ, not a button. It has
                to be reachable from the nav (there was no path at all), but it
                sits under the open-chat ghost button and two under the register
                pill, which is the order these three should always be in. */}
            {showQuiz && (
            <a
              href="/quiz"
              onClick={() => track("quiz_click", { src: "nav" })}
              className="relative whitespace-nowrap text-sm font-medium text-accent/85 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent/70 after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
            >
              {t(dict.nav.quizNav)}
            </a>
            )}
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
          {/* 퀴즈를 본 적 있는 방문자에게 이름으로 인사하는 필. 퀴즈와 같은
              기능이라 같은 스위치를 탑니다. 나루 홈에서 8월 퀴즈 결과로 인사하면
              그 사람은 자기가 어느 페이지에 있는지 헷갈립니다. */}
          {showQuiz && (
            <span className="hidden min-[1700px]:inline-flex">
              <ReturningGreeting compact />
            </span>
          )}
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
          {/* 2026-08-12: ✦ 하나만 있던 칩에 글자를 붙였습니다. 세로는 이미
              min-h-[44px]였지만 가로가 px-3 + 글리프 하나라 40px 남짓이었고,
              무엇보다 ✦만으로는 눌러야 할 이유가 전달되지 않았습니다 — 폰에서
              헤더에 있는 유일한 퀴즈 통로인데 라벨이 aria에만 있었습니다.
              전체 라벨("유형 테스트 ✦")은 좁은 헤더에서 다른 칩을 밀어내므로
              짧은 라벨을 따로 둡니다. */}
          {showQuiz && (
          <a
            href="/quiz"
            onClick={() => track("quiz_click", { src: "nav_mobile" })}
            aria-label={t(dict.nav.quizNav)}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3.5 text-xs font-bold text-accent transition hover:border-accent/50 hover:bg-accent/20 hover:text-white xl:hidden"
          >
            <span aria-hidden>✦</span>
            <span aria-hidden>{t(dict.nav.quizNavShort)}</span>
          </a>
          )}
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
                  // showQuiz가 false면 lg 아래에서도 보입니다. 퀴즈 칩을 뺀
                  // 자리가 비면 폰에서 헤더에 액션이 하나도 없게 되는데, 이
                  // 페이지에서 지금 할 수 있는 일이 이것 하나입니다. 좁은 폭에서는
                  // 패딩과 글자를 줄이고 min-h로 터치 타깃 44px을 지킵니다.
                  : `shrink-0 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/[0.12] font-semibold text-accent transition hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/20 hover:text-white ${
                      showQuiz
                        ? "hidden px-4 py-2 text-sm lg:inline-flex"
                        : "inline-flex min-h-[44px] px-3.5 text-xs sm:px-4 sm:text-sm"
                    }`
              }
            >
              <ChatGlyph className="h-4 w-4" />
              {t(dict.nav.openChat)}
            </a>
          )}
          {/* DECIDED 2026-08-22 (마감 후 청산): 스크롤로 나타나던 등록 필을
              걷어냈습니다. 등록 진입점 전면 제거 — 비활성 버튼을 남기지 않는다.
              1순위 액션은 오픈채팅, 히어로 1순위는 트랙. 등록 코드(모달·API·
              registered 상태)는 삭제하지 않고 진입점만 끊습니다.

              누를 수 없는 버튼을 회색으로 남기는 쪽이 더 나빴습니다. 참가자가 이
              페이지에서 지금 할 수 있는 일은 오픈채팅에 들어오는 것 하나뿐인데,
              그 옆에 죽은 버튼이 서 있으면 어느 쪽이 살아 있는지를 매번 읽어야
              합니다. 위의 오픈채팅 버튼이 이제 이 바의 유일한 액션입니다 —
              스타일은 올리지 않았습니다. 경쟁 상대가 없어졌으니 고스트 톤으로
              충분하고, 그라디언트로 올리면 마감 전과 같은 압력이 됩니다. */}
          {/* 배경 정지 토글, 헤더에도(감사 반영 브리프 2.4). 푸터 것은 그대로. 나루 홈만. */}
          {naru && <MotionToggle compact />}
          {/* Language last — it's a setting, not an action, so it sits after
              the CTA rather than between the brand and it. */}
          <LocaleToggle variant={brand} />
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
          {/* 나루(홈): 가로로 굴리지 않고 **접습니다** (2026-09-19, 사용자: "모바일 뷰에서
              TOC가 한 스크린에 다 들어왔으면"). 전에는 우측 페이드 마스크 + snap으로 "뒤에
              더 있다"를 알렸는데, 알려 주는 것과 보이는 것은 다릅니다. 다섯 칸짜리 목차는
              굴릴 것이 아니라 한눈에 있어야 합니다.

              390px에서 실측한 글자 폭(0.7rem semibold): ko 57.8·43.6·36.0·21.8·10.9 = 170.1,
              en 114.1·51.8·79.1·36.4·26.6 = 308.0. 칩 좌우 여백 2.5rem×5와 칸 사이 8px×4를
              더하면 ko 302px, en 440px입니다. 가로 여백 24px×2를 뺀 342px 안에 **ko는 한 줄로
              들어가고 en은 못 들어갑니다.** en을 한 줄에 넣으려면 글자가 9px까지 내려가야 해서
              (읽을 수 없습니다) 대신 접습니다: en은 3 + 2 두 줄, ko는 한 줄. 로케일 분기가
              아니라 폭이 스스로 결정합니다. 360px 폰에서도 ko는 한 줄입니다(302 ≤ 312).

              칩 폭 통일(min-w 5.25rem)은 여기서 풉니다. 그 값은 /2026-08 레일의 최장 라벨
              en "Mentoring"에서 나온 것이고, 굴리는 레일에서 칩이 들쭉날쭉해 보이지 않게
              하는 장치였습니다. 접는 목차에서는 다섯 칸이 한눈에 함께 보여서 서로가 서로의
              기준이 되고, 통일하면 오히려 두 줄이 됩니다(ko 94.5×5 + 32 = 505px).

              /2026-08은 그대로 굴러갑니다. 그쪽은 아카이브고 라벨 길이가 달라서, 옮기려면
              위 주석대로 그 로케일들을 다시 재야 합니다. */}
          <div ref={railRef} className={naru
            ? "flex flex-wrap justify-center gap-2 px-6 pb-2"
            : "flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]{display:none}"}>
            {anchors.map((a) => {
              const here = a.id === activeSection;
              return (
                <a
                  key={a.id}
                  href={`#${a.id}`}
                  // aria-current, not just colour: the chip's meaning has to
                  // survive for someone who can't see the tint.
                  aria-current={here ? "true" : undefined}
                  // min-h stays 44px — the row got shorter by losing padding around
                  // it, never by shrinking the thing a thumb has to hit.
                  //
                  // 현위치 표시는 테두리+글자색까지만 (2026-08-12). 칩을 채우면
                  // 헤더에서 등록 버튼 다음으로 무거운 요소가 되어, 읽고 있는
                  // 챕터가 행동을 부르는 것처럼 보입니다. 이건 표지판이지
                  // 버튼이 아닙니다.
                  // DECIDED 2026-08-17: 레일 칩 폭 통일 — 라벨 길이 무관 동일 폭.
                  // 폭이 라벨을 따라가서 "혜택"(51px)과 "참가 대상"(76px)이 나란히
                  // 서면 레일이 들쭉날쭉했습니다. 칩은 표지판이라 크기가 정보가 되면
                  // 안 됩니다 — 긴 이름의 챕터가 더 중요한 챕터로 보입니다.
                  //
                  // 5.25rem(94.5px)은 두 로케일의 최장 라벨을 실측해 고른 최소값입니다:
                  // ko "참가 대상" 75.9px, en "Mentoring" 89.9px. (2026-08-23에
                  // "참가 대상"이 세트에서 빠졌지만 폭을 정한 것은 en "Mentoring"이고
                  // 그건 그대로라, 이 값은 손대지 않습니다.) 5rem은 90px이라
                  // Mentoring과 0.1px 차이여서 폰트 렌더링이 조금만 달라도 넘칩니다.
                  // 라벨을 더 긴 것으로 바꾸면 이 값을 다시 재세요 — 하나라도 min-w를
                  // 넘기면 그 칩만 넓어져서 통일이 깨집니다.
                  //
                  // 대가: 레일 총 길이가 늘어 한 화면에 보이는 칩이 줄어듭니다.
                  // 원래부터 가로 스크롤 레일이라 감당하는 쪽을 골랐습니다.
                  // 상단 행의 퀴즈 칩(✦)은 이 레일이 아니라 첫 행에 있어 대상이 아닙니다.
                  className={`inline-flex min-h-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border text-[0.7rem] font-semibold backdrop-blur transition active:scale-[0.97] ${
                    naru ? "px-2.5" : "min-w-[5.25rem] snap-center px-3"
                  } ${
                    here
                      ? "border-accent/40 bg-accent/[0.12] text-white"
                      : "border-white/[0.12] bg-white/[0.06] text-white/75"
                  }`}
                >
                  {t(a.label)}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
