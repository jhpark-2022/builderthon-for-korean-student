"use client";

import dynamic from "next/dynamic";
import JourneyNav from "@/components/journey/JourneyNav";
import Journey from "@/components/journey/Journey";
import { RegisterProvider } from "@/lib/RegisterContext";

// WebGL background is client-only (no SSR).
const Background = dynamic(() => import("@/components/Background"), { ssr: false });

export default function Home() {
  return (
    // RegisterProvider owns the single register-modal instance shared by the hero
    // hook, the scroll-revealed nav button, and the ?register=1 auto-open.
    <RegisterProvider>
      <Background />
      <JourneyNav />
      <Journey />
    </RegisterProvider>
  );
}
