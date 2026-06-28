// ─────────────────────────────────────────────────────────────────────────────
// Session recommendation for personality-test takers.
// Instead of matching solo builders to a squad, we read the builder role their
// result already carries and recommend the Day 2–5 side sessions they'd most
// enjoy RSVP-ing to. The picks link back to the program section on the main page.
//
// Deterministic + stable: the same result always yields the same picks, so a
// shared "?r=INFJ-A" link shows a friend the same recommendations.
// Pure functions + mapping only — session content lives in data/schedule.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "@/data/dictionary";
import { schedule, type BEvent, type Category } from "@/data/schedule";
import { RESULTS, type MbtiKey, type RoleKey } from "@/data/quiz";

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

const CATEGORY_REASON: Record<Category, Phrase> = {
  main: { ko: "모두가 함께하는 메인 트랙이에요.", en: "The main track everyone shares." },
  workshop: { ko: "AI 바이브 코딩을 빠르게 흡수하는 당신에게 딱이에요.", en: "Tailored to how fast you soak up AI vibe coding." },
  build: { ko: "방해 없이 몰입해서 빌드하는 시간이에요.", en: "Heads-down, distraction-free build time." },
  mentoring: { ko: "막히는 지점을 멘토와 1:1로 푸는 시간이에요.", en: "One-on-one mentor time for your blockers." },
  network: { ko: "생태계 사람들과 가볍게 연결되는 자리예요.", en: "Easy networking with people across the ecosystem." },
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
  const mbti = resultId.split("-")[0] as MbtiKey;
  const roleKey = RESULTS[mbti].roleKey;
  const weights = ROLE_WEIGHT[roleKey];
  const social = mbti.startsWith("E") ? E_BONUS : I_BONUS;

  const scored = candidatePool().map((event) => {
    const base = weights[event.category] ?? 0;
    const bonus = social[event.category] ?? 0;
    // tiny deterministic jitter so ties break consistently per result.
    const jitter = (hashString(resultId + event.id) % 100) / 1000;
    return { event, score: base + bonus + jitter };
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

  return picks.map((event) => ({ event, reason: CATEGORY_REASON[event.category] }));
}
