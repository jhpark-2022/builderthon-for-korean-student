"use client";

import { decemberPartners } from "@/data/naru";
import { partnerUrl } from "@/data/partnerLinks";

// ─────────────────────────────────────────────────────────────────────────────
// 나루와 함께한 곳 로고 띠 (DECIDED 2026-10-22, 사용자, 스크린숏: "지금까지 나루와 함께한 기업들 로고 다 이런 식으로").
// 8월 페이지의 "이 빌더톤이 자라 나온 곳" 띠(둥근 어두운 카드, 두 줄이 반대로 흐름)를 그대로 옮겼습니다.
// 그 섹션은 같은 날 8월 페이지에서 뺐고(사용자: "빼주고 바로 FAQ로"), 이 띠는 푸터(/naru, /2026-08)에 섭니다.
// 목록 순서: 12월 크로싱 서울(data/naru.ts decemberPartners) → 8월 후원 → 제로백 네트워크. 이름이 같으면 한 번만.
// 학교 학생회(SMU, NUS, NTU)는 기업이 아니라 넣지 않습니다.
// 카드는 바탕을 거의 칠하지 않습니다(white/5). 어두운 바탕에 밝은 판을 두지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────

type Logo = { src: string; alt: string; w: number; h: number; url?: string };

const W = "/partners/logos/white/trimmed/";
const Z = "/partners/zero100/";

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

const network: Logo[] = [
  { src: `${Z}05-startup-alliance.webp`, alt: "Startup Alliance", w: 268, h: 100 },
  { src: `${Z}06-KAIA.webp`, alt: "KAIA", w: 263, h: 100 },
  { src: `${Z}07-venturesquare.webp`, alt: "Venture Square", w: 354, h: 100 },
  { src: `${Z}08-mysc.webp`, alt: "MYSC", w: 256, h: 100 },
  { src: `${Z}09-eventus.webp`, alt: "EventUs", w: 212, h: 100 },
  { src: `${Z}26-ukf.webp`, alt: "United Korean Founders", w: 310, h: 100 },
  { src: `${Z}12-mission.webp`, alt: "Mission", w: 401, h: 100 },
  { src: `${Z}14-themiilk.webp`, alt: "TheMiilk", w: 427, h: 100 },
  { src: `${Z}16-andar.webp`, alt: "andar", w: 368, h: 100 },
  { src: `${Z}17-ceo-suite.webp`, alt: "CEO SUITE", w: 489, h: 100 },
  { src: `${Z}18-yj.webp`, alt: "YJ", w: 98, h: 100 },
  { src: `${Z}20-habit-factory.webp`, alt: "Habit Factory", w: 560, h: 75 },
  { src: `${Z}23-twigfarm.webp`, alt: "Twigfarm", w: 370, h: 100 },
  { src: `${Z}24-kowork.webp`, alt: "Kowork", w: 478, h: 100 },
  { src: `${Z}25-one-dgree-labs.webp`, alt: "One Degree Labs", w: 122, h: 100 },
];

export const NARU_PARTNERS: Logo[] = [...december, ...august, ...network].filter(
  (l, i, all) => all.findIndex((o) => o.alt === l.alt) === i,
);

// 같은 넓이 규칙(Journey.tsx opticalHeight와 같은 식). 넓은 로고는 낮게, 좁은 로고는 높게.
const opticalHeight = (w: number, h: number) => Math.round(Math.min(56, Math.max(28, Math.sqrt(3000 / (w / h)))));

const FADE = "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)";

/** 두 줄이 반대로 흐르는 로고 카드 띠. paused면 멈춥니다(WCAG 2.2.2, 배경 움직임 끄기와 같은 값). 호버해도 멈춥니다. */
export default function PartnerMarquee({ paused }: { paused: boolean }) {
  const mid = Math.ceil(NARU_PARTNERS.length / 2);
  const rows = [
    { items: NARU_PARTNERS.slice(0, mid), dir: "marquee-left" },
    { items: NARU_PARTNERS.slice(mid), dir: "marquee-right" },
  ];
  return (
    // 양끝은 덮개가 아니라 마스크로 흐립니다. 푸터 뒤로 배경이 비쳐서 단색 덮개는 띠처럼 보입니다.
    <div
      className="relative w-full"
      style={{ WebkitMaskImage: FADE, maskImage: FADE }}
    >
      <div className="group flex flex-col gap-4 overflow-hidden sm:gap-5">
        {rows.map((r, ri) => {
          // 같은 목록을 두 번 이어 -50% 이동으로 끊김 없이 돕니다. 두 번째 것은 낭독과 키보드에서 뺍니다.
          const track = [...r.items, ...r.items];
          return (
            <ul
              role="list"
              key={ri}
              style={paused ? { animationPlayState: "paused" } : undefined}
              className={`marquee-track ${r.dir} group-hover:[animation-play-state:paused]`}
            >
              {track.map((c, i) => {
                const url = c.url ?? partnerUrl(c.alt);
                const dup = i >= r.items.length;
                const cls = "mr-4 flex h-24 w-44 shrink-0 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.05] px-6 sm:mr-5 sm:h-28 sm:w-52";
                const img = (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.src}
                    alt={url ? "" : c.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ height: opticalHeight(c.w, c.h) }}
                    className="w-auto max-w-[82%] object-contain opacity-95"
                  />
                );
                return (
                  <li key={i} aria-hidden={dup || undefined}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={c.alt} tabIndex={dup ? -1 : undefined} className={cls}>
                        {img}
                      </a>
                    ) : (
                      <div className={cls}>{img}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          );
        })}
      </div>
    </div>
  );
}
