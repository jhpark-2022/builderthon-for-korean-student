"use client";

import dynamic from "next/dynamic";
import JourneyNav from "@/components/journey/JourneyNav";
import Journey from "@/components/journey/Journey";
import ResetHandler from "@/components/ResetHandler";
import { RegisterProvider } from "@/lib/RegisterContext";

// WebGL background is client-only (no SSR).
const Background = dynamic(() => import("@/components/Background"), { ssr: false });

export default function Home() {
  return (
    // RegisterProvider owns the single register-modal instance shared by the hero
    // hook, the scroll-revealed nav button, and the ?register=1 auto-open.
    <RegisterProvider>
      {/* First child: the ?reset=1 sweep runs before greeting/register read storage. */}
      <ResetHandler />
      <Background />
      <JourneyNav />
      <Journey />
    </RegisterProvider>
  );
}
