"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { naru } from "@/data/naru";

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
// DECIDED 2026-10-24 (사용자, 스크린숏 셋: "하나로, 3곳에 흩어져있음"): 독립 챕터가 아니라 /2026-08 #results 안의
// 둘째 블록입니다(결과 → 이 블록 → 고맙습니다). 그래서 Chapter 대신 div, 제목은 h3입니다. id="gaps"는 홈의 링크가 봅니다.
export default function AugustGaps() {
  const { t } = useLocale();
  return (
    <div id="gaps" role="region" aria-labelledby="gaps-heading" className="scroll-mt-48 text-center">
      <h3 id="gaps-heading" className="break-keep text-[clamp(1.5rem,3.6vw,2.25rem)] font-bold leading-tight tracking-tight text-white">
        {t(naru.december.gapsHeading)}
      </h3>
      <p className="mt-4">
        <Link
          href="/#december"
          onClick={() => track("archive_cta", { src: "gaps", to: "december" })}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-white/85 underline underline-offset-4 transition hover:text-white"
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
            <h4 className="mt-3 break-keep text-base font-bold leading-snug text-white">{t(gap.title)}</h4>
            <p className="mt-2 break-keep text-sm leading-relaxed text-white/75">{t(gap.body)}</p>
            <p className="mt-3 break-keep text-sm leading-relaxed text-white/90">
              <span className="mr-1.5 text-xs font-bold uppercase text-violet-200">{t(naru.december.decemberLabel)}</span>
              {gap.answer ? t(gap.answer) : t(naru.record.answerPending)}
            </p>
          </li>
        ))}
      </ol>
      {/* DECIDED 2026-10-10 (사용자, 스크린숏: "그 밖에 바꾼 것 아래의 내용들이 너무 부실함"): 헤어라인 사이의 한 줄 셋이던 것을
          위 카드 둘과 같은 유리 카드 셋으로 세웁니다. 번호는 위에서 이어 03부터, 앞에 12월 라벨. 문장은 그대로입니다. */}
      <h4 className="mt-10 break-keep text-left text-base font-bold text-white">{t(naru.december.alsoLabel)}</h4>
      <ul role="list" className="mt-4 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        {naru.december.also.map((line, i) => (
          <li key={i} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-500/20 text-xs font-black text-violet-200">
              {String(i + 1 + naru.record.gaps.length).padStart(2, "0")}
            </span>
            <p className="mt-3 break-keep text-sm leading-relaxed text-white/90">
              <span className="mr-1.5 text-xs font-bold uppercase text-violet-200">{t(naru.december.decemberLabel)}</span>
              {t(line)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
