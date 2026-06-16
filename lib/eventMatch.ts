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

// Structural day markers that aren't really a session to RSVP for.
const EXCLUDED_IDS = new Set(["d5-no-main"]);

// Candidate pool = the optional Day 2–5 side sessions a builder freely RSVPs to.
// Main-track and Day 1/6 sessions are for everyone, so they're never "picks".
// Repeated sessions (the two Ad-hoc Mentorings, the two AI Use Cases) collapse
// to one by title so a recommendation never surfaces the same thing twice.
function candidatePool(): BEvent[] {
  const pool: BEvent[] = [];
  const seenTitles = new Set<string>();
  for (const ev of schedule) {
    const optional = ev.day >= 2 && ev.day <= 5 && ev.category !== "main";
    if (!optional || EXCLUDED_IDS.has(ev.id)) continue;
    if (seenTitles.has(ev.title.en)) continue;
    seenTitles.add(ev.title.en);
    pool.push(ev);
  }
  return pool;
}

// How strongly each builder role is drawn to each side-session category.
const ROLE_WEIGHT: Record<RoleKey, Partial<Record<Category, number>>> = {
  plan:   { empowerment: 5, meetup: 4, ambassador: 3, dinner: 2, build: 2 },
  dev:    { ambassador: 5, build: 5, meetup: 3, empowerment: 1, dinner: 1 },
  design: { empowerment: 4, ambassador: 3, meetup: 3, dinner: 3, build: 2 },
  growth: { dinner: 5, meetup: 5, ambassador: 2, empowerment: 2, build: 1 },
};

// Extroverts lean toward people-time; introverts toward focused / learning time.
const E_BONUS: Partial<Record<Category, number>> = { dinner: 1, meetup: 1, network: 1 };
const I_BONUS: Partial<Record<Category, number>> = { ambassador: 1, build: 1, empowerment: 1 };

const CATEGORY_REASON: Record<Category, Phrase> = {
  main: { ko: "메인 트랙에서 창업가의 1차 인사이트를 직접 듣기 좋아요.", en: "First-hand founder insight on the main track." },
  ambassador: { ko: "AI 워크플로를 빠르게 흡수하는 당신에게 딱이에요.", en: "Tailored to how fast you soak up AI workflows." },
  dinner: { ko: "사람들과 어울리며 에너지를 얻는 자리예요.", en: "A table where you connect and recharge." },
  meetup: { ko: "생태계 사람들과 가볍게 연결되는 밋업이에요.", en: "Easy networking with people across the ecosystem." },
  empowerment: { ko: "‘나의 다음 걸음’을 넓게 그려보는 세션이에요.", en: "A session to widen your next step." },
  network: { ko: "팀과 사람을 잇는, 당신이 빛나는 자리예요.", en: "Connecting people — where you shine." },
  build: { ko: "방해 없이 몰입해서 빌드하는 시간이에요.", en: "Heads-down, distraction-free build time." },
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
