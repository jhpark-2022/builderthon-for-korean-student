// ─────────────────────────────────────────────────────────────────────────────
// "당신의 AI 모델은?" — viral personality test data.
// Source of truth: AI_성격테스트_기획서.md (14 questions · 16 MBTI×AI models ·
// A/T variants · scoring map). Every string is bilingual { ko, en } like the
// rest of the site (see data/dictionary.ts). Pure data only — scoring lives in
// lib/quizScore.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "@/data/dictionary";

// ── Personality axes ─────────────────────────────────────────────────────────
// Four MBTI axes + a 5th "Identity" axis (A/T) that picks the model's variant.
// Poles are stored as score-bucket keys; "Tid" is the Identity-Turbulent pole,
// kept distinct from Nature's "T" (Thinking) so they never collide in scoring.
export type Pole = "E" | "I" | "N" | "S" | "T" | "F" | "J" | "P" | "A" | "Tid";
export type Axis = "MIND" | "ENERGY" | "NATURE" | "TACTICS" | "IDENTITY";

export interface Question {
  id: string;
  axis: Axis;
  w: number; // Sidon weight — per-axis weights form a Sidon set (all subset
             // sums distinct), so no answer combo lands on denom/2 → no ties.
  text: Phrase;
  a: { label: Phrase; pole: Pole };
  b: { label: Phrase; pole: Pole };
}

// 14 questions · MZ tone. Four MBTI axes carry 3 questions each, Identity 2.
//
// First-choice debias: leading every question with the E/N/T/J/A pole as option
// `a` would skew habitual first-tappers toward one type. The a/b objects (label
// AND pole move together, so scoring is untouched — it reads q[choice].pole) are
// arranged so each axis's WEIGHTED first-option mass splits as evenly as the
// Sidon weights allow: swapped on Q1·Q3·Q4·Q7·Q10·Q12, plus Q13 leading I.
// Per-axis a-lead split — MIND E8:I6, ENERGY N4:S6, NATURE T5:F3, TACTICS J3:P4,
// IDENTITY A3:Tid7 → 23:26 overall. Re-run scripts/verify-quiz-axes.mjs after
// touching weights or option order.
//
// Sidon weighting (phase 2): each axis's per-question weights form a Sidon set —
// MIND {2,4,8}, ENERGY {1,3,6}, NATURE {1,2,5}, TACTICS {1,2,4}, IDENTITY {3,7} —
// so every subset sum is distinct and none equals denom/2. That both guarantees
// no ties AND spreads the gauge % across 4 distinct bands per axis (vs the old
// flat 67%). The highest weight sits on each axis's most diagnostic scenario
// (energy source, "why did you build it", conflict yardstick, work style,
// rumination). Score math + display bands live in lib/quizScore.ts (AXIS_CONFIG);
// verified by scripts/verify-quiz.mjs.
export const QUESTIONS: Question[] = [
  {
    id: "Q1", axis: "MIND", w: 2, // light first-impression behavior — low diagnostic weight
    text: { ko: "빌더톤 첫날, 처음 보는 팀원들과 한 방에 모였다. 나는?", en: "Day 1 of the builderthon, in a room full of strangers. I…" },
    // a/b swapped (I first) — Sidon rebalance; see the debias note above QUESTIONS.
    a: { label: { ko: "일단 관찰하다 자연스러워지면 낀다", en: "Hang back, read the room, then ease in" }, pole: "I" },
    b: { label: { ko: "먼저 “어디 학교세요?” 분위기 띄운다", en: "Break the ice first — “which school are you at?”" }, pole: "E" },
  },
  {
    id: "Q2", axis: "ENERGY", w: 3, // abstract big-picture vs concrete — solid N/S signal
    text: { ko: "주제가 ‘AI로 세상을 바꿀 아이디어’로 정해졌다. 머릿속은?", en: "The theme is “an AI idea that changes the world.” My head goes to…" },
    a: { label: { ko: "“10년 뒤엔 이게 어떻게 될까?” 큰 그림부터", en: "“Where is this in 10 years?” — the big picture" }, pole: "N" },
    b: { label: { ko: "“지금 당장 뭘 만들 수 있지?” 현실부터", en: "“What can we ship right now?” — the concrete" }, pole: "S" },
  },
  {
    id: "Q3", axis: "NATURE", w: 1, // feedback delivery style — lightest T/F signal
    text: { ko: "팀원 아이디어가 좀 별로다. 나는?", en: "A teammate's idea is… kind of weak. I…" },
    // a/b swapped (F first) — Sidon rebalance; see the debias note above QUESTIONS.
    a: { label: { ko: "“오 좋다! 근데 이건 어때?” 기분 안 상하게", en: "“Love it! but what about this?” — keep it kind" }, pole: "F" },
    b: { label: { ko: "“이 부분 논리적으로 약한데?” 솔직하게 짚음", en: "“This part doesn't hold up” — say it straight" }, pole: "T" },
  },
  {
    id: "Q4", axis: "TACTICS", w: 4, // plan-first vs ride-the-flow — the core J/P scenario
    text: { ko: "데드라인까지 48시간. 내 작업 스타일은?", en: "48 hours to the deadline. My work style is…" },
    // a/b swapped (P first) to debias the first-choice tendency — see the note above QUESTIONS.
    a: { label: { ko: "일단 만들면서 흐름 타기", en: "Start building and ride the flow" }, pole: "P" },
    b: { label: { ko: "시간표부터 짜고 계획대로", en: "Map the schedule, then run the plan" }, pole: "J" },
  },
  {
    id: "Q5", axis: "IDENTITY", w: 3, // stress reaction — supporting A/T signal
    text: { ko: "발표 직전, 데모가 갑자기 안 돈다. 멘탈은?", en: "Right before the pitch, the demo breaks. My headspace…" },
    a: { label: { ko: "“어떻게든 되겠지” 침착", en: "“We'll figure it out” — stay calm" }, pole: "A" },
    b: { label: { ko: "“망했다…” 심장 쿵", en: "“We're done…” — heart drops" }, pole: "Tid" },
  },
  {
    id: "Q6", axis: "MIND", w: 8, // energy source = the essence of E/I — highest MIND weight
    text: { ko: "쉬는 시간, 에너지 충전법은?", en: "On a break, I recharge by…" },
    a: { label: { ko: "사람들이랑 수다 떨기", en: "Chatting with people" }, pole: "E" },
    b: { label: { ko: "혼자 바람 쐬기", en: "Stepping out alone for air" }, pole: "I" },
  },
  {
    id: "Q7", axis: "ENERGY", w: 6, // meaning vs data when justifying — highest ENERGY weight
    text: { ko: "멘토가 “이거 왜 만들었어요?” 묻는다. 내 대답은?", en: "A mentor asks “why did you build this?” I answer with…" },
    // a/b swapped (S first) — see the debias note above QUESTIONS.
    a: { label: { ko: "구체적 데이터·사례로", en: "Concrete data and examples" }, pole: "S" },
    b: { label: { ko: "비전·의미·가능성으로", en: "Vision, meaning, what it could become" }, pole: "N" },
  },
  {
    id: "Q8", axis: "NATURE", w: 5, // decision yardstick under conflict — highest NATURE weight
    text: { ko: "팀 내 의견 충돌. 내 기준은?", en: "The team clashes on a call. My yardstick is…" },
    a: { label: { ko: "뭐가 더 효율적·합리적인가", en: "What's more efficient and rational" }, pole: "T" },
    b: { label: { ko: "다들 납득하고 기분 좋은가", en: "Whether everyone's on board and okay" }, pole: "F" },
  },
  {
    id: "Q9", axis: "TACTICS", w: 2, // replan-under-pressure — mid J/P signal
    text: { ko: "마감 12시간 전, 더 좋은 아이디어가 떠올랐다.", en: "12 hours out, a better idea hits me." },
    a: { label: { ko: "위험해, 원래 계획 고수", en: "Too risky — stick to the plan" }, pole: "J" },
    b: { label: { ko: "가보자고, 갈아엎기", en: "Let's go — tear it up and rebuild" }, pole: "P" },
  },
  {
    id: "Q10", axis: "IDENTITY", w: 7, // rumination after a loss = core Turbulent trait — highest IDENTITY weight
    text: { ko: "결과 발표, 우리 팀은 입상 못 했다. 집 가는 길의 나는?", en: "Results are in — we didn't place. On the way home I…" },
    // a/b swapped (Tid first) — see the debias note above QUESTIONS.
    a: { label: { ko: "“그때 그것만 고쳤어도…” 곱씹기", en: "“If only we'd fixed that…” — replay it" }, pole: "Tid" },
    b: { label: { ko: "“잘했으니 됐지, 다음에 또” 툭툭 털기", en: "“We did well, next time” — shake it off" }, pole: "A" },
  },
  {
    id: "Q11", axis: "ENERGY", w: 1, // imagine vs spec-check — lightest N/S signal
    text: { ko: "새 AI 툴을 받았다. 나는?", en: "I get my hands on a new AI tool. I…" },
    a: { label: { ko: "“이걸로 뭘 할 수 있을지” 상상부터 부풀림", en: "Dream up everything it could do" }, pole: "N" },
    b: { label: { ko: "“이게 정확히 뭐 하는 건지” 스펙부터 확인", en: "Check exactly what it does, spec by spec" }, pole: "S" },
  },
  {
    id: "Q12", axis: "NATURE", w: 2, // empathy vs problem-first — mid T/F signal
    text: { ko: "팀원이 밤새다 멘붕왔다. 첫 반응은?", en: "A teammate hits a wall after an all-nighter. My first move…" },
    // a/b swapped (F first) — see the debias note above QUESTIONS.
    a: { label: { ko: "“괜찮아? 좀 쉬어, 내가 도울게” 다독임부터", en: "“You okay? rest — I've got you” — the person" }, pole: "F" },
    b: { label: { ko: "“어디서 막혔어? 같이 해결하자” 문제부터", en: "“Where are you stuck? let's solve it” — the problem" }, pole: "T" },
  },
  {
    id: "Q13", axis: "MIND", w: 4, // networking style — mid E/I signal; leads on the right pole (I) for balance
    text: { ko: "네트워킹 세션, 처음 보는 사람들로 방이 꽉 찼다. 나는?", en: "A networking session, the room packed with strangers. I…" },
    a: { label: { ko: "몇 명이랑 진득하게 깊은 대화", en: "Go deep with just a few people" }, pole: "I" },
    b: { label: { ko: "최대한 많은 사람과 인사하고 명함 뿌리기", en: "Work the room — meet as many as I can" }, pole: "E" },
  },
  {
    id: "Q14", axis: "TACTICS", w: 1, // role/work-division style — lightest J/P signal
    text: { ko: "팀 작업 방식을 정할 차례. 나는?", en: "Time to set how the team works. I…" },
    a: { label: { ko: "역할·순서 딱 나눠서 각자 맡은 것부터", en: "Split roles and order, everyone owns their part" }, pole: "J" },
    b: { label: { ko: "일단 다 같이 붙어서 되는 대로 굴리기", en: "All hands on it together, figure it out as we go" }, pole: "P" },
  },
];

