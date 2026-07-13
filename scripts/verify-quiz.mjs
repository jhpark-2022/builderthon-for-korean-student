// One-off invariant check for the phase-2 Sidon scoring + explanation layer.
// Parses data/quiz.ts + data/quizExplanations.ts (sources of truth) and, per axis,
// enumerates every answer combination to verify:
//   ① the base %s are distinct bands with ≥5-gap (so the ±2 spice from
//      lib/quizScore.ts can never blur two bands or dip a % to ≤50),
//   ② no combination lands on exactly 50% (Sidon: r never = 0.5),
//   ③ EXPLANATIONS covers every reachable pattern key (and no extras),
//   ④ the 14 questions' per-axis counts + weights match the design table.
// Run: node scripts/verify-quiz.mjs
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const quizSrc = await readFile(join(root, "data/quiz.ts"), "utf8");
const explSrc = await readFile(join(root, "data/quizExplanations.ts"), "utf8");

// Mirror of lib/quizScore.ts (kept in sync by hand).
const AXIS_CONFIG = {
  MIND: { denom: 14, floor: 52, ceil: 95 },
  ENERGY: { denom: 10, floor: 54, ceil: 93 },
  NATURE: { denom: 8, floor: 55, ceil: 91 },
  TACTICS: { denom: 7, floor: 53, ceil: 94 },
  IDENTITY: { denom: 10, floor: 56, ceil: 92 },
};
const EXPECTED_WEIGHTS = {
  MIND: [2, 8, 4], ENERGY: [3, 6, 1], NATURE: [1, 5, 2], TACTICS: [4, 2, 1], IDENTITY: [3, 7],
};
const AXIS_ORDER = ["MIND", "ENERGY", "NATURE", "TACTICS", "IDENTITY"];

function bankRound(x) {
  const floor = Math.floor(x);
  const frac = x - floor;
  if (Math.abs(frac - 0.5) < 1e-9) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(x);
}

// ── Parse the 14 questions (axis + weight, in file order) ────────────────────
const qRe = /id:\s*"(Q\d+)",\s*axis:\s*"(\w+)",\s*w:\s*(\d+)/g;
const byAxis = {};
let total = 0;
for (const m of quizSrc.matchAll(qRe)) {
  total++;
  (byAxis[m[2]] ??= []).push(Number(m[3]));
}

// ── Parse EXPLANATIONS keys per axis ─────────────────────────────────────────
function explKeys(axis) {
  const m = explSrc.match(new RegExp(`\\n  ${axis}:\\s*\\{([\\s\\S]*?)\\n  \\},`));
  if (!m) return null;
  return [...m[1].matchAll(/"([01,]+)":/g)].map((x) => x[1]);
}

let ok = true;
const fail = (msg) => { ok = false; console.log(`  ✗ ${msg}`); };

console.log(`Parsed ${total} questions.\n`);
if (total !== 14) fail(`expected 14 questions, got ${total}`);

