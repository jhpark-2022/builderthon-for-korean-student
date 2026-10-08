"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 8월 등록의 남은 자리 하나: "이 기기에서 등록했었다"는 플래그.
//
// DECIDED 2026-10-08 (전체 리뷰 반영): 8월 등록 모달(components/RegisterModal.tsx),
// 닫을 때 뜨던 오픈채팅 넛지, /api/register 라우트를 지웠습니다. 등록 진입점은
// 2026-08-22에 이미 전부 걷혔고 openRegister()를 부르는 곳이 없었는데, 모달
// 1,551줄이 /2026-08 번들에 계속 실려 나갔습니다. 테이블은 그대로입니다.
//
// 남긴 것은 registered 하나입니다. JourneyNav가 오픈채팅 버튼의 톤을 정할 때
// 읽습니다. 나루 홈에는 프로바이더가 없으므로 useRegisterOptional()은 null을
// 돌려줄 수 있습니다.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from "react";
import { REGISTERED_KEY } from "@/lib/storage";

interface RegisterContextValue {
  registered: boolean;
}

const RegisterContext = createContext<RegisterContextValue | null>(null);

export function useRegisterOptional(): RegisterContextValue | null {
  return useContext(RegisterContext);
}

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  // 서버의 첫 페인트와 맞추려고 false에서 시작하고 마운트 뒤에 읽습니다.
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    try {
      if (window.localStorage.getItem(REGISTERED_KEY)) setRegistered(true);
    } catch {
      /* storage blocked: 등록하지 않은 것으로 봅니다 */
    }
  }, []);
  return <RegisterContext.Provider value={{ registered }}>{children}</RegisterContext.Provider>;
}
