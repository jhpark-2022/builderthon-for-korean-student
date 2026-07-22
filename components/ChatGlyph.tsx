// ─────────────────────────────────────────────────────────────────────────────
// Speech-bubble glyph for the open-chat entry points.
//
// BRANDING CONSTRAINT: KakaoTalk's logo and its official symbol may NOT be used
// here — the brand guidelines restrict third-party reproduction. So this is a
// generic bubble drawn from scratch, with a single #FEE500 (Kakao yellow) dot as
// the only nod to which app it opens. That dot is the entire brand cue.
//
// The button around it must never be filled yellow either: this element sits
// beside the violet register CTA, and a full-yellow control would out-shout the
// thing we actually want clicked.
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      // currentColor for the bubble so it inherits whatever state the button is
      // in (ghost → muted, promoted → white).
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* rounded bubble with a tail at the lower-left */}
      <path d="M10 3.2c-3.9 0-7 2.4-7 5.4 0 1.9 1.2 3.5 3.1 4.5-.2.7-.6 1.7-1.2 2.6-.2.3.1.6.4.5 1.4-.5 2.6-1.2 3.3-1.7.45.07.92.1 1.4.1 3.9 0 7-2.4 7-5.4S13.9 3.2 10 3.2Z" />
      {/* the one brand cue — Kakao yellow, deliberately small */}
      <circle cx="13.2" cy="8.4" r="1.35" fill="#FEE500" stroke="none" />
    </svg>
  );
}
