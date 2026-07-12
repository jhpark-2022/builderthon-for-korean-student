// ─────────────────────────────────────────────────────────────────────────────
// Pure scoring for the AI personality test.
// 14 answers → per-axis Sidon-weighted ratio → 4-letter MBTI + Identity (A/T).
//
// For each axis we sum the weights of the answers pointing at the FIRST pole
// (E/N/T/J/A) and divide by the axis denom → r ∈ [0,1]. r > 0.5 wins the first
// pole, r < 0.5 the second. Because each axis's weights are a Sidon set (all
// subset sums distinct) and no subset sums to denom/2, r === 0.5 is impossible —
// so ties can't happen. The displayed % maps r onto a per-axis [floor, ceil]
// band, giving 4 distinct values per 3-question axis (2 for Identity) instead
// of the old flat 67%. See AXIS_CONFIG and data/quiz.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AXIS_ORDER,
  AXIS_POLES,
  QUESTIONS,
  RESULTS,
  type Axis,
  type Identity,
  type MbtiKey,
  type Pole,
} from "@/data/quiz";

export type Choice = "a" | "b";

// Per-axis display band. denom = sum of that axis's question weights; a raw
// ratio r maps to round(floor + max(r, 1-r) * (ceil - floor)). floor/ceil are
// tuned per axis so every axis shows a distinct spread of %s.
export interface AxisBand {
  denom: number;
  floor: number;
  ceil: number;
}

export const AXIS_CONFIG: Record<Axis, AxisBand> = {
  MIND: { denom: 14, floor: 52, ceil: 95 }, // weights {2,4,8} → 77 / 83 / 89 / 95
  ENERGY: { denom: 10, floor: 54, ceil: 93 }, // weights {1,3,6} → 77 / 81 / 89 / 93
  NATURE: { denom: 8, floor: 55, ceil: 91 }, // weights {1,2,5} → 78 / 82 / 86 / 91
  TACTICS: { denom: 7, floor: 53, ceil: 94 }, // weights {1,2,4} → 76 / 82 / 88 / 94
  IDENTITY: { denom: 10, floor: 56, ceil: 92 }, // weights {3,7} → 81 / 92
};

// Round half to even — reconciles the published bands with the ratio formula:
// e.g. NATURE's 86.5 → 86 and 77.5 → 78 (plain Math.round would give 87).
function bankRound(x: number): number {
  const floor = Math.floor(x);
  const frac = x - floor;
  if (Math.abs(frac - 0.5) < 1e-9) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(x);
}

// Per-axis winner + margin + the raw answer pattern, used by the result-screen
// gauges and the answer-aware explanation lookup.
export interface AxisScore {
  axis: Axis;
  winner: Pole; // the pole that won this axis (e.g. "E")
  loser: Pole; // the opposite pole
  pct: number; // displayed % for the winning pole (per-axis band)
  // Each of the axis's questions in QUESTION order, encoded 1 if the chosen pole
  // is the axis's FIRST pole (E/N/T/J/A), else 0. Pole-based (NOT a/b) so it
  // survives the phase-1 a/b swaps. Keys data/quizExplanations.ts.
  pattern: number[];
}

export interface QuizResult {
  mbti: MbtiKey;
  identity: Identity;
  resultId: string; // e.g. "INFJ-A"
  // Only present when the taker actually answered the quiz. Deep-linked results
  // (parseResultId) carry no per-answer data, so `axes` is undefined there and
  // the UI hides the gauge + explanation section.
  axes?: AxisScore[];
}

// answers[i] is the choice for QUESTIONS[i]. Missing/short answers just don't
// score (the UI never calls this until all 14 are answered).
export function scoreQuiz(answers: Choice[]): QuizResult {
  const axes: AxisScore[] = AXIS_ORDER.map((axis) => {
    const [first, second] = AXIS_POLES[axis];
    const cfg = AXIS_CONFIG[axis];

    let firstSum = 0;
    const pattern: number[] = [];
    QUESTIONS.forEach((q, i) => {
      if (q.axis !== axis) return;
      const choice = answers[i];
      const pole = choice === "a" || choice === "b" ? q[choice].pole : null;
      const isFirst = pole === first;
      pattern.push(isFirst ? 1 : 0);
      if (isFirst) firstSum += q.w;
    });

    const r = firstSum / cfg.denom;
    // Sidon guarantee: r is never exactly 0.5 (no subset sums to denom/2).
    if (r === 0.5) throw new Error(`quiz: impossible tie on ${axis}`);
    const winner = r > 0.5 ? first : second;
    const loser = winner === first ? second : first;
    const pct = bankRound(cfg.floor + Math.max(r, 1 - r) * (cfg.ceil - cfg.floor));
    return { axis, winner, loser, pct, pattern };
  });

  const byAxis = (a: Axis) => axes.find((x) => x.axis === a)!.winner;
  const l1 = byAxis("MIND"); // E | I
  const l2 = byAxis("ENERGY"); // N | S
  const l3 = byAxis("NATURE"); // T | F
  const l4 = byAxis("TACTICS"); // J | P
  const identity: Identity = byAxis("IDENTITY") === "A" ? "A" : "T";

  const mbti = `${l1}${l2}${l3}${l4}` as MbtiKey;
  return { mbti, identity, resultId: `${mbti}-${identity}`, axes };
}

// Parse a shared "?r=INFJ-A" query into a validated result, or null if bogus.
export function parseResultId(raw: string | null | undefined): QuizResult | null {
  if (!raw) return null;
  const [mbti, identity] = raw.toUpperCase().split("-");
  if (!(mbti in RESULTS)) return null;
  if (identity !== "A" && identity !== "T") return null;
  return { mbti: mbti as MbtiKey, identity, resultId: `${mbti}-${identity}` };
}
