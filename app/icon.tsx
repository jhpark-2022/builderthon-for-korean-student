import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon / app icon — always-legible branded square (no transparent-logo
// invisibility on light/dark tab bars).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
          color: "#ffffff",
          fontSize: 44,
          fontWeight: 900,
          borderRadius: 14,
        }}
      >
        B
      </div>
    ),
    { ...size }
  );
}
