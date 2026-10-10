"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru } from "@/data/naru";
import Chapter from "@/components/journey/Chapter";

// ─────────────────────────────────────────────────────────────────────────────
// /2026-08의 #gaps: "8월이 남기지 못한 두 가지, 그리고 12월의 답"과 "그 밖에 바꾼 것".
//
// DECIDED 2026-10-10 (사용자: "객관적으로 너무 내용이 많다", 중복 브리프 B3): 이 블록은 홈(/)의 #december 둘째
// 판 조각이었습니다. 8월을 돌아보는 글이라 8월 페이지의 맨 아래(기록 다음, 마지막 화면 앞)로 옮겼습니다.
// 홈에는 여기로 오는 한 줄 링크만 남습니다(components/home/NaruHome.tsx).
//
// 문장은 홈에 있던 그대로입니다(data/naru.ts의 record.gaps, december.gapsHeading, alsoLabel, also).
// 홈의 한 줄 "8월을 모르셔도 됩니다"(gapsNote)는 이 페이지에서는 필요 없어서 그리지 않고, 그 자리에
// 홈의 프로그램 챕터로 돌아가는 링크 하나를 둡니다.
//
// 모양은 이 페이지의 문법입니다(Chapter, 제목의 clamp, 유리 카드). 홈의 글자 크기 셋(TITLE, BODY, META)과
// 왼쪽 끝 규칙은 홈의 것이라 여기에 가져오지 않습니다. 이 페이지의 다른 부분은 바뀌지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────
export default function AugustGaps() {
  const { t } = useLocale();
  return (
    <Chapter id="gaps" align="center" labelledBy="gaps-heading">
      <h2 id="gaps-heading" className="break-keep text-[clamp(1.6rem,4vw,2.5rem)] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]">
        {t(naru.december.gapsHeading)}
      </h2>
      <p className="mt-4">
        <Link
          href="/#december"
          onClick={() => track("archive_cta", { src: "gaps", to: "december" })}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-white/85 underline-offset-4 transition hover:text-white hover:underline"
        >
          {t(naru.december.gapsBackLink)}
          <span aria-hidden>→</span>
        </Link>
      </p>
      <ol role="list" className="mt-6 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
        {naru.record.gaps.map((gap, i) => (
          <li key={gap.title.en} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-500/20 text-xs font-black text-violet-200">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 break-keep text-base font-bold leading-snug text-white">{t(gap.title)}</h3>
            <p className="mt-2 break-keep text-sm leading-relaxed text-white/75">{t(gap.body)}</p>
            <p className="mt-3 break-keep text-sm leading-relaxed text-white/90">
              <span className="mr-1.5 text-xs font-bold uppercase text-violet-200">{t(naru.december.decemberLabel)}</span>
              {gap.answer ? t(gap.answer) : t(naru.record.answerPending)}
            </p>
          </li>
        ))}
      </ol>
      <h3 className="mt-10 break-keep text-left text-base font-bold text-white">{t(naru.december.alsoLabel)}</h3>
      <ul role="list" className="mt-3 text-left">
        {naru.december.also.map((line, i) => (
          <li key={i} className={`break-keep border-t border-white/10 py-3 text-sm leading-relaxed text-white/75 ${i === naru.december.also.length - 1 ? "border-b" : ""}`}>
            {t(line)}
          </li>
        ))}
      </ul>
    </Chapter>
  );
}
