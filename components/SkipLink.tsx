"use client";

import { dict } from "@/data/dictionary";
import { useLocale } from "@/lib/LocaleContext";

// Keyboard-only skip link: invisible until focused, lets keyboard / screen-reader
// users bypass the fixed nav. No effect on normal layout.
//
// It is its own client component purely so it can read the locale. The label was
// hardcoded "Skip to content" in the server layout, which meant a Korean visitor
// tabbing into the page heard English — on the one control whose entire audience
// is assistive-tech users. The layout is a server component and cannot call
// useLocale(), so the link moved in here and now renders as the first child of
// LocaleProvider, which keeps it first in the DOM (the provider emits no markup).
export default function SkipLink() {
  const { t } = useLocale();
  return (
    <a
      // #main입니다 (2026-09-19, 접근성 감사 1). #top은 히어로 <section>이고
      // 포커스를 받으려고 tabIndex={-1}을 달아 둔 것은 <main id="main">입니다.
      // 주석과 href가 어긋나 있었습니다. 건너뛰기의 목적은 고정 헤더를 지나
      // 본문에 서는 것이므로 main이 맞습니다.
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
    >
      {t(dict.a11y.skipToContent)}
    </a>
  );
}
