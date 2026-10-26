"use client";

import Image from "next/image";
import { trackOpenChat } from "@/lib/openChatCount";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { coreDict as dict, links, type Phrase } from "@/data/dictionaryCore";
import { naruLinks } from "@/data/naru";
import { META } from "@/components/ui/typography";
import ChatGlyph from "@/components/ChatGlyph";
import MotionToggle from "@/components/ui/MotionToggle";
import PartnerMarquee from "@/components/shared/PartnerMarquee";
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
  // DECIDED 2026-10-22 (사용자: "후원 문의는 빼줘"): 헤더와 폰 메뉴에서 뺐습니다. 푸터(long)에는 남깁니다.
  if (long) items.push({ key: "sponsor", href: naruLinks.sponsor, label: t(dict.siteMenu.sponsor), external: "mail" });
  if (includeChat && links.openChat) items.push({ key: "chat", href: links.openChat, label: t(dict.footerNav.openChat), external: "chat" });
  return items;
}

const LINK = "inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap underline-offset-[6px] transition-colors duration-150 hover:text-white hover:underline";

function MenuLink({ it, page, className, src }: { it: Item; page: SitePage; className: string; src: string }) {
  const here = it.page === page;
  const cls = `${LINK} ${className} ${here ? "font-bold !text-accent underline decoration-accent decoration-2" : ""}`;
  if (it.external === "chat") {
    return (
      <a href={links.openChat} target="_blank" rel="noopener noreferrer" onClick={() => trackOpenChat(src)} className={cls}>
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

/** 메가 메뉴의 한 칸: 페이지 하나와 그 페이지의 목차. */
export type SitemapPage = { page: SitePage; anchors: { id: string; label: Phrase }[] };

/**
 * 사이트 메뉴(메가 메뉴). 현재 페이지 이름 하나(홈▾, 나루▾, 8월 기록▾)가 단추이고, 호버하거나 누르면 아래로 사이트맵이 펼쳐집니다.
 * DECIDED 2026-10-26 (사용자: "호버하면 핵심 타이틀뿐 아니라 서브메뉴가 떠서 사이트맵처럼"): 세 페이지가 칸 하나씩, 칸마다 페이지 제목과 그 목차.
 * 같은 페이지의 목차는 해시로, 다른 페이지는 그 페이지의 해시로 갑니다. 바깥을 누르거나 Esc, 링크를 누르면 닫힙니다.
 * 8월 페이지에서는 단추 이름 옆에 Zero100 워드마크가 작은 서브 로고로 섭니다(같은 날 사용자: "8월기록쪽 로고는 해당 타이틀 옆에 서브로고로").
 * DECIDED 2026-10-26 (같은 날 뒤, 사용자: "3칼럼 가로방향인데 세로로", "호버 위치와 핵심 타이틀이 대강 직선으로"): 세 페이지를 세로 한 줄로 쌓고,
 * 패널의 왼쪽 끝을 단추 왼쪽 끝에 맞춰 단추 글자와 페이지 제목들이 같은 세로선에 섭니다. 목차는 제목 오른쪽에 이어 붙습니다.
 * 같은 날 뒤(사용자: "좌측이 너무 좁아"): 패널 안쪽 왼쪽 여백 8 → 16px, 패널을 8px 왼쪽으로 내어 제목의 세로선은 그대로. 제목 칸 6.5 → 9.5rem, 패널 34 → 40rem.
 */
export function SiteMenu({ page, sitemap }: { page: SitePage; sitemap: SitemapPage[] }) {
  const { t } = useLocale();
  const items = useItems(false);
  const current = items.find((item) => item.page === page);
  const [open, setOpen] = useState(false);
  const id = `site-menu-${useId().replace(/:/g, "")}`;
  const box = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    const onDown = (event: PointerEvent) => { if (!box.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onDown); };
  }, [open]);
  return (
    <div
      ref={box}
      className="relative shrink-0"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse" && !box.current?.contains(document.activeElement)) setOpen(false); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${current?.label ?? ""}, ${t(open ? dict.siteMenu.close : dict.siteMenu.open)}`}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2 text-sm font-semibold transition-colors duration-150 hover:bg-white/[0.06] ${open ? "text-white" : "text-white/85"}`}
      >
        {current?.label}
        {page === "aug" && (
          <Image src="/partners/zero100-wordmark.png" alt="" width={602} height={127} className="h-3 w-auto opacity-70 brightness-0 invert" />
        )}
        <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {/* 패널 위의 pt-2는 단추와 패널 사이의 빈틈을 호버가 지나가도 닫히지 않게 하는 다리입니다. */}
      <div
        className={`absolute -left-2 top-full z-50 pt-2 transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
      >
        <nav id={id} aria-label={t(dict.siteMenu.aria)} className="card-raised w-[min(40rem,calc(100vw-40px))] rounded-xl py-2">
          <ul role="list" className="flex flex-col" onClick={() => setOpen(false)}>
            {sitemap.map((col) => {
              const item = items.find((it) => it.page === col.page);
              if (!item) return null;
              const here = col.page === page;
              return (
                <li key={col.page} className={`grid grid-cols-1 gap-x-8 px-4 py-1.5 sm:grid-cols-[9.5rem_1fr] ${here ? "bg-white/[0.03]" : ""}`}>
                  <MenuLink it={item} page={page} src="site-menu" className="text-sm font-bold text-white hover:no-underline" />
                  <ul role="list" className="flex flex-wrap gap-x-4 pb-1 sm:pb-0">
                    {col.anchors.filter((a) => a.id !== "top").map((a) => {
                      const href = here ? `#${a.id}` : `${item.href}#${a.id}`;
                      const cls = "inline-flex min-h-[36px] items-center text-sm text-naru-muted transition-colors hover:text-white";
                      return (
                        <li key={a.id}>
                          {here ? <a href={href} className={cls}>{t(a.label)}</a> : <Link href={href} onClick={() => track("page_chip", { from: page, to: `${col.page}#${a.id}` })} className={cls}>{t(a.label)}</Link>}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

/**
 * 세 페이지의 푸터 하나(hwang 브리프 4.2). 한 줄 소개, 사이트 메뉴(다섯)와 문의, 나루와 함께한 곳 로고 띠, 저작권, 배경 움직임 토글.
 * onMotionToggle: 8월 페이지는 같은 누름에 영상과 로고 띠도 멈춥니다.
 */
export function SiteFooter({ page, onMotionToggle }: { page: SitePage; onMotionToggle?: () => void }) {
  const { t } = useLocale();
  return (
    <footer id="site-footer" className="relative w-full border-t border-white/10 px-6 py-12 sm:px-10">
      {/* DECIDED 2026-10-22 (사용자, 스크린숏: "이 부분 빼줘"): 푸터의 한 줄 소개와 메뉴 줄(크로싱 서울, 나루, 8월 기록, 후원 문의, 오픈채팅, 문의)을 뺐습니다.
          헤더에 같은 메뉴가 있고, 오픈채팅은 하단 바와 헤더에 있습니다. */}
      {/* DECIDED 2026-10-21 (사용자, 스크린숏: "빼줘"): 크로싱 서울 홈에는 이 줄을 두지 않습니다. 바로 위 12월 "함께하는 곳"과 겹칩니다.
          DECIDED 2026-10-22 (사용자, 스크린숏: "지금까지 나루와 함께한 기업들 로고 다 이런 식으로"): 8월 로고 한 줄을
          8월 페이지의 카드 띠 모양으로 바꾸고 12월과 제로백 네트워크까지 담았습니다(PartnerMarquee). 띠는 화면 폭 전체입니다. */}
      {/* DECIDED 2026-10-22 (사용자, 스크린숏: "8월달에는 이거 빼줘"): 8월 페이지에도 띠를 두지 않습니다. /naru에만 섭니다. */}
      {page === "naru" && (
        <div className="-mx-6 flex flex-col items-center gap-5 sm:-mx-10">
          <p className={`${META} text-caption`}>{t(dict.siteFooter.partners)}</p>
          <PartnerMarquee />
        </div>
      )}
      {/* 2026-10-22 (모바일 점검: 홈 맨 아래 빈 공간): 위 로고 띠가 없는 페이지에서는 위 여백 없이. */}
      <div className={`mx-auto flex max-w-3xl flex-col items-center gap-5 text-center ${page === "naru" ? "mt-8" : ""}`}>
        <p className={`${META} text-caption`}>{t(dict.siteFooter.rights)}</p>
        <span className="inline-flex" onClick={onMotionToggle}>
          <MotionToggle className="min-h-[44px] !text-white/70" />
        </span>
      </div>
    </footer>
  );
}
