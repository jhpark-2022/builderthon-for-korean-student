// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 현장 도구(팀 코드, 멘토 예약, 미션 인증)의 값과 계산. 서버와 브라우저가 함께 씁니다.
// 표는 supabase/migrations/0008_crossing_mentoring_and_proofs.sql.
//
// DECIDED 2026-10-17 (사용자): 멘토링은 예약제이고, 예약 하나가 그 앞뒤 15분을 막습니다.
// 막는 규칙의 정본은 DB의 exclude 제약입니다. 여기의 계산은 화면에 칸을 그리고 미리 거절하는 용도이고,
// BUFFER_MINUTES를 바꾸면 마이그레이션의 interval '15 minutes'도 같이 바꿔야 합니다.
// ─────────────────────────────────────────────────────────────────────────────

import { DECEMBER_STARTS_AT } from "@/lib/naruDates";

/** 예약 한 번의 길이(분). TODO: confirm. 멘토와 정해지면 바꿉니다. */
export const SESSION_MINUTES = 30;
/** 예약 앞뒤로 막히는 시간(분). 마이그레이션 0008과 같아야 합니다. */
export const BUFFER_MINUTES = 15;
/** 시작 시각을 고르는 칸의 간격(분). */
export const GRID_MINUTES = 15;
/** 한 팀이 하루에 잡을 수 있는 예약 수. 한 팀이 멘토 시간을 쓸어 가지 않게. TODO: confirm. */
export const MAX_BOOKINGS_PER_TEAM_PER_DAY = 2;
/** 예약과 인증이 있는 날. */
export const OPS_DAYS = [2, 3] as const;
export type OpsDay = (typeof OPS_DAYS)[number];

export const PROOF_KINDS = ["photo", "pdf"] as const;
export type ProofKind = (typeof PROOF_KINDS)[number];
export const PROOF_MAX_BYTES = 20 * 1024 * 1024;
export const PROOF_TYPES: Record<ProofKind, string[]> = {
  photo: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  pdf: ["application/pdf"],
};

const MIN = 60_000;

export const isOpsDay = (v: unknown): v is OpsDay => v === 2 || v === 3;

/** Day n의 날짜(KST) "YYYY-MM-DD". Day 0이 DECEMBER_STARTS_AT입니다. */
export function dayDate(day: number): string {
  const d = new Date(`${DECEMBER_STARTS_AT}T00:00:00+09:00`);
  d.setUTCDate(d.getUTCDate() + day);
  return new Date(d.getTime() + 9 * 60 * MIN).toISOString().slice(0, 10);
}

/** Day n의 "HH:MM"(KST)을 시각으로. */
export function kstTime(day: number, hhmm: string): Date | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hhmm)) return null;
  return new Date(`${dayDate(day)}T${hhmm}:00+09:00`);
}

/** 시각을 "HH:MM"(KST)으로. */
export function fmtKst(iso: string | number | Date): string {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * MIN);
  return d.toISOString().slice(11, 16);
}

export type Window = { startsAt: string; endsAt: string };
export type Booking = { startsAt: string; endsAt: string; mine?: boolean };
export type SlotState = "open" | "booked" | "buffer" | "mine" | "past" | "teamBusy";

const overlap = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;

/**
 * 시작 시각 t에 예약할 수 있는지. 같은 멘토의 다른 예약과 BUFFER_MINUTES 이상 떨어져야 하고(DB 제약과 같은 규칙),
 * 팀의 다른 예약과 겹치면 안 됩니다.
 */
export function slotState(t: number, mentorBookings: Booking[], teamBookings: Booking[], now = Date.now()): SlotState {
  const end = t + SESSION_MINUTES * MIN;
  const buf = BUFFER_MINUTES * MIN;
  for (const b of mentorBookings) {
    const b0 = Date.parse(b.startsAt), b1 = Date.parse(b.endsAt);
    if (b.mine && b0 === t) return "mine";
    if (overlap(t, end, b0, b1)) return "booked";
    if (overlap(t, end, b0 - buf, b1 + buf)) return "buffer";
  }
  if (t < now) return "past";
  for (const b of teamBookings) {
    if (overlap(t, end, Date.parse(b.startsAt), Date.parse(b.endsAt))) return "teamBusy";
  }
  return "open";
}

/** 구간들 안에서 예약이 들어갈 수 있는 시작 시각(GRID_MINUTES 간격). */
export function slotStarts(windows: Window[]): number[] {
  const out = new Set<number>();
  for (const w of windows) {
    const w0 = Date.parse(w.startsAt), w1 = Date.parse(w.endsAt);
    for (let t = w0; t + SESSION_MINUTES * MIN <= w1; t += GRID_MINUTES * MIN) out.add(t);
  }
  return [...out].sort((a, b) => a - b);
}

/** 시작 시각이 그 멘토의 구간 안에 온전히 들어가고 칸 간격에 맞는지. */
export function fitsWindow(t: number, windows: Window[]): boolean {
  return slotStarts(windows).includes(t);
}

// 헷갈리는 글자(0 O 1 I L)를 뺀 31자. 마이그레이션의 check와 같은 집합입니다.
export const TEAM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const normalizeTeamCode = (v: unknown) =>
  typeof v === "string" ? v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : "";
export const isTeamCode = (v: string) => /^[A-HJKMNP-Z2-9]{6}$/.test(v);
