"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";

// ─────────────────────────────────────────────────────────────────────────────
// 아카이브 배너: /2026-08 맨 위 한 줄.
//
// DECIDED 2026-09-15: 8월 페이지를 지우지 않고 기록으로 남깁니다. 두 번째
// 회차부터 선례가 되고(매니페스토 VIII), 한 회차가 남겨야 하는 것은 결과물이
// 아니라 사람의 이야기라서, 그 이야기가 있던 페이지를 없애면 남는 것이
// 없습니다. 그래서 이 페이지는 8월 그대로 두고 배너 한 줄만 답니다.
//
// 이 한 줄이 실제로 하는 일은 두 가지입니다. 하나, 링크를 타고 들어온 사람에게
// 지금 보는 것이 지난 회차라고 말합니다. 페이지 본문은 여전히 "8일이
// 끝났습니다"에서 시작하지만, 그건 회차의 마무리이지 그룹의 현재가 아닙니다.
// 둘, 왜 이 페이지 어디에도 나루가 없는지를 설명합니다. 이름이 이 회차 뒤에
// 정해졌기 때문이고, 그래서 크레딧(주최 AXMOS 등)도 고치지 않았습니다.
// 지난 회차의 주최 표기를 나중에 정해진 이름으로 덮어쓰면 그건 기록이
// 아닙니다.
//
// 고정 헤더(JourneyNav)가 맨 위 52px을 덮고 있어 그만큼 위를 비웁니다. xl에서
// 바가 h-20으로 자라므로 거기서 한 번 더 벌어집니다. 이 값은 헤더의 바 높이를
// 따라갑니다. 바가 바뀌면 여기도 함께 바꾸세요.
// ─────────────────────────────────────────────────────────────────────────────
const COPY = {
  note: {
    ko: "나루의 1회차 기록입니다. 나루라는 이름은 이 회차 뒤에 정해졌습니다.",
    en: "This is the record of NARU's first round. The name NARU was chosen after it.",
  },
  home: { ko: "나루 홈으로", en: "Go to NARU home" },
} as const;

export default function ArchiveBanner() {
  const { t } = useLocale();
  return (
    <div className="relative z-20 w-full border-b border-white/10 bg-[#0B1430]/80 pt-[52px] backdrop-blur-sm xl:pt-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-3 text-center sm:flex-row sm:justify-center sm:gap-4 sm:px-10">
        <p className="break-keep text-xs leading-relaxed text-white/70">{t(COPY.note)}</p>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
        >
          {t(COPY.home)}
          <span aria-hidden className="text-white/50">→</span>
        </Link>
      </div>
    </div>
  );
}
