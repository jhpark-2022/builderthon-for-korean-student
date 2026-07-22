import { ImageResponse } from "next/og";

// ─────────────────────────────────────────────────────────────────────────────
// Share card for /quiz.
//
// The quiz is the funnel's low-friction entry — it's the link that actually gets
// pasted into KakaoTalk — and it was shipping with NO og:image at all. The root
// `app/opengraph-image.tsx` does not carry down here, because this segment
// declares its own `openGraph` block in page.tsx, so a shared /quiz link
// rendered as a bare grey card in exactly the channel Phase 2 runs on.
//
// Deliberately its own card rather than reusing the event one: what makes
// someone tap a link a friend dropped in a group chat is the quiz question, not
// the event billing.
// ─────────────────────────────────────────────────────────────────────────────

export const alt = "당신의 AI 모델은? · Which AI model are you?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function QuizOpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px",
          background:
            "radial-gradient(120% 90% at 50% 22%, #1a1235 0%, #0f172a 46%, #06040f 82%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#c4b5fd",
            // No decorative glyphs here: ImageResponse renders with a plain
            // sans fallback and "✦" came out as tofu in the generated PNG.
          }}
        >
          AI Personality Test
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          당신의 AI 모델은?
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.1,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          Which AI model are you?
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 32,
            fontWeight: 600,
            color: "rgba(255,255,255,0.62)",
          }}
        >
          14문항 · 3분 · 16개 AI 모델 중 하나 · 환상의 짝꿍까지
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 46,
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              padding: "14px 30px",
              background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            Zero100 Builderthon
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 600,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            2026.08.22 – 08.29 · Singapore
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
