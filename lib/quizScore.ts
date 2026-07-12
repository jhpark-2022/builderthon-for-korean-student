// ─────────────────────────────────────────────────────────────────────────────
// Pure scoring for the AI personality test (brief §7).
// 12 answers → 5-axis tally → 4-letter MBTI + Identity (A/T) → model + variant.
// No ties possible by design: every axis has an odd weight total (weighted 2+1
// on the two-question axes, 1+1+1 on the three-question axes).
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

// Per-axis winner + margin, used to render the result-screen % gauges.
export interface AxisScore {
  axis: Axis;
  winner: Pole; // the pole that won this axis (e.g. "E")
  loser: Pole; // the opposite pole
  pct: number; // winner share, round(winner / (winner+loser) * 100) → 67 or 100
}

export interface QuizResult {
  mbti: MbtiKey;
  identity: Identity;
  resultId: string; // e.g. "INFJ-A"
  // Only present when the taker actually answered the quiz. Deep-linked results
  // (parseResultId) carry no per-answer data, so `axes` is undefined there and
  // the UI hides the gauge section.
  axes?: AxisScore[];
}

// answers[i] is the choice for QUESTIONS[i]. Missing/short answers just don't
// score (the UI never calls this until all 12 are answered).
export function scoreQuiz(answers: Choice[]): QuizResult {
  const score: Record<Pole, number> = {
    E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0, A: 0, Tid: 0,
  };

  QUESTIONS.forEach((q, i) => {
    const choice = answers[i];
    if (choice !== "a" && choice !== "b") return;
    const pole = q[choice].pole;
    score[pole] += q.w;
  });

  // ">=" picks the left pole on a tie, but §7-2 guarantees ties never happen.
  const l1 = score.E >= score.I ? "E" : "I";
  const l2 = score.N >= score.S ? "N" : "S";
  const l3 = score.T >= score.F ? "T" : "F";
  const l4 = score.J >= score.P ? "J" : "P";
  const identity: Identity = score.A >= score.Tid ? "A" : "T";

  const mbti = `${l1}${l2}${l3}${l4}` as MbtiKey;

  // Per-axis margins for the gauges — display order fixed by AXIS_ORDER.
  const axes: AxisScore[] = AXIS_ORDER.map((axis) => {
    const [left, right] = AXIS_POLES[axis];
    const leftScore = score[left];
    const rightScore = score[right];
    const winner = leftScore >= rightScore ? left : right;
    const loser = winner === left ? right : left;
    const winnerScore = Math.max(leftScore, rightScore);
    const total = leftScore + rightScore; // always 3 given odd per-axis weights
    const pct = total > 0 ? Math.round((winnerScore / total) * 100) : 0;
    return { axis, winner, loser, pct };
  });

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
