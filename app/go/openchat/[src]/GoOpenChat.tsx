"use client";

import { useEffect } from "react";
import { links } from "@/data/dictionaryCore";

// iframe 안(버튼이 세려고 부른 경우)에서는 아무것도 하지 않습니다. 방문 기록은 루트 레이아웃의 Analytics가 남깁니다.
// 누군가 이 주소로 직접 들어오면(창의 맨 위) 오픈채팅으로 바로 보냅니다.
export default function GoOpenChat() {
  useEffect(() => {
    if (window.self === window.top && links.openChat) window.location.replace(links.openChat);
  }, []);
  return null;
}
