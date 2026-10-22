import type { Metadata } from "next";
import GoOpenChat from "./GoOpenChat";

// 오픈채팅 버튼이 거쳐 가는 페이지(lib/openChatHref.ts). 검색에 잡히지 않게 합니다.
export const metadata: Metadata = { title: "오픈채팅으로 이동", robots: { index: false, follow: false } };

export default function Page() {
  return <GoOpenChat />;
}
