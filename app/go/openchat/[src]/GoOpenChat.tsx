"use client";

import { useEffect } from "react";
import { links } from "@/data/dictionaryCore";

// 방문 기록(Analytics)이 나갈 틈을 0.35초 준 뒤 오픈채팅으로 넘깁니다. replace라 뒤로 가기에 이 페이지가 남지 않습니다.
// 주소가 비어 있으면(오픈채팅을 닫은 기간) 홈으로 돌아갑니다.
export default function GoOpenChat() {
  const to = links.openChat || "/";
  useEffect(() => {
    const id = window.setTimeout(() => window.location.replace(to), 350);
    return () => window.clearTimeout(id);
  }, [to]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070B1F] px-6 text-center">
      <p className="text-sm text-white/70">
        오픈채팅으로 이동합니다.{" "}
        <a href={to} className="underline underline-offset-4 hover:text-white">바로 가기</a>
      </p>
    </main>
  );
}
