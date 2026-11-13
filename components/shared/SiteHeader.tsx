"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { trackOpenChat } from "@/lib/openChatCount";
import { decemberEventLabel } from "@/lib/naruDates";
import { useLocale } from "@/lib/LocaleContext";
import { coreDict as dict, links } from "@/data/dictionaryCore";
import { naruNav, naruPageNav } from "@/data/naru";
import LocaleToggle from "@/components/LocaleToggle";
import ChatGlyph from "@/components/ChatGlyph";
import { SiteMenu, type SitemapPage } from "@/components/shared/SiteChrome";
import type { SitePage } from "@/components/shared/PageChips";
import PageSwipe from "@/components/shared/PageSwipe";
import { useActiveSection, type NavAnchor } from "@/components/journey/JourneyNav";

// DECIDED 2026-11-07 (redesign/crossing): 세 페이지(나루 홈, 크로싱 서울, 8월 기록)의 새 헤더. JourneyNav를 대신합니다.
// 목차는 가운데가 아니라 워드마크 바로 옆, 본문과 같은 왼쪽 선에서 시작합니다. 글자는 본문 크기(17px)이고,
// 지금 보고 있는 장은 잉크색 글자와 주황 점 하나로 표시합니다(주황은 점에만, brand 10장).
// 순서는 이 페이지의 화면 순서입니다. naruNav의 순서는 옛 홈(함께하는 곳이 맨 위)의 것이라 여기서 다시 늘어놓습니다.
const ORDER = ["december", "partners", "register"]; // 2026-11-12 dedupe R2: 남는 것을 뺌
const CROSSING_ANCHORS: NavAnchor[] = ORDER.map((id) => naruNav.find((a) => a.id === id)).filter((a): a is NavAnchor => !!a);

// DECIDED 2026-11-13: 8월 기록의 새 화면(components/archive/redesign/Aug2026.tsx)의 다섯 장. 다른 두 페이지와 같은 폭에서 목차가 섭니다.
const AUG_ANCHORS: NavAnchor[] = [
  { id: "days", label: { ko: "8일", en: "Eight days" } },
  { id: "photos", label: { ko: "사진", en: "Photos" } },
  { id: "people", label: { ko: "사람들", en: "People" } },
  { id: "partners", label: { ko: "함께한 곳", en: "Partners" } },
  { id: "media", label: { ko: "미디어", en: "Media" } },
];

const ANCHORS: Record<SitePage, NavAnchor[]> = { naru: naruPageNav, crossing: CROSSING_ANCHORS, aug: AUG_ANCHORS };

const SITEMAP: SitemapPage[] = [
  { page: "naru", anchors: ANCHORS.naru },
  { page: "crossing", anchors: ANCHORS.crossing },
  { page: "aug", anchors: ANCHORS.aug },
];

const FRAME = "mx-auto w-full max-w-[75rem] px-5 sm:px-8 lg:px-10";