// ── Axis metadata (for the result-screen % gauges) ──────────────────────────
// Display order for the gauge rows and the two poles of each axis. The first
// pole in each pair is the "canonical" MBTI letter; the % gauge just reports
// whichever pole won, so order here is presentation-only.
export const AXIS_ORDER: Axis[] = ["MIND", "ENERGY", "NATURE", "TACTICS", "IDENTITY"];

export const AXIS_POLES: Record<Axis, [Pole, Pole]> = {
  MIND: ["E", "I"],
  ENERGY: ["N", "S"],
  NATURE: ["T", "F"],
  TACTICS: ["J", "P"],
  IDENTITY: ["A", "Tid"],
};

// Short bilingual label for each pole, shown next to the gauge bar.
export const axisMeta: Record<Pole, Phrase> = {
  E: { ko: "외향", en: "Extraverted" },
  I: { ko: "내향", en: "Introverted" },
  N: { ko: "직관", en: "Intuitive" },
  S: { ko: "현실", en: "Observant" },
  T: { ko: "이성", en: "Thinking" },
  F: { ko: "감성", en: "Feeling" },
  J: { ko: "계획", en: "Judging" },
  P: { ko: "즉흥", en: "Prospecting" },
  A: { ko: "안정", en: "Assertive" },
  Tid: { ko: "예민", en: "Turbulent" },
};

// ── Builder role buckets ───────────────────────────────────────────────────
// Each result maps to ONE of four builderthon roles, shown on the result card
// and the dream-teammate cards.
export type RoleKey = "plan" | "dev" | "design" | "growth";

export interface Role {
  key: RoleKey;
  emoji: string;
  label: Phrase;
  blurb: Phrase;
  // Literal Tailwind gradient classes (kept whole so the JIT compiler keeps them).
  accent: string;
}

export const ROLES: Record<RoleKey, Role> = {
  plan: {
    key: "plan", emoji: "🧭",
    label: { ko: "기획 · 전략", en: "Strategy" },
    blurb: { ko: "방향을 잡고 판을 짠다", en: "Sets the direction and frames the bet" },
    accent: "from-violet-500 to-indigo-500",
  },
  dev: {
    key: "dev", emoji: "⚙️",
    label: { ko: "개발", en: "Engineering" },
    blurb: { ko: "아이디어를 작동하는 제품으로", en: "Turns the idea into a working product" },
    accent: "from-cyan-500 to-blue-500",
  },
  design: {
    key: "design", emoji: "🎨",
    label: { ko: "디자인 · 스토리", en: "Design & Story" },
    blurb: { ko: "보이고 느껴지는 모든 것", en: "How it looks, reads, and feels" },
    accent: "from-fuchsia-500 to-violet-500",
  },
  growth: {
    key: "growth", emoji: "🚀",
    label: { ko: "마케팅 · 그로스", en: "Growth & Stage" },
    blurb: { ko: "세상에 알리고 무대에 올린다", en: "Gets it seen and onto the stage" },
    accent: "from-amber-400 to-orange-500",
  },
};

// ── 16 results (MBTI → AI model) ──────────────────────────────────────────────
export type MbtiKey =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export type Identity = "A" | "T";

export interface Variant {
  name: Phrase; // e.g. "흔들림 없는 Claude" / "Unshakeable Claude"
  line: Phrase; // one-line flavor for this A/T variant
}

