// ─────────────────────────────────────────────────────────────────────────────
// 체인지로그 파일이 레포 루트의 CHANGELOG.md 하나뿐인지 빌드 전에 확인합니다.
// DECIDED 2026-09-24 (사용자): 체인지로그는 CHANGELOG.md 하나입니다(CLAUDE.md의 규칙).
// package.json의 prebuild에서 돌아서 Vercel 빌드도 이 검사를 거칩니다.
//
// 실패하는 경우(exit 1, 찾은 경로 출력):
//   - 파일명에 "changelog"가 들어간 .md 파일이 루트의 CHANGELOG.md 말고 또 있을 때
//   - docs/changelogs/ 폴더가 있을 때
// node_modules, .next, .git은 보지 않습니다.
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SKIP = new Set(["node_modules", ".next", ".git"]);

const found = [];
function walk(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const full = join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/changelog/i.test(ent.name) && ent.name.toLowerCase().endsWith(".md")) found.push(relative(ROOT, full));
  }
}
walk(ROOT);

const problems = found.filter((p) => p !== "CHANGELOG.md");
if (existsSync(join(ROOT, "docs", "changelogs"))) problems.unshift("docs/changelogs/ (폴더)");

if (problems.length) {
  console.error("[check-changelog] 체인지로그는 루트의 CHANGELOG.md 하나여야 합니다(CLAUDE.md). 찾은 것:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log("[check-changelog] ok: CHANGELOG.md 하나");
