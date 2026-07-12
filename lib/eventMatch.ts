// ─────────────────────────────────────────────────────────────────────────────
// Session recommendation for personality-test takers.
// Instead of matching solo builders to a squad, we read the builder role their
// result already carries and recommend the Day 2–5 side sessions they'd most
// enjoy RSVP-ing to. The picks link back to the program section on the main page.
//
// Deterministic + stable: the same result always yields the same picks, so a
// shared "?r=INFJ-A" link shows a friend the same recommendations.
// Pure functions + mapping only — session content lives in data/schedule.ts.
//
// Scoring axes that shape the picks: builder ROLE (plan/dev/design/growth) sets
// the base category weights; MIND (E/I) nudges people-time vs focus-time; and
// IDENTITY (A/T) adds a small nudge — Turbulent → mentoring (wants 1:1
// reassurance), Assertive → build (prefers self-driven focus). All deterministic,
// so a shared "?r=INFJ-A" vs "?r=INFJ-T" link differs but each is stable.
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "@/data/dictionary";
import { schedule, type BEvent, type Category } from "@/data/schedule";
import { RESULTS, type Identity, type MbtiKey, type RoleKey } from "@/data/quiz";

export interface EventPick {
  event: BEvent;
  reason: Phrase; // why this session fits the taker (category-driven)
}

// Candidate pool = the non-main sessions a builder can lean into across the 8
// days (workshops, networking, mentoring, self-paced build). Main-track moments
// (problem release, keynote, demo day) are for everyone, so they're never
// "picks". Repeated sessions (Independent Build, Networking, Mentoring 1:1)
// collapse to one by title so a recommendation never surfaces the same thing
// twice.
function candidatePool(): BEvent[] {
  const pool: BEvent[] = [];
  const seenTitles = new Set<string>();
  for (const ev of schedule) {
    if (ev.category === "main") continue;
    if (seenTitles.has(ev.title.en)) continue;
    seenTitles.add(ev.title.en);
    pool.push(ev);
  }
  return pool;
}

// How strongly each builder role is drawn to each session category.
const ROLE_WEIGHT: Record<RoleKey, Partial<Record<Category, number>>> = {
  plan:   { mentoring: 5, network: 4, workshop: 3, build: 2 },
  dev:    { workshop: 5, build: 5, mentoring: 3, network: 1 },
  design: { workshop: 4, network: 3, mentoring: 3, build: 2 },
  growth: { network: 5, mentoring: 4, workshop: 2, build: 2 },
};

// Extroverts lean toward people-time; introverts toward focused / learning time.
const E_BONUS: Partial<Record<Category, number>> = { network: 1 };
const I_BONUS: Partial<Record<Category, number>> = { workshop: 1, build: 1, mentoring: 1 };

// Identity (A/T) nudge — layered on top of role + MIND weights.
const IDENTITY_BONUS: Record<Identity, Partial<Record<Category, number>>> = {
  T: { mentoring: 1 }, // Turbulent → 1:1 feedback / reassurance helps most
  A: { build: 1 },     // Assertive → prefers self-driven, heads-down focus time
};

// Fallback reason (category-only) — used when a role has no bespoke line below.
const CATEGORY_REASON: Record<Category, Phrase> = {
  main: { ko: "모두가 함께하는 메인 트랙이에요.", en: "The main track everyone shares." },
  workshop: { ko: "AI 바이브 코딩을 빠르게 흡수하는 당신에게 딱이에요.", en: "Tailored to how fast you soak up AI vibe coding." },
  build: { ko: "방해 없이 몰입해서 빌드하는 시간이에요.", en: "Heads-down, distraction-free build time." },
  mentoring: { ko: "막히는 지점을 멘토와 1:1로 푸는 시간이에요.", en: "One-on-one mentor time for your blockers." },
  network: { ko: "생태계 사람들과 가볍게 연결되는 자리예요.", en: "Easy networking with people across the ecosystem." },
};

