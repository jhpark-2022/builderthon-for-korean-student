import type { Metadata } from "next";
import StaffTool from "@/components/crossing/StaffTool";

// /crossing/staff: 크로싱 서울 운영진 화면(2026-10-17). 팀, 멘토 시간, 예약, 미션 체크. CROSSING_STAFF_KEY로 들어옵니다.
export const metadata: Metadata = {
  title: "크로싱 서울 운영진",
  robots: { index: false, follow: false },
};

export default function StaffPage() {
  return <StaffTool />;
}
