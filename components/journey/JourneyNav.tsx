"use client";

import Image from "next/image";
import { trackOpenChat } from "@/lib/openChatCount";
import { useEffect, useRef, useState } from "react";
import { decemberEventLabel } from "@/lib/naruDates";
import { useLocale } from "@/lib/LocaleContext";
import { coreDict as dict, links, type Phrase } from "@/data/dictionaryCore";
import LocaleToggle from "@/components/LocaleToggle";
import ChatGlyph from "@/components/ChatGlyph";
import type { SitePage } from "@/components/shared/PageChips";
import { SiteMenu, type SitemapPage } from "@/components/shared/SiteChrome";
import { naruNav, naruPageNav } from "@/data/naru";
import PageSwipe from "@/components/shared/PageSwipe";
// The one list every anchor UI reads: the desktop anchor row, the mobile/side
// section rail, and useActiveSection's IntersectionObserver all map over it, so
// a change here propagates everywhere. There is no second hardcoded list.
//
// DECIDED 2026-08-13 (안 A): nav 앵커 연사→멘토링 교체 - 참가자 클릭 가치 기준.
// 링크 8개 폭 예산 유지. 멘토링 챕터(3단계 멘토링 · 멘토진 · 피드백 패널)는 이
// 페이지에서 가장 큰 챕터인데 앵커가 없었고, #speakers는 프로그램 바로 다음이라
// 프로그램 앵커로 닿으며 연사 정보는 Day 카드에도 반복됩니다. #speakers 섹션은
// 그대로 있습니다 - 사라진 것은 앵커뿐입니다.
//
// DECIDED 2026-08-22 (Day 1): 트랙 공개 - 저지먼트, 오토메이션, 출제 기업
// 코드프레소. nav 앵커 참가 대상(#join) → 트랙(#tracks). 등록이 마감된 뒤로
// "참가 대상"은 클릭 가치가 다했고, 지금 이 페이지의 1순위 독자는 이미 들어온
// 참가자입니다. 배열 순서는 페이지 순서를 따라야 하므로 tracks는 benefits 뒤,
// program 앞에 옵니다 - #tracks 섹션이 바로 그 사이에 있습니다.
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
export type NavAnchor = {
  id: string;
  label: Phrase;
  /**
   * 폰 목차(레일)에서만 쓰는 줄바꿈 판. `\n`이 있는 자리에서 칩 안의 글자가 두 줄로
   * 섭니다. 없으면 label을 그대로 한 줄로 씁니다 (2026-09-19, 사용자).
   *
   * 왜 필요한가: 영어 "CROSSING SEOUL"은 138.6px이라 칩 하나가 폭 342px짜리 첫 줄의
   * 40%를 먹었습니다. 두 줄로 세우면 91.7px이 되고(칩 높이는 44px 그대로) 첫 줄이
   * 321px에서 283px로 내려갑니다. 한국어 "크로싱 서울"은 57.8px이라 판이 비어 있고,
   * 그래서 한 줄 그대로입니다. 자동 줄바꿈(whitespace-normal + max-width)으로는 안
   * 됩니다. flex 아이템의 폭이 max-content에서 정해져, 글자만 접히고 상자는 넓은
   * 채로 남습니다(실측).
   */
  railLines?: Phrase;
  /**
   * 링크의 접근 가능한 이름 (2026-09-19, 접근성 감사 19). 라벨이 한두 음절이라
   * 로터의 링크 목록에서 문맥 없이 읽히면 뜻이 없을 때 씁니다("왜" → "왜 이
   * 자리가 필요한가"). 눈으로 읽는 글자는 label 그대로입니다.
   */
  ariaLabel?: Phrase;
};

