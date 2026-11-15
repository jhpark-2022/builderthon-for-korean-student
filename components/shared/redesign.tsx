// DECIDED 2026-11-07 (redesign/crossing 브랜치): 세 페이지(나루 홈, 크로싱 서울, 8월 기록)가 같이 쓰는 글자 단과 부품.
// 정보 위계를 글자 크기로 드러내는 다섯 단이고, 한 화면 안에서는 넷까지만 씁니다.
export const DISPLAY = "text-[3.25rem] sm:text-[4.5rem] lg:text-[6.25rem] font-black leading-[0.95] tracking-[-0.04em]";
export const TITLE = "text-[1.875rem] sm:text-[2.25rem] lg:text-[2.75rem] font-bold leading-[1.18] tracking-[-0.03em]";
export const HEADING = "text-[1.25rem] lg:text-[1.5rem] font-bold leading-[1.4] tracking-[-0.02em]";
export const BODY = "text-[1.0625rem] leading-[1.6]";
export const META = "text-[0.9375rem] leading-[1.55]";

export const INK = "text-naru-text";
export const SOFT = "text-naru-muted";
export const NAVY = "text-naru-navy";
export const RULE = "border-[#E3E0D8]";
export const FRAME = "mx-auto w-full max-w-[75rem] px-5 sm:px-8 lg:px-10";

export const BTN = "inline-flex min-h-[48px] items-center justify-center rounded-[10px] px-6 text-[1.0625rem] font-bold transition-[background-color,border-color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naru-navy";
export const BTN_PRIMARY = `${BTN} bg-naru-navy text-[#fff] hover:bg-[#1D338A]`;
// DECIDED 2026-11-15 (naru.community 판): 고스트 버튼은 흰 면 없이 바탕 그대로.
export const BTN_GHOST = `${BTN} border ${RULE} bg-transparent ${INK} hover:border-naru-navy/40`;
export const LINK = `inline-flex min-h-[44px] items-center ${META} font-semibold ${NAVY} underline decoration-naru-navy/30 underline-offset-[5px] transition-colors hover:decoration-naru-navy`;

/** 문구의 "\n"마다 데스크톱(lg 이상)에서 줄을 나눕니다. 폰에서는 한 문단으로 이어서 흐릅니다. */
export function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((part, i) => (
        <span key={i} className="lg:block">{i > 0 && " "}{part}</span>
      ))}
    </>
  );
}

/**
 * "2026-12-17", "2026-12-21" → "2026.12.17–12.21". 끝 날이 없으면 "2026.12.17".
 * DECIDED 2026-11-15 (사용자: "https://naru.community/crossing 이거 대로 내 version update 해줘"): /crossing 히어로 날짜 줄(naru.community 판).
 */
export function formatDotRange(start: string, end?: string | null): string {
  const [y, m, d] = start.split("-");
  if (!end) return `${y}.${m}.${d}`;
  const [, m2, d2] = end.split("-");
  return `${y}.${m}.${d}–${m2}.${d2}`;
}
