"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 도구 페이지(멘토 링크 등)의 바. 사이트 바(components/journey/JourneyNav.tsx)와 같은 모양에서 메뉴와 목차만 뺐습니다.
// DECIDED 2026-10-27 (사용자: "멘토들에게 배포되는 링크들의 UIUX도 kwan-design을 따르게"): 왼쪽 크로싱 서울 워드마크(brand 6장 표기 C,
// 누르면 /crossing), 아래 가는 선, 오른쪽 36px EN/KR. 높이와 여백은 사이트 바와 같습니다(폰 52px, xl 80px).
// 메가 메뉴와 오픈채팅은 넣지 않습니다. 멘토가 자기 칸을 보러 오는 페이지라 다른 길을 열지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────

import { useLocale } from "@/lib/LocaleContext";
import { decemberEventLabel } from "@/lib/naruDates";
import LocaleToggle from "@/components/LocaleToggle";

export default function ToolHeader() {
  const { locale } = useLocale();
  const en = locale === "en";
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-naru-ink">
      <div
        className="flex h-[52px] items-center justify-between gap-3 px-5 sm:px-10 xl:h-20"
        style={{ paddingLeft: "calc(env(safe-area-inset-left, 0px) + 20px)", paddingRight: "calc(env(safe-area-inset-right, 0px) + 20px)" }}
      >
        <a href="/crossing" className="-my-1 flex min-h-[44px] shrink-0 items-center py-1 leading-none">
          <span lang={en ? "en" : undefined} className={`whitespace-nowrap pb-[0.08em] font-black tracking-[-0.02em] text-white ${en ? "text-sm sm:text-xl xl:text-2xl" : "text-xl sm:text-2xl xl:text-3xl"}`}>
            {decemberEventLabel(locale)}
          </span>
        </a>
        <LocaleToggle className="h-9 !min-h-0 !py-0 xl:text-sm" />
      </div>
    </header>
  );
}
