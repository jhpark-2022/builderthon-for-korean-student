"use client";

import { decemberPartners } from "@/data/naru";
import { partnerUrl } from "@/data/partnerLinks";

// ─────────────────────────────────────────────────────────────────────────────
// 나루와 함께한 곳 로고 띠 (DECIDED 2026-10-22, 사용자, 스크린숏: "지금까지 나루와 함께한 기업들 로고 다 이런 식으로").
// 8월 페이지의 "이 빌더톤이 자라 나온 곳" 띠(둥근 어두운 카드, 두 줄이 반대로 흐름)를 그대로 옮겼습니다.
// 그 섹션은 같은 날 8월 페이지에서 뺐고(사용자: "빼주고 바로 FAQ로"), 이 띠는 푸터(/naru, /2026-08)에 섭니다.
// 목록 순서: 12월 크로싱 서울(data/naru.ts decemberPartners) → 8월 후원. 이름이 같으면 한 번만.
// 같은 날 (사용자: "제로백 네트워크 15곳은 빼줘"): 나루와 직접 일한 곳이 아니라 뺐습니다.
// 학교 학생회(SMU, NUS, NTU)는 기업이 아니라 넣지 않습니다.
// 카드는 바탕을 거의 칠하지 않습니다(white/5). 어두운 바탕에 밝은 판을 두지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────

type Logo = { src: string; alt: string; w: number; h: number; url?: string };

const W = "/partners/logos/white/trimmed/";

const december: Logo[] = decemberPartners.groups.flatMap((g) => [
  ...(g.lead ? [{ src: g.lead.src, alt: g.lead.name, w: g.lead.w, h: g.lead.h, url: g.lead.url }] : []),
  ...g.logos.map((l) => ({ src: l.src, alt: l.name, w: l.w, h: l.h, url: l.url })),
]);

const august: Logo[] = [
  { src: `${W}aws.png`, alt: "AWS", w: 512, h: 306 },
  { src: `${W}hashed.png`, alt: "Hashed", w: 355, h: 90 },
  { src: `${W}innovate360.png`, alt: "INNOVATE 360", w: 455, h: 54 },
  { src: `${W}life.png`, alt: "L^IFE", w: 900, h: 352 },
  { src: `${W}bzcf.png`, alt: "BZCF", w: 465, h: 156 },
  { src: `${W}korean-association.png`, alt: "Korean Association in Singapore", w: 443, h: 90 },
  { src: `${W}onword-lab.png`, alt: "Onword Lab", w: 900, h: 92 },
  { src: `${W}remited.png`, alt: "REmited", w: 512, h: 105 },
  { src: `${W}brandboost.png`, alt: "Brand Boost", w: 205, h: 81 },
  { src: `${W}nuldam.png`, alt: "Nuldam", w: 631, h: 136 },
  { src: `${W}haenyeo-kitchen.png`, alt: "Jeju Haenyeo", w: 316, h: 72 },
];


export const NARU_PARTNERS: Logo[] = [...december, ...august].filter(
  (l, i, all) => all.findIndex((o) => o.alt === l.alt) === i,
);

// 같은 넓이 규칙(Journey.tsx opticalHeight와 같은 식). 넓은 로고는 낮게, 좁은 로고는 높게.
const opticalHeight = (w: number, h: number) => Math.round(Math.min(56, Math.max(28, Math.sqrt(3000 / (w / h)))));

// DECIDED 2026-10-26 (사용자: "티커는 절제를 원했지 모두 삭제를 지시하진 않았어"): 같은 날 정지 격자로 바꾼 것을 되돌리고 절제한 띠로.
// 그 전(2026-10-22)의 두 줄 반대 방향 카드 띠에서 한 줄, 카드 없이 로고만, 90초 한 바퀴(globals.css .marquee-left). 호버해도 멈추지 않고(같은 날 사용자), 모션 줄이기에서는 멈춥니다.
// 로고는 처음부터 src를 둡니다(eager). 2026-10-26 (anti-slop broken-image): 화면 근처에서만 src를 채우던 방식은 첫 HTML에 빈 img 44개를 남겼습니다.
// 그 전 이유(2026-10-22: iOS Safari가 흐르는 띠의 lazy 이미지를 끝내 받지 않음)는 eager로 지켜집니다.
export default function PartnerMarquee() {
  const track = [...NARU_PARTNERS, ...NARU_PARTNERS];
  return (
    <div className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
      <ul role="list" className="marquee-track marquee-left">
        {track.map((logo, i) => {
          const url = logo.url ?? partnerUrl(logo.alt);
          const dup = i >= NARU_PARTNERS.length;
          const image = <img src={logo.src} alt={url || dup ? "" : logo.alt} loading="eager" decoding="async" style={{ height: opticalHeight(logo.w, logo.h) }} className="w-auto max-h-12 max-w-[160px] object-contain opacity-80" />;
          return (
            <li key={i} aria-hidden={dup || undefined} className="flex min-h-[64px] shrink-0 items-center justify-center px-[28px] sm:px-[40px]">
              {url ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={logo.alt} tabIndex={dup ? -1 : undefined} className="inline-flex min-h-[44px] items-center justify-center">{image}</a> : image}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
