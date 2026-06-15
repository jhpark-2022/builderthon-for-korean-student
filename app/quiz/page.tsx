import type { Metadata } from "next";
import { Suspense } from "react";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = {
  title: "당신의 AI 모델은? — SMU × Zero100 Builderthon",
  description:
    "12개의 질문으로 알아보는 나의 빌더 유형. 결과는 16개 AI 모델 중 하나로. 팀이 없으면 성격에 맞는 그룹으로 매칭까지. / A 12-question AI personality test for the Singapore Korean-student builderthon — get your AI model and auto-matched to a squad.",
  openGraph: {
    title: "당신의 AI 모델은? · Which AI model are you?",
    description: "12문항으로 알아보는 나의 빌더 유형 + 솔로 빌더 팀 매칭.",
    type: "website",
  },
};

export default function QuizPage() {
  // LocaleProvider is already supplied by the root layout.
  // useSearchParams (the ?r= deep link) must sit under a Suspense boundary.
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#06040f]" />}>
      <Quiz />
    </Suspense>
  );
}
