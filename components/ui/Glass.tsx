// MOVED HERE 2026-09-17 (8월 문법 브리프). components/journey/Journey.tsx에서
// 정의만 옮겼습니다. 마크업과 클래스는 한 글자도 바뀌지 않았고, 8월 페이지는
// 같은 파일을 import 합니다. 나루 홈이 같은 문법을 쓰기 위해서입니다.

export default function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-9 ${className}`}>
      {children}
    </div>
  );
}
