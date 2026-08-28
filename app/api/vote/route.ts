// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vote — Day 8 빌더스 초이스 투표를 Supabase에 기록합니다.
//
// 무기명입니다. 이름도 이메일도 받지 않고, 저장하는 것은 트랙, 고른 팀, 투표자의
// 소속 팀(자기 팀 배제용), 기기 토큰, IP 해시뿐입니다. 기기 토큰은 브라우저가
// 처음 방문할 때 만들어 localStorage에 두는 난수 UUID라 사람을 가리키지 않습니다.
//
// 구조는 app/api/register/route.ts를 그대로 따릅니다: force-dynamic, 클라이언트
// 검증을 다시 하는 서버 검증, 스로틀, 길이 캡, service_role은 서버에만.
//
// 중복 차단은 (track, device_token) 유니크 인덱스가 합니다. 시크릿 창으로 우회할
// 수 있다는 것은 알고 있고, 그래도 이 선을 고른 이유는 무기명이기 때문입니다.
// 신원을 받아야 진짜로 막을 수 있는데, 40명이 한 방에 모여 서로의 발표를 보고
// 뽑는 자리에서는 신원을 받는 쪽의 비용이 더 큽니다. IP 해시 스로틀이 보조입니다.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  ALL_VOTE_TEAMS,
  VOTER_TEAM_NONE,
  VOTE_PICKS,
  VOTE_TEAMS,
  isDeviceToken,
  isVoteTrack,
  voteWindowState,
  type VoteTrack,
} from "@/lib/day8Vote";

// 비밀 + 라이브 DB → 빌드 타임에 정적으로 평가되면 안 됩니다.
export const dynamic = "force-dynamic";

// ── 스로틀 한도 ──────────────────────────────────────────────────────────────
// 현장 투표라서 등록 라우트와 숫자가 완전히 다릅니다. 40명이 SMU 강의실 와이파이
// 하나를 쓰면 서버가 보는 주소는 사실상 한 개이고, 오픈 직후 1~2분에 표가 전부
// 몰립니다. 등록 쪽 한도(10분에 10건)를 그대로 가져오면 열한 번째 사람부터
// 투표를 못 합니다.
//
// TESTED 2026-08-28: 처음엔 10분 60건으로 잡았다가 40명 부하 시뮬레이션에서
// 진짜 투표자가 막혔습니다. 한 IP에서 60건을 넘기는 순간 그 뒤로는 전부 429였고,
// 현장에서 이것이 터지면 되돌릴 방법이 없습니다. 투표는 다시 받을 수 없어요.
//
// 그래서 층위를 다시 나눴습니다. 한 방이 NAT 뒤에 있으면 per-IP와 GLOBAL은 사실상
// 같은 값을 세므로, per-IP는 "현장 한 방이 절대 닿지 않을 높이"로 올리고 폭주
// 감지는 GLOBAL이 맡습니다.
//
// 산술: 참가자와 관중을 합쳐 최대 60기기, 트랙당 1표씩. 오픈 직후 10분에 60건이
// 최악이고 실패 재시도를 넉넉히 얹어도 100건을 넘기 어렵습니다. 200이면 두 배
// 여유이고, 하루 전체 예상 행 수는 120 안쪽이라 60분 400건도 닿지 않습니다.
//
// 이 한도를 다시 내리지 마세요. 여기서 아낄 수 있는 것은 스크립트 몇 건이고,
// 잃는 것은 못 찍은 사람의 표입니다.
const PER_IP_SHORT = { minutes: 10, max: 200 };
const PER_IP_LONG = { minutes: 60, max: 400 };
// 모든 제출자를 합친 회로 차단기. 이 속도로 표가 들어오면 출처와 무관하게
// 사람이 누르는 속도가 아닙니다. 실제 예상치(하루 120건 안쪽)의 세 배가 넘고,
// 여기까지 오면 로그에 남기고 막습니다.
const GLOBAL = { minutes: 10, max: 400 };

// 팀명은 명단에 있는 것만 통과하므로 길이 캡은 형식적입니다. 그래도 붙입니다.
// 명단 대조 전에 거대한 문자열이 로그와 비교 연산을 타는 것을 막습니다.
const MAX_LEN = 120;
// choices 배열 자체의 상한. 트랙별 개수 검사가 뒤에서 정확히 걸러내지만, 그 전에
// 만 개짜리 배열을 map으로 훑지 않기 위한 선입니다.
const MAX_CHOICES = 8;

type Json = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, MAX_LEN) : "";
}

/**
 * 제출자 IP의 소금 친 단방향 지문. 등록 라우트와 같은 방식이고 같은 소금입니다
 * (SUPABASE_SERVICE_ROLE_KEY 파생). 원본 주소는 DB에 닿지 않습니다.
 */
