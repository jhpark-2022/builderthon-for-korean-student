// Invariant check for the personality-test question set (debias + Sidon phases).
// Parses data/quiz.ts (source of truth) and verifies, per axis:
//   (1) exactly the correct pole pair for that axis,
//   (2) the weight multiset matches the Sidon config,
//   (3) both poles lead as option `a` on at least one question,
//   (4) the WEIGHTED first-option split stays within tolerance — |diff| <= 4
//       per axis (the best the Sidon sets allow) and 40–60% overall — so
//       habitual first-tappers aren't funneled toward any single type.
// Run: node scripts/verify-quiz-axes.mjs
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = await readFile(join(root, "data/quiz.ts"), "utf8");

const AXIS_POLES = {
  MIND: ["E", "I"],
  ENERGY: ["N", "S"],
  NATURE: ["T", "F"],
  TACTICS: ["J", "P"],
  IDENTITY: ["A", "Tid"],
};
const SIDON = {
  MIND: [2, 4, 8],
  ENERGY: [1, 3, 6],
  NATURE: [1, 2, 5],
  TACTICS: [1, 2, 4],
  IDENTITY: [3, 7],
};

const blockRe =
  /id:\s*"(Q\d+)",\s*axis:\s*"(\w+)",\s*w:\s*(\d+)[\s\S]*?a:\s*\{[\s\S]*?pole:\s*"(\w+)"[\s\S]*?b:\s*\{[\s\S]*?pole:\s*"(\w+)"/g;
const questions = [...src.matchAll(blockRe)].map((m) => ({
  id: m[1], axis: m[2], w: Number(m[3]), aPole: m[4], bPole: m[5],
}));
console.log(`Parsed ${questions.length} questions.\n`);

const byAxis = {};
for (const q of questions) (byAxis[q.axis] ??= []).push(q);

let ok = true;
let leftTotal = 0;
let rightTotal = 0;

for (const [axis, [p1, p2]] of Object.entries(AXIS_POLES)) {
  const qs = byAxis[axis] ?? [];
  const poles = new Set(qs.flatMap((q) => [q.aPole, q.bPole]));
  const polesOk = poles.size === 2 && poles.has(p1) && poles.has(p2);
  const weights = qs.map((q) => q.w).sort((a, b) => a - b);
  const weightsOk = JSON.stringify(weights) === JSON.stringify(SIDON[axis]);
  const leftLead = qs.filter((q) => q.aPole === p1).reduce((s, q) => s + q.w, 0);
  const rightLead = qs.filter((q) => q.aPole === p2).reduce((s, q) => s + q.w, 0);
  leftTotal += leftLead;
  rightTotal += rightLead;
  const bothLead = qs.some((q) => q.aPole === p1) && qs.some((q) => q.aPole === p2);
  const balanced = Math.abs(leftLead - rightLead) <= 4;
  const pass = polesOk && weightsOk && bothLead && balanced;
  ok &&= pass;
  const flags = [
    polesOk ? "" : " (wrong pole pair!)",
    weightsOk ? "" : ` (weights should be [${SIDON[axis]}])`,
    bothLead ? "" : " (one pole never leads!)",
    balanced ? "" : " (|a-lead diff| > 4!)",
  ].join("");
  console.log(
    `  ${pass ? "✓" : "✗"} ${axis}: weights [${weights}], a-lead ${p1}${leftLead}:${p2}${rightLead}${flags}`,
  );
}

const share = leftTotal / (leftTotal + rightTotal);
const globalOk = share >= 0.4 && share <= 0.6;
ok &&= globalOk;
console.log(
  `\nWeighted first-option split: E/N/T/J/A ${leftTotal} : ${rightTotal} others (${Math.round(share * 100)}%${globalOk ? "" : " — OUT OF 40–60% BAND"})`,
);
console.log(ok ? "\n✅ Pole-balance invariants hold." : "\n❌ Invariant violation — see above.");
process.exit(ok ? 0 : 1);
