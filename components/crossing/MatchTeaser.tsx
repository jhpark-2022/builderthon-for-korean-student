"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 등록 완료 화면의 AI 유형 테스트 카드 (DECIDED 2026-10-15, 사용자: "보내면 AI 유형 테스트로 direct",
// 스크린숏: "더 eye grabbing 하고, 더 catchy 하게").
//
// 테두리와 제목은 크로싱 서울 워드마크 그라데이션(brand 10장, 2026-10-11)이고, 위에 테스트 결과의 AI 로고(흰색 단색,
// data/quiz-2026-12.ts) 여덟 개를 겹쳐 세웁니다. 글자 크기는 모달과 같은 셋(LARGE, BODY, META)입니다.
// ─────────────────────────────────────────────────────────────────────────────

import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/LocaleContext";
import { register as copy } from "@/data/naru";
import { MODELS_2026_12 } from "@/data/quiz-2026-12";
import { BODY, META } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/Button";

const GRADIENT = "linear-gradient(90deg, #9AA8EE 0%, #A99AD6 35%, #C99ACB 68%, #E08A76 100%)";
const SHOWN = 8;
const LOGOS = Object.values(MODELS_2026_12).map((m) => m.logo).filter((v, i, a) => a.indexOf(v) === i).slice(0, SHOWN);

export default function MatchTeaser() {
  const { t } = useLocale();
  return (
    <div className="mx-auto mt-7 max-w-sm rounded-[1.1rem] p-px shadow-[0_12px_48px_rgba(169,154,214,0.28)]" style={{ background: GRADIENT }}>
      <div className="rounded-2xl bg-naru-surface p-[22.5px] text-center sm:p-[32px]">
        <div aria-hidden className="flex items-center justify-center">
          {LOGOS.map((file, i) => (
            <span key={file} className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#161c3d] ${i ? "-ml-2" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/logos/${file}`} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            </span>
          ))}
          <span className={`-ml-2 flex h-9 items-center rounded-full border border-white/25 bg-[#161c3d] px-2.5 ${META} font-semibold text-white/70`}>+{16 - SHOWN}</span>
        </div>
        <p className={`mt-4 ${META} font-semibold tracking-wide text-white/70`}>{t(copy.nextLabel)}</p>
        <p className="mt-1 break-keep bg-clip-text text-base font-extrabold leading-snug text-transparent" style={{ backgroundImage: GRADIENT }}>{t(copy.nextTitle)}</p>
        <p className={`mt-2 break-keep ${META} leading-relaxed text-white/70`}>{t(copy.nextBody)}</p>
        <a href="/match" onClick={() => track("match_click", { src: "naru-register-success" })} className={`${buttonClass("primary", "naru")} mt-4 w-full justify-center`}>
          {t(copy.nextCta)}<span aria-hidden className="ml-1.5">→</span>
        </a>
      </div>
    </div>
  );
}
