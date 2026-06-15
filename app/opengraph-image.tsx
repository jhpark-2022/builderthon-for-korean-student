import { ImageResponse } from "next/og";

export const alt = "SMU × Zero100 Builderthon — Build in Singapore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social-share card (generated at build/edge — no binary asset needed).
export default function OpengraphImage() {
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
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700, letterSpacing: 2, color: "#c4b5fd" }}>
          <span>KOMOS</span>
          <span style={{ opacity: 0.4 }}>×</span>
          <span style={{ opacity: 0.75 }}>Zero100</span>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#a5b4fc", marginTop: 26, fontWeight: 600 }}>
          Singapore&apos;s first festival-style builderthon for Korean students
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 22, fontSize: 118, fontWeight: 900, lineHeight: 1 }}>
          <span>Build</span>
          <span style={{ background: "linear-gradient(90deg,#c4b5fd,#f0abfc,#a5f3fc)", backgroundClip: "text", color: "transparent" }}>
            in Singapore.
          </span>
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 32, color: "#cbd5e1" }}>
          24–29 Aug 2026 · 6 days · ~100 builders
        </div>
      </div>
    ),
    { ...size }
  );
}