// REMOVED 2026-09-16: { id: "wrap", label: dict.wrap.navLabel }. 그 챕터가
// 페이지에서 내려갔습니다(Journey.tsx의 같은 날짜 주석). 앵커 id는 섹션 id와
// 반드시 짝이라, 섹션 없이 남으면 링크는 아무 데도 가지 않고 현위치 표시가
// 영영 켜지지 않습니다. 라벨 키는 dict.wrap.navLabel에 그대로 있습니다.
const DEFAULT_ANCHORS: NavAnchor[] = [
  // 2026-10-13: 앞의 네 챕터(결과, 취지, 참가, 혜택). id는 Journey.tsx의 섹션 id와 같습니다.
  // 2026-10-25: #results 판을 내려 "결과" 탭도 뺐습니다.
  { id: "about",     label: dict.nav.about },
  { id: "join",      label: dict.nav.join },
  { id: "benefits",  label: dict.nav.benefits },
  { id: "program",   label: dict.nav.program },
  { id: "speakers",  label: dict.nav.speakers },
  { id: "mentoring", label: dict.nav.mentoring },
  // The "For partners" pitch chapter (#why-partner) was removed, so this now
  // lands directly on the partner/logo wall.
  { id: "builders",  label: dict.nav.builders },
  // 2026-10-25: FAQ 챕터를 내려 탭도 뺐습니다.
];

// ─────────────────────────────────────────────────────────────────────────────
// WHERE AM I - the id of the anchor section currently occupying the viewport.
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
    // 2026-10-13 (폰 점검): 맨 위로 돌아오면 현위치를 비웁니다. 그 전에는 마지막 챕터의 칩이 맨 위에서도 켜져 있었습니다.
    if (!enabled) { setActive(null); return; }
    const nodes = anchors
      .map((a) => document.getElementById(a.id))
      .filter((n): n is HTMLElement => !!n);
    if (!nodes.length) return;
    // DECIDED 2026-10-13 (폰 점검): 현위치는 판정선(화면 높이의 35%, 적어도 140px)을 지난 마지막 항목입니다. 세 페이지 모두 같습니다.
    // 그 전에는 /naru만 이 방식이었고(2026-10-10, 구조 브리프 3.2) 홈과 /2026-08은 IntersectionObserver의 겹침 비율로
    // 골랐습니다. 그 비율은 문턱(0, 0.15, 0.4, 0.75)을 넘을 때만 갱신돼서, 칩으로 뛰어 내려간 직후에는 지나온 긴 챕터의
    // 묵은 값이 이겼습니다(8월 페이지에서 "파트너"를 눌렀는데 "멘토링"이 켜짐, 실측). 착지점은 74~209px이라 선 안입니다.
    // 항목 사이의 틈에서는 마지막 항목이 그대로 남습니다(전과 같음). 맨 위에서는 비웁니다.
    let raf = 0;
    const read = () => {
      raf = 0;
      let current: string | null = null;
      const line = Math.max(140, window.innerHeight * 0.35);
      for (const n of nodes) if (n.getBoundingClientRect().top <= line) current = n.id;
      setActive(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, anchors]);
  return active;
}

