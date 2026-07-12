// One-off: self-host the brand logos the quiz uses, copied from the simple-icons
// npm package into /public/logos so we no longer depend on cdn.simpleicons.org
// (whose `openai` slug 404'd on us). Each copied SVG gets fill="#ffffff" so it
// renders white on the dark cards, matching the old `/ffffff` CDN URLs.
//
// Run: node scripts/copy-logos.mjs
// Safe to re-run — it overwrites /public/logos and reports what it did.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "node_modules/simple-icons/icons");
const outDir = join(root, "public/logos");

// 1. Slugs actually used in the code (RESULTS `logo:` + HERO_LOGOS `slug:`).
const quizSrc = await readFile(join(root, "data/quiz.ts"), "utf8");
const componentSrc = await readFile(join(root, "components/Quiz.tsx"), "utf8");

const used = new Set();
for (const m of quizSrc.matchAll(/logo:\s*"([^"]+)"/g)) used.add(m[1]);
for (const m of componentSrc.matchAll(/slug:\s*"([^"]+)"/g)) used.add(m[1]);

// 2. Candidate slugs for the models that currently ship logo:"" (emoji-only).
//    We probe these; the ones that exist get copied and reported so we can fill
//    the `logo` field in data/quiz.ts. (Grok, Midjourney, Character.AI, and Pi
//    have no confidently-correct slug in the package → they stay emoji.)
const candidates = ["mistralai", "suno", "xai", "grok", "midjourney", "characterai", "characterdotai"];

await mkdir(outDir, { recursive: true });

const copied = [];
const missing = [];
const foundCandidates = [];

async function copySlug(slug, isCandidate) {
  const srcPath = join(iconsDir, `${slug}.svg`);
  if (!existsSync(srcPath)) {
    if (!isCandidate) missing.push(slug);
    return;
  }
  let svg = await readFile(srcPath, "utf8");
  // Inject a white fill on the root <svg> so the mono path renders white.
  if (!/<svg[^>]*\sfill=/.test(svg)) {
    svg = svg.replace(/<svg\b/, '<svg fill="#ffffff"');
  }
  await writeFile(join(outDir, `${slug}.svg`), svg, "utf8");
  if (isCandidate) foundCandidates.push(slug);
  copied.push(slug);
}

for (const slug of used) await copySlug(slug, false);
for (const slug of candidates) if (!used.has(slug)) await copySlug(slug, true);

const onDisk = (await readdir(outDir)).filter((f) => f.endsWith(".svg")).sort();

console.log(`Copied ${copied.length} logo(s) → public/logos/`);
console.log(`  self-hosted: ${onDisk.map((f) => f.replace(".svg", "")).join(", ")}`);
if (foundCandidates.length) {
  console.log(`  candidate slugs found (fill logo field in data/quiz.ts): ${foundCandidates.join(", ")}`);
}
if (missing.length) {
  console.log(`  used but NOT in simple-icons (→ emoji fallback via onError): ${missing.join(", ")}`);
}
