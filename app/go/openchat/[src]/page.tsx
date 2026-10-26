import type { Metadata } from "next";
import { OPENCHAT_SOURCES } from "@/lib/openChatCount";
import GoOpenChat from "./GoOpenChat";

// 오픈채팅 클릭을 세는 페이지(lib/openChatCount.ts). 버튼을 누르면 보이지 않는 iframe으로 열려 방문 한 번이 기록됩니다.
// 정해진 이름만 정적으로 만들고(dynamicParams false) 나머지는 404라 Analytics의 Pages가 아무 주소로 오염되지 않습니다. 검색에는 잡히지 않습니다.
export const dynamicParams = false;
export function generateStaticParams() {
  return OPENCHAT_SOURCES.map((src) => ({ src }));
}
export const metadata: Metadata = { title: "오픈채팅", robots: { index: false, follow: false } };

export default function Page() {
  return <GoOpenChat />;
}
