"use client";

import { dict, type Phrase } from "@/data/dictionary";

type Tfn = (p: Phrase) => string;

// MOVED HERE 2026-09-17 (8월 문법 브리프). components/journey/Journey.tsx에서
// 정의만 옮겼습니다. 마크업과 클래스는 한 글자도 바뀌지 않았고, 8월 페이지는
// 같은 파일을 import 합니다. 나루 홈이 같은 문법을 쓰기 위해서입니다.
// 이 파일이 내보내는 것: HeroPartnerStrip(기본), sortLikeHeroStrip, sponsorMass.
// 뒤의 둘은 Journey.tsx의 파트너 벽(CompanionMarquee, LogoTile 목록)이 씁니다.
//
// TODO: confirm. 나루 홈은 이 스트립을 렌더하지 않습니다. 12월 출제사와 후원사가
// 확정되면 홈 히어로의 두 단 아래에 이 컴포넌트를 tiers prop으로 일반화해 씁니다.
// 지금의 confirmedPartnerTiers는 8월 회차의 것이라 홈에 그대로 걸면 안 됩니다.

// ─────────────────────────────────────────────────────────────────────────────
// HERO CONFIRMED-PARTNER STRIP — the deck cover's "CONFIRMED PARTNERS" band.
//
// HONESTY RULE (same as the partner wall): only partners whose participation is
// CONFIRMED may appear here. The Zero100 network marquee stays out — those are
// network companions, not partners of this event — as does anything still in
// discussion.
//
// STRUCTURE: the strip mirrors the partner section's own 주최 → 주관 → 후원
// tiering rather than dumping every mark into one anonymous row, so the hero
// answers "who is running this" and "who is backing it" as separate questions —
// which is the whole point of showing logos this early.
//
// Assets are the same trimmed white silhouettes the partner wall uses — no new
// files. They're above the fold, so they load eagerly (never lazily).
// ─────────────────────────────────────────────────────────────────────────────
// ── SIZING: equal OPTICAL MASS, with a width wall ────────────────────────────
// WHY NOT ONE FIXED HEIGHT PER TIER (2026-08-10).
//
// The previous rule drew every mark in a tier at the same box height, capped by
// the same max width. It is the obvious rule and it looks wrong, because a
// logo's apparent size is not its bounding box:
//
//   • WEIGHT. Nuldam is a fat rounded wordmark, ONWORD LAB is hairline caps. At
//     the same height Nuldam reads about twice as big.
//   • LOCKUPS. aws is letters over a smile, BRAND BOOST is two stacked lines,
//     싱가포르 한인회 is a crest plus a line of 6pt English. Only part of the box
//     is the name, so the whole thing reads small at any given box height.
//   • THE WIDTH CAP. It only bites the widest wordmarks, and when it bites it
//     drops their height off a cliff — INNOVATE 360 and ONWORD LAB were landing
//     at 11px and 10px next to 26px neighbours. That cliff was most of the
//     visible unevenness.
//
// Equal AREA was tried before this and abandoned (see the note in
// opticalHeight): with no tile to sit in, equal area let width run free and the
// long wordmarks dominated their row. That failure was real, but the diagnosis
// was half right. Area is the correct axis; a raw bounding box is the wrong
// thing to measure, because it counts a hairline mark's whitespace as ink.
//
// So each mark now carries a measured `mass` — the fraction of its trimmed box
// it actually paints, as sqrt(ink coverage × silhouette coverage). Ink alone
// would blow up outlined marks (REmited's pill, L^IFE) that paint almost
// nothing; silhouette alone would shrink the bold ones too far. The geometric
// mean behaves on all 18. `mass × aspect` is then the ink a 1px-tall render
// would lay down, and height solves for a constant target:
//
//     h = H0 · (NORM / (aspect × mass)) ^ STRIP_EXP
//
// STRIP_EXP damps it: 0.5 is exactly equal ink and swings too hard (aws would
// be 2.6× the height of ONWORD LAB), 0 is the old fixed height. 0.35 is where
// a row of these marks reads even.
// The width wall still exists, but it is now the last step rather than a cliff
// — the exponent has already pulled the wide marks most of the way down, so
// the wall trims rather than amputates.
//
// This IS per-mark sizing, which the fixed-box note warned against. The
// difference is that `mass` is measured, not tuned: run
// `python3 scripts/measure-logo-mass.py <name>` and paste the number. There is
// still no hand-picked fudge factor, and there should not be one — if a mark
// looks wrong, re-measure it or move STRIP_EXP and re-check the whole tier.
//
// `w`/`h` are the trimmed art's INK dimensions; they give both the aspect ratio
// used above and the <img> intrinsic size, so the box is reserved before the
// file lands.
type StripBox = {
  h: number;     // ≥sm  base height for a NORM-mass mark, px
  maxW: number;  // ≥sm  width wall, px
  mH: number;    // <sm  base height, px
  mMaxW: number; // <sm  width wall, px
};
type StripLogoSpec = {
  src: string; alt: string; w: number; h: number;
  // sqrt(ink × silhouette) coverage of the trimmed box — see the script above.
  mass: number;
};

