// ─────────────────────────────────────────────────────────────────────────────
// Speech-bubble glyph for the open-chat entry points.
//
// BRANDING CONSTRAINT: KakaoTalk's logo and its official symbol may NOT be used
// here - the brand guidelines restrict third-party reproduction. So this is a
// generic bubble drawn from scratch, with a single #FEE500 (Kakao yellow) dot as
// the only nod to which app it opens. That dot is the entire brand cue.
//
// The button around it must never be filled yellow either: this element sits
// beside the violet register CTA, and a full-yellow control would out-shout the
// thing we actually want clicked.
// ─────────────────────────────────────────────────────────────────────────────

// DECIDED 2026-10-26 (사용자: "카카오 아이콘 플랫한 화이트로"): 테두리와 노란 점을 걷고 흰 면 하나의 말풍선입니다. 주요 CTA는 블루 그라데이션 면이라 흰색이 잘 보입니다.
// 같은 날 앞서 둔 onLight(노랑 채움)는 이 결정이 대신합니다.
export default function ChatGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden width="20" height="20" focusable="false" viewBox="0 0 20 20" className={`shrink-0 ${className}`}>
      <path fill="#FFFFFF" d="M10 3.2c-3.9 0-7 2.4-7 5.4 0 1.9 1.2 3.5 3.1 4.5-.2.7-.6 1.7-1.2 2.6-.2.3.1.6.4.5 1.4-.5 2.6-1.2 3.3-1.7.45.07.92.1 1.4.1 3.9 0 7-2.4 7-5.4S13.9 3.2 10 3.2Z" />
    </svg>
  );
}