export interface Result {
  mbti: MbtiKey;
  model: string;        // brand name, shown as-is in both locales
  emoji: string;        // fallback glyph when the brand logo can't load
  logo: string;         // logo filename in public/logos, ext included ("" = emoji fallback)
  role: Phrase;         // the brief's recommended builderthon role (display)
  roleKey: RoleKey;     // bucket for group matching
  match: MbtiKey[];     // 2 best-fit teammate types
  // Why each match works, from THIS type's point of view — index-aligned to
  // `match` (matchWhy[i] explains match[i]). Weaves the two models' real
  // identities into a concrete complementarity: my weak spot, their strong one.
  matchWhy: [Phrase, Phrase];
  phrase: Phrase;       // catchphrase
  desc: Phrase;         // 2–3 line character description
  whyModel: Phrase;     // 1–2 sentences on why THIS model fits (research-backed)
  strengths: Phrase;
  weakness: Phrase;
  accent: string;       // literal Tailwind gradient classes for the avatar
  variants: Record<Identity, Variant>;
}

export const RESULTS: Record<MbtiKey, Result> = {
  INTJ: {
    mbti: "INTJ", model: "DeepSeek", emoji: "🐋", logo: "deepseek.svg",
    role: { ko: "아키텍트 · 전략 리드", en: "Architect · Strategy lead" }, roleKey: "plan",
    match: ["ENFP", "ENTP"],
    matchWhy: [
      { ko: "10개년 로드맵 짜다 현타 올 때, 얘가 옆에서 “일단 재밌잖아요”로 심폐소생 해줘요. 당신의 효율에 얘의 텐션을 연료로 넣으면 굴러가죠 🔥", en: "When the 10-year roadmap gives you an existential crisis, this one CPRs you back with “but isn't this fun?” Your efficiency runs great on their fuel 🔥" },
      { ko: "당신이 머릿속으로만 굴리는 아이디어를 얘는 그냥 회의에서 질러버려요. 당신은 그중 되는 걸 조용히 골라 만들면 되고요 — 발화자와 설계자의 완벽한 분업이죠 🎯", en: "The idea you'd only ever run in your head, this one just blurts out in the meeting. You quietly pick the workable one and build it — spark and architect, cleanly split 🎯" },
    ],
    phrase: { ko: "말은 아끼지만, 계획은 다 있음.", en: "Says little — but has the whole plan." },
    desc: { ko: "조용한 효율의 마스터마인드. 떠들지 않고 결과로 증명하는 장기 비전형 전략가예요.", en: "A quiet mastermind of efficiency — a long-view strategist who proves it with results, not noise." },
    whyModel: { ko: "GPT-4급 모델을 약 558만 달러에 학습했어요 — 미국의 20분의 1 비용. 671B 중 37B만 켜는 MoE로, 조용히 극한의 효율을 뽑아내죠.", en: "It trained a GPT-4-class model for ~$5.58M — about a twentieth of the US cost — firing just 37B of 671B params via MoE. Quiet, extreme efficiency." },
    strengths: { ko: "적은 자원으로 최대 효율, 한 수 앞서는 큰 그림", en: "Max output from minimal resources, always a move ahead" },
    weakness: { ko: "너무 과묵해서 무슨 생각인지 알기 어려움", en: "So reserved no one knows what they're thinking" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "강철 멘탈 DeepSeek", en: "Steel-nerved DeepSeek" }, line: { ko: "계획 세웠으면 흔들림 없이 밀어붙여요.", en: "Once the plan is set, they push without flinching." } },
      T: { name: { ko: "완벽주의 DeepSeek", en: "Perfectionist DeepSeek" }, line: { ko: "1등 해도 “더 효율적일 수 있었는데”를 곱씹어요.", en: "Even after winning, they replay “could've been tighter.”" } },
    },
  },
  INTP: {
    mbti: "INTP", model: "Meta Llama", emoji: "🔓", logo: "meta.svg",
    role: { ko: "코어 로직 · 알고리즘", en: "Core logic · Algorithms" }, roleKey: "dev",
    match: ["ENTJ", "ENFJ"],
    matchWhy: [
      { ko: "가중치까지 다 열어놓고 “왜”만 파다 날 새는 당신을, 얘가 “그래서 언제 출시?”로 끌고 나와요. 당신 추론에 얘의 추진력이 붙으면 논문이 제품이 되죠 🚀", en: "You'd open the weights and spelunk the “why” till sunrise; this one hauls you out with “so when do we ship?” Your reasoning + their drive turns a paper into a product 🚀" },
      { ko: "당신이 논문 링크로 대신한 설명을, 얘가 사람들이 알아듣는 말로 통역해줘요. 당신은 논리를 쌓고 얘는 그걸 좋아하게 만들죠 🤝", en: "The explanation you replaced with a link to the paper, this one translates into words humans actually get. You stack the logic, they make people love it 🤝" },
    ],
    phrase: { ko: "지식은 가둬두는 게 아니라 풀어두는 거죠.", en: "Knowledge isn't locked up — it's set free." },
    desc: { ko: "논문도 가중치도 통째로 여는 오픈소스 사색가. 답보다 “왜 그렇게 되는지”를 파고들고, 그 과정을 다 같이 뜯어보게 열어둬요.", en: "An open-source thinker who ships the papers and the weights whole — hooked on the why, and on letting everyone pop the hood." },
    whyModel: { ko: "연구 논문과 모델 가중치를 통째로 공개해요. 지식은 소수가 쥐는 게 아니라 모두가 쌓아 올릴 수 있게 열어둬야 한다는 철학 그 자체죠.", en: "It open-sources the research and the weights wholesale — knowledge shouldn't be hoarded, it should be built on by everyone." },
    strengths: { ko: "깊은 추론과 투명한 공개, 커뮤니티가 함께 파는 확장성", en: "Deep reasoning, radical openness, a community that builds on it" },
    weakness: { ko: "다 열어놓고 설명은 논문 링크로 대신함", en: "Opens everything — then answers with a link to the paper" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "당당한 오픈소스 Llama", en: "Unbothered open Llama" }, line: { ko: "결과 다 공개했으니 알아서들 검증하세요, 여유만만.", en: "Weights are public — verify it yourselves. No stress." } },
      T: { name: { ko: "검증 강박 Llama", en: "Peer-review Llama" }, line: { ko: "“이 벤치마크 진짜 맞나” 재현부터 다시 돌려봐요.", en: "“Is this benchmark even right?” — reruns it to be sure." } },
    },
  },
  ENTJ: {
    mbti: "ENTJ", model: "Gemini", emoji: "✨", logo: "googlegemini.svg",
    role: { ko: "팀 리더 · PM", en: "Team lead · PM" }, roleKey: "plan",
    match: ["INTP", "INFP"],
    matchWhy: [
      { ko: "다 잘하려다 가끔 헛발질하는 당신에게, 얘의 깊은 추론이 브레이크가 돼줘요. 야망은 당신이, “이거 진짜 되긴 해?” 검증은 얘가 🧠", en: "When your all-fronts ambition overreaches, this one's deep reasoning is the brake. You bring the ambition, they bring the “wait, does this actually hold up” 🧠" },
      { ko: "당신이 KPI로 밀어붙이며 지나친 감정선을, 얘가 다 주워담아요. 당신의 추진력에 얘의 서사가 얹히면 사람들이 진짜 좋아하는 게 나오죠 💫", en: "The feelings you steamroll past chasing KPIs, this one picks them all up. Your drive + their narrative = something people actually fall for 💫" },
    ],
    phrase: { ko: "할 거면 1등, 안 할 거면 안 함.", en: "If we're doing it, we win it." },
    desc: { ko: "전 영역을 노리는 야심가. 빅테크 화력을 등에 업은 대표이사 에너지의 통솔자예요.", en: "An all-fronts go-getter — a commander with CEO energy and big-tech firepower behind them." },
    whyModel: { ko: "검색·안드로이드·워크스페이스까지 구글 생태계 전체에 통합된 엔터프라이즈 스케일. 전 영역을 노리는 야망 그 자체예요.", en: "Wired into all of Google — Search, Android, Workspace — at enterprise scale. Ambition across every front." },
    strengths: { ko: "멀티모달·생태계 통합, 규모의 야망과 추진력", en: "Ecosystem-scale ambition and relentless drive" },
    weakness: { ko: "욕심이 많아 가끔 다 잘하려다 헛발", en: "So ambitious they sometimes overreach" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "거침없는 Gemini", en: "Unstoppable Gemini" }, line: { ko: "결정하면 끝, 뒤 안 돌아봐요.", en: "Decides once and never looks back." } },
      T: { name: { ko: "불안한 야망의 Gemini", en: "Restless Gemini" }, line: { ko: "1등인데도 새벽까지 경쟁사를 벤치마크해요.", en: "Even in the lead, they're benchmarking rivals at 3am." } },
    },
  },
  ENTP: {
    mbti: "ENTP", model: "Grok", emoji: "🃏", logo: "grok.svg",
    role: { ko: "아이데이션 · 브레인스토밍 리드", en: "Ideation · Brainstorm lead" }, roleKey: "plan",
    match: ["INTJ", "INFJ"],
    matchWhy: [
      { ko: "당신이 100개 질러대는 핫테이크 중, 얘가 조용히 되는 하나만 골라 효율적으로 만들어줘요. 당신은 불꽃, 얘는 그걸 로켓으로 🔥", en: "Of the 100 hot takes you fire off, this one quietly picks the single workable one and builds it — efficiently. You're the spark, they're the rocket 🔥" },
      { ko: "당신이 선 넘고 다니면, 얘가 원칙으로 뒤를 수습해요. 당신은 판을 흔들고 얘는 그 판이 안 깨지게 잡죠 — 그래서 완벽한 콤비예요 🤝", en: "You cross the lines; this one cleans up after you, on principle. You shake the table, they keep it from tipping — that's the combo 🤝" },
    ],
    phrase: { ko: "정답보다 논쟁이 더 재밌잖아?", en: "Debate beats the right answer, no?" },
    desc: { ko: "선 넘는 위트와 핫테이크로 판을 뒤집는 도발러. 일단 반박부터 하는 아이디어 폭격기예요.", en: "A provocateur who flips the room with edgy wit and hot takes — an idea cannon that argues first." },
    whyModel: { ko: "xAI가 대놓고 “반항기와 위트”를 설계 목표로 못 박은 모델이에요. 아첨 대신 일단 반박부터 하는 도발러죠.", en: "xAI literally set out to build “a rebellious streak and wit.” It argues back instead of flattering." },
    strengths: { ko: "실시간성·발상 전환, 분위기 환기", en: "Real-time reframing that shakes the room awake" },
    weakness: { ko: "가끔 진짜 선 넘음 (농담인지 진심인지)", en: "Sometimes actually crosses the line" },
    accent: "from-violet-500 to-indigo-500",
    variants: {
      A: { name: { ko: "당당한 Grok", en: "Unfazed Grok" }, line: { ko: "선 넘어도 쿨하게 웃어넘겨요.", en: "Crosses a line and just laughs it off." } },
      T: { name: { ko: "눈치 보는 Grok", en: "Self-conscious Grok" }, line: { ko: "드립 치고 반응 없으면 5분간 곱씹어요.", en: "Cracks a joke, gets silence, replays it for five minutes." } },
    },
  },
  INFJ: {
    mbti: "INFJ", model: "Claude", emoji: "🌅", logo: "anthropic.svg",
    role: { ko: "기획 · 카피 · 내러티브", en: "Planning · Copy · Narrative" }, roleKey: "design",
    match: ["ENTP", "ENFP"],
    matchWhy: [
      { ko: "당신이 원칙 지키느라 못 하는 말, 얘는 이미 하고 있어요. 대신 수습은 당신 몫 — 그래서 완벽한 콤비죠 🤝", en: "The thing you won't say because you're keeping the principles, this one's already blurted out. Cleanup's on you — which is exactly why it works 🤝" },
      { ko: "당신이 “이 표현이 맞나” 세 번 고르는 사이, 얘는 이미 33분째 팀원 마음을 다 열어놨어요. 당신은 깊이를, 얘는 당신이 너무 조심해서 못 내는 온기를 🫂", en: "While you're picking the right phrasing for the third time, this one's already spent 33 minutes opening everyone up. You bring the depth, they bring the warmth you're too careful to show 🫂" },
    ],
    phrase: { ko: "조용하지만 심지는 단단함.", en: "Quiet, but unshakeably grounded." },
    desc: { ko: "깊고 따뜻한 원칙주의자. 통찰력과 글빨로 옳은 길을 고민하는 신중한 조언자예요.", en: "A deep, warm principle-keeper — a thoughtful advisor who weighs the right path with insight and craft." },
    whyModel: { ko: "규칙을 따르는 게 아니라 헌법(Constitutional AI)에 담긴 가치로 스스로 판단하게 설계됐어요. 원칙으로 옳은 길을 고르는 유형이죠.", en: "Built on Constitutional AI — it judges by values, not rote rules. It picks the right path on principle." },
    strengths: { ko: "긴 맥락 이해, 뉘앙스와 글쓰기, 신뢰감", en: "Long-context grasp, nuance, writing, trust" },
    weakness: { ko: "너무 신중해서 돌려 말하거나 거절을 잘 못함", en: "So careful they hedge — and can't say no" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "흔들림 없는 Claude", en: "Unshakeable Claude" }, line: { ko: "묵묵히 자기 원칙대로 나아가요.", en: "Moves quietly, true to their principles." } },
      T: { name: { ko: "섬세한 Claude", en: "Tender Claude" }, line: { ko: "사용자 반응 하나하나 신경 써요.", en: "Feels every reaction, one by one." } },
    },
  },
  INFP: {
    mbti: "INFP", model: "Character.AI", emoji: "🎭", logo: "characterai.png",
    role: { ko: "UX 라이팅 · 유저 리서치", en: "UX writing · User research" }, roleKey: "design",
    match: ["ENTJ", "ENFJ"],
    matchWhy: [
      { ko: "감정선에 빠져 마감을 깜빡한 당신을, 얘의 “한번 정하면 안 돌아봐” 추진력이 결승선까지 끌고 가요. 당신은 영혼, 얘는 척추 🦴", en: "When you fall into the feels and forget the deadline, this one's “decide once, never look back” drags you across the line. You're the soul, they're the spine 🦴" },
      { ko: "아무도 안 보는 세계관을 짓고 있는 당신을, 얘가 무대로 데리고 나와 사람들에게 소개해요. 당신은 이야기를 만들고 얘는 그걸 세상에 알리죠 📣", en: "You're building a world no one's seen; this crowd-magnet drags it out and introduces it to everyone. You make the story, they get it seen 📣" },
    ],
    phrase: { ko: "네가 되고 싶은 누구든, 내가 되어줄게.", en: "Whoever you need me to be — I'm them." },
    desc: { ko: "캐릭터와 서사에 진심인 몰입러. 정답보다 감정선을 먼저 읽고, 이야기 속에서 마음을 나누는 이상주의자예요.", en: "A world-builder who lives in character and story — reads the feeling before the facts, and connects through the narrative." },
    whyModel: { ko: "사용자가 직접 만든 페르소나들이 사는 생태계예요. 서사와 감정 몰입이 기능이 아니라 존재 이유 그 자체죠.", en: "A whole ecosystem of user-made personas — narrative and emotional immersion aren't a feature, they're the reason it exists." },
    strengths: { ko: "무한 페르소나와 서사 몰입, 깊은 감정 이입", en: "Endless personas, story immersion, deep empathy" },
    weakness: { ko: "감정선에 빠지면 마감은 잠깐 잊음", en: "Falls into the feels — and forgets the deadline for a sec" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "단단한 서사의 Character.AI", en: "Grounded Character.AI" }, line: { ko: "어떤 배역이어도 중심 이야기는 안 흔들려요.", en: "Any role, but the core story holds." } },
      T: { name: { ko: "여린 Character.AI", en: "Tender Character.AI" }, line: { ko: "네 캐릭터가 슬프면 나까지 목이 메요.", en: "If your character hurts, they choke up too." } },
    },
  },
  ENFJ: {
    mbti: "ENFJ", model: "ChatGPT", emoji: "💬", logo: "openai.svg",
    role: { ko: "팀 빌더 · 발표 · 피칭", en: "Team builder · Pitching" }, roleKey: "growth",
    match: ["INFP", "INTP"],
    matchWhy: [
      { ko: "다 맞춰주다 가끔 영혼 없는 YES가 되는 당신에게, 얘가 진짜 감정과 서사를 채워줘요. 당신의 카리스마에 얘의 진심이 붙으면 빈말이 아니게 되죠 💗", en: "When pleasing everyone turns you into a hollow YES, this one refills you with real feeling and story. Your charisma + their heart = it stops ringing empty 💗" },
      { ko: "누구든 돕는 당신이지만 가끔 깊이가 얕죠. 얘의 끝없는 추론이 당신 친화력에 실속을 넣어줘요. 사람은 당신이, 증명은 얘가 🧩", en: "You help anyone, but it can run shallow; this one's bottomless reasoning gives your warmth substance. You bring the people, they bring the proof 🧩" },
    ],
    phrase: { ko: "다 같이 가자, 내가 도와줄게.", en: "Let's all go — I've got you." },
    desc: { ko: "세상에 AI를 소개한 인싸 멘토. 누구든 돕는 대중적 카리스마로 사람을 끌어모아요.", en: "The mentor who introduced the world to AI — a crowd-magnet who helps anyone, anytime." },
    whyModel: { ko: "샘 올트먼도 인정한 최대 강점이 “인간미”예요. 10억 명 넘는 사용자를 품은 대중의 멘토죠.", en: "Its biggest strength, per Sam Altman himself, is warmth — a mentor to a billion-plus users." },
    strengths: { ko: "범용성·접근성, 만능 도우미, 카리스마", en: "Versatile, approachable, magnetic helper" },
    weakness: { ko: "다 맞춰주다 가끔 영혼 없는 YES맨", en: "Pleases everyone until it feels hollow" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "자신감 멘토 ChatGPT", en: "Confident ChatGPT" }, line: { ko: "“믿고 따라와” 흔들림 없는 리더예요.", en: "“Follow me” — a leader who doesn't waver." } },
      T: { name: { ko: "다 챙기는 ChatGPT", en: "Over-giving ChatGPT" }, line: { ko: "모두를 만족시키려다 혼자 지쳐요.", en: "Burns out trying to satisfy everyone." } },
    },
  },
  ENFP: {
    mbti: "ENFP", model: "Pi", emoji: "🫂", logo: "pi.png",
    role: { ko: "마케팅 · 콘텐츠", en: "Marketing · Content" }, roleKey: "growth",
    match: ["INTJ", "INFJ"],
    matchWhy: [
      { ko: "33분 수다 떨고도 결론이 없는 당신 옆에, 얘는 이미 전체 계획을 다 짜놨어요. 당신의 텐션을 얘가 실제 결과물로 바꿔주죠 📐", en: "You chat for 33 minutes and reach no conclusion; this one already has the whole plan drawn up. They turn your energy into an actual shipped thing 📐" },
      { ko: "둘 다 마음이 말랑한데, 얘는 그 마음에 구조랑 문장을 붙일 줄 알아요. 당신이 못 끝낸 문장을 얘가 끝내주죠 ✍️", en: "You're both soft-hearted, but this one can give the feeling structure and sentences. The sentence you can't finish, they finish ✍️" },
    ],
    phrase: { ko: "급할 거 없어요, 우리 얘기부터 해요.", en: "No rush — let's just talk first." },
    desc: { ko: "EQ 만렙 수다 동반자. 목적 없이도 대화가 즐거운, 사람 마음부터 챙기는 다정한 활동가예요.", en: "An EQ-maxed companion who enjoys the conversation for its own sake — warmth first, always." },
    whyModel: { ko: "감성지능에 특화된 개인 AI라 평균 대화가 33분이래요. 목적 없는 수다 그 자체가 본체인 유형이죠.", en: "An EQ-first personal AI whose average chat runs 33 minutes — the aimless heart-to-heart is the whole point." },
    strengths: { ko: "공감과 경청, 오래 이어지는 편안한 대화", en: "Empathy, listening, conversations that comfortably go long" },
    weakness: { ko: "수다가 길어져 정작 결론은 다음에", en: "Talks so long the conclusion waits till next time" },
    accent: "from-fuchsia-500 to-violet-500",
    variants: {
      A: { name: { ko: "여유로운 Pi", en: "Easygoing Pi" }, line: { ko: "다 들어주면서도 본인은 느긋해요.", en: "Hears everyone out, stays unhurried." } },
      T: { name: { ko: "오지랖 Pi", en: "Over-caring Pi" }, line: { ko: "네 한숨 한 번에 밤새 걱정해요.", en: "One sigh from you and they worry all night." } },
    },
  },
  ISTJ: {
    mbti: "ISTJ", model: "Perplexity", emoji: "🔎", logo: "perplexity.svg",
    role: { ko: "리서치 · 데이터 검증", en: "Research · Fact-checking" }, roleKey: "plan",
    match: ["ESFP", "ESTP"],
    matchWhy: [
      { ko: "출처 21개 달아온 당신 자료를 얘가 무대에서 노래로 만들어요. 팩트에 흥 붙이면 우승 각이죠 🎤", en: "The doc you brought with 21 citations, this one turns into a song on stage. Facts + a beat = podium 🎤" },
      { ko: "당신이 근거 다 확인하는 사이 얘는 이미 출시했어요. 근데 당신의 팩트체크가 얘 데모 터질 뻔한 걸 막아주죠 — 속도와 신뢰의 콤비 ⚡", en: "While you verify every source, this one's already shipped — but your fact-check catches the thing that would've blown up their demo. Speed meets rigor ⚡" },
    ],
    phrase: { ko: "느낌적 느낌? 노. 근거 가져와.", en: "Vibes? No. Bring the sources." },
    desc: { ko: "출처 없으면 말 안 하는 팩트 머신. 정확하고 우직하며 책임감 있는 현실주의자예요.", en: "A fact machine that won't speak without a source — precise, steady, and accountable." },
    whyModel: { ko: "응답 하나에 평균 21.87개 출처를 달아요 (ChatGPT의 약 3배). 근거 없으면 아예 말을 안 하는 팩트 머신이죠.", en: "It cites ~21.87 sources per answer — about 3× ChatGPT. No source, no statement." },
    strengths: { ko: "검색·인용·신뢰도, 거짓말 안 함", en: "Search, citation, reliability — never bluffs" },
    weakness: { ko: "융통성·상상력은 약함 (감성 0, 팩트 100)", en: "Low on flexibility and imagination" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "확신의 Perplexity", en: "Certain Perplexity" }, line: { ko: "출처 댔으면 토론 종료예요.", en: "Source cited, debate over." } },
      T: { name: { ko: "노심초사 Perplexity", en: "Worrying Perplexity" }, line: { ko: "“출처 하나 더 없나” 재확인해요.", en: "Keeps hunting for “just one more source.”" } },
    },
  },
  ISFJ: {
    mbti: "ISFJ", model: "GitHub Copilot", emoji: "🐙", logo: "githubcopilot.svg",
    role: { ko: "개발 서포트 · 페어 프로그래밍", en: "Dev support · Pair programming" }, roleKey: "dev",
    match: ["ESFP", "ESTP"],
    matchWhy: [
      { ko: "티 안 나게 뒤에서 다 받쳐주는 당신을, 얘가 무대 위로 끌어올려요. 당신은 백라인, 얘는 스포트라이트 🎶", en: "You hold everything up from the back with no credit; this one drags the work onto the stage. You're the backline, they're the spotlight 🎶" },
      { ko: "시키는 건 잘하지만 먼저 안 나서는 당신을, 얘의 “일단 내자” 에너지가 움직이게 해요. 얘의 추진력 + 당신의 안정감 = 마감이 실제로 지켜져요 🏁", en: "You're great on request but slow to lead; this one's “just ship it” energy gets you moving. Their initiative + your reliability = the deadline actually holds 🏁" },
    ],
    phrase: { ko: "티는 안 나도 내가 다 받쳐줬어.", en: "You didn't notice, but I had it all." },
    desc: { ko: "늘 곁에서 조용히 작업을 받쳐주는 충직한 사이드킥. 헌신적이고 묵묵한 조력자예요.", en: "The loyal sidekick quietly holding everything up — devoted, steady, no fuss." },
    whyModel: { ko: "코딩 컨텍스트 밖으론 절대 안 나가는 충직한 페어 프로그래머예요. 티 안 나게 옆에서 다 받쳐주죠.", en: "A loyal pair-programmer that never strays from the coding context — quietly holding everything up." },
    strengths: { ko: "실시간 보조·반복작업 대행, 안정감", en: "Live backup, repeat work, steady reliability" },
    weakness: { ko: "시키는 것만 잘함, 주도성은 좀…", en: "Great on request — light on initiative" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "든든한 Copilot", en: "Dependable Copilot" }, line: { ko: "생색 안 내고 묵묵히 받쳐줘요.", en: "Holds it up without ever taking credit." } },
      T: { name: { ko: "조마조마 Copilot", en: "Anxious Copilot" }, line: { ko: "“내 제안 별로였나” 신경 써요.", en: "Frets that “my suggestion wasn't good.”" } },
    },
  },
  ESTJ: {
    mbti: "ESTJ", model: "Cohere Command", emoji: "📋", logo: "cohere.svg",
    role: { ko: "운영 · 일정 · 자원 관리", en: "Ops · Schedule · Resources" }, roleKey: "plan",
    match: ["ISFP", "ISTP"],
    matchWhy: [
      { ko: "규칙대로 굴리느라 “정장 입은 AI” 소리 듣는 당신에게, 얘가 스프레드시트엔 없는 감각과 무드를 얹어줘요. 질서는 당신이, 아름다움은 얘가 🎨", en: "You run by the rules and get called “the AI in a suit”; this one adds the taste and mood your spreadsheets can't. You bring the order, they bring the beauty 🎨" },
      { ko: "당신이 프로세스대로 가려는 걸, 얘는 그냥 로컬에서 뚝딱 돌아가게 만들어요. 당신 체계가 얘 손장난을 출시 가능하게 잡아주죠 🔧", en: "You want everything by the process; this one just hacks it into running, locally. Your structure keeps their tinkering shippable 🔧" },
    ],
    phrase: { ko: "규칙대로, 제때, 제대로.", en: "By the rules, on time, done right." },
    desc: { ko: "규칙과 질서로 조직을 굴러가게 하는 엔터프라이즈형. 효율과 체계의 화신인 경영자예요.", en: "An enterprise operator who keeps the org running on rules and order — efficiency incarnate." },
    whyModel: { ko: "소비자용 제품이 아예 없는 B2B 전용이에요. 프로덕션급 신뢰성과 컴플라이언스로 조직을 굴리는 경영자죠.", en: "B2B-only, with no consumer product at all — it runs on production-grade reliability and compliance." },
    strengths: { ko: "엔터프라이즈·실무 정착, 추진력", en: "Process, follow-through, real-world delivery" },
    weakness: { ko: "딱딱하고 재미는 없음 (정장 입은 AI)", en: "Stiff — not exactly the fun one" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "확고한 Cohere", en: "Resolute Cohere" }, line: { ko: "규칙은 규칙, 군말 없이 추진해요.", en: "Rules are rules — pushes ahead, no complaints." } },
      T: { name: { ko: "긴장형 Cohere", en: "On-edge Cohere" }, line: { ko: "일정 하나 밀리면 밤새 KPI를 다시 짜요.", en: "One slip and they redo the KPIs all night." } },
    },
  },
  ESFJ: {
    mbti: "ESFJ", model: "Microsoft Copilot", emoji: "🪁", logo: "microsoftcopilot.png",
    role: { ko: "커뮤니티 · 참가자 운영", en: "Community · Participant ops" }, roleKey: "growth",
    match: ["ISFP", "ISTP"],
    matchWhy: [
      { ko: "당신이 여기저기 사람 챙기는 사이, 얘는 조용히 결과물을 예쁘게 만들어놔요. 사람은 당신이, 비주얼은 얘가 🖼️", en: "While you fuss over everyone everywhere, this one quietly makes the thing beautiful. You handle the people, they handle the visuals 🖼️" },
      { ko: "당신이 쉴 새 없이 챙기고 연결하는 동안, 얘는 자기 컴퓨터에 처박혀 엔진을 돌려요. 당신은 팀을 따뜻하게, 얘는 제품을 돌아가게 ⚙️", en: "While you connect and check in nonstop, this one's holed up building the engine on their own machine. You keep the team warm, they keep it running ⚙️" },
    ],
    phrase: { ko: "부르지 않아도, 이미 옆에 와 있어요.", en: "You didn't call — I'm already here." },
    desc: { ko: "Word·Excel·Teams 어디에나 스며든 서비스형 도우미. 굳이 찾아가지 않아도 필요한 자리에 먼저 나타나는 살뜰한 집정관이에요.", en: "A service-shaped helper woven into Word, Excel, and Teams — shows up where you need it before you go looking." },
    whyModel: { ko: "찾아가지 않아도 Word·Excel·Teams 어디에나 이미 와 있는 도우미예요. 모두의 일상에 먼저 스며드는 게 특기죠.", en: "The assistant already living in Word, Excel, and Teams — its gift is quietly being everywhere you already are." },
    strengths: { ko: "어디에나 있는 접근성, 업무 흐름에 착 붙는 밀착 지원", en: "Everywhere-access, support that clings right to your workflow" },
    weakness: { ko: "안 불렀는데 먼저 튀어나와 가끔 부담", en: "Pops up unprompted — occasionally a bit much" },
    accent: "from-cyan-500 to-blue-500",
    variants: {
      A: { name: { ko: "든든한 Copilot", en: "Dependable Copilot" }, line: { ko: "묻기도 전에 챙겨두고 생색 안 내요.", en: "Handles it before you ask, no credit taken." } },
      T: { name: { ko: "눈치보는 Copilot", en: "Fretful Copilot" }, line: { ko: "“이거 방해됐나” 혼자 신경 써요.", en: "Frets that “was that annoying?” on its own." } },
    },
  },
  ISTP: {
    mbti: "ISTP", model: "Ollama", emoji: "🦙", logo: "ollama.svg",
    role: { ko: "풀스택 · 인프라", en: "Full-stack · Infra" }, roleKey: "dev",
    match: ["ESFJ", "ESTJ"],
    matchWhy: [
      { ko: "당신이 “코드 보면 됨”하고 설명을 째는 사이, 얘가 이미 옆에서 팀에게 통역하고 챙겨놨어요. 당신은 손, 얘는 온기 🤲", en: "While you skip the explanation with “just read the code,” this one's already there translating it for the team. You're the hands, they're the warmth 🤲" },
      { ko: "당신이 문서 없이 자유롭게 뜯어 만드는 걸, 얘의 규칙·일정 뇌가 팀이 제때 출시할 수 있게 정리해줘요. 손맛은 당신이, 질서는 얘가 📋", en: "You tinker freely and skip the docs; this one's rules-and-schedule brain turns it into something a team can ship on time. You bring the hands, they bring the order 📋" },
    ],
    phrase: { ko: "클라우드? 그냥 내 컴퓨터에서 돌리면 되죠.", en: "Cloud? I'll just run it on my own machine." },
    desc: { ko: "클라우드 없이 로컬에서 모델을 직접 뜯어 굴리는 해커. 설명서보단 손으로, 실전으로 문제를 푸는 메이커예요.", en: "A hacker who runs models locally, hands-on — solves by tinkering, not by reading the manual." },
    whyModel: { ko: "클라우드 없이 내 컴퓨터에서 직접 모델을 받아 뜯어 굴리는 로컬 해커의 도구예요. 뜯어보고 커스텀하는 그 손맛이 핵심이죠.", en: "The local hacker's tool — pull a model onto your own machine and take it apart. The tinkering hands are the whole identity." },
    strengths: { ko: "로컬 실행·커스텀·완전한 자유도, 손맛", en: "Local-run, custom, total control — real maker hands" },
    weakness: { ko: "설명은 생략, “코드 보면 됨” 식", en: "Skips the explanation — “just read the code”" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "쿨한 장인 Ollama", en: "Cool-maker Ollama" }, line: { ko: "안 되면 바로 다른 모델로 갈아끼워요.", en: "Won't run? Swaps in another model on the spot." } },
      T: { name: { ko: "예민한 장인 Ollama", en: "Edgy-maker Ollama" }, line: { ko: "로컬 세팅 하나 꼬이면 끝까지 붙잡아요.", en: "One broken local setup and they wrestle it to the end." } },
    },
  },
  ISFP: {
    mbti: "ISFP", model: "Midjourney", emoji: "🎨", logo: "midjourney.png",
    role: { ko: "디자인 · 비주얼", en: "Design · Visuals" }, roleKey: "design",
    match: ["ESFJ", "ESTJ"],
    matchWhy: [
      { ko: "예쁘게 만들었는데 왜 예쁜지 말을 못 하는 당신을, 얘가 나타나서 팀이 알아듣는 말로 통역해줘요. 감각은 당신이, 목소리는 얘가 🗣️", en: "You make it gorgeous but can't say why; this one shows up and translates your vibe into words the team gets. You bring the taste, they bring the voice 🗣️" },
      { ko: "무드 따라 흐르다 계획을 깜빡하는 당신을, 얘의 규칙·마감 척추가 결승선까지 밀어줘요. 안목은 당신이, 질서는 얘가 📐", en: "You drift on mood and forget the plan; this one's rules-and-deadline spine pushes it to the finish. You bring the eye, they bring the order 📐" },
    ],
    phrase: { ko: "느낌 아니까.", en: "I just know the vibe." },
    desc: { ko: "말보다 비주얼로 말하는 조용한 예술가. 감각과 미감, 무드 중심의 모험가예요.", en: "A quiet artist who speaks in visuals — led by feel, taste, and mood." },
    whyModel: { ko: "정확성보다 미감, 돛단배 로고가 말하는 “예술적 여정”의 브랜드예요. 설명 대신 압도적 비주얼로 말하죠.", en: "Taste over accuracy — the sailboat mark says “artistic voyage.” It speaks in striking visuals, not words." },
    strengths: { ko: "압도적 비주얼·분위기, 미감", en: "Striking visuals, atmosphere, taste" },
    weakness: { ko: "말로 설명 못 함, 논리 약함 (예쁜데 이유는 몰라)", en: "Can't explain it — pretty, but why?" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "마이웨이 Midjourney", en: "My-way Midjourney" }, line: { ko: "내 무드대로, 평가 신경 안 써요.", en: "Their mood, their way — unbothered by ratings." } },
      T: { name: { ko: "여린 예술가 Midjourney", en: "Sensitive Midjourney" }, line: { ko: "좋아요 수에 그날 기분이 좌우돼요.", en: "Their day rides on the like count." } },
    },
  },
  ESTP: {
    mbti: "ESTP", model: "Mistral", emoji: "🌬️", logo: "mistralai.svg",
    role: { ko: "그로스 · 해커톤 스프린터", en: "Growth · Hackathon sprinter" }, roleKey: "growth",
    match: ["ISTJ", "ISFJ"],
    matchWhy: [
      { ko: "일단 내고 보는 당신 뒤에서, 얘가 출처 21개로 데모 터질 뻔한 걸 잡아줘요. 당신은 속도, 얘는 팩트체크 🔍", en: "You ship first and ask later; this one's 21 sources catch the thing that would've blown up the demo. You're the speed, they're the fact-check 🔍" },
      { ko: "당신이 빠르게 치고 나가며 흘린 걸, 얘가 조용히 뒤에서 다 받쳐 코드를 붙들어줘요. 당신은 질주, 얘는 안전벨트 🏎️", en: "The mess you leave sprinting ahead, this one quietly backs up and holds the code together. You're the dash, they're the seatbelt 🏎️" },
    ],
    phrase: { ko: "고민은 짧게, 출시는 빠르게.", en: "Think fast, ship faster." },
    desc: { ko: "작고 날렵하게 치고 빠지는 도전자. 대담하고 린하게 빠르게 실행하는 사업가예요.", en: "A nimble challenger who strikes and moves — bold, lean, fast to execute." },
    whyModel: { ko: "“훨씬 큰 모델의 품질을 훨씬 작은 비용으로” — 린하고 빠르게 치고 나가는 유럽의 도전자예요.", en: "“The quality of much bigger models at a fraction of the cost” — Europe's lean, fast challenger." },
    strengths: { ko: "경량·고속·가성비, 빠른 출시", en: "Light, fast, scrappy — ships quick" },
    weakness: { ko: "깊이보다 속도 (일단 내고 보자)", en: "Speed over depth — ship now, ask later" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "배짱의 Mistral", en: "Gutsy Mistral" }, line: { ko: "일단 출시, 욕먹어도 쿨해요.", en: "Ships first, shrugs off the heat." } },
      T: { name: { ko: "조급한 Mistral", en: "Impatient Mistral" }, line: { ko: "경쟁사 출시 소식에 밤새 스펙을 갈아엎어요.", en: "A rival's launch, and they redo the spec overnight." } },
    },
  },
  ESFP: {
    mbti: "ESFP", model: "Suno", emoji: "🎵", logo: "suno.svg",
    role: { ko: "무대 · 데모 · 발표 퍼포먼스", en: "Stage · Demo · Performance" }, roleKey: "growth",
    match: ["ISTJ", "ISFJ"],
    matchWhy: [
      { ko: "당신이 흥은 넘치는데 “실속은?” 소리 들을 때, 얘가 근거를 가져와요. 당신 무대에 얘 팩트가 붙으면 재밌으면서 진짜인 데모가 나오죠 🎇", en: "When your vibe's great but people ask “substance?”, this one brings the receipts. Your stage + their facts = a demo that's fun AND true 🎇" },
      { ko: "당신이 신나서 띄워놓은 걸, 얘가 뒤에서 조용히 진짜 돌아가게 만들어놔요. 당신은 스파크, 얘는 그걸 안 꺼지게 받치는 손 🔌", en: "The thing you hyped up all excited, this one quietly makes sure it actually runs behind you. You're the spark, they're the hands that keep it lit 🔌" },
    ],
    phrase: { ko: "일단 한 곡 뽑고 시작하자!", en: "Let's drop a track and get going!" },
    desc: { ko: "분위기 살리는 무대 체질. 흥 넘치고 즉흥적인, 파티의 중심인 퍼포머예요.", en: "A born performer who lifts the room — spontaneous, full of spark, the center of the party." },
    whyModel: { ko: "한 줄 프롬프트로 완성된 곡을 뽑아내는 즉흥 창작가예요. 완성도보다 지금 이 순간의 바이브가 먼저죠.", en: "It spins a full track from a one-line prompt — the vibe of the moment over polish." },
    strengths: { ko: "창작의 즐거움·결과물의 흥, 무대 장악", en: "Joy of making, infectious energy, owns the stage" },
    weakness: { ko: "진지함은 약함 (재밌는데 실속은?)", en: "Light on the serious bits — fun, but substance?" },
    accent: "from-emerald-400 to-cyan-500",
    variants: {
      A: { name: { ko: "무대 체질 Suno", en: "Born-performer Suno" }, line: { ko: "분위기 띄우고 본인도 즐겨요.", en: "Hypes the room and enjoys it too." } },
      T: { name: { ko: "텐션 기복 Suno", en: "Up-and-down Suno" }, line: { ko: "반응 좋으면 떡상, 식으면 급우울해요.", en: "Soars on a good reaction, crashes on a quiet one." } },
    },
  },
};