// The mark that renders at exactly the tier's base height: aspect × mass ≈ 1.45,
// i.e. a ~4:1 wordmark painting ~36% of its box. That is the middle of this set,
// and it is a FIXED constant on purpose — deriving it from the current line-up
// would resize every existing logo the day a sponsor is added.
const STRIP_NORM = 1.45;
// EDIT 2026-08-17: 0.35 → 0.5. 드리마스가 주최 줄에서 혼자 커 보인다는 지적이
// 있었고, 재보니 눈이 맞았습니다 — 그 마크가 칠하는 잉크가 같은 줄 중앙값보다
// 30% 많았습니다(1079 vs 829, 모바일 기준). mass는 다시 재도 같은 값이라 데이터가
// 아니라 이 지수가 원인이었습니다.
//
// 0.35는 잉크를 (aspect × mass)^0.3에 비례하게 남깁니다. 넓고 진한 마크일수록
// 보정이 덜 되고, 드리마스는 이 줄에서 aspect × mass가 가장 큽니다(3.37, 다음이
// 1.53). 그래서 잔차가 그 하나에 몰렸습니다.
//
// 0.5는 잉크를 정확히 맞춥니다. 이 값을 처음에 버린 이유는 "aws가 ONWORD LAB의
// 2.6배 높이가 된다"였는데, 그 뒤에 들어온 폭 상한이 그 극단을 이미 붙잡고
// 있습니다 — ONWORD LAB은 지수와 무관하게 상한(98px)에 걸려 10px로 고정이고,
// 지수를 올려도 더 작아지지 않습니다. 실제 비는 2.2배에서 2.4배로만 움직입니다.
// 원래 반대의 근거가 사라진 값이라 다시 씁니다.
//
// 결과(모바일): 주최 줄의 잉크 편차 1.41배 → 1.00배, 드리마스 폭 119px → 105px.
// 후원 줄은 폭 상한이 이미 잡고 있어 마크당 ±6% 안에서만 움직입니다.
// 이 값을 다시 만지면 두 줄을 다 보세요 — 한 마크만 보고 옮기면 다른 줄이 틀어집니다.
const STRIP_EXP = 0.5;

// Base heights are set so each tier's total rendered width comes out where the
// old fixed box had it (~840px for 후원 on desktop) — this evens the marks out
// without making the strip claim more of the hero, so the wrap points at every
// breakpoint are unchanged. The scale clamps are guard rails for a future mark
// far outside this set; nothing in the current line-up reaches them.
const STRIP_MIN_SCALE = 0.6;
const STRIP_MAX_SCALE = 1.45;
const LEAD_BOX: StripBox = { h: 30, maxW: 160, mH: 24, mMaxW: 128 };
// 후원 sits one step below 주최·주관 — a ~23% smaller base height, same rule.
const SPONSOR_BOX: StripBox = { h: 23, maxW: 122, mH: 18, mMaxW: 98 };

