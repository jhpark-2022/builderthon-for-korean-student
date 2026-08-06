import type { Metadata } from "next";
import { Suspense } from "react";
import Quiz from "@/components/Quiz";
import ResetHandler from "@/components/ResetHandler";
import QuizIntroShell from "./QuizIntroShell";

export const metadata: Metadata = {
  title: "당신의 AI 모델은? · Zero100 AI Builderthon",
  description:
    "14개의 질문으로 알아보는 나의 빌더 유형. 결과는 16개 AI 모델 중 하나로. 결과에 맞춰 빌더톤에서 참여하면 좋을 세션까지 추천. / A 14-question AI personality test for the Singapore Korean-student builderthon: get your AI model and the sessions worth joining.",
  openGraph: {
    title: "당신의 AI 모델은? · Which AI model are you?",
    description: "14문항으로 알아보는 나의 빌더 유형 + 결과 맞춤 세션 추천.",
    type: "website",
  },
  // Without this the page inherited the root layout's twitter card, so a shared
  // quiz link showed the quiz's og:title next to the EVENT's twitter:title.
  // The image comes from ./opengraph-image.tsx via the summary_large_image card.
  twitter: {
    card: "summary_large_image",
    title: "당신의 AI 모델은? · Which AI model are you?",
    description: "14문항으로 알아보는 나의 빌더 유형 + 결과 맞춤 세션 추천.",
  },
};

export default function QuizPage() {
  // LocaleProvider is already supplied by the root layout.
  // useSearchParams (the ?r= deep link) must sit under a Suspense boundary.
  return (
    <>
      {/* First: the ?reset=1 sweep runs before Quiz reads its saved result.
          ResetHandler reads window.location directly (no useSearchParams), so it
          sits outside the Suspense boundary. */}
      <ResetHandler />
      {/* The fallback used to be a bare black rectangle. Quiz opts out of server
          rendering (useSearchParams), so that black frame was the entire first
          paint of /quiz until the bundle arrived. */}
      <Suspense fallback={<QuizIntroShell />}>
        <Quiz />
      </Suspense>
    </>
  );
}