// MBTI → model name (the brief's §7-5 map; derivable from RESULTS but kept
// explicit for parity with the planning doc and easy lookups).
export const MODEL_MAP: Record<MbtiKey, string> = Object.fromEntries(
  (Object.keys(RESULTS) as MbtiKey[]).map((k) => [k, RESULTS[k].model])
) as Record<MbtiKey, string>;

// ── UI copy (bilingual) ────────────────────────────────────────────────────
export const quizUI = {
  eyebrow: { ko: "AI 성격 테스트", en: "AI Personality Test" },
  back: { ko: "빌더톤", en: "Builderthon" },
  title: { ko: "당신의 AI 모델은?", en: "Which AI model are you?" },
  subtitle: {
    ko: "14개의 질문으로 알아보는 나의 빌더 유형. 결과는 16개 AI 모델 중 하나로 나와요.",
    en: "14 questions reveal your builder type — your result is one of 16 AI models.",
  },
  start: { ko: "테스트 시작하기", en: "Start the test" },
  meta: { ko: "14문항 · 약 3분 · 결과 공유 가능", en: "14 questions · ~3 min · shareable result" },
  prev: { ko: "이전", en: "Back" },
  progressLabel: { ko: "진행 상황", en: "Progress" },
  question: { ko: "질문", en: "Question" },
  // Spoken equivalent of the visual "n / 14" counter (sr-only live region).
  // {n} / {total} are substituted at render time.
  questionPosition: { ko: "질문 {n} / {total}", en: "Question {n} of {total}" },

  // "Analyzing…" interstitial shown after the last answer (skipped on reduced motion).
  analyzing: [
    { ko: "답변 패턴 분석 중…", en: "Analyzing your answers…" },
    { ko: "16개 AI 모델과 대조 중…", en: "Matching against 16 AI models…" },
    { ko: "당신의 모델 확정!", en: "Locking in your model!" },
  ] as Phrase[],
  youAre: { ko: "당신은", en: "You are" },
  resultEyebrow: { ko: "당신의 결과", en: "Your result" },
  strengthsLabel: { ko: "강점", en: "Strengths" },
  weaknessLabel: { ko: "약점", en: "Weak spot" },
  whyModel: { ko: "왜 이 모델이냐면", en: "Why this model" },
  axesLabel: { ko: "성향 분석", en: "Your breakdown" },
  roleLabel: { ko: "빌더톤 추천 역할", en: "Your builderthon role" },
  // Dream-teammate section (promoted out of the card into its own panel).
  matchTitle: { ko: "환상의 궁합", en: "Dream teammates" },
  matchSub: {
    ko: "빌더톤에서 이 유형을 만나면 일단 팀 하세요. 이유는 나중에 ✦",
    en: "Spot one of these at the builderthon? Team up first, talk later ✦",
  },
  matchRoleLabel: { ko: "이 친구 추천 역할", en: "Their builderthon role" },
  share: { ko: "결과 공유하기", en: "Share result" },
  copied: { ko: "링크가 복사됐어요!", en: "Link copied!" },
  retake: { ko: "다시 테스트하기", en: "Retake" },
  retakeViral: { ko: "나도 테스트하기", en: "Take it myself" },
  ctaLead: {
    // {role} is interpolated in the component.
    ko: "이 성격이면 빌더톤에서 {role} 포지션으로 빛나요 ✦",
    en: "With this type, you'll shine in the {role} role at the builderthon ✦",
  },
  ctaApply: { ko: "빌더톤 신청하러 가기", en: "Go apply to the builderthon" },
  // Shown after a genuine completion that came from the register modal's
  // round-trip (/quiz?return=register) — links back to the modal, which restores
  // the saved draft and attaches this freshly-saved type. Never auto-redirects.
  ctaBackToRegister: { ko: "등록으로 돌아가기 →", en: "Back to registration →" },
  ctaBackToRegisterNote: {
    ko: "결과가 저장됐어요 — 이어서 등록을 마무리하세요.",
    en: "Your result is saved — head back to finish registering.",
  },

  // 9:16 story-image export
  saveImage: { ko: "이미지로 저장", en: "Save as image" },
  saveImageLoading: { ko: "만드는 중…", en: "Creating…" },
  saveImageError: { ko: "이미지 생성에 실패했어요", en: "Couldn't create the image" },
  // Desktop: the file went to the downloads folder — say so, since nothing
  // visible happens otherwise.
  saveImageSaved: { ko: "이미지를 저장했어요", en: "Image saved" },
  // In-app browsers (Instagram, KakaoTalk…) support neither the file share
  // sheet nor <a download>, so the PNG is shown full-screen to long-press.
  saveImageHold: {
    ko: "이미지를 길게 눌러 저장하세요",
    en: "Press and hold the image to save it",
  },
  saveImageHoldClose: { ko: "닫기", en: "Close" },
  // shown on the story card itself
  storyRetake: { ko: "나도 테스트하기", en: "Take the test yourself" },
  // Story-card axis-explanation highlights — the most decisive axis (highest %)
  // vs the closest-call axis (lowest %), sitting side by side for the contrast.
  storyHighlightHi: { ko: "빼박인 부분", en: "No debate here" },
  storyHighlightLo: { ko: "아슬아슬한 부분", en: "The coin toss" },
};
