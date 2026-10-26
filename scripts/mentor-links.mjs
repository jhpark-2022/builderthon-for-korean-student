#!/usr/bin/env node
// 멘토마다 자기 페이지 링크(/crossing/mentor?k=)를 뽑습니다(2026-10-26). 운영진이 멘토에게 따로 보냅니다.
// 열쇠 계산은 lib/crossingOpsServer.ts mentorKey와 같아야 합니다. 비밀은 배포 환경과 같은 값이어야 링크가 맞습니다.
//   node scripts/mentor-links.mjs [사이트 주소]
// .env.local의 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY(와 있으면 MENTOR_LINK_SECRET)를 읽습니다.
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")
    .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
);
const get = (k) => process.env[k] || env[k];
const url = get("NEXT_PUBLIC_SUPABASE_URL"), key = get("SUPABASE_SERVICE_ROLE_KEY");
const secret = get("MENTOR_LINK_SECRET") || key;
const site = (process.argv[2] || get("NEXT_PUBLIC_SITE_URL") || "https://naru-crossing-seoul.vercel.app").replace(/\/+$/, "");
if (!url || !key) { console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다."); process.exit(1); }

const r = await fetch(`${url}/rest/v1/crossing_mentors?select=id,name&event_slug=eq.crossing-seoul-2026-12&active=eq.true&order=sort,name`, {
  headers: { apikey: key, authorization: `Bearer ${key}` },
});
if (!r.ok) { console.error("멘토 목록을 읽지 못했습니다:", r.status); process.exit(1); }
for (const m of await r.json()) {
  const k = createHmac("sha256", secret).update(`crossing-mentor:${m.id}`).digest("hex").slice(0, 20);
  console.log(`${m.name}\t${site}/crossing/mentor?k=${k}`);
}
