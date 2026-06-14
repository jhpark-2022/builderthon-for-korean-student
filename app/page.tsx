"use client";

import dynamic from "next/dynamic";
import { JourneyProvider } from "@/lib/JourneyContext";
import JourneyNav from "@/components/journey/JourneyNav";
import Journey from "@/components/journey/Journey";

// WebGL background is client-only (no SSR).
const Background = dynamic(() => import("@/components/Background"), { ssr: false });

export default function Home() {
  return (
    <JourneyProvider>
      <Background />
      <JourneyNav />
      <Journey />
    </JourneyProvider>
  );
}
