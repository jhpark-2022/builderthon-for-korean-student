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
    if (bands[i] - bands[i - 1] < 5) fail(`${axis}: bands ${bands[i - 1]} and ${bands[i]} are <5 apart - ±2 spice could blur them`);
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
// public/logos - assert the file actually exists (a missing file silently falls
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

// ── 판 사이 채점 불변 (2026-10-09, 팀 매칭 유머 브리프 4장, 7장 2) ──────────────────────────
// 12월판의 질문(data/quiz-2026-12.ts의 QUESTIONS_2026_12)은 글만 다릅니다. 14개의 id, axis, w, a.pole, b.pole과 순서가
// 8월의 QUESTIONS와 같은지 봅니다. 그리고 채점의 거울(lib/quizScore.ts와 같은 식)로 무작위 답 1,000세트를 두 질문 배열에
// 각각 매겨, 유형과 A/T, 축별 승자와 퍼센트가 모두 같은지 확인합니다. 화면의 채점은 QUESTIONS만 읽지만, 이 검사는
// 누가 12월 배열의 극이나 가중치를 건드렸을 때 "화면의 글과 채점이 어긋났다"를 잡아냅니다.
const dec = await readFile(join(root, "data/quiz-2026-12.ts"), "utf8");
const decStart = dec.indexOf("export const QUESTIONS_2026_12");
const augStart = quizSrc.indexOf("export const QUESTIONS");
const sliceArray = (src, from) => src.slice(from, src.indexOf("\n];", from));
const parseQs = (block) =>
  [...block.matchAll(/id:\s*"(Q\d+)",\s*axis:\s*"(\w+)",\s*w:\s*(\d+)[\s\S]*?\n\s*a:\s*\{[^\n]*pole:\s*"(\w+)"\s*\},[\s\S]*?\n\s*b:\s*\{[^\n]*pole:\s*"(\w+)"\s*\},/g)]
    .map((m) => ({ id: m[1], axis: m[2], w: Number(m[3]), a: m[4], b: m[5] }));
if (decStart < 0) fail("QUESTIONS_2026_12 not found in data/quiz-2026-12.ts");
const qAug = parseQs(sliceArray(quizSrc, augStart));
const qDec = decStart < 0 ? [] : parseQs(sliceArray(dec, decStart));
if (qAug.length !== 14) fail(`edition check: parsed ${qAug.length} August questions, expected 14`);
if (qDec.length !== 14) fail(`edition check: parsed ${qDec.length} December questions, expected 14`);
qAug.forEach((q, i) => {
  const d = qDec[i];
  if (!d) return;
  for (const k of ["id", "axis", "w", "a", "b"]) {
    if (q[k] !== d[k]) fail(`edition check: question #${i + 1} ${k} differs (2026-08 ${q[k]} vs 2026-12 ${d[k]})`);
  }
});
const POLES = { MIND: ["E", "I"], ENERGY: ["N", "S"], NATURE: ["T", "F"], TACTICS: ["J", "P"], IDENTITY: ["A", "Tid"] };
function scoreWith(qs, answers) {
  const out = [];
  for (const axis of AXIS_ORDER) {
    const [first] = POLES[axis];
    const cfg = AXIS_CONFIG[axis];
    let firstSum = 0;
    qs.forEach((q, i) => { if (q.axis === axis && q[answers[i]] === first) firstSum += q.w; });
    const r = firstSum / cfg.denom;
    const margin = (Math.max(r, 1 - r) - 0.5) * 2;
    out.push(`${r > 0.5 ? POLES[axis][0] : POLES[axis][1]}:${bankRound(cfg.floor + margin * (cfg.ceil - cfg.floor))}`);
  }
  return out.join("|");
}
// 고정 씨앗(같은 1,000세트가 매번 나옵니다).
let seed = 20261218;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
let mismatched = 0;
const SETS = 1000;
if (qAug.length === 14 && qDec.length === 14) {
  for (let n = 0; n < SETS; n++) {
    const answers = Array.from({ length: 14 }, () => (rnd() < 0.5 ? "a" : "b"));
    if (scoreWith(qAug, answers) !== scoreWith(qDec, answers)) mismatched++;
  }
  if (mismatched) fail(`edition check: ${mismatched}/${SETS} random answer sheets score differently between editions`);
  else console.log(`\nEditions: QUESTIONS_2026_12 matches QUESTIONS on id, axis, w and poles (14/14); ${SETS} random answer sheets score identically (type, A/T, per-axis winner and %).`);
}
// 12월 표의 로고 파일도 같은 규칙으로 봅니다(빈 값은 이모지 폴백).
const decLogos = [...dec.matchAll(/logo:\s*"([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
for (const f of decLogos) {
  if (!existsSync(join(root, "public/logos", f))) fail(`2026-12 logo file missing: public/logos/${f}`);
}

console.log(ok ? "\n✅ All Sidon + explanation invariants hold." : "\n❌ Invariant violation - see above.");
process.exit(ok ? 0 : 1);