export default function JourneyNav({ anchors = DEFAULT_ANCHORS, page }: { anchors?: NavAnchor[]; page: SitePage }) {
  const { t, locale } = useLocale();
  const en = locale === "en";
  const activeSection = useActiveSection(true, anchors);
  // 가운데 목차가 바에 서는 폭. 왼쪽 묶음(로고 + 메뉴)과 오른쪽 묶음 사이에 들어가는 폭부터입니다. 그 아래는 바 아래 목차 줄.
  // 홈과 /naru는 한국어 xl, 영문은 낱말이 길어 1440. 8월은 로고가 길고 칸이 일곱이라 2xl, 영문 1800(2026-10-13 실측 기준을 이어받음).
  // 2026-10-26 (같은 날 뒤): 왼쪽은 크로싱 서울 워드마크 하나라 세 페이지 같은 폭입니다. 한국어 xl, 영문은 낱말이 길어 1440.
  const bp = en ? { row: "min-[1440px]:flex", rail: "min-[1440px]:hidden" } : { row: "xl:flex", rail: "xl:hidden" };
  // 메가 메뉴의 세 칸. 페이지마다 그 페이지의 목차를 그대로 씁니다(홈 data/naru.ts naruNav, /naru naruPageNav, 8월 이 파일의 DEFAULT_ANCHORS).
  // 2026-10-26 (naru-first): 홈(나루) / 크로싱 서울 / 8월 기록 순서(data/dictionaryCore.ts pages와 같음).
  const sitemap: SitemapPage[] = [
    { page: "naru", anchors: naruPageNav },
    { page: "crossing", anchors: naruNav },
    { page: "aug", anchors: DEFAULT_ANCHORS },
  ];
  const headerRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  // DECIDED 2026-10-26: 모든 페이지는 고정된 사이트 바와 목차 줄을 같은 높이로 씁니다.
  useEffect(() => {
    const root = document.documentElement;
    const measure = () => {
      const height = headerRef.current?.offsetHeight ?? 116;
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

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const current = rail.querySelector<HTMLElement>(`a[href="#${activeSection ?? "top"}"]`);
    if (current && rail.scrollWidth > rail.clientWidth + 1) {
      // 목차만 즉시 옮겨 현재 항목을 보여 주고, 문서는 움직이지 않습니다.
      rail.scrollLeft = current.offsetLeft - rail.clientWidth / 2 + current.offsetWidth / 2;
    }
  }, [activeSection]);

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

  const sectionLinks = anchors.filter((anchor) => anchor.id !== "top").map((anchor) => (
    <a key={anchor.id} href={`#${anchor.id}`} onClick={(event) => jump(event, anchor.id)} aria-label={anchor.ariaLabel ? t(anchor.ariaLabel) : undefined} aria-current={activeSection === anchor.id ? "location" : undefined} className={`inline-flex min-h-[44px] shrink-0 snap-start items-center whitespace-nowrap text-xs font-semibold underline-offset-4 xl:text-sm ${activeSection === anchor.id ? "text-accent underline decoration-2" : "text-naru-muted hover:text-white"}`}>{t(anchor.label)}</a>
  ));
  return (
    <>
      <header ref={headerRef} data-page={page} className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-naru-ink">
        <div className="relative flex h-[52px] items-center justify-between gap-3 px-5 sm:px-10 xl:h-20" style={{ paddingLeft: "calc(env(safe-area-inset-left, 0px) + 20px)", paddingRight: "calc(env(safe-area-inset-right, 0px) + 20px)" }}>
          {/* DECIDED 2026-10-26 (사용자: "크로싱 서울 로고가 메인으로 항상 있어야 해", "홈 메뉴와 서브메뉴가 중앙에 순서대로 붙은 레이아웃이 좋았어"):
              바 왼쪽은 세 페이지 모두 크로싱 서울 워드마크 하나(brand 6장 표기 C, 홈이 아니면 홈으로 가는 링크). 바 가운데는 페이지 메뉴(홈▾, 메가 메뉴) | 목차가
              한 묶음으로 붙어 섭니다. 8월의 Zero100은 메뉴 이름 옆 서브 로고입니다(SiteMenu). 그 폭 아래에서는 메뉴가 워드마크 옆, 목차는 바 아래 줄. */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* DECIDED 2026-10-26 (사용자, 외부 리뷰: 홈은 나루, 그 밑에 12월. docs/naru-first-brief.md 1.4): 위 10/26 "세 페이지 모두 크로싱 서울 워드마크"를
                되돌립니다. 크로싱 서울 페이지(/crossing)만 크로싱 서울 글자 워드마크(brand 6장 표기 C), 홈(나루)과 8월 기록은 나루 가로 락업(이름만, 반전).
                락업은 5360254 전의 것 그대로입니다(한글 PNG, 영문 SVG, 영문은 한글 높이의 142/168, 로고 가이드: 비율, 색, 회전, 그림자 금지).
                지금 페이지면 #top, 아니면 홈(/)으로. */}
            {page === "crossing" ? (
            <a href="#top" className="-my-1 flex min-h-[44px] shrink-0 items-center py-1 leading-none">
              <span lang={en ? "en" : undefined} className={`whitespace-nowrap pb-[0.08em] font-black tracking-[-0.02em] text-white ${en ? "text-sm sm:text-xl xl:text-2xl" : "text-xl sm:text-2xl xl:text-3xl"}`}>
                {decemberEventLabel(locale)}
              </span>
            </a>
            ) : (
            <a href={page === "naru" ? "#top" : "/"} className="-my-1 flex min-h-[44px] shrink-0 items-center py-1 leading-none">
              <Image
                src={en ? "/naru/naru-name-en-rev.svg" : "/naru/naru-name-rev.png"}
                alt={en ? "NARU" : "나루 NARU"}
                width={en ? 857 : 604}
                height={en ? 142 : 168}
                unoptimized={en}
                priority
                className={en ? "h-[1rem] w-auto min-[360px]:h-[1.1rem] min-[380px]:h-[1.35rem] min-[430px]:h-[1.69rem] sm:h-[1.9rem]" : "h-6 w-auto min-[360px]:h-7 min-[380px]:h-8 sm:h-9"}
              />
            </a>
            )}
            {/* 폰(sm 아래)에서는 메뉴가 바 아래 목차 줄 맨 앞으로 내려갑니다(아래). 360px 영문에서 워드마크 + 메뉴 + 오픈채팅 + EN/KR이 한 줄을 넘었습니다(계산 약 385px). */}
            <div className={`hidden sm:block ${bp.rail}`}>
              <SiteMenu page={page} sitemap={sitemap} />
            </div>
          </div>
          <div className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-4 ${bp.row}`}>
            <SiteMenu page={page} sitemap={sitemap} />
            <span aria-hidden className="h-5 w-px shrink-0 bg-white/20" />
            <nav aria-label={t(dict.nav.sectionsAria)} className="flex items-center gap-5">{sectionLinks}</nav>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {links.openChat && (
              <a href={links.openChat} target="_blank" rel="noopener noreferrer" aria-label={t({ ko: "오픈채팅, 카카오톡 새 창", en: "Open chat, KakaoTalk, new window" })} onClick={() => trackOpenChat("nav")} className="cta-shimmer inline-flex h-9 min-w-[36px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-accent-gradient px-3 text-xs font-semibold text-[#fff] transition-[filter] duration-150 hover:brightness-110 max-[419px]:w-9 max-[419px]:px-0 xl:text-sm">
                <ChatGlyph className="block h-4 w-4" />
                <span className="max-[419px]:sr-only">{t(dict.nav.openChat)}</span>
              </a>
            )}
            {/* 2026-10-26 (사용자: "카카오 아이콘버튼도 옆 언어들과 안맞아", 이어서 "카카오를 줄이란 의미"): 오픈채팅을 언어 단추 크기로 줄이고 둘 다 36px 알약,
                같은 글자(xs, xl부터 sm). 폰(420px 아래)의 오픈채팅은 36px 원. */}
            <LocaleToggle className="h-9 !min-h-0 !py-0 xl:text-sm" />
          </div>
        </div>
        {/* DECIDED 2026-10-26 (사용자: 올리기 전 모바일 손보기): 폰의 목차 줄은 [홈▾ | 목차]. 메뉴는 가로로 굴러가는 칸 밖에 있어 펼친 사이트맵이 잘리지 않습니다. */}
        <div className={`flex items-center border-t border-white/[0.06] ${bp.rail}`}>
          <div className="shrink-0 pl-3 sm:hidden">
            <SiteMenu page={page} sitemap={sitemap} />
          </div>
          <span aria-hidden className="h-5 w-px shrink-0 bg-white/15 sm:hidden" />
          <nav aria-label={t(dict.nav.sectionsAria)} className="min-w-0 flex-1">
            {/* DECIDED 2026-10-26 (사용자: "모바일에서 홈 옆 서브메뉴가 잘리는 경우 방지"): 목차가 화면을 넘으면 양끝을 흐려(왼쪽 16px, 오른쪽 40px) 더 있다는 것을 보이고,
                칸이 글자 중간에서 끊기지 않게 칸 단위로 멈춥니다(snap). 끝 칸이 흐림 밖으로 나오도록 오른쪽 여백 40px. 지금 칸은 가운데로 옮겨집니다(위 effect). */}
            <div ref={railRef} className="relative flex min-h-[48px] snap-x snap-proximity scroll-px-4 items-center gap-4 overflow-x-auto pl-4 pr-10 [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%_-_40px),transparent)] [scrollbar-width:none] sm:px-10 lg:justify-center lg:[mask-image:none] [&::-webkit-scrollbar]:hidden">{sectionLinks}</div>
          </nav>
        </div>
      </header>
      <PageSwipe page={page} />
    </>
  );
}
