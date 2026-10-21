"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { coreDict as dict, links } from "@/data/dictionaryCore";
import { naruLinks } from "@/data/naru";
import { META } from "@/components/ui/typography";
import ChatGlyph from "@/components/ChatGlyph";
import MotionToggle from "@/components/ui/MotionToggle";
import type { SitePage } from "@/components/shared/PageChips";

// ─────────────────────────────────────────────────────────────────────────────
// 세 페이지(/, /naru, /2026-08)가 같이 쓰는 사이트의 틀: 메뉴와 푸터.
// DECIDED 2026-10-20 (hwang 브리프 4.1~4.3, 감사 W8, W13, 옵션 A): 그 전에는 사이트 메뉴가 목차 칩과 같은 알약이었고(PageChips),
// 푸터가 세 종(홈 compact, /naru 로고 푸터, 8월 FooterNav), 나루 표기가 페이지마다 달랐습니다. 이 파일 하나가 세 페이지의 틀입니다.
// 12월 뒤 나루를 마스터로 세울 때(옵션 B)도 여기서 바꿉니다.
// ─────────────────────────────────────────────────────────────────────────────

type Item = { key: string; href: string; label: string; external?: "mail" | "chat"; page?: SitePage };

function useItems(includeChat: boolean, long = false): Item[] {
  const { t } = useLocale();
  // long: 푸터는 긴 이름(footerLabel, EN "CROSSING SEOUL")을 씁니다. 헤더와 폰 메뉴는 짧은 이름(EN "Home").
  const items: Item[] = dict.pages.map((p) => ({ key: p.key, href: p.href, label: t(long ? p.footerLabel : p.label), page: p.key as SitePage }));
  items.push({ key: "sponsor", href: naruLinks.sponsor, label: t(dict.siteMenu.sponsor), external: "mail" });
  if (includeChat && links.openChat) items.push({ key: "chat", href: links.openChat, label: t(dict.footerNav.openChat), external: "chat" });
  return items;
}

const LINK = "inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap underline-offset-[6px] transition-colors duration-150 hover:text-white hover:underline";

function MenuLink({ it, page, className, src }: { it: Item; page: SitePage; className: string; src: string }) {
  const here = it.page === page;
  const cls = `${LINK} ${className} ${here ? "font-bold text-white underline decoration-accent decoration-2" : ""}`;
  if (it.external === "chat") {
    return (
      <a href={it.href} target="_blank" rel="noopener noreferrer" onClick={() => track("openchat_click", { src })} className={cls}>
        <ChatGlyph className="h-3.5 w-3.5 shrink-0" />
        {it.label}
      </a>
    );
  }
  if (it.external === "mail") {
    return <a href={it.href} onClick={() => track("naru_mail", { src })} className={cls}>{it.label}</a>;
  }
  return (
    <Link href={it.href} aria-current={here ? "page" : undefined} onClick={() => track("page_chip", { from: page, to: it.key })} className={cls}>
      {it.label}
    </Link>
  );
}

/** 데스크톱 헤더의 사이트 메뉴(xl부터). 오픈채팅은 같은 줄의 버튼이 맡아 여기서는 넷입니다. */
export function SiteMenuBar({ page }: { page: SitePage }) {
  const { t, locale } = useLocale();
  const items = useItems(false);
  // 영문은 낱말이 길어 간격을 한 단 좁힙니다(1440 영문 홈에서 목차와 오픈채팅이 닿지 않게, 실측 2026-10-20).
  return (
    <nav aria-label={t(dict.siteMenu.aria)} className={`ml-4 hidden shrink-0 items-center xl:flex ${locale === "en" ? "gap-3" : "gap-4"}`}>
      {items.map((it) => <MenuLink key={it.key} it={it} page={page} src="site-menu" className="text-sm font-semibold text-white/85" />)}
    </nav>
  );
}

/** 폰과 태블릿의 메뉴 단추(xl 아래). 목차 레일 밖, 레일 왼쪽에 섭니다. 누르면 레일 아래에 메뉴 한 줄이 열립니다. */
export function SiteMenuButton({ open, onToggle, controls }: { open: boolean; onToggle: () => void; controls: string }) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={t(open ? dict.siteMenu.close : dict.siteMenu.open)}
      onClick={onToggle}
      className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center text-white/85 transition-[color,transform] duration-150 active:scale-[0.96] hover:text-white xl:hidden"
    >
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
      </svg>
    </button>
  );
}

export function SiteMenuSheet({ page, open, id, onClose }: { page: SitePage; open: boolean; id: string; onClose: () => void }) {
  const { t } = useLocale();
  const items = useItems(true);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <nav id={id} aria-label={t(dict.siteMenu.aria)} hidden={!open} className="border-y border-white/10 bg-[#070B1F]/95 px-5 pb-2 backdrop-blur-md sm:px-10 xl:hidden">
      <div className="flex flex-wrap items-center gap-x-5" onClick={onClose}>
        {items.map((it) => <MenuLink key={it.key} it={it} page={page} src="site-menu-phone" className={`${META} font-semibold text-white/85`} />)}
      </div>
    </nav>
  );
}