// Rendered height for one mark inside one tier box, at one breakpoint.
function stripHeight(spec: StripLogoSpec, base: number, maxW: number) {
  const aspect = spec.w / spec.h;
  const h = Math.min(
    base * STRIP_MAX_SCALE,
    Math.max(base * STRIP_MIN_SCALE, base * (STRIP_NORM / (aspect * spec.mass)) ** STRIP_EXP),
  );
  // Width wall last: a mark wide enough to still overrun it loses height until
  // it fits, which only pushes it further toward the tier's average mass.
  return Math.round(Math.min(h, maxW / aspect) * 10) / 10;
}

// `rowMax`는 그 티어의 마크 줄이 몇 줄로 접힐지를 정하는 유일한 손잡이입니다.
// 넓은 화면에서는 flex-wrap이 접을 이유가 없어서 티어가 아무리 길어져도 한 줄로
// 늘어서는데, 마크가 열 개를 넘으면 그 한 줄이 히어로를 가로지르는 띠가 되고
// 로고 하나하나는 알아볼 수 없게 작아 보입니다. 폭을 묶어 두면 같은 마크가
// 두 줄로 접히면서 크기는 그대로, 읽기만 나아집니다.
//
// 티어별로만 겁니다 — 주최(5)와 주관(3)은 한 줄이 자연스러운 길이라 손대지
// 않습니다. 후원이 열둘, 열셋으로 늘면 이 값을 다시 보세요(줄당 대여섯 개가
// 기준입니다). 모바일에는 걸지 않습니다: 거기서는 이미 폭이 좁아 알아서 접힙니다.
const confirmedPartnerTiers: { label: Phrase; box: StripBox; items: StripLogoSpec[]; rowMax?: string; rowGap?: string }[] = [
  {
    // 주최 — the AXMOS collective.
    label: dict.hero.partnersHost,
    box: LEAD_BOX,
    items: [
      { src: "/partners/logos/white/trimmed/translink.png",    alt: "Translink Investment", w: 330, h: 91,  mass: 0.421 },
      { src: "/partners/logos/white/trimmed/wilt.png",         alt: "Wilt Venture Builder", w: 309, h: 148, mass: 0.513 },
      { src: "/partners/logos/white/trimmed/codepresso.png",   alt: "Codepresso",           w: 456, h: 91,  mass: 0.280 },
      { src: "/partners/logos/white/trimmed/popup-studio.png", alt: "Popup Studio",         w: 512, h: 245, mass: 0.525 },
      { src: "/partners/logos/white/trimmed/drimaes.png",      alt: "Drimaes",              w: 332, h: 50,  mass: 0.507 },
    ],
  },
  {
    // 주관 — the student associations actually running the event.
    label: dict.hero.partnersOrganizers,
    box: LEAD_BOX,
    items: [
      { src: "/partners/logos/white/trimmed/smu-lion.png", alt: "SMU KSA",           w: 292, h: 173, mass: 0.465 },
      { src: "/partners/logos/white/trimmed/nus.png",      alt: "NUS Korea Society", w: 512, h: 512, mass: 0.424 },
      { src: "/partners/logos/white/trimmed/ntu-ksa.png",  alt: "NTU KSA",           w: 318, h: 382, mass: 0.670 },
    ],
  },
  {
    // 후원 — confirmed only; the deck lists no in-discussion sponsors.
    // AWS and Hashed lead: they are the two marks a visitor recognises without
    // being told, so they do the most work in a first-screen band. The rest keep
    // the partner section's order. (Only the hero strip is ordered this way —
    // the section itself stays grouped by what each sponsor provides.)
    label: dict.hero.partnersSponsors,
    box: SPONSOR_BOX,
    // 후원이 열한 곳이 되면서 한 줄이 화면을 가로질렀습니다 (2026-08-17).
    // 6 + 5 두 줄로 접습니다 — 위 rowMax 주석 참고.
    //
    // EDIT 2026-08-17 (2차): 두 줄로 접고 나니 이번엔 로고들이 화면 가운데
    // 뭉쳐 보였습니다. 이 티어만 마크 사이를 넓힙니다(sm:gap-x-6 → 12, 27px →
    // 54px). 줄의 실제 폭을 정하는 건 rowMax가 아니라 마크 폭 + 간격입니다 —
    // rowMax는 어디서 접히는지만 정하고, 남는 폭은 가운데 정렬로 그냥 비어
    // 있습니다. 그래서 "더 넓게 퍼뜨린다"의 손잡이는 간격 쪽입니다.
    // 결과: 첫 줄 608 → 743px, 둘째 줄 567 → 675px.
    //
    // 주최·주관은 한 줄이라 그대로 둡니다. 간격을 여기서 더 벌리면 마크들이
    // 한 덩어리로 안 읽히기 시작하니, 다음에 넓힐 일이 생기면 간격보다 마크
    // 크기(SPONSOR_BOX)를 먼저 보세요.
    rowGap: "sm:gap-x-12",
    //
    // 단위는 rem이 아니라 px입니다. 이 사이트는 루트 폰트가 18px이라 46rem이
    // 828px로 계산돼(= 일곱 개가 그대로 들어감) 처음 걸었을 때 아무 일도
    // 일어나지 않았습니다. 줄바꿈 지점은 마크의 실측 px 폭으로 정해지는 값이니
    // px로 적습니다.
    //
    // 계산 근거: 앞 여섯 개가 598px(gap 24 포함), 일곱 번째까지면 744px입니다.
    // 700px은 그 사이라 여섯에서 끊기고, 양쪽으로 44px과 102px 여유가 있어
    // 마크 하나가 조금 바뀌어도 줄이 튀지 않습니다. 로고를 더하거나 아트워크를
    // 갈면 이 숫자를 다시 재세요.
    // 700 → 800 (간격을 넓히면서 같이 올렸습니다). 여섯 개가 743px, 일곱 번째까지면
    // 919px이라 800은 그 사이입니다. 양쪽으로 57px과 119px 여유가 있습니다.
    rowMax: "sm:max-w-[800px]",
    items: [
      { src: "/partners/logos/white/trimmed/aws.png",                alt: "AWS",                             w: 512, h: 306, mass: 0.491 },
      { src: "/partners/logos/white/trimmed/hashed.png",             alt: "Hashed",                          w: 355, h: 90,  mass: 0.499 },
      { src: "/partners/logos/white/trimmed/innovate360.png",        alt: "INNOVATE 360",                    w: 455, h: 54,  mass: 0.378 },
      { src: "/partners/logos/white/trimmed/life.png",               alt: "L^IFE",                           w: 900, h: 352, mass: 0.466 },
      { src: "/partners/logos/white/trimmed/bzcf.png",               alt: "BZCF",                            w: 465, h: 156, mass: 0.553 },
      { src: "/partners/logos/white/trimmed/korean-association.png", alt: "Korean Association in Singapore",  w: 443, h: 90,  mass: 0.409 },
      { src: "/partners/logos/white/trimmed/onword-lab.png",         alt: "Onword Lab",                      w: 900, h: 92,  mass: 0.563 },
      { src: "/partners/logos/white/trimmed/remited.png",            alt: "REmited",                         w: 512, h: 105, mass: 0.500 },
      { src: "/partners/logos/white/trimmed/brandboost.png",         alt: "Brand Boost",                     w: 205, h: 81,  mass: 0.454 },
      { src: "/partners/logos/white/trimmed/nuldam.png",             alt: "Nuldam",                          w: 631, h: 136, mass: 0.518 },
      // 해녀의 부엌, 2026-08-17 확정. 널담 바로 뒤에 둡니다 — 둘 다 어워드 부상이고,
      // 아래 후원 그리드는 이 스트립 순서를 그대로 따르므로(sortLikeHeroStrip) 여기
      // 순서가 곧 그리드에서 두 마크가 나란히 서는 이유가 됩니다.
      //
      // mass 0.316은 measure-logo-mass.py가 잰 값입니다(눈대중으로 고치지 마세요).
      // 아트워크는 zero100 밴드용 파일(316x72)이 유일한 소스라 다른 마크(장변 900px)
      // 보다 작습니다. 원본을 받으면 scripts/process-partner-logos.py로 다시 뽑고
      // 이 줄의 w/h/mass를 함께 갱신하세요.
      { src: "/partners/logos/white/trimmed/haenyeo-kitchen.png",    alt: "Jeju Haenyeo",                     w: 316, h: 72,  mass: 0.316 },
    ],
  },
];