for (const axis of AXIS_ORDER) {
  const weights = byAxis[axis] ?? [];
  const cfg = AXIS_CONFIG[axis];
  const n = weights.length;

  // ④ counts + weights match the table
  const expW = EXPECTED_WEIGHTS[axis];
  const weightsOk = weights.length === expW.length && [...weights].sort((a, b) => a - b).join() === [...expW].sort((a, b) => a - b).join();
  const denomOk = weights.reduce((a, b) => a + b, 0) === cfg.denom;
  if (!weightsOk) fail(`${axis}: weights ${JSON.stringify(weights)} ≠ expected ${JSON.stringify(expW)}`);
  if (!denomOk) fail(`${axis}: weight sum ${weights.reduce((a, b) => a + b, 0)} ≠ denom ${cfg.denom}`);

  // enumerate all 2^n patterns
  const combos = 1 << n;
  const pcts = new Set();
  const states = new Set(); // winner+pct pairs
  const patternKeys = [];
  let anyHalf = false;
  for (let mask = 0; mask < combos; mask++) {
    const pattern = [];
    let firstSum = 0;
    for (let i = 0; i < n; i++) {
      const bit = (mask >> i) & 1;
      pattern.push(bit);
      if (bit) firstSum += weights[i];
    }
    const r = firstSum / cfg.denom;
    if (Math.abs(r - 0.5) < 1e-9) anyHalf = true;
    const winner = r > 0.5 ? "first" : "second";
    const margin = (Math.max(r, 1 - r) - 0.5) * 2; // mirror of lib/quizScore.ts
    const pct = bankRound(cfg.floor + margin * (cfg.ceil - cfg.floor));
    pcts.add(pct);
    states.add(`${winner}:${pct}`);
    patternKeys.push(pattern.join(","));
  }

  // ② no exact 50%
  if (anyHalf) fail(`${axis}: some combo lands on r = 0.5 (tie!)`);
  if (pcts.has(50)) fail(`${axis}: a displayed % equals 50`);

  // ① distinct bands: n=3 → 4 distinct, n=2 → 2 distinct; every combo a unique (winner,%) state
  const expectedDistinct = combos / 2;
  if (pcts.size !== expectedDistinct) fail(`${axis}: expected ${expectedDistinct} distinct %s, got ${pcts.size} → ${[...pcts].sort((a, b) => a - b)}`);
  if (states.size !== combos) fail(`${axis}: expected ${combos} unique (winner,%) states, got ${states.size}`);

  // ③ explanation coverage
  const keys = explKeys(axis);
  if (!keys) { fail(`${axis}: no EXPLANATIONS block found`); }
  else {
    const have = new Set(keys);
    const missing = patternKeys.filter((k) => !have.has(k));
    const extra = keys.filter((k) => !patternKeys.includes(k));
    if (missing.length) fail(`${axis}: EXPLANATIONS missing keys ${JSON.stringify(missing)}`);
    if (extra.length) fail(`${axis}: EXPLANATIONS has extra keys ${JSON.stringify(extra)}`);
    if (keys.length !== new Set(keys).size) fail(`${axis}: duplicate explanation keys`);
  }

  const bands = [...pcts].sort((a, b) => a - b);
  // ① spice safety: bands must sit ≥5 apart and never reach ≤52 (base - 2 > 50)
  for (let i = 1; i < bands.length; i++) {
    if (bands[i] - bands[i - 1] < 5) fail(`${axis}: bands ${bands[i - 1]} and ${bands[i]} are <5 apart — ±2 spice could blur them`);
  }
  if (bands[0] - 2 <= 50) fail(`${axis}: lowest band ${bands[0]} - 2 spice dips to ≤50%`);
  console.log(`  ${ok ? "✓" : "·"} ${axis}: weights ${JSON.stringify(weights)} (Σ=${cfg.denom}), bands = ${bands.join(" / ")} %, explanations ${keys ? keys.length : 0}/${combos}`);
}

// ── Dream-teammate reasons: matchWhy is index-aligned to match ───────────────
// Every result must have match.length === matchWhy.length === 2, and each of the
// 32 matchWhy phrases must carry both ko and en. Parse both arrays per result.
const matchArrays = [...quizSrc.matchAll(/\n    match:\s*\[([^\]]*)\]/g)].map(
  (m) => [...m[1].matchAll(/"[^"]+"/g)].length
);
const whyBlocks = [...quizSrc.matchAll(/matchWhy:\s*\[\s*\n([\s\S]*?)\n\s*\],/g)].map((m) =>
  [...m[1].matchAll(/\{\s*ko:\s*"((?:[^"\\]|\\.)*)"\s*,\s*en:\s*"((?:[^"\\]|\\.)*)"\s*\}/g)]
);
let whyPhrases = 0;
if (matchArrays.length !== 16) fail(`expected 16 match arrays, got ${matchArrays.length}`);
if (whyBlocks.length !== 16) fail(`expected 16 matchWhy arrays, got ${whyBlocks.length}`);
matchArrays.forEach((len, i) => { if (len !== 2) fail(`result #${i}: match.length ${len} ≠ 2`); });
whyBlocks.forEach((entries, i) => {
  if (entries.length !== 2) fail(`result #${i}: matchWhy.length ${entries.length} ≠ 2`);
  for (const e of entries) {
    if (!e[1]?.trim() || !e[2]?.trim()) fail(`result #${i}: a matchWhy phrase is missing ko or en`);
    whyPhrases++;
  }
});
if (ok) console.log(`\nDream teammates: 16 results × 2 = ${whyPhrases} matchWhy phrases, all ko/en, match↔matchWhy aligned.`);

// Logo files: every non-empty `logo` field is a filename (ext included) under
// public/logos — assert the file actually exists (a missing file silently falls
// back to emoji, which is what we want the check to catch). Empty logos are the
// deliberate emoji-fallback models (openai/cohere have no self-hostable mono
// mark); they're reported, not failed.
const logos = [...quizSrc.matchAll(/logo:\s*"([^"]*)"/g)].map((m) => m[1]);
const withFile = logos.filter(Boolean);
const emojiOnly = logos.length - withFile.length;
for (const f of withFile) {
  if (!existsSync(join(root, "public/logos", f))) fail(`logo file missing: public/logos/${f}`);
}
console.log(`\nRESULTS logos: ${withFile.length}/${logos.length} have a file in public/logos, ${emojiOnly} emoji-fallback. Files: ${[...new Set(withFile)].join(", ")}`);

console.log(ok ? "\n✅ All Sidon + explanation invariants hold." : "\n❌ Invariant violation — see above.");
process.exit(ok ? 0 : 1);
