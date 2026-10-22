"use client";

import Image from "next/image";
import { trackOpenChat } from "@/lib/openChatCount";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// AnimatePresence와 motion은 등록 필이 있던 동안만 쓰였습니다 (2026-08-22 청산).
// useReducedMotion은 헤더 자체의 전환에 여전히 필요합니다.
import { useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { coreDict as dict, links, type Phrase } from "@/data/dictionaryCore";
import { useRegisterOptional } from "@/lib/RegisterContext";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { isScrollLocked } from "@/lib/useBodyScrollLock";
import LocaleToggle from "@/components/LocaleToggle";
import MotionToggle from "@/components/ui/MotionToggle";
import ChatGlyph from "@/components/ChatGlyph";
import type { SitePage } from "@/components/shared/PageChips";
import { SiteMenuBar, SiteMenuButton, SiteMenuSheet, useSiteMenu } from "@/components/shared/SiteChrome";
import { decemberEventLabel } from "@/lib/naruDates";
import dynamic from "next/dynamic";
// DECIDED 2026-10-08 (성능 리뷰 4): 인사 칩은 퀴즈 결과 표(data/quiz의 RESULTS, gzip 약 22KB)를 끌고 옵니다.
// 홈은 이 칩을 쓰지 않는데(showQuiz=false) 헤더를 같이 쓰느라 그 표까지 받았습니다. 칩은 저장된 결과가
// 있을 때 마운트 뒤에야 나타나므로, 따로 받아도 화면이 달라지지 않습니다.
const ReturningGreeting = dynamic(() => import("./ReturningGreeting"), { ssr: false });

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
  { id: "results",   label: dict.nav.results },
  { id: "about",     label: dict.nav.about },
  { id: "join",      label: dict.nav.join },
  { id: "benefits",  label: dict.nav.benefits },
  { id: "program",   label: dict.nav.program },
  { id: "speakers",  label: dict.nav.speakers },
  { id: "mentoring", label: dict.nav.mentoring },
  // The "For partners" pitch chapter (#why-partner) was removed, so this now
  // lands directly on the partner/logo wall.
  { id: "builders",  label: dict.nav.builders },
  { id: "faq",       label: dict.nav.faq },
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

export default function JourneyNav({
  anchors = DEFAULT_ANCHORS,
  brand = "zero100",
  showQuiz = true,
  page,
  mark = "lockup",
}: {
  // DECIDED 2026-10-13 (등록 브리프 2.1): 지금 어느 페이지인가. 로고 옆(xl부터)과 레일 맨 앞(xl 아래)의 페이지 칩 셋이 읽습니다.
  // 그 전의 back(/naru의 "← 크로싱 서울" 알약)과 8월 페이지의 "12월 이벤트 →" 알약은 이 칩 셋이 대신합니다.
  page: SitePage;
  // DECIDED 2026-10-10 (구조 브리프 2.4, D2): 홈(/)의 헤더 왼쪽은 나루 락업이 아니라 크로싱 서울 워드마크입니다.
  // 두 이름이 한 화면에 로고로 같이 서는 것이 혼동의 절반이었습니다. 나루 락업은 /naru에서만 씁니다.
  // brand="naru"일 때만 봅니다. 기본값 "lockup"은 전과 같습니다.
  mark?: "lockup" | "crossing";
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
  const menu = useSiteMenu();
  const reduce = useReducedMotion();
  // registered 하나만 읽습니다. 8월에 이 기기에서 등록했던 방문자에게 오픈채팅
  // 버튼의 톤을 올려 주는 플래그입니다(lib/RegisterContext.tsx).
  // 나루 홈에는 RegisterProvider가 없으므로(등록 없음) null이 올 수 있습니다.
  const registered = useRegisterOptional()?.registered ?? false;
  const [scrolled, setScrolled] = useState(false);
  // Only observe once the rail exists - before that there is nothing to mark,
  // and the observer would run through the whole hero for nobody.
  const activeSection = useActiveSection(scrolled, anchors);
  // 나루 홈(2026-09-18, 모바일 수정 브리프 7): 칩 일곱이 390px에 들어가지 않아 현위치 칩이
  // 레일 밖에 있을 수 있습니다. 현위치가 바뀌면 그 칩을 레일 가운데로 스크롤합니다(레일만,
  // 페이지는 움직이지 않음). 8월 페이지는 그대로(brand 조건).
  const railRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // 2026-10-13 (폰 점검): 현위치가 비면(맨 위) 레일을 처음으로 되돌려 페이지 칩 셋이 다시 보이게 합니다.
    if (!activeSection) { railRef.current?.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" }); return; }
    if (!railRef.current) return;
    // 2026-09-19: 홈 레일은 접히므로 가로로 넘칠 것이 없습니다. 넘치지 않으면
    // 아무것도 하지 않습니다(문서를 건드리지 않게).
    if (railRef.current.scrollWidth <= railRef.current.clientWidth + 1) return;
    const chip = railRef.current.querySelector<HTMLElement>(`a[href="#${activeSection}"]`);
    if (!chip) return;
    // 감사 반영 브리프 2.2: 활성 칩을 레일 가운데로. block:nearest라 문서는 움직이지 않습니다.
    chip.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [activeSection, reduce]);
  // Shared with the bottom bars and the back-to-top button (lib/useScrollDirection):
  // on a phone this header is two rows tall and, together with the bottom rail,
  // was taking a quarter of an in-app browser's viewport. Scrolling DOWN - the
  // gesture that means "show me more page" - slides it out; scrolling up brings
  // it straight back. Desktop is untouched: the translate only applies below lg.
  //
  // DECIDED 2026-08-17: 여기에 "멈추면 돌아온다"가 더해졌습니다. 스크롤이 0.9초
  // 멎으면 훅이 스스로 false로 돌아오므로, 읽으려고 멈춘 사람이 등록 버튼을
  // 다시 보려고 위로 긁을 필요가 없습니다. 그 규칙은 훅이 갖고 있고 이 컴포넌트는
  // 그대로 구독만 합니다 - 여기에 별도 타이머를 만들지 마세요. 네 표면이 한 몸으로
  // 움직이는 이유가 신호가 하나라는 점입니다.
  // 나루 홈(감사 반영 브리프 2.1): 아래로 스크롤하면 로고 줄(52px)만 접고 칩 레일은 남깁니다. 위로
  // 스크롤해야 돌아오고, 멈춰 있다고 돌아오지 않습니다(idleReveal false). 8월 페이지는 그 전
  // 그대로(헤더 전체 숨김 + 정지 시 복귀).
  const naru = brand === "naru";
  const directionHidden = useScrollDirection({ idleReveal: naru ? false : 450 });
  const [anchorPinned, setAnchorPinned] = useState(false);
  const chromeHidden = directionHidden && !anchorPinned;
  // DECIDED 2026-10-21: 앵커 이동 중에는 헤더를 펼쳐 착지 여백이 바뀌지 않게 합니다. 직접 스크롤하면 다시 접힙니다.
  useEffect(() => {
    if (!naru || !anchorPinned) return;
    const release = () => setAnchorPinned(false);
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) release();
    };
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", onKey);
    };
  }, [naru, anchorPinned]);
  const headerRef = useRef<HTMLElement | null>(null);
  // DECIDED 2026-10-21: 펼친 헤더의 실높이를 예약합니다. 접힘 전환 도중에도 앵커 목적지가 고정됩니다.
  // 8월 페이지는 globals.css의 기존 고정값을 따릅니다.
  useEffect(() => {
    if (!naru) return;
    const root = document.documentElement;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const h = headerRef.current;
      if (!h) return;
      root.style.scrollPaddingTop = `${h.offsetHeight + 12}px`;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };
    // 즉시 한 번 (2026-09-19, 접근성 감사 23). 350ms 타이머만 있으면 그 전에
    // Tab이나 앵커 점프가 일어났을 때 globals.css의 고정값 120px이 쓰입니다.
    // 영어 두 줄 헤더는 158px이라 38px이 모자라 착지점이 헤더 뒤로 들어갑니다.
    // 타이머는 그대로 둡니다. 서체가 늦게 오면 높이가 한 번 더 바뀝니다.
    apply();
    const timer = window.setTimeout(apply, 350);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (headerRef.current && ro) ro.observe(headerRef.current);
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.clearTimeout(timer);
      ro?.disconnect();
      window.removeEventListener("resize", schedule);
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
      setAnchorPinned(true);
      const labelId = target.getAttribute("aria-labelledby")?.split(/\s+/)[0];
      const heading = (labelId ? document.getElementById(labelId) : null)
        ?? (target.matches("h1,h2,h3") ? target : target.querySelector("h1:not(.sr-only),h2:not(.sr-only),h3:not(.sr-only)"))
        ?? target;
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      heading.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      // 포커스도 옮깁니다 (2026-09-19, 접근성 감사 1). preventDefault()를 하면
      // 브라우저가 기본 동작에서 해 주던 "순차 포커스 시작점 이동"이 사라집니다.
      // 그대로 두면 VoiceOver로 목차 칩을 눌러도 커서가 헤더에 남아 스와이프하면
      // 다시 헤더부터 읽고, "본문으로 건너뛰기"를 눌러도 다음 Tab이 헤더입니다.
      // 이 페이지의 유일한 우회 수단(2.4.1)이 아무 일도 하지 않게 됩니다.
      //
      // preventScroll: 위에서 이미 scrollIntoView로 부드럽게 옮기는 중이라,
      // focus()가 다시 튀게 두면 그 애니메이션을 잘라먹습니다.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      (target as HTMLElement).focus({ preventScroll: true });
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
    // not in every context - a backgrounded tab coalesces them away. Since that
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
  // DECIDED 2026-10-13 (사용자: "TOC 수가 너무 적음"): 챕터 링크가 늘어 로고 줄에 서는 폭을 실측으로 다시 정했습니다.
  // 한국어는 전과 같습니다(홈과 /naru는 xl, 8월 페이지는 2xl). 영문은 낱말이 길어 같은 폭에서 오픈채팅 버튼과 겹칩니다
  // (홈 1280~1536에서 9px 겹침). 그래서 영문 홈은 한 단 넓은 폭(1728)부터, 영문 /naru는 2xl부터 서고, 그 아래에서는 레일이 맡습니다.
  // 줄과 레일은 같은 폭에서 바뀌어야 합니다(둘 다 서거나 둘 다 없으면 안 됩니다).
  // 8월 페이지의 영문 아홉 칸도 1536에서 오픈채팅 버튼과 붙어(실측 간격 0, 1728에서 6px) 1800부터 섭니다. 그 사이(1536~1799)에는 레일이
  // 남으므로, 배너의 위 여백(ArchiveBanner)과 scroll-padding(globals.css의 html[lang="en"] 규칙)이 같은 폭에서 따라 바뀝니다.
  const en = locale === "en";
  // DECIDED 2026-10-20 (hwang 브리프 2.14, 1.3, 감사 W7): 영문도 한국어와 같은 폭에서 한 줄이 됩니다(홈과 /naru는 xl, 8월은 그대로).
  // 그 전에는 영문 홈 1728, /naru 2xl부터였고 1440 영문 헤더가 두 줄이었습니다. 페이지 칩이 글자 메뉴가 되고 EN 문자열이 짧아져 들어갑니다.
  const anchorRowAt = en && !naru
    ? { row: "min-[1800px]:ml-6 min-[1800px]:flex", rail: "min-[1800px]:hidden" }
    : naru && en && anchors.length > 4
      // 영문 홈은 낱말이 길어 xl(1280)에서 목차 끝이 오픈채팅과 겹쳐(실측) 1440부터입니다. 영문 /naru는 xl에서 들어갑니다.
      ? { row: "min-[1440px]:ml-4 min-[1440px]:flex", rail: "min-[1440px]:hidden" }
      : naru
      ? { row: "xl:ml-6 xl:flex", rail: "xl:hidden" }
      : { row: "2xl:ml-6 2xl:flex", rail: "2xl:hidden" };
  return (
    <>
      <header
      ref={headerRef}
      // focus-within pins it open: a keyboard user tabbing into the nav must not
      // have it slide away under them. `lg:!translate-y-0` keeps the desktop bar
      // fixed in place no matter what the scroll signal says.
      // DECIDED 2026-10-11 (리뷰 A1): 나루 계열 헤더(홈, /naru)는 focus-within이 아니라 :has(:focus-visible)에 반응합니다.
      // 폰에서 접힌 헤더(-52px)의 칩을 탭하면 탭 순간 포커스가 들어와 헤더가 내려오고, 손가락 아래의 칩이 사라져 첫 탭이
      // 빈 헤더에 떨어졌습니다(같은 자리의 둘째 탭은 오픈채팅). 키보드 포커스에만 펼칩니다. 8월 페이지는 그대로.
      // --nav-gutter: 아래 <nav>가 인라인 style로 safe-area를 더해야 해서
      // px-6 / sm:px-10을 변수로 옮겼습니다. 여기서 인라인 style을 쓰면 sm 분기가
      // 죽으므로(인라인이 클래스를 이깁니다) 클래스로만 정의합니다.
      className={`fixed inset-x-0 top-0 z-50 [--nav-gutter:1rem] min-[360px]:[--nav-gutter:1.5rem] ${naru ? "[&:has(:focus-visible)]:translate-y-0" : "focus-within:translate-y-0"} sm:[--nav-gutter:2.5rem] lg:!translate-y-0 ${
        reduce ? "" : naru ? "transition-[transform,background-color] duration-200" : "transition-all duration-300 lg:duration-500"
      // DECIDED 2026-08-23 (박주형): /85 → /95. 스크롤하면 헤더 뒤로 본문이 -
      // 특히 파트너 로고 월이 - 비쳐 보였습니다. 15%가 통과하고 있었어요.
      //
      // backdrop-blur에만 기대면 안 됩니다. blur는 뒤를 흐릴 뿐 가리지 않아서,
      // 로고처럼 대비가 큰 것은 흐려진 채로 그대로 읽힙니다. 어두운 단색이 기본이고
      // blur는 보조입니다.
      //
      // 두 줄(로고 줄 + 섹션 레일)은 이미 이 배경 하나를 함께 씁니다 - 실측 105px =
      // nav 52 + 레일 53이라 줄 사이에 빈 틈이 없습니다. 여기서 갈라 두지 마세요.
      } ${scrolled ? "bg-[#070B1F]/95 backdrop-blur-md" : "bg-transparent"} ${
        // 로고 줄(52px)만 접고 목차 줄은 남깁니다(감사 반영 브리프 2.1). 레일이 없는 첫 화면
        // 근처(scrolled false)에서는 topZone이 먼저 막아 hidden이 되지 않습니다.
        //
        // 2026-09-20: 나루 홈만 이랬던 것을 8월 아카이브까지 넓혔습니다. 8월은
        // 아래로 스크롤하면 헤더 전체가 사라져서, 목차도 12월 버튼도 위로 긁어야
        // 나왔습니다. 사용자가 원한 것은 "항상 보이는 것"입니다. 대가는 폰에서
        // 53px이 상주하는 것이고, 홈이 이미 치르고 있는 값입니다.
        // 2026-10-13 (등록 브리프 2.2): 레일이 스크롤 0부터 있으므로 맨 위에서도 로고 줄만 접습니다(그 전에는 헤더 전체).
        chromeHidden ? "-translate-y-[52px]" : "translate-y-0"
      }`}
    >
      {/* 52px in the two-row band, h-20 from xl: the tall bar was designed for a
          desktop row of seven anchor links, but below that it carries a logo, a
          chip or two and the language toggle - and it sits above a second row.
          Together with the rail's tightened padding this takes the two-row header
          from ~145px to ~105px - about a quarter of that chrome back. Touch
          targets inside are unchanged (44px minimums), and the nav CTAs that
          appear from lg are ~43px tall, so they still clear the 52px bar.
          Tracks the anchor row's breakpoint (`lg` → `xl`, 2026-08-03) so the bar
          is tall exactly when it has a row of links to hold - and so
          scroll-padding-top in globals.css only ever needs two bands. */}
      {/* aria-label: 이름 없는 nav가 둘이면 iOS 로터에 "탐색, 탐색"으로 뜹니다
          (2026-09-19, 접근성 감사 4). 아래 칩 레일이 두 번째입니다.
          safe-area (모바일 감사 19): 세로 모드에서는 뷰포트가 노치 아래에서
          시작해 문제가 없지만, 가로 모드에서는 inset-left/right가 44px씩 생겨
          로고와 언어 토글이 노치 아래로 들어갑니다. px-6/sm:px-10을 그대로 두고
          거기에 더합니다. */}
      <nav
        aria-label={t(dict.nav.primaryAria)}
        className="flex h-[52px] w-full items-center justify-between xl:h-20"
        style={{
          paddingLeft: "calc(env(safe-area-inset-left, 0px) + var(--nav-gutter))",
          paddingRight: "calc(env(safe-area-inset-right, 0px) + var(--nav-gutter))",
        }}
      >
        {/* LEFT group - brand logo + anchor links, kept together on the left edge. */}
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
            // -my-1 py-1: 히트 영역만 44px로 (2026-09-19, 모바일 감사 6).
            // 이미지가 h-8(36px)뿐이라 맨 위로 돌아가는 관용 동작이 8px 모자랐습니다.
            // 음수 마진으로 52px 바 안의 세로 정렬은 그대로 둡니다. 로고 가이드의
            // 비율·색은 건드리지 않습니다. 상자만 키웁니다.
            // DECIDED 2026-09-29 (사용자: "맨위 TOC랑 있는 나루는 맨 왼쪽 like how it was like previously"):
            // 헤더의 로고는 바 왼쪽 끝, 메뉴는 그 옆입니다. 같은 날 앞서 넣었던 "바 한가운데"(f3e12a6)를
            // 되돌린 것입니다. 홈 본문의 #naru 인장과 푸터 로고는 그대로 가운데입니다.
            mark === "crossing" ? (
            // 히어로 제목과 같은 글자, 같은 그라데이션(naru-logo-from → to). 로고 파일이 아니라 글자입니다.
            <a href="#top" className="-my-1 flex min-h-[44px] items-center py-1 leading-none">
              {/* DECIDED 2026-10-11 (브랜드 브리프 B7, docs/brand.md의 표기 B): 홈 헤더의 워드마크는 두 로케일 모두 영문 "CROSSING SEOUL" 단독입니다.
                  그 전에는 한국어 화면에서 국문 "크로싱 서울" 단독이었는데, 정본의 표기는 A(국문과 영문 락업)와 B(영문 단독) 둘뿐입니다.
                  히어로의 큰 로고는 표기 A 그대로입니다. 같은 그라데이션이고, 크기는 영문 화면이 쓰던 값입니다(sm부터는 전과 같은 크기,
                  그 아래에서는 글자 수가 두 배라 전의 영문 화면처럼 작게 둡니다). */}
              {/* DECIDED 2026-10-12 (사용자, 스크린숏: "한국어 버전에서는 crossing seoul이 아니고 크로싱 서울"): 위의 결정을 한국어 화면에서 되돌립니다.
                  한국어 화면의 헤더 워드마크는 국문 "크로싱 서울" 단독, 영문 화면은 영문 "CROSSING SEOUL" 단독입니다(docs/brand.md의 표기 C).
                  크기도 10월 11일 전의 값으로 돌아갑니다. 한글은 글자 수가 절반이라 폰에서도 크게 둡니다. */}
              {/* DECIDED 2026-10-20 (사용자, hwang 브리프 3.5, 감사 W2): 헤더 워드마크는 단색 흰색. 4색 그라데이션은 히어로의 큰 로고 하나에만 남깁니다
                  (폰 첫 화면에 같은 그라데이션 글자가 둘 서지 않게). */}
              <span lang={locale === "en" ? "en" : undefined} className={`whitespace-nowrap pb-[0.08em] font-black tracking-[-0.02em] text-white ${
                // DECIDED 2026-10-10 (사용자, 스크린숏: "크로싱 서울 로고가 더 크게 보였으면"): text-xl(22.5px)에서 키웠습니다.
                // 52px 바에서는 2xl(27px), 80px 바(xl부터)에서는 3xl(33.75px)로 전의 나루 락업(36~40px)과 비슷한 무게입니다.
                // 영문 "CROSSING SEOUL"은 글자 수가 두 배라 폰에서는 작게 둡니다(390px에서 오른쪽 버튼과 28px, 360px에서도 닿지 않게).
                // 한국어도 360px 아래에서는 한 단 작습니다. sm(640px)부터는 두 로케일이 같은 크기입니다.
                // 2026-10-13: 영문은 페이지 칩 셋이 로고 옆에 서는 xl~1399px에서 한 단 작게 둡니다(1280에서 왼쪽과 오른쪽 묶음이 0px로 닿았습니다).
                // 2026-10-13 (폰 점검): 360px 아래에서는 한 단 더 작게(320에서 오른쪽 묶음이 여백 안으로 23px 들어왔습니다).
                // 2026-10-20 (hwang 브리프 2.14): 영문은 목차가 같은 줄에 서는 1440~1599에서 한 단 작게(실측 넘침), 1600부터 3xl.
                locale === "en" ? "text-[0.7rem] min-[360px]:text-xs min-[390px]:text-sm sm:text-2xl min-[1600px]:text-3xl" : "text-lg min-[360px]:text-2xl xl:text-3xl"
              }`}>
                {decemberEventLabel(locale)}
              </span>
            </a>
            ) : (
            <a href="#top" className="-my-1 flex min-h-[44px] items-center py-1 leading-none">
              {/* 영문 화면에서는 이름도 영문입니다 (DECIDED 2026-09-21, 사용자:
                  "영어 버전에서도 로고 옆은 NARU여야 하고, 대문자로").
                  한글 락업은 PNG인데(public/naru/README.md: 원본 SVG의 "나루"가
                  <text>라 방문자 기기의 한글 서체를 부릅니다) 영문 판은 SVG입니다.
                  Montserrat ExtraBold를 패스로 outline해 두어서 부를 서체가
                  없습니다. 심볼 기하와 색은 원본 그대로고, 글자만 바뀝니다. */}
              <Image
                src={locale === "en" ? "/naru/naru-name-en-rev.svg" : "/naru/naru-name-rev.png"}
                alt={locale === "en" ? "NARU" : "나루 NARU"}
                width={locale === "en" ? 857 : 604}
                height={locale === "en" ? 142 : 168}
                // SVG는 이미지 최적화를 태우지 않습니다. 벡터라 리샘플할 것이 없고,
                // Next의 옵티마이저는 SVG에 400을 돌려줍니다(파트너 로고도 같은 이유로
                // unoptimized입니다. Journey.tsx의 로고 타일 참고).
                unoptimized={locale === "en"}
                priority
                // DECIDED 2026-09-23 (사용자: "영어 버전이 더 큼. 동일해야지"): 두 파일의 여백이
                // 다릅니다. 한글 PNG는 높이 168px 중 심볼이 142px이고(위 26px이 여백), 영문 SVG는
                // 심볼 높이가 곧 파일 높이입니다. 같은 h-9로 두면 영문 심볼이 18% 크게 그려졌습니다.
                // 그래서 영문은 한글 높이의 142/168로 둡니다. h-8(2rem) → 1.69rem, h-9(2.25rem) → 1.9rem.
                // px가 아니라 rem인 것이 요점입니다. 루트 글자 크기가 화면에 따라 바뀌어 h-9가
                // 데스크톱에서 40.5px이 되므로, px로 박으면 두 락업이 다시 어긋납니다.
                // 2026-10-13 (폰 점검): 좁은 폰에서는 한두 단 작게 둡니다. 영문 락업은 가로가 길어 390px에서도 오픈채팅 알약과 0px로 닿았고,
                // 한글 락업은 360px에서 6px이었습니다. 360px 아래(320px 화면)에서는 한 단 더 작습니다. 비율과 색은 그대로이고 높이만 바뀝니다.
                className={locale === "en" ? "h-[1rem] w-auto min-[360px]:h-[1.1rem] min-[380px]:h-[1.35rem] min-[430px]:h-[1.69rem] sm:h-[1.9rem]" : "h-6 w-auto min-[360px]:h-7 min-[380px]:h-8 sm:h-9"}
              />
            </a>
            )
          ) : (
            <a href="#top" className="mr-2 flex items-center gap-2.5 leading-none">
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
                // 360px 아래에서는 한 단계 작게(2026-10-08): 320 폭에서 로고 오른쪽 끝과
                // 퀴즈 알약이 0px로 붙어 있었습니다. 위 mr-2와 함께 틈을 만듭니다.
                // 2026-10-13: 언어 토글이 두 버튼이 되어 17px 넓어졌습니다. 작은 로고를 380px 아래까지 씁니다(360에서 0px로 닿았습니다).
                className="h-[1.1rem] w-auto opacity-90 brightness-0 invert min-[360px]:h-5 min-[380px]:h-6 min-[430px]:h-7 sm:h-8"
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
                  appears, and the EN labels are the longer set - "AI Builderthon"
                  is 163px against "AI 빌더톤"'s 89px, and the EN anchor row is
                  577px against 509px. Measured with the suffix forced on: at 1400
                  the two nav groups touch (0px between them) and the lockup still
                  overflows its own flex item by 18px, at 1440 the gap is 15px, at
                  1500 it is 75px. Below that the lockup printed on top of the first
                  two links; the zero100 wordmark alone carries the brand there.
                  KR fits from `xl` with 42px to spare, so it needs no second band.
                  Re-measure before touching 1500 - it is the EN row width, not a
                  round number. 
                  2026-10-13: 1500 → 1700. 페이지 칩 셋이 로고 옆에 서면서 1536에서 두 묶음 사이가 6px이었습니다(실측). */}
              <span className={`hidden items-center whitespace-nowrap text-lg font-black leading-none tracking-wide text-white/85 sm:inline-flex sm:text-xl ${locale === "ko" ? "translate-y-[2px]" : "xl:hidden min-[1700px]:inline-flex"}`}>{t(dict.nav.brandSuffix)}</span>
            </a>
          )}
          {/* DECIDED 2026-10-20 (사용자, 스크린숏: "여기서 by 나루는 빼고"): hwang 브리프 4.3의 헤더 바이라인은 넣지 않습니다. 8월 OG의 나루 락업은 그대로. */}
          {/* DECIDED 2026-10-20 (hwang 브리프 4.1, 감사 W8): 사이트 메뉴는 알약(PageChips)이 아니라 글자 링크입니다(xl부터).
              크로싱 서울(EN Home), 나루, 8월 기록, 후원 문의. 오픈채팅은 같은 줄 오른쪽의 버튼입니다. 그 아래 폭에서는 레일 왼쪽의 메뉴 단추. */}
          <SiteMenuBar page={page} />
          {/* ANCHOR ROW - `xl` (1280), not `lg` (1024). See the note on the
              section rail below: between 1024 and 1279 this row does not fit
              next to the brand and the two CTAs in either locale, and flex
              silently crushed the brand to make room. */}
          {/* 챕터 링크는 페이지 칩에서 24px 띄웁니다(등록 브리프 2.1). 8월 페이지는 다섯이라 2xl(1536)부터 섭니다.
              실측: 1440에서 로고, 칩 셋, 링크 다섯, 오른쪽 묶음이 한 줄에 들어가지 않습니다. 그 아래에서는 레일이 맡습니다. */}
          {/* 영문 8월의 아홉 칸은 간격 20px이면 오픈채팅 버튼과 붙어 그 줄만 12px입니다. */}
          <div className={`hidden items-center ${en ? (naru ? "gap-4" : "gap-3") : "gap-5"} ${anchorRowAt.row}`}>
            {/* 2026-10-20 (hwang 브리프 4.1): 사이트 메뉴와 챕터 목차 사이의 1px 선. 목차 줄이 설 때만 섭니다. */}
            <span aria-hidden className="h-5 w-px shrink-0 bg-white/20" />
            {/* DECIDED 2026-10-10 (사용자: "TOC가 너무 어색함"): 나루 계열 헤더(홈, /naru)의 데스크톱 줄에서는 첫 항목(#top)을
                그리지 않습니다. 바로 왼쪽의 로고가 같은 이름이고 같은 곳(#top)으로 갑니다. "나루 나루", "크로싱 서울 크로싱 서울"로
                읽혔습니다. 폰 레일은 로고 줄이 접힌 뒤에 혼자 남으므로 넷 그대로입니다. 8월 페이지는 그대로. */}
            {(naru ? anchors.filter((a) => a.id !== "top") : anchors).map((a) => {
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
                  // "location" (2026-09-19, 접근성 감사 25): 섹션 현위치의 정확한 값.
                  aria-current={here ? "location" : undefined}
                  // whitespace-nowrap: a nav label is a single target and must stay
                  // on one line. The Korean labels are the longer set and were
                  // breaking apart at the narrow end of `lg` - "참가 대상" split at
                  // its space and the row turned into two ragged lines of syllables.
                  // 2026-10-11 (리뷰 작은 것): 나루 계열 헤더의 링크는 누르는 자리를 py-2.5 px-2만큼 키웁니다(높이 23px에서 45px).
                  // 음수 마진으로 배치는 그대로이고, 밑줄은 글자 폭과 전의 높이에 그대로 섭니다. 8월 페이지는 그대로.
                  className={`relative whitespace-nowrap text-sm font-medium transition after:absolute ${naru ? "-mx-2 -my-2.5 px-2 py-2.5 after:bottom-[0.375rem] after:left-2 after:w-[calc(100%-1rem)]" : "after:-bottom-1 after:left-0 after:w-full"} after:h-px after:origin-left after:bg-accent/70 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100 focus-visible:after:scale-x-100 ${
                    here ? "text-white after:scale-x-100" : "text-white/70 after:scale-x-0"
                  }`}
                >
                  {t(a.label)}
                </a>
              );
            })}
            {/* Quiz - an anchor-weight text link after FAQ, not a button. It has
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
        {/* RIGHT group - open chat + EN/KR toggle, with the register button
            appearing as soon as the visitor scrolls off the hero.
 
            "파트너십 문의" USED TO LIVE HERE and was moved to the footer. This
            bar is seen by every visitor on every screen, and the two audiences
            want opposite things: a student wants a way in, a company wants an
            email address. Spending the most valuable slot on the smaller
            audience cost the larger one a door. Companies still reach it from
            the footer CTA (a full pill, more prominent than this ever was) and
            from the partner section. */}
        <div className="flex items-center gap-1.5 min-[360px]:gap-2.5 sm:gap-3">
          {/* Returning quiz-taker greeting - sits to the LEFT of open chat.
              Compact single-line pill; renders nothing for first-time visitors.
              Desktop-only, so the mobile bar stays uncluttered.
              Held back to 1700px: it used to appear at `xl`, the same breakpoint
              where the brand suffix returns, and the two together overran the bar
              for anyone who had taken the quiz (~210px pill + ~130px suffix).
              Of the two the brand lockup wins, so the pill waits for the width.
              1700 rather than `2xl` because at 1536 - a very common effective
              width, 1920 at 125% scaling - the row fits only exactly: the FAQ
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
          {/* Open chat - visible from first paint, NOT scroll-revealed. Someone
              who lands and isn't ready to register should find the low-commitment
              door immediately, not after proving they'll scroll.
 
              Emphasized violet-tinted outline while unregistered: a soft violet
              glow + brighter text so the low-commitment door actually draws the
              eye - but still an OUTLINE, not a fill, so it stays one tier below
              the solid register pill (no two competing primaries). Once
              registered the roles swap: registration is done ("등록 완료 ✓"), so
              the next real action is the chat, and this becomes the filled
              control. See the registered branch below. */}
          {/* Phone/tablet path to the quiz. The anchor row above is `xl:flex`, so
              without this there is no route to /quiz from the header at all
              below xl. Kept to a compact chip rather than a new hamburger - the
              header's minimalism is the point, and one more sheet to open is one
              more reason not to. Tracks the anchor row's breakpoint: if that
              moves, this moves with it or the quiz loses its only header route. */}
          {/* 2026-08-12: ✦ 하나만 있던 칩에 글자를 붙였습니다. 세로는 이미
              min-h-[44px]였지만 가로가 px-3 + 글리프 하나라 40px 남짓이었고,
              무엇보다 ✦만으로는 눌러야 할 이유가 전달되지 않았습니다 - 폰에서
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
              // 2026-10-11 (리뷰 작은 것): 나루 계열 헤더의 이름은 보이는 글자("오픈채팅")로 시작하고 새 창임을 말합니다(WCAG 2.5.3).
              aria-label={naru ? t({ ko: "오픈채팅, 카카오톡 새 창", en: "Open chat, KakaoTalk, new window" }) : t(dict.nav.openChatAria)}
              // 2026-10-12 (등록 브리프 1.3, 리뷰 S7): 폰에서는 아이콘만 보이는 자리라, 올려 두면 어디로 가는지 보이게 합니다.
              title={t(dict.nav.openChatTitle)}
              onClick={() => trackOpenChat("nav")}
              className={
                registered
                  // 2026-10-13 (등록 브리프 2.3, 리뷰 N7): 8월의 보라와 인디고 대신 본 사이트의 나루 그라데이션입니다.
                  ? "hidden shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-naru-purple to-naru-plum px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(75,58,140,0.5)] transition active:translate-y-0 active:scale-[0.98] active:duration-75 hover:shadow-[0_0_28px_rgba(75,58,140,0.7)] lg:inline-flex"
                  // showQuiz가 false면 lg 아래에서도 보입니다. 퀴즈 칩을 뺀
                  // 자리가 비면 폰에서 헤더에 액션이 하나도 없게 되는데, 이
                  // 페이지에서 지금 할 수 있는 일이 이것 하나입니다. 좁은 폭에서는
                  // 패딩과 글자를 줄이고 min-h로 터치 타깃 44px을 지킵니다.
                  : `shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] font-semibold text-white/85 transition active:translate-y-0 active:scale-[0.98] active:duration-75 hover:border-white/30 hover:bg-white/10 hover:text-white ${
                      showQuiz
                        ? "hidden px-4 py-2 text-sm lg:inline-flex"
                        : "inline-flex min-h-[44px] min-w-[44px] justify-center px-2.5 text-xs min-[360px]:px-3.5 sm:px-4 sm:text-sm"
                    }`
              }
            >
              <ChatGlyph className="h-4 w-4" />
              {/* DECIDED 2026-10-08 (사용자: "오픈채팅 - 열어줘", 390px 스크린숏 확인): 링크를 되살리니 폰에서 로고의
                  오른쪽 끝과 이 알약의 왼쪽 끝이 0px로 붙었습니다. 퀴즈 칩이 없는 헤더(나루 홈)의 420px 아래에서는
                  글자를 화면에서만 내리고 아이콘만 둡니다. 이름은 aria-label이 그대로 읽습니다. */}
              <span className={showQuiz ? undefined : "max-[419px]:sr-only"}>{t(dict.nav.openChat)}</span>
            </a>
          )}
          {/* DECIDED 2026-08-22 (마감 후 청산): 스크롤로 나타나던 등록 필을
              걷어냈습니다. 등록 진입점 전면 제거 - 비활성 버튼을 남기지 않는다.
              1순위 액션은 오픈채팅, 히어로 1순위는 트랙. 등록 코드(모달·API·
              registered 상태)는 삭제하지 않고 진입점만 끊습니다.

              누를 수 없는 버튼을 회색으로 남기는 쪽이 더 나빴습니다. 참가자가 이
              페이지에서 지금 할 수 있는 일은 오픈채팅에 들어오는 것 하나뿐인데,
              그 옆에 죽은 버튼이 서 있으면 어느 쪽이 살아 있는지를 매번 읽어야
              합니다. 위의 오픈채팅 버튼이 이제 이 바의 유일한 액션입니다 -
              스타일은 올리지 않았습니다. 경쟁 상대가 없어졌으니 고스트 톤으로
              충분하고, 그라디언트로 올리면 마감 전과 같은 압력이 됩니다. */}
          {/* 배경 정지 토글, 헤더에도(감사 반영 브리프 2.4). 푸터 것은 그대로. 나루 홈만.
              xl 아래에서는 여기 두지 않습니다. 아래로 스크롤하면 이 줄이 52px 접혀 들어가
              버튼이 화면 밖으로 나갔습니다(실측: 스크롤 뒤 top −51px). 폰·태블릿용은 헤더
              **바깥**의 고정 자리에 있었습니다. 2026-10-11 (리뷰 A4): 그 고정 버튼은 뺐고, xl 아래에서는
              푸터의 버튼 하나입니다. */}
          {naru && (
            <div className="hidden xl:flex">
              <MotionToggle compact />
            </div>
          )}
          {/* 2026-10-13 (등록 브리프 2.1): 여기 있던 8월 페이지의 "12월 이벤트 →" 알약은 페이지 칩 셋이 대신합니다.
              "항상 보였으면"(2026-09-20)은 그대로 지켜집니다. 칩 셋이 xl부터는 로고 옆에, 그 아래에서는 레일 맨 앞에 늘 있습니다. */}
          {/* Language last - it's a setting, not an action, so it sits after
              the CTA rather than between the brand and it. */}
          {/* 2026-10-13 (등록 브리프 2.3, 리뷰 N7): 8월 페이지도 EN KR 두 버튼입니다(그 전에는 "EN / KR" 단일 버튼). */}
          <LocaleToggle variant="naru" />
        </div>
      </nav>
      {/* ── Section rail (below `xl` only) ────────────────────────────────────
          The anchor row above is `xl:flex`, so on a phone the header carried the
          brand, the quiz chip and the language toggle and nothing else - while
          the page itself runs ~27,000px on a 390px screen. A visitor who wanted
          the programme or the FAQ had one tool: scrolling, or the back-to-top
          button. This is that missing route.

          THE BOUNDARY MOVED `lg` → `xl` (2026-08-03). The inline row appeared at
          1024 but did not FIT until ~1200 (KR) / ~1280 (EN): brand 171 + row 509
          /577 + the two CTAs 324 + rail padding came to 1139px (KR) and 1201px
          (EN) inside a 1024px bar. Nothing wrapped, because every label is
          whitespace-nowrap - instead flex shrank the one item that could give,
          the brand link, and at 1024 the zero100 wordmark was crushed from 171px
          to 50px while the EN/KR toggle sat off the right edge. Measured, both
          locales, before and after. So 1024–1279 now gets the same two-row
          treatment as a phone: compact bar + this rail, which reaches every
          section the inline row does. Do not move this back to `lg` without
          re-measuring the widest locale - the row is the constraint, not the
          breakpoint name.

          Deliberately a scrollable rail, not a hamburger sheet: the same chips
          the desktop bar uses, laid on their side, so nothing new has to be
          opened or learned (the header's minimalism was the reason a menu was
          turned down before, and it still holds).

          Appears only once the hero is behind you - the same `scrolled` latch
          the register button uses. On the first screen the hero's own CTAs are
          the point and this would just be a second row of chrome.

          `scroll-padding-top` in globals.css accounts for the extra height on
          this breakpoint, so an anchor jump doesn't park a heading underneath. */}
      {/* DECIDED 2026-10-13 (등록 브리프 2.2, 리뷰 N5 N8): 레일은 스크롤 0부터 보이고, 세 페이지가 같은 레일 하나를 씁니다.
          [페이지 칩 셋] 1px 구분선 [챕터 칩]. 왼쪽 정렬, 13.5px, 한 줄, 넘치면 가로로 굴립니다(오른쪽 16px 페이드).
          그 전에는 셋이 제각각이었습니다(홈은 가운데로 접는 칩, /naru는 왼쪽과 돌아가기 칸, /2026-08은 고정폭 칩과 오른쪽 핀).
          폰의 첫 화면에 다른 페이지로 가는 길이 없던 것도 이 줄이 풉니다. 2026-09-19의 "접는 목차"와 2026-08-17의
          "칩 폭 통일"은 이 결정이 대신합니다. 8월 페이지의 챕터 링크는 2xl부터 로고 줄에 서므로 레일도 거기까지 남습니다.
          nav 랜드마크입니다(2026-09-19, 접근성 감사 4). 로고 줄이 접히면 위에도 여백을 둡니다(2026-10-10). */}
      {/* DECIDED 2026-10-20 (hwang 브리프 4.1): 레일에서 페이지 칩을 뺐습니다. 레일은 챕터 목차만, 사이트 메뉴는 레일 왼쪽의 단추가 엽니다
          (레일 밖, 가로로 굴러가지 않습니다). 메뉴는 레일 아래 한 줄입니다. */}
      <div className={`${anchorRowAt.rail} ${!naru && chromeHidden ? "pt-2 lg:pt-0" : ""} ${reduce || naru ? "" : "transition-[padding] duration-300"}`}>
      <div className="flex items-center pl-1 sm:pl-6 xl:pl-0">
      <SiteMenuButton open={menu.open} onToggle={menu.toggle} controls={menu.id} />
      <span aria-hidden className="h-6 w-px shrink-0 bg-white/20 xl:hidden" />
      <nav aria-label={t(dict.nav.sectionsAria)} className="min-w-0 flex-1">
        <div
          ref={railRef}
          // calc 안의 밑줄 두 개(100%_-_16px)가 필요합니다. Tailwind는 임의값의 밑줄을 공백으로 바꾸는데,
          // CSS의 calc는 빼기 부호 양옆에 공백이 없으면 무효입니다(실측 2026-09-20).
          className="flex items-center gap-2 overflow-x-auto pb-1 pl-3 pr-5 [mask-image:linear-gradient(to_right,transparent,#000_12px,#000_calc(100%_-_16px),transparent)] [scrollbar-width:none] sm:pr-10 xl:pl-5 [&::-webkit-scrollbar]:hidden"
        >
          {anchors.map((a) => {
            const here = a.id === activeSection;
            return (
              <a
                key={a.id}
                href={`#${a.id}`}
                // "location": 스크린리더가 "현재 위치"로 읽습니다(2026-09-19, 접근성 감사 25).
                aria-current={here ? "location" : undefined}
                // 챕터 제목 전문을 이름으로(접근성 감사 19). "왜"는 한 음절이라 링크 목록에서 뜻이 없습니다.
                aria-label={a.ariaLabel ? t(a.ariaLabel) : undefined}
                // 현위치는 색만으로 말하지 않습니다(WCAG 1.4.1). 밑줄이 함께 켜집니다. 칩은 표지판이라 누르는 자리는 44px.
                // DECIDED 2026-10-20 (hwang 브리프 2.13, 감사 W4): 챕터 칩(알약)을 밑줄 글자 링크로. 알약은 버튼에만 씁니다. 현위치는 accent 밑줄.
                className={`inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center whitespace-nowrap px-1.5 text-[0.75rem] font-semibold underline-offset-4 transition ${
                  here
                    ? "font-bold text-white underline decoration-accent decoration-2"
                    : "text-white/70"
                }`}
              >
                {t(a.label)}
              </a>
            );
          })}
        </div>
      </nav>
      </div>
      <SiteMenuSheet page={page} open={menu.open} id={menu.id} onClose={menu.close} />
      </div>
      </header>

      {/* DECIDED 2026-10-11 (리뷰 A4, 결정 D-d): 여기 있던 폰과 태블릿(xl 미만)의 고정 배경 정지 버튼을 뺐습니다.
          오른쪽 아래 63px 원반이 본문 열의 오른쪽 36px을 스크롤 내내 덮었고, DAY 4 버튼의 아래 절반과 360px 화면의
          히어로 CTA를 가렸습니다. 배경을 멈추는 수단은 푸터의 "배경 움직임" 버튼이 맡습니다(WCAG 2.2.2). xl부터는
          전과 같이 헤더 오른쪽에도 있습니다. 2026-09-19의 "항상 보이게"는 이 결정이 대신합니다. */}
    </>
  );
}
