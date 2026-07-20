import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon / app icon — the Zero100 wheel mark on a white rounded square, so the
// brand mark stays legible on both light and dark browser tab bars (a bare
// transparent navy mark would vanish on dark tabs).
export default async function Icon() {
  // Read the brand mark at build/request time and inline it as a data URI so
  // ImageResponse (which can't fetch relative /public paths) can render it.
  const iconData = await readFile(
    join(process.cwd(), "public/partners/zero100-icon.png")
  );
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} width={46} height={46} alt="Zero100" />
      </div>
    ),
    { ...size }
  );
}
