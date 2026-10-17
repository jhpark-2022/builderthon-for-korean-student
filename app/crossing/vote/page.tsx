import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VoteTool from "@/components/crossing/VoteTool";
import { voteOpen } from "@/lib/crossingVote";

// ─────────────────────────────────────────────────────────────────────────────
// /crossing/vote: 마지막 날 트랙별 인기투표(2026-10-17). CROSSING_VOTE_OPEN=1일 때만 열립니다. 그 전에는 404이고
// 사이트 어디에도 이 주소로 가는 링크가 없습니다(사용자: "function은 만들어 놓되, frontend에는 아직은 안 보이게").
// ─────────────────────────────────────────────────────────────────────────────
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "크로싱 서울 인기투표",
  robots: { index: false, follow: false },
};

export default function VotePage() {
  if (!voteOpen()) notFound();
  return <VoteTool />;
}
