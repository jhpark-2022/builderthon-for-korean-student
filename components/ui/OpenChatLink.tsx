"use client";

import { track } from "@vercel/analytics";
import { dict, links, type Phrase } from "@/data/dictionary";
import ChatGlyph from "@/components/ChatGlyph";
import { buttonClass, ARROW_CLASS } from "@/components/ui/Button";

type Tfn = (p: Phrase) => string;

// ─────────────────────────────────────────────────────────────────────────────
// OPEN-CHAT LINK — the third CTA, for the visitor who isn't ready to register.
//
// Deliberately the lowest-hierarchy element wherever it appears: no border, no
// fill, no pill. It sits directly under a register CTA, and the moment it reads
// as a peer it starts taking clicks from the conversion it exists to catch. If
// this ever looks like a button, that's the bug.
//
// `src` tags where the click came from so the funnel can be read per placement.
// ─────────────────────────────────────────────────────────────────────────────
// MOVED HERE 2026-09-15 (나루 런칭). components/journey/Journey.tsx 안에 있던
// 것을 그대로 꺼냈습니다. 마크업과 클래스는 바뀌지 않았고, 바뀐 것은 `src`의
// 목록뿐입니다. 나루 홈에 오픈채팅 자리가 세 군데 생겼기 때문입니다.
//
// 나루 홈에서 이 링크가 특히 중요한 이유: 홈에는 등록이 없습니다. 12월 이벤트의
// 등록은 아직 열리지 않았고, 나루는 가입 폼을 두지 않습니다(Overview 06).
// 그래서 "지금 할 수 있는 일"이 오픈채팅 하나뿐이고, 8월 페이지에서처럼 등록
// 버튼 아래 3순위로 서 있는 것이 아니라 그 자리의 유일한 문입니다.
// 그럼에도 스타일을 올리지 않은 것은 의도입니다. 홈의 CTA 위계는 각 챕터가
// 자기 알약으로 만들고, 이 칩은 어디에 있든 같은 무게로 읽혀야 합니다.
// ─────────────────────────────────────────────────────────────────────────────
export default function OpenChatLink({
  t,
  src,
  label,
  className = "",
  variant = "ghost",
}: {
  t: Tfn;
  // 자리마다 누르는 이유가 다릅니다. 기본값(dict.register.openChatCta)은 8월
  // 정본이 들고 있는 문장형 라벨이라, 문을 열어 주기는 하지만 무엇을 언제 받는지
  // 말하지 않습니다. 나루 홈은 data/naru.ts의 openChatLabels를 넘깁니다.
  // 넘기지 않으면 지금까지처럼 동작하므로 /2026-08은 한 글자도 바뀌지 않습니다.
  label?: Phrase;
  // "wrap" = 행사 마무리 섹션 (2026-08-30). analytics에서 어느 자리의 오픈채팅
  // 링크가 눌렸는지 가르는 값이라, 자리를 새로 만들면 여기에 이름을 더합니다.
  // naru-* = 나루 홈의 자리들 (2026-09-15). 8월 페이지의 계열과 섞이지 않도록
  // 접두사를 답니다. 두 페이지의 퍼널은 따로 읽어야 합니다.
  src: "band" | "footer" | "wrap" | "naru-hero" | "naru-december" | "naru-join" | "naru-footer";
  className?: string;
  // DECIDED 2026-09-17: "primary"가 생겼습니다. 위 주석의 "이 칩은 어디에 있든
  // 같은 무게"는 등록 버튼이 있는 페이지의 규칙이었습니다. 나루 홈 #december에는
  // 등록이 없고, 이 링크가 그 챕터의 유일한 문인데 옆의 메일 링크와 같은
  // 고스트로 나란히 서서 "소식 받기"와 "출제사 문의"가 동급으로 읽혔습니다.
  // 히어로 주 CTA를 눌러 착지한 사람이 3화면을 더 내려가야 이 칩을 만나기도
  // 했고요. 그 한 자리만 흰 면입니다(#record의 아카이브 버튼과 같은 면. 주황은
  // 히어로의 원장이 막습니다). /2026-08과 나머지 자리는 기본값(ghost) 그대로.
  // "hero" (2026-09-17 2차): 홈 첫 화면의 주 CTA. 히어로가 크로싱 서울이 되면서
  // 이 자리의 행동이 앵커에서 오픈채팅으로 바뀌었고, 히어로 주황 면은 그대로
  // 이 버튼 하나입니다(주황 원장은 NaruHome 히어로 주석).
  // 2026-09-17 (8월 문법 브리프): "hero"가 주황 면에서 그라데이션 필(보라 → 자주,
  // 발광)로 바뀌었습니다. 8월 히어로의 주 CTA와 같은 기하이고, 주황은 면이 아니라
  // 점이라는 원칙에 따라 버튼 면에서 뺐습니다. "secondary"는 8월의 유령 필(같은
  // 크기). #december의 문이 이것을 씁니다. 페이지의 그라데이션 필은 히어로 하나.
  variant?: "ghost" | "primary" | "hero" | "secondary";
}) {
  if (!links.openChat) return null;
  if (variant === "hero" || variant === "secondary") {
    return (
      <a
        href={links.openChat}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("openchat_click", { src })}
        className={`${buttonClass(variant === "hero" ? "primary" : "secondary", "naru")} ${className}`}
      >
        <ChatGlyph className="h-4 w-4 shrink-0" />
        {t(label ?? dict.register.openChatCta)}
        <span aria-hidden className={variant === "hero" ? ARROW_CLASS : "text-white/50"}>→</span>
      </a>
    );
  }
  if (variant === "primary") {
    return (
      <a
        href={links.openChat}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("openchat_click", { src })}
        className={`group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-naru-navy transition hover:-translate-y-0.5 hover:bg-white/90 sm:px-8 sm:text-base ${className}`}
      >
        <ChatGlyph className="h-4 w-4 shrink-0" />
        {t(label ?? dict.register.openChatCta)}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </a>
    );
  }
  return (
    // Ghost CHIP, not a bare underlined line. At text-white/60 with a hairline
    // underline this read as a footnote and was skipped — which defeats the
    // point, since this is the only offer on the page for someone who has read
    // everything and still isn't ready to register. Same ghost treatment as the
    // nav's open-chat button, so the two are recognisably the same door.
    //
    // Still deliberately NOT a fill: it sits under the violet register pill and
    // must stay a clear step below it. Border + brighter text is the ceiling.
    <a
      href={links.openChat}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("openchat_click", { src })}
      className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-medium leading-relaxed text-white/75 transition hover:border-white/35 hover:bg-white/10 hover:text-white ${className}`}
    >
      <ChatGlyph className="h-4 w-4 shrink-0" />
      {t(label ?? dict.register.openChatCta)}
      <span aria-hidden className="text-white/50">→</span>
    </a>
  );
}
