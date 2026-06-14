import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";

export const metadata: Metadata = {
  title: "SMU × Zero100 Builderthon — Build in Singapore",
  description:
    "Singapore's first festival-style builderthon for Korean students. 24–29 Aug 2026 · 6 days · ~100 builders. Co-building, global out-bounding, AI-native.",
  keywords: ["Builderthon", "Zero100", "KOMOS", "SMU", "Singapore", "Korean students", "hackathon", "vibe coding"],
  openGraph: {
    title: "SMU × Zero100 Builderthon",
    description: "Singapore's first festival-style builderthon for Korean students · 24–29 Aug 2026.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080810",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-[#06040f] text-white">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