export function useSiteMenu() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return { open, id: `site-menu-${id.replace(/:/g, "")}`, toggle: () => setOpen((v) => !v), close: () => setOpen(false) };
}

// 8월에 실제로 함께한 곳 중 주소가 있는 열여섯(Journey.tsx의 로고 벽과 같은 주소). 학생회 셋은 주소가 없어 빠집니다.
const AUGUST_PARTNERS: { src: string; alt: string; w: number; h: number; url: string }[] = [
  { src: "translink.png", alt: "Translink Investment", w: 330, h: 91, url: "https://translinkinvestment.com" },
  { src: "wilt.png", alt: "Wilt Venture Builder", w: 309, h: 148, url: "https://www.wiltvb.com/" },
  { src: "codepresso.png", alt: "Codepresso", w: 456, h: 91, url: "https://codepresso.io" },
  { src: "popup-studio.png", alt: "Popup Studio", w: 512, h: 245, url: "https://popupstudio.ai" },
  { src: "drimaes.png", alt: "Drimaes", w: 332, h: 50, url: "https://www.drimaes.com" },
  { src: "aws.png", alt: "AWS", w: 512, h: 306, url: "https://aws.amazon.com/" },
  { src: "hashed.png", alt: "Hashed", w: 355, h: 90, url: "https://www.hashed.com/" },
  { src: "innovate360.png", alt: "INNOVATE 360", w: 455, h: 54, url: "https://innovate360.sg/" },
  { src: "life.png", alt: "L^IFE", w: 900, h: 352, url: "https://life-singapore.com/" },
  { src: "bzcf.png", alt: "BZCF", w: 465, h: 156, url: "https://bzcf.io/" },
  { src: "korean-association.png", alt: "Korean Association in Singapore", w: 443, h: 90, url: "https://singapore.korean.net/" },
  { src: "onword-lab.png", alt: "Onword Lab", w: 900, h: 92, url: "https://www.onwordlab.com/" },
  { src: "remited.png", alt: "REmited", w: 512, h: 105, url: "https://teamremited.com/" },
  { src: "brandboost.png", alt: "Brand Boost", w: 205, h: 81, url: "https://www.brandboost.kr/" },
  { src: "nuldam.png", alt: "Nuldam", w: 631, h: 136, url: "https://sg.nuldam.com/" },
  { src: "haenyeo-kitchen.png", alt: "Jeju Haenyeo", w: 316, h: 72, url: "https://www.jejuhaenyeosg.com/" },
];

/**
 * 세 페이지의 푸터 하나(hwang 브리프 4.2). 한 줄 소개, 사이트 메뉴(다섯)와 문의, 8월 파트너 로고 줄, 저작권, 배경 움직임 토글.
 * onMotionToggle: 8월 페이지는 같은 누름에 영상과 로고 띠도 멈춥니다.
 */
export function SiteFooter({ page, onMotionToggle }: { page: SitePage; onMotionToggle?: () => void }) {
  const { t } = useLocale();
  const items = useItems(true, true);
  return (
    <footer id="site-footer" className="relative w-full border-t border-white/10 px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <p className={`break-keep ${META} font-semibold text-white/85`}>{t(dict.siteFooter.line)}</p>
        <nav aria-label={t(dict.footerNav.aria)} className="flex flex-wrap items-center justify-center gap-x-5">
          {items.map((it) => <MenuLink key={it.key} it={it} page={page} src="footer" className={`${META} text-white/70`} />)}
          <a href={links.general} onClick={() => track("naru_mail", { src: "footer" })} className={`${LINK} ${META} text-white/70`}>
            {t(dict.footerNav.contact)}
          </a>
        </nav>
        <div className="flex w-full flex-col items-center gap-3">
          <p className={`${META} text-white/70`}>{t(dict.siteFooter.partners)}</p>
          <ul role="list" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {AUGUST_PARTNERS.map((p) => (
              <li key={p.src}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.alt} className="inline-flex min-h-[44px] items-center opacity-70 transition hover:opacity-100">
                  <Image src={`/partners/logos/white/trimmed/${p.src}`} alt="" width={p.w} height={p.h} unoptimized loading="lazy"
                    className="h-4 w-auto max-w-[5.5rem] object-contain" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className={`${META} text-white/70`}>{t(dict.siteFooter.rights)}</p>
        <span className="inline-flex" onClick={onMotionToggle}>
          <MotionToggle className="min-h-[44px] !text-white/70" />
        </span>
      </div>
    </footer>
  );
}
