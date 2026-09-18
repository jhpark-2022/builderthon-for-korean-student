"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 크로싱 서울 등록 상태 (2026-09-18, Supabase 등록 브리프 2.5). 8월 lib/RegisterContext와
// 별개이고 인터페이스는 같은 꼴입니다. 홈(app/page.tsx)에 마운트합니다.
//
// state는 서버 첫 그림에서 "not_open"으로 시작해 마운트 뒤 registrationState()로 맞춥니다.
// 창이 닫혀 있는 동안(지금) 화면은 그 전과 같습니다. 창이 열리면 CTA 셋(히어로, #december,
// #join 참가자 카드)이 "등록하기"로 바뀌고 ?register=1이 모달을 엽니다.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import RegisterModal from "@/components/crossing/RegisterModal";
import { CURRENT_EVENT, registrationState, type RegistrationState } from "@/lib/registrationWindow";

export const CROSSING_REGISTERED_KEY = `naru.register.${CURRENT_EVENT}.done`;

interface Value {
  openRegister: () => void;
  registered: boolean;
  registerOpen: boolean;
  state: RegistrationState;
}

const Ctx = createContext<Value | null>(null);

export function useCrossingRegister(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCrossingRegister must be used within CrossingRegisterProvider");
  return v;
}
/** 프로바이더가 없어도 그려야 하는 자리용(없으면 null). */
export function useCrossingRegisterOptional(): Value | null {
  return useContext(Ctx);
}

export function CrossingRegisterProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [state, setState] = useState<RegistrationState>("not_open");
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    const s = registrationState(CURRENT_EVENT);
    setState(s);
    try {
      if (window.localStorage.getItem(CROSSING_REGISTERED_KEY)) setRegistered(true);
    } catch { /* storage blocked */ }
    const params = new URLSearchParams(window.location.search);
    const r = params.get("ref");
    if (r) setRef(r);
    if (params.get("register") === "1") {
      if (s === "open") setOpen(true);
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    }
    // 창이 열리거나 닫히는 순간을 탭이 열린 채로 맞으면 그 자리에서 바꿉니다.
    const id = window.setInterval(() => setState(registrationState(CURRENT_EVENT)), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const openRegister = useCallback(() => {
    if (registrationState(CURRENT_EVENT) === "open") setOpen(true);
  }, []);

  return (
    <Ctx.Provider value={{ openRegister, registered, registerOpen: open, state }}>
      {children}
      <RegisterModal
        open={open}
        onClose={() => setOpen(false)}
        refSource={ref}
        onRegistered={() => {
          setRegistered(true);
          try { window.localStorage.setItem(CROSSING_REGISTERED_KEY, "1"); } catch { /* ignore */ }
        }}
      />
    </Ctx.Provider>
  );
}