// Sort any sponsor list into the hero strip's order. The strip is the single
// source of truth for sponsor sequence (AWS and Hashed lead it — the two marks
// a visitor recognises without being told); anything the strip doesn't list
// keeps its relative position at the end rather than being dropped.
export function sortLikeHeroStrip<T extends { src: string }>(rows: T[]): T[] {
  const order = confirmedPartnerTiers
    .find((tier) => tier.label === dict.hero.partnersSponsors)!
    .items.map((i) => i.src);
  const rank = (src: string) => {
    const i = order.indexOf(src);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...rows].sort((a, b) => rank(a.src) - rank(b.src));
}

// The measured mass of a sponsor mark, read off the hero strip's roster so the
// 후원 grid cannot drift from it. Same reasoning as sortLikeHeroStrip: the two
// lists describe the same ten marks, and every time they have held their own
// copy of something they have disagreed. Throws rather than defaulting — a
// silent fallback would size the new mark wrong and look like a design choice.
// Throwing is safe here precisely because it is loud: the home page is
// statically prerendered, so an unmeasured mark fails `next build` and can
// never reach a visitor. Do not soften this into a default.
export function sponsorMass(src: string): number {
  const item = confirmedPartnerTiers
    .find((tier) => tier.label === dict.hero.partnersSponsors)!
    .items.find((i) => i.src === src);
  if (!item) throw new Error(`sponsorMass: no measured mass for ${src}. Run scripts/measure-logo-mass.py and add it to confirmedPartnerTiers.`);
  return item.mass;
}

