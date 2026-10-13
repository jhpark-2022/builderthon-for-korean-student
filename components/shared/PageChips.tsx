"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { coreDict as dict, links, type Phrase } from "@/data/dictionaryCore";
import ChatGlyph from "@/components/ChatGlyph";

type Tfn = (p: Phrase) => string;
export type SitePage = "crossing" | "naru" | "aug";

// ─────────────────────────────────────────────────────────────────────────────
// 세 페이지(/, /naru, /2026-08)를 잇는 칩 셋과 푸터의 한 줄.
//
// DECIDED 2026-10-13 (등록 브리프 2.1, 리뷰 N1 N3 N4 N5 N7): 세 페이지의 헤더 같은 자리에 같은 칩 셋이 섭니다.
// 크로싱 서울, 나루, 8월 기록. 순서는 고정이고 현재 페이지 칩만 채웁니다(aria-current="page"). 화살표는 없습니다.
// 셋은 부모와 자식이 아니라 형제입니다. 그 전에는 /naru의 "← 크로싱 서울", /2026-08의 "← 나루"와 "12월 이벤트 →"가
// 서로 다른 계층을 말했고, 홈을 부르는 이름이 다섯이었습니다. 목적지는 언제나 각 페이지의 맨 위입니다.
// 라벨과 주소는 data/dictionaryCore.ts의 pages 한 곳에 있습니다.
// ─────────────────────────────────────────────────────────────────────────────
export function PageChips({ t, page, size = "bar" }: { t: Tfn; page: SitePage; size?: "bar" | "rail" }) {
  return (
    <>
      {dict.pages.map((p) => {
        const here = p.key === page;
        return (
          <Link
            key={p.key}
            href={p.href}
            aria-current={here ? "page" : undefined}
            onClick={() => track("page_chip", { from: page, to: p.key })}
            className={`inline-flex min-h-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border font-semibold transition active:scale-[0.97] ${
              size === "rail" ? "px-2.5 text-[0.75rem] backdrop-blur" : "px-3.5 text-sm"
            } ${here ? "border-accent/40 bg-accent/[0.12] text-white" : "border-white/15 bg-white/[0.04] text-white/75 hover:border-white/30 hover:text-white"}`}
          >
            {t(p.label)}
          </Link>
        );
      })}
    </>
  );
}

// 푸터의 한 줄(등록 브리프 2.3). 세 페이지가 같은 줄을 씁니다: 페이지 셋, 오픈채팅, 문의.
const FOOT_LINK = "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 text-white/70 underline-offset-4 transition hover:text-white hover:underline";
export function FooterNav({ t, page }: { t: Tfn; page: SitePage }) {
  return (
    <nav aria-label={t(dict.footerNav.aria)} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs">
      {dict.pages.map((p) => (
        <Link key={p.key} href={p.href} aria-current={p.key === page ? "page" : undefined} className={FOOT_LINK}>
          {t(p.footerLabel)}
        </Link>
      ))}
      {links.openChat && (
        <a href={links.openChat} target="_blank" rel="noopener noreferrer" onClick={() => track("openchat_click", { src: "footer-nav" })} className={FOOT_LINK}>
          <ChatGlyph className="h-3.5 w-3.5 shrink-0" />
          {t(dict.footerNav.openChat)}
        </a>
      )}
      <a href={links.general} onClick={() => track("naru_mail", { src: "footer" })} className={FOOT_LINK}>
        {t(dict.footerNav.contact)}
      </a>
    </nav>
  );
}
