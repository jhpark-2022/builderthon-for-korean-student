// One-off invariant check for the personality-test question set (Task 1).
// Parses data/quiz.ts (source of truth) and verifies, per MBTI axis:
//   (1) both poles present are exactly the correct pole pair for that axis,
//   (2) the per-axis weight total is 3 (odd → no ties possible),
// then reports the weighted first-position (option `a`) tally so the debias is
// visible. Run: node scripts/verify-quiz-axes.mjs
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = await readFile(join(root, "data/quiz.ts"), "utf8");

// The correct pole pair for each axis.
const AXIS_POLES = {
  MIND: ["E", "I"],
  ENERGY: ["N", "S"],
  NATURE: ["T", "F"],
  TACTICS: ["J", "P"],
  IDENTITY: ["A", "Tid"],
};
const CANONICAL_FIRST = new Set(["E", "N", "T", "J", "A"]); // the old all-`a` poles

// Extract each question block: id, axis, weight, a-pole (first), b-pole (second).
const blockRe =
  /id:\s*"(Q\d+)",\s*axis:\s*"(\w+)",\s*w:\s*(\d+)[\s\S]*?a:\s*\{[\s\S]*?pole:\s*"(\w+)"[\s\S]*?b:\s*\{[\s\S]*?pole:\s*"(\w+)"/g;

const questions = [];
for (const m of src.matchAll(blockRe)) {
  questions.push({ id: m[1], axis: m[2], w: Number(m[3]), aPole: m[4], bPole: m[5] });
}

let ok = true;
const byAxis = {};
for (const q of questions) (byAxis[q.axis] ??= []).push(q);

console.log(`Parsed ${questions.length} questions.\n`);

for (const [axis, [p1, p2]] of Object.entries(AXIS_POLES)) {
  const qs = byAxis[axis] ?? [];
  const poles = new Set();
  let weightSum = 0;
  for (const q of qs) {
    poles.add(q.aPole);
    poles.add(q.bPole);
    weightSum += q.w;
    // each question's two poles must be this axis's pole pair
    const pair = new Set([q.aPole, q.bPole]);
    if (!(pair.has(p1) && pair.has(p2) && pair.size === 2)) {
      ok = false;
      console.log(`  ✗ ${axis} ${q.id}: poles {${q.aPole},${q.bPole}} ≠ expected {${p1},${p2}}`);
    }
  }
  const polesOk = poles.size === 2 && poles.has(p1) && poles.has(p2);
  const weightOk = weightSum === 3;
  if (!polesOk || !weightOk) ok = false;
  console.log(
    `  ${polesOk && weightOk ? "✓" : "✗"} ${axis}: poles {${[...poles].join(",")}} (expect {${p1},${p2}}), ` +
      `weight sum = ${weightSum} ${weightOk ? "(odd ✓)" : "(SHOULD BE 3)"}`
  );
}

// Weighted first-position (option a) tally — the debias metric.
let canonicalFirst = 0;
let oppositeFirst = 0;
for (const q of questions) {
  if (CANONICAL_FIRST.has(q.aPole)) canonicalFirst += q.w;
  else oppositeFirst += q.w;
}
console.log(
  `\nWeighted first-position (option a): E/N/T/J/A = ${canonicalFirst}, I/S/F/P/Tid = ${oppositeFirst} ` +
    `→ ${canonicalFirst}:${oppositeFirst}`
);

console.log(ok ? "\n✅ All axis invariants hold." : "\n❌ Invariant violation — see above.");
process.exit(ok ? 0 : 1);