// Role × category reason — personalized so the same session reads differently
// for a strategist vs a builder. Falls back to CATEGORY_REASON when a pair is
// missing (all 16 pairs are filled below, so the fallback is belt-and-braces).
const REC_REASON: Record<RoleKey, Partial<Record<Category, Phrase>>> = {
  plan: {
    workshop: { ko: "판을 짜기 전에 도구의 한계부터 감 잡기 좋은 시간이에요.", en: "Get a feel for what the tools can (and can't) do before you frame the bet." },
    build: { ko: "전략을 실제 프로토타입으로 검증해보는 몰입 시간이에요.", en: "Heads-down time to pressure-test your strategy against a real prototype." },
    mentoring: { ko: "전략의 빈틈을 멘토와 1:1로 검증하기 좋은 시간이에요.", en: "One-on-one time to have a mentor poke holes in your strategy." },
    network: { ko: "다양한 관점을 모아 판을 더 크게 그릴 수 있는 자리예요.", en: "Gather other angles and draw the bet bigger." },
  },
  dev: {
    workshop: { ko: "손이 빠른 당신, 바이브 코딩 실전 감각을 바로 흡수해요.", en: "Fast hands — absorb hands-on vibe-coding technique on the spot." },
    build: { ko: "방해 없이 코드에 몰입해 제품을 밀어붙이는 시간이에요.", en: "Distraction-free time to sink into the code and push the build." },
    mentoring: { ko: "막힌 버그·아키텍처를 멘토와 1:1로 뚫는 시간이에요.", en: "One-on-one time to unblock a nasty bug or architecture call." },
    network: { ko: "다른 빌더들의 스택과 트릭을 슬쩍 배워오는 자리예요.", en: "Pick up other builders' stacks and tricks along the way." },
  },
  design: {
    workshop: { ko: "AI로 무드보드부터 프로토타입까지 빠르게 뽑는 감을 익혀요.", en: "Learn to spin moodboards-to-prototypes fast with AI." },
    build: { ko: "비주얼과 내러티브를 방해 없이 다듬는 몰입 시간이에요.", en: "Uninterrupted time to polish the visuals and the narrative." },
    mentoring: { ko: "스토리와 UX의 결을 멘토와 1:1로 다듬는 시간이에요.", en: "One-on-one time to refine the story and the UX grain." },
    network: { ko: "레퍼런스와 취향을 나누며 안목을 넓히는 자리예요.", en: "Swap references and taste, widen your eye." },
  },
  growth: {
    workshop: { ko: "빠르게 만들어 빠르게 알리는 그로스 감각을 챙겨가요.", en: "Take away the make-fast, share-fast growth instinct." },
    build: { ko: "런치 각을 잡고 데모를 빠르게 빚어내는 시간이에요.", en: "Shape the launch angle and rough out the demo, fast." },
    mentoring: { ko: "피칭·런치 전략을 멘토와 1:1로 벼리는 시간이에요.", en: "One-on-one time to sharpen the pitch and launch play." },
    network: { ko: "사람들과 연결되며 무대와 기회를 넓히는 당신의 자리예요.", en: "Your element — connect with people, widen the stage and the odds." },
  },
};

// Small stable string hash (djb2) → non-negative int. Used for a deterministic
// tie-break jitter without Math.random (which would break SSR/hydration parity).
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// The sessions a result is recommended to RSVP for — deterministic + varied.
export function recommendEvents(resultId: string, count = 3): EventPick[] {
  const [mbtiRaw, identityRaw] = resultId.split("-");
  const mbti = mbtiRaw as MbtiKey;
  const roleKey = RESULTS[mbti].roleKey;
  const weights = ROLE_WEIGHT[roleKey];
  const social = mbti.startsWith("E") ? E_BONUS : I_BONUS;
  const identityBonus = IDENTITY_BONUS[identityRaw as Identity] ?? {};

  const scored = candidatePool().map((event) => {
    const base = weights[event.category] ?? 0;
    const bonus = social[event.category] ?? 0;
    const idBonus = identityBonus[event.category] ?? 0;
    // tiny deterministic jitter so ties break consistently per result.
    const jitter = (hashString(resultId + event.id) % 100) / 1000;
    return { event, score: base + bonus + idBonus + jitter };
  });
  scored.sort((a, b) => b.score - a.score);

  // Take the top `count`, capping any single category at 2 so picks feel varied.
  const picks: BEvent[] = [];
  const catCount: Partial<Record<Category, number>> = {};
  for (const { event } of scored) {
    if (picks.length >= count) break;
    const c = catCount[event.category] ?? 0;
    if (c >= 2) continue;
    catCount[event.category] = c + 1;
    picks.push(event);
  }
  // Safety: if the cap left us short on a tiny pool, backfill with next-best.
  if (picks.length < count) {
    for (const { event } of scored) {
      if (picks.length >= count) break;
      if (!picks.includes(event)) picks.push(event);
    }
  }

  return picks.map((event) => ({
    event,
    reason: REC_REASON[roleKey]?.[event.category] ?? CATEGORY_REASON[event.category],
  }));
}
