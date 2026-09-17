"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { dict, links } from "@/data/dictionary";
import ChatGlyph from "@/components/ChatGlyph";
import { useScrollDirection } from "@/lib/useScrollDirection";

// MOVED HERE 2026-09-17 (8월 문법 브리프). components/journey/Journey.tsx에서
// 정의만 옮겼습니다. 마크업과 클래스는 한 글자도 바뀌지 않았고, 8월 페이지는
// 같은 파일을 import 합니다. 나루 홈이 같은 문법을 쓰기 위해서입니다.
// afterId / endId (2026-09-17): 8월 페이지는 #about이 지나면 나타나고 #closing이
// 보이면 물러납니다. 나루 홈에는 #about이 없어서 id를 prop으로 받습니다. 기본값이
// 8월의 것이라 Journey.tsx의 <MobileChatBar />는 그대로입니다.
// Tablet-only sticky bar (sm ~ lg). Below lg the nav's actions are easy to miss
// once the visitor is deep in the page, so the page keeps a permanent bottom rail
// from the moment #about scrolls past. Latched on: once shown it stays, so it
// can't flicker on scroll-up.
//
// RENAMED 2026-08-22 (마감 후 청산): MobileRegisterBar였습니다. 등록 진입점을
// 걷어내면서 이 바가 나르는 것이 오픈채팅 하나가 됐으니, 이름이 더 이상 사실이
// 아니었습니다. 바 자체와 등장 조건은 그대로입니다.
// phone (2026-09-17): 8월 페이지는 이 바가 태블릿 전용이고(sm ~ lg), 폰은 따로
// MobileStickyBar가 맡습니다. 나루 홈에는 그 폰 바가 없어서 이 바가 폰까지 맡습니다.
// 기본값 false라 8월 페이지는 그대로입니다.
export default function MobileChatBar({ afterId = "about", endId = "closing", phone = false }: { afterId?: string; endId?: string; phone?: boolean } = {}) {
  const reduce = useReducedMotion();
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  // Shared with the header and the FAB (lib/useScrollDirection).
  // idleReveal: false — 아래 폰 바와 같은 이유입니다(훅 주석 참고). 두 바가 같은
  // 자리를 다른 브레이크포인트에서 맡고 있어서, 한쪽만 멈춤 복귀를 하면 화면 폭에
  // 따라 다르게 동작합니다.
  const chromeHidden = useScrollDirection({ idleReveal: false });

  useEffect(() => {
    const onScroll = () => {
      const about = document.getElementById(afterId);
      // Fires once #about's TOP has passed the top of the viewport — i.e. the
      // visitor is reading the "why" and has left the hero for good. Waiting for
      // its BOTTOM would be far too late: on a phone #about is ~2400px tall, so
      // the bar wouldn't show until three screens of scrolling in. If the section
      // isn't in the DOM for any reason, fall back to a plain scroll depth so the
      // bar can never be permanently missing.
      const past = about
        ? about.getBoundingClientRect().top < 0
        : window.scrollY > window.innerHeight;
      if (past) setVisible(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [afterId]);

  // The closing section carries its own register CTA. Two identical buttons, one
  // fixed over the other, is the kind of duplication a visitor reads as a bug —
  // so this bar stands down while that section is on screen. Same observer the
  // phone-width bar already used; this one never had it.
  useEffect(() => {
    const end = document.getElementById(endId) ?? document.querySelector("footer");
    if (!end) return;
    // rootMargin 0 / threshold 0 = 클로징이 뷰포트에 닿는 순간 (DECIDED 2026-08-17).
    // -20%였습니다: 클로징이 화면 아래 20%를 지나 올라와야 바가 비켜섰는데, 그
    // 사이 구간에서 알약 바가 "우리가 있었으면 했던 다리를" 헤드라인을 그대로
    // 덮었습니다. 관찰자를 닿는 즉시로 당깁니다. 바가 조금 일찍 사라지는 쪽이
    // 헤드라인을 가리는 것보다 낫습니다 — 클로징에는 같은 CTA가 이미 있습니다.
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { rootMargin: "0px", threshold: 0 });
    io.observe(end);
    return () => io.disconnect();
  }, [endId]);

  return (
    <AnimatePresence>
      {visible && !atEnd && !chromeHidden && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 24 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          // z-40 keeps it under the ScrollToTop button (z-50), which is offset
          // ~5.25rem UP on this breakpoint (a vertical band above the bar), so
          // the bar can use the full screen width — no right-side reservation.
          // pt-2 / pb 0.5rem + safe area: the bar lost ~10px of padding without
          // touching the buttons inside it, which stay at 44px+.
          // `hidden sm:block lg:hidden` — TABLET ONLY. This was `lg:hidden` alone,
          // which meant that below sm it rendered on top of MobileStickyBar (also
          // `sm:hidden`): two fixed bars at bottom-0, two register buttons, and
          // after this change two open-chat buttons as well. The phone rail is the
          // pill bar; this one starts where that one stops.
          className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pt-2 lg:hidden ${phone ? "block" : "hidden sm:block"}`}
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
        >
          {/* DECIDED 2026-08-22 (마감 후 청산): 등록 버튼이 빠지고 오픈채팅이
              이 바의 단독 액션이 됐습니다. 폭도 넘겨받습니다(flex-1).
              라벨을 유지하는 이유는 그대로입니다: 맨 말풍선 하나는 어느 서비스를
              여는지 방문자가 짐작해야 하고, 오픈채팅은 지금 이 페이지에서 유일하게
              살아 있는 문이라 이름으로 찾는 대상입니다. aria-label은 더 긴
              "카카오톡 오픈채팅방 열기"로 그대로 둡니다. */}
            {/* DECIDED 2026-08-23 (모바일 감사 2차): 풀폭 바에서 내용 폭 필로.
                오픈채팅 바와 바로 위 맨위로 FAB이 정지 상태마다 하단 180px 남짓을
                점유하면서 본문 한 줄을 덮고 있었습니다. 오픈채팅은 지금 이 페이지에서
                유일하게 살아 있는 문이지만 그래도 보조 액션이라, 화면 폭 전체를
                가로지를 이유는 없어요. 색과 보더는 그대로 두고 폭만 내용에 맞춥니다.
                등장 조건, chromeHidden, 스크롤 동작은 하나도 건드리지 않았습니다. */}
          <div className="flex items-center justify-center gap-2">
            {links.openChat && (
              <a
                href={links.openChat}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(dict.nav.openChatAria)}
                onClick={() => track("openchat_click", { src: "mobile-bar" })}
                className="pointer-events-auto inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-violet-400/45 bg-[#070B1F]/92 px-6 text-sm font-bold text-violet-100 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.9)] backdrop-blur transition active:scale-95"
              >
                <ChatGlyph className="h-5 w-5 shrink-0" />
                {t(dict.nav.openChat)}
              </a>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