function hashIp(ip: string, secret: string): string {
  return createHash("sha256").update(`${secret}::ip-salt::${ip}`).digest("hex");
}

/** 최선의 클라이언트 IP. x-forwarded-for의 첫 항목이 원 클라이언트입니다. */
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

const sinceIso = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

/**
 * 세 창(IP 단기·IP 장기·전체)을 한 번에 세고, 막아야 하면 true.
 *
 * POST와 DELETE가 같은 계층을 탑니다. 취소를 스로틀 밖에 두면 삭제 요청을
 * 무한히 던져 카운트 쿼리로 DB를 때릴 수 있고, 그건 투표를 못 받게 만드는
 * 가장 싼 방법입니다.
 *
 * COUNT가 실패하면 통과시킵니다. 스로틀은 난간이지 문이 아니에요.
 */
async function isThrottled(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  ipHash: string
): Promise<boolean> {
  const [shortWindow, longWindow, globalWindow] = await Promise.all([
    supabase
      .from("day8_votes")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinceIso(PER_IP_SHORT.minutes)),
    supabase
      .from("day8_votes")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinceIso(PER_IP_LONG.minutes)),
    supabase
      .from("day8_votes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso(GLOBAL.minutes)),
  ]);

  if ((shortWindow.count ?? 0) >= PER_IP_SHORT.max || (longWindow.count ?? 0) >= PER_IP_LONG.max) {
    return true;
  }
  if ((globalWindow.count ?? 0) >= GLOBAL.max) {
    // 로그가 시끄러운 것이 의도입니다. 이 줄은 유기적인 관객이 만들 수 없는
    // 속도에서만 찍힙니다.
    console.error(
      `[vote] GLOBAL RATE LIMIT HIT — ${globalWindow.count} rows in ${GLOBAL.minutes}m. Possible attack.`
    );
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vote — 서버의 "지금"과 트랙별 국면.
//
// 화면이 시각을 물어보는 창구입니다. Day8Vote는 SSR이 내려준 serverNow로 첫
// 화면을 그린 뒤 이 값으로 시계를 맞춥니다.
//
// 왜 serverNow만으로는 부족한가: / 는 ISR(revalidate 300)이라 HTML이 최대 5분
// 낡습니다. 12:48에 만들어진 HTML을 12:52에 받은 사람은 serverNow만 믿으면
// 12:50 오픈을 4분 늦게 봅니다. 폰 시계가 틀린 사람을 구하려다 시계가 맞는
// 사람을 막는 셈이에요. 이 라우트는 force-dynamic이라 캐시되지 않습니다.
//
// 표를 읽지 않습니다. 중간 집계는 무대에서만 공개됩니다.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const now = Date.now();
  return NextResponse.json(
    {
      now,
      tracks: { 1: voteWindowState(1, now), 2: voteWindowState(2, now) },
    },
    { headers: { "cache-control": "no-store" } }
  );
}

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabase || !serviceKey) {
    console.error("[vote] Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // ── 트랙 ───────────────────────────────────────────────────────────────────
  const track: unknown = typeof body.track === "number" ? body.track : Number(body.track);
  if (!isVoteTrack(track)) {
    return NextResponse.json({ error: "invalid_track" }, { status: 400 });
  }
  const t: VoteTrack = track;

  // ── 오픈 창 ────────────────────────────────────────────────────────────────
  // 진짜 게이트입니다. 패널의 잠금 상태는 보여줄 뿐이고, 열린 탭이나 손으로 만든
  // POST는 그 화면을 거치지 않습니다. 서버 시계가 유일한 권위입니다.
  const windowState = voteWindowState(t);
  if (windowState === "before") {
    return NextResponse.json({ error: "not_open" }, { status: 403 });
  }
  if (windowState === "closed") {
    return NextResponse.json({ error: "vote_closed" }, { status: 403 });
  }

  // ── 기기 토큰 ──────────────────────────────────────────────────────────────
  const deviceToken = str(body.deviceToken).toLowerCase();
  if (!isDeviceToken(deviceToken)) {
    return NextResponse.json({ error: "invalid_device" }, { status: 400 });
  }

  // ── 투표자 소속 팀 ─────────────────────────────────────────────────────────
  // 이름 대신 받는 유일한 정보입니다. 자기 팀에 투표하는 것을 막는 데만 씁니다.
  const voterTeam = str(body.voterTeam);
  if (voterTeam !== VOTER_TEAM_NONE && !ALL_VOTE_TEAMS.includes(voterTeam)) {
    return NextResponse.json({ error: "invalid_voter_team" }, { status: 400 });
  }

  // ── 고른 팀 ────────────────────────────────────────────────────────────────
  const rawChoices = Array.isArray(body.choices) ? body.choices.slice(0, MAX_CHOICES) : [];
  const choices = rawChoices.map(str);
  if (choices.length !== VOTE_PICKS[t]) {
    return NextResponse.json({ error: "invalid_choice_count" }, { status: 400 });
  }
  if (new Set(choices).size !== choices.length) {
    return NextResponse.json({ error: "duplicate_choice" }, { status: 400 });
  }
  const roster = VOTE_TEAMS[t];
  if (!choices.every((c) => roster.includes(c))) {
    return NextResponse.json({ error: "unknown_team" }, { status: 400 });
  }
  // 자기 팀 배제. 화면에서도 비활성이지만, 그 화면을 거치지 않은 요청이 여기로
  // 옵니다. 이 검사가 이 라우트에서 가장 중요한 한 줄입니다.
  if (voterTeam !== VOTER_TEAM_NONE && choices.includes(voterTeam)) {
    return NextResponse.json({ error: "self_vote" }, { status: 400 });
  }

  // ── 스로틀 ─────────────────────────────────────────────────────────────────
  // 쓰기 전에 셉니다. 거절된 폭주가 행을 남기지 않게 하려는 것입니다.
  const ipHash = hashIp(clientIp(req), serviceKey);
  if (await isThrottled(supabase, ipHash)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // ── 기록 ───────────────────────────────────────────────────────────────────
  const { error } = await supabase.from("day8_votes").insert({
    track: t,
    device_token: deviceToken,
    voter_team: voterTeam,
    choices,
    ip_hash: ipHash,
  });

  if (error) {
    // 23505 = unique_violation. (track, device_token) 유니크 인덱스입니다.
    // 경쟁 상태로 두 번 눌린 경우까지 여기로 오므로 오류가 아니라 상태로 답합니다.
    if (error.code === "23505") {
      return NextResponse.json({ error: "already_voted" }, { status: 409 });
    }
    console.error("[vote] insert failed:", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/vote — 제출한 표를 취소합니다. body는 { track, deviceToken }.
//
// 왜 필요한가: "내 팀"을 잘못 고르고 제출한 사람에게 복구 경로가 없었습니다.
// 자기 팀 배제는 그 값으로 판정하므로, 잘못 고른 사람은 자기 팀에 투표한 표를
// 남긴 채 아무것도 할 수 없었어요. 이제 취소하고 다시 찍습니다.
//
// 소유 증명은 기기 토큰입니다. 그 토큰을 가진 기기만 그 표를 지울 수 있고,
// 토큰은 브라우저 localStorage에만 있습니다. 무기명 투표에서 "내 표"를 가리킬
// 수 있는 것이 이것뿐이에요. 이름을 받지 않기로 한 대가입니다.
//
// 창이 열려 있을 때만 지웁니다. 3:20PM 마감 뒤에는 집계가 시작되고, 그 뒤로
// 표가 움직이면 무대에서 부르는 숫자와 DB가 갈라집니다.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  const supabase = getSupabaseAdmin();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabase || !serviceKey) {
    console.error("[vote] Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const track: unknown = typeof body.track === "number" ? body.track : Number(body.track);
  if (!isVoteTrack(track)) {
    return NextResponse.json({ error: "invalid_track" }, { status: 400 });
  }
  const t: VoteTrack = track;

  // POST와 같은 게이트를 같은 순서로 탑니다. 취소가 제출보다 느슨하면 그쪽이
  // 우회로가 됩니다.
  const windowState = voteWindowState(t);
  if (windowState === "before") {
    return NextResponse.json({ error: "not_open" }, { status: 403 });
  }
  if (windowState === "closed") {
    return NextResponse.json({ error: "vote_closed" }, { status: 403 });
  }

  const deviceToken = str(body.deviceToken).toLowerCase();
  if (!isDeviceToken(deviceToken)) {
    return NextResponse.json({ error: "invalid_device" }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(req), serviceKey);
  if (await isThrottled(supabase, ipHash)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // select()를 붙여야 지운 행을 돌려받습니다. 붙이지 않으면 0건 삭제와 1건
  // 삭제를 구분할 수 없고, 화면은 그 차이로 "이미 없음"과 "방금 지움"을
  // 가릅니다.
  const { data, error } = await supabase
    .from("day8_votes")
    .delete()
    .eq("track", t)
    .eq("device_token", deviceToken)
    .select("id");

  if (error) {
    console.error("[vote] delete failed:", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    // 이 기기의 표가 없습니다. 화면은 이것을 오류로 보여주지 않고 조용히
    // 투표 화면으로 되돌립니다. 저장소만 남고 표는 지워진 상태의 복구예요.
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deleted: data.length }, { status: 200 });
}