// One logo, drawn at the height that gives it the same optical mass as the rest
// of its tier (see stripHeight above).
function StripLogo({ src, alt, w, h, mass, box }: StripLogoSpec & { box: StripBox }) {
  // One <img>, two heights. A CSS variable per breakpoint is what lets the phone
  // size be genuinely its own instead of a scaled-down desktop one, without
  // a second element in the DOM (these are 18 above-fold images — duplicating
  // them for a media query is not a trade worth making).
  const spec = { src, alt, w, h, mass };
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      // INK dimensions, for the aspect ratio only — CSS below owns the size.
      // Present so the browser reserves the right box before the file lands.
      width={w}
      height={h}
      // Above the fold: never lazy-load. These are the same small pre-shrunk
      // static marks the partner wall uses, so there's nothing to optimize.
      // fetchPriority="low" is the counterweight: 14 eager images at default
      // priority pushed hero LCP from ~0.97s to ~1.56s on throttled Slow 4G /
      // 4x CPU by crowding the critical path. Low priority keeps them eager (no
      // pop-in on fast connections) but yields the pipe to the hero itself.
      loading="eager"
      fetchPriority="low"
      decoding="async"
      title={alt}
      // This mark's own height, phone value and ≥sm value; `width: auto` then
      // follows the aspect ratio, so flex-wrap still packs the row naturally.
      style={{
        "--sl-h": `${stripHeight(spec, box.mH, box.mMaxW)}px`,
        "--sl-w": `${box.mMaxW}px`,
        "--sl-h-sm": `${stripHeight(spec, box.h, box.maxW)}px`,
        "--sl-w-sm": `${box.maxW}px`,
      } as React.CSSProperties}
      // max-w restates the wall stripHeight() already applied, so it never bites
      // — it is a backstop for a mark whose `mass` was never measured (a wrong
      // mass makes one logo the wrong size; a missing wall would let it run
      // across the row).
      //
      // Opacity raised 50 → 80. At 50 the marks were only legible once the page
      // had scrolled far enough for the strip to sit over the hero scrim's dark
      // end — brightness was an accident of scroll position, not a design, so
      // they looked muddy exactly where they matter most (at rest, first view).
      // The scrim added behind the strip is what makes 80 safe on the bright
      // part of the video; the drop-shadow still carries the thin wordmarks.
      className="h-[var(--sl-h)] w-auto max-w-[var(--sl-w)] shrink-0 object-contain opacity-80 grayscale drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] transition duration-300 group-hover:opacity-100 sm:h-[var(--sl-h-sm)] sm:max-w-[var(--sl-w-sm)]"
    />
  );
}