export default function SiteHeader({ page }: { page: SitePage }) {
  const { t, locale } = useLocale();
  const en = locale === "en";
  const anchors = ANCHORS[page];
  const active = useActiveSection(true, anchors);
  const headerRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // 히어로와 스크롤 여백이 읽는 헤더 높이. JourneyNav와 같은 변수입니다.
  useEffect(() => {
    const root = document.documentElement;
    const measure = () => {
      const height = headerRef.current?.offsetHeight ?? 112;
      root.style.scrollPaddingTop = `${height + 12}px`;
      root.style.setProperty("--site-header-height", `${height}px`);
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (headerRef.current) observer?.observe(headerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      root.style.scrollPaddingTop = "";
      root.style.removeProperty("--site-header-height");
    };
  }, []);

  // 맨 위에서는 바닥 줄 없이 종이와 이어지고, 내려가면 줄이 생겨 본문과 갈라집니다.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 폰 목차 줄이 넘치면 지금 칸을 보이는 곳으로 옮깁니다.
  // 2026-11-09 (사용자: "모바일 version 에서 TOC 가 좀 이상했었음"): offsetLeft는 줄이 아니라 헤더 기준이라 앞의 메뉴 폭만큼
  // 더 밀려, 지금 칸(프로그램)이 왼쪽으로 숨었습니다. 줄 기준으로 재고, 칸이 이미 보이면 움직이지 않습니다.
  useEffect(() => {
    const rail = railRef.current;
    const current = rail?.querySelector<HTMLElement>(`a[href="#${active ?? "top"}"]`);
    if (!rail || !current || rail.scrollWidth <= rail.clientWidth + 1) return;
    const r = rail.getBoundingClientRect(), c = current.getBoundingClientRect();
    const fade = 32; // 오른쪽 끝의 흐려지는 폭(mask)
    if (c.left < r.left) rail.scrollLeft += c.left - r.left;
    else if (c.right > r.right - fade) rail.scrollLeft += c.right - (r.right - fade);
  }, [active]);

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "instant", block: "start" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    window.history.pushState(null, "", `#${id}`);
  };

  const sectionLinks = (size: string) =>
    anchors.map((a) => {
      const here = active === a.id;
      return (
        <a
          key={a.id}
          href={`#${a.id}`}
          onClick={(event) => jump(event, a.id)}
          aria-current={here ? "location" : undefined}
          className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy ${size} ${here ? "text-naru-text" : "text-naru-muted hover:text-naru-text"}`}
        >
          <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full bg-naru-orange transition-opacity duration-150 ${here ? "opacity-100" : "opacity-0"}`} />
          {t(a.label)}
        </a>
      );
    });

  // 바에 목차가 서는 폭. 영문은 낱말이 길어 더 넓어야 합니다. Tailwind가 읽도록 클래스는 통째로 씁니다.
  // 2026-11-13: 8월 기록도 칸이 다섯이 되어 다른 두 페이지와 같은 폭입니다.
  const row = en ? "min-[1180px]:flex" : "lg:flex";
  const rail = en ? "min-[1180px]:hidden" : "lg:hidden";

  return (
    <>
      <header
        ref={headerRef}
        data-page={page}
        className={`fixed inset-x-0 top-0 z-50 border-b bg-[#FCFBF8]/90 backdrop-blur-md transition-colors duration-200 supports-[not(backdrop-filter:blur(1px))]:bg-[#FCFBF8] ${scrolled ? "border-[#E3E0D8]" : "border-transparent"}`}
      >
        <div className={`${FRAME} flex h-16 items-center gap-5 lg:h-[76px]`}>
          {/* 크로싱 서울은 글자 워드마크, 나루 홈과 8월 기록은 나루 가로 락업(brand 6장). 지금 페이지면 맨 위로, 8월 기록에서는 홈으로. */}
          <a href={page === "aug" ? "/" : "#top"} className="-my-1 flex min-h-[44px] shrink-0 items-center leading-none">
            {page === "crossing" ? (
              <span lang={en ? "en" : undefined} className={`whitespace-nowrap font-black tracking-[-0.03em] text-naru-navy ${en ? "text-[1.125rem] sm:text-[1.375rem]" : "text-[1.375rem] lg:text-[1.625rem]"}`}>
                {decemberEventLabel(locale)}<span aria-hidden className="text-naru-orange">.</span>
              </span>
            ) : (
              <Image
                src={en ? "/naru/naru-name-en-paper.svg" : "/naru/naru-name-paper.png"}
                alt={en ? "NARU" : "나루 NARU"}
                width={en ? 857 : 604}
                height={en ? 142 : 168}
                unoptimized={en}
                priority
                className={en ? "h-[1.25rem] w-auto lg:h-[1.5rem]" : "h-7 w-auto lg:h-8"}
              />
            )}
          </a>
          <div className="hidden sm:block">
            <SiteMenu page={page} sitemap={SITEMAP} />
          </div>
          <nav aria-label={t(dict.nav.sectionsAria)} className={`ml-3 hidden items-center gap-7 ${row}`}>
            {sectionLinks("text-[1.0625rem]")}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {links.openChat && (
              <a
                href={links.openChat}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t({ ko: "오픈채팅, 카카오톡 새 창", en: "Open chat, KakaoTalk, new window" })}
                onClick={() => trackOpenChat("nav")}
                className="inline-flex h-10 min-w-[40px] items-center justify-center gap-2 rounded-full bg-naru-navy px-4 text-[0.9375rem] font-bold text-[#fff] transition-colors duration-150 hover:bg-[#1D338A] max-[419px]:w-10 max-[419px]:px-0"
              >
                <ChatGlyph className="block h-4 w-4" />
                <span className="max-[419px]:sr-only">{t(dict.nav.openChat)}</span>
              </a>
            )}
            <LocaleToggle className="tap-44 h-10 !min-h-0 !py-0 !text-[0.9375rem]" />
          </div>
        </div>
        <div className={rail}>
          <div className={`${FRAME} flex items-center gap-4 !pr-0`}>
            <div className="shrink-0 sm:hidden">
              <SiteMenu page={page} sitemap={SITEMAP} />
            </div>
            <nav aria-label={t(dict.nav.sectionsAria)} className="min-w-0 flex-1">
              <div ref={railRef} className="flex min-h-[48px] items-center gap-6 overflow-x-auto pr-8 [mask-image:linear-gradient(to_right,#000_calc(100%_-_32px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {sectionLinks("text-[0.9375rem]")}
              </div>
            </nav>
          </div>
        </div>
      </header>
      <PageSwipe page={page} />
    </>
  );
}
