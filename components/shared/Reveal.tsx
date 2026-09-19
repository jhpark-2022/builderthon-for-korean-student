"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 스크롤하면 올라오며 나타나는 블록 (ADDED 2026-09-19, 사용자: "맨 위에서
// 스크롤해서 아래로 내릴 때 애니메이션이 있으면 좋겠다, 8월 페이지와 같은 효과로").
//
// **효과는 components/journey/Chapter.tsx의 것을 그대로 씁니다.** 값 하나도
// 바꾸지 마세요: opacity 0 → 1, translateY(40px) → 0, 700ms ease-out, 한 번만.
// 두 페이지가 한 사이트로 읽히려면 움직이는 방식이 같아야 합니다.
//
// 왜 Chapter로는 모자랐는가: 홈도 같은 Chapter를 쓰고 있었지만 챕터가 다섯이고
// 하나가 3,000px입니다. 챕터에 들어서는 순간 한 번 나타난 뒤로는 화면 몇 개
// 분량을 아무 일 없이 내려가게 됩니다. 8월 페이지는 챕터가 열 몇 개이고 대부분
// 한 화면 높이라 스크롤 내내 무언가 올라왔어요. 그래서 홈에서는 챕터 안의
// 블록에 같은 효과를 답니다.
//
// data-chapter-reveal을 그대로 붙이는 것이 요점입니다. globals.css의 안전망
// (번들이 죽으면 1.5초 뒤 강제로 보이게)과 모션 민감 설정(transform 제거)이
// 그 선택자로 걸려 있습니다. 새 이름을 만들면 둘 다 빠집니다.
// ─────────────────────────────────────────────────────────────────────────────
export default function Reveal({
  children,
  className = "",
  id,
  /** 같은 화면에 여럿이 들어올 때 순서를 주고 싶으면 ms 단위로. 기본은 없음. */
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // React가 살아 있다는 표시. globals.css의 안전망이 이 클래스를 보고 비켜섭니다.
    document.documentElement.classList.add("js-reveal-ready");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    // 안전망. 관찰자가 한 번도 울리지 않는 경우에도 **이미 화면에 있는** 블록은
    // 보여 줍니다. 화면 밖은 건드리지 않습니다. 전에는 조건 없이 1200ms에 전부
    // 보이게 했는데, 그러면 아래쪽 블록이 스크롤 전에 이미 나타나 있어서
    // 스크롤 애니메이션이 사라집니다(2026-09-19).
    const fallback = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) setShown(true);
    }, 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      id={id}
      // @ts-expect-error 태그가 셋 중 하나라 ref 타입이 갈라집니다. 셋 다 HTMLElement입니다.
      ref={ref}
      data-chapter-reveal
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(40px)",
        transitionDelay: shown && delay ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </Tag>
  );
}