// The small 주최 / 주관 / 후원 caption that leads each tier.
// 0.55rem → 0.65rem (2026-08-24 모바일 감사): 히어로 아이브로와 같은 이유입니다.
// 이 캡션은 whitespace-nowrap이라 줄이 접힐 위험이 없고, 폰의 마퀴 행에서도
// 여백이 남습니다(320px에서 "주최 AXMOS"가 66px, 칸이 266px).
function StripTierLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 whitespace-nowrap text-[0.65rem] font-bold uppercase tracking-[0.16em] text-violet-200/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
      {children}
    </span>
  );
}

// Thin confirmed-partner logo band at the bottom of the hero, above the scroll
// hint — grouped 주최 → 주관 → 후원 like the partner section. Desktop lays the
// tiers out inline and lets them wrap; below sm it reuses the site's marquee
// animation as a slow auto-scroll (17 marks can't fit a phone width) with the
// tier captions riding inline in the same track. Tapping anywhere jumps to the
// full partner section — individual intro modals stay there, not here.
export default function HeroPartnerStrip({ t }: { t: Tfn }) {
  // ONE STATIC LAYOUT AT EVERY WIDTH (2026-08-03).
  //
  // Mobile used to render this as a single-line auto-scroll marquee, on the
  // reasoning that 18 marks can't fit a phone width. They can — they just have to
  // wrap. And the marquee cost the thing the strip exists for: a logo wall earns
  // trust by being SEEN AT ONCE. Three marks sliding past one at a time is a
  // ticker; it reads as decoration, and a visitor who looks away has no idea
  // whether they saw two sponsors or twenty. Sequential exposure is a weak trust
  // signal no matter how many logos are in the queue.
  //
  // So the tier stack below is no longer `hidden sm:flex` — it renders at every
  // width, from the same data, through the same StripLogo and the same tier
  // boxes. Mobile is not a separate layout: it is the same optical-mass rule
  // with the phone half of each StripBox (mH / mMaxW) and tighter gaps, so the
  // 주최·주관 > 후원 hierarchy and the within-tier evenness both survive the
  // smaller scale.
  //
  // Side effects, both good: no animation means nothing to exempt from
  // prefers-reduced-motion (the old marquee deliberately ignored it, because a
  // frozen ticker hides half its content), and the duplicated marquee track is
  // gone so the above-fold image count drops back to one copy.
  return (
    // Non-clickable: kept the `group` wrapper so the hover highlight still plays,
    // but it's a div (not a link) so the strip no longer jumps to #builders.
    // `relative` + the scrim below. The hero's own legibility scrim fades to
    // TRANSPARENT at its bottom edge, which is exactly where this strip sits —
    // so the brightest part of the video was showing through the marks at full
    // strength, and they only sharpened once scrolling carried them up into the
    // dark end of that gradient. This gives the strip its own constant backdrop
    // so legibility no longer depends on scroll position or on which frame of
    // the video happens to be playing. The background scene itself is untouched.
    // mt-11 on phones (2026-08-18). 이 스트립 바로 위에 모바일 전용 오픈채팅
    // 칩이 있는데(lg:hidden), 아래 글로가 -inset-y-6만큼 위로 번지면서 그 칩의
    // 밑동을 애매하게 물고 있었습니다. 버튼이 글로 안에 반쯤 잠긴 것처럼 보여서
    // 둘 사이를 벌립니다. sm 이상은 종전 값 그대로입니다 — 그 폭에서는 위에
    // 칩이 없습니다.
    <div className="group relative mt-11 block w-full rounded-2xl py-1.5 sm:mt-5">
      <div
        aria-hidden
        // No rounding and a long falloff that runs PAST the container on every
        // side: with a tight radius this read as a dark card floating over the
        // video — fine behind the tall three-tier desktop stack, obviously a box
        // behind the single-line mobile marquee. Bleeding the gradient outside
        // the element and fading to transparent well before its edge keeps it a
        // shadow rather than a panel.
        // -inset-x-6 on mobile, not -inset-x-10. The hero rail pads the strip in
        // by px-6 (24px), so a 40px horizontal bleed put this layer 16px past the
        // viewport on each side — that was one of the two sources of the 18px
        // horizontal document overflow (see the overflow changelog). At -6 the
        // glow reaches exactly the screen edge and no further. The gradient is
        // already ~0 alpha out there, so nothing visible changed; from sm up the
        // rail pads by 40px and the original bleed still fits.
        // 위쪽 번짐을 -3으로 줄여봤다가 되돌렸습니다(2026-08-18). 세로 폭이 좁아지니
        // 그라디언트가 위 모서리에 닿기 전에 투명해지지 못해 직선 경계가 생겼고,
        // 위 주석이 경고하는 "그림자가 아니라 패널"이 그대로 나왔습니다. 오픈채팅
        // 칩과의 간격은 이 레이어가 아니라 컨테이너의 mt로 벌립니다.
        className="pointer-events-none absolute -inset-x-6 -inset-y-6 -z-10 sm:-inset-x-10"
        style={{
          background:
            "radial-gradient(75% 130% at 50% 50%, rgba(6,4,15,0.7) 0%, rgba(6,4,15,0.5) 42%, rgba(6,4,15,0.22) 68%, transparent 88%)",
        }}
      />
      <p className="text-center text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)] transition group-hover:text-white/90">
        {t(dict.hero.partnersLabel)}
      </p>
      {/* ≥sm — one row per tier, caption centred above its own marks. The tiers
          used to run inline (caption, then marks, then the next caption) which
          read as one long undifferentiated line: the whole point of the tiering
          is that 주최 / 주관 / 후원 are answers to different questions, and a
          vertical stack is what makes them read that way. */}
      {/* Gaps are deliberately tight: stacking three tiers and enlarging the
          marks already added ~160px to a hero that overflows a laptop viewport,
          so every row here is spaced to the minimum that still separates them. */}
      {/* Gaps are deliberately tight on mobile: three tiers of wrapped marks in a
          hero that is already stacked will run long otherwise. gap-x-3 + the
          phone box widths (mMaxW) is what lands ~3–4 marks per row at 375px. */}
      <div className="mt-2.5 flex flex-col items-center gap-2">
        {confirmedPartnerTiers.map((tier) => (
          <div key={tier.label.en} className="flex flex-col items-center gap-1">
            <StripTierLabel>{t(tier.label)}</StripTierLabel>
            {/* flex-wrap with one gap for the whole tier. Every mark is capped
                at the same width wall, so no single logo can claim a row to
                itself the way the widest wordmarks used to (DRIMAES had a line
                of its own under bounding-box area sizing). */}
            <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 ${tier.rowGap ?? "sm:gap-x-6"} ${tier.rowMax ?? ""}`}>
              {tier.items.map((p) => (
                <StripLogo key={p.alt} {...p} box={tier.box} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
