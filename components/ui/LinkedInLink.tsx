"use client";

// MOVED HERE 2026-09-15 (나루 런칭). components/journey/Journey.tsx 안에 있던
// 것을 그대로 꺼냈습니다. 나루 홈의 8월 기록 탭이 같은 링크를 그려야 하는데,
// 두 번째 버전을 만들면 호버 색과 탭 타깃이 두 페이지에서 갈라집니다.
// 마크업과 클래스는 한 글자도 바뀌지 않았습니다.
// LinkedIn glyph + link — shown ONLY on mentor / judge / speaker cards that
// carry a confirmed public URL (never invented). Opens in a new tab with
// noopener; stopPropagation keeps a click off any surrounding button/card.
export function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 8.98h4V21H3zM9 8.98h3.83v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.34c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.81V21H9z" />
    </svg>
  );
}

export default function LinkedInLink({ url, label, className = "" }: { url: string; label: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label={`${label} LinkedIn`}
      className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/60 transition after:absolute after:-inset-2 after:content-[''] hover:border-[#0a66c2]/60 hover:bg-[#0a66c2]/15 hover:text-[#7cb8f5] ${className}`}
    >
      <LinkedInIcon className="h-3.5 w-3.5" />
    </a>
  );
}
