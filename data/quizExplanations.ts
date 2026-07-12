// ─────────────────────────────────────────────────────────────────────────────
// Answer-aware explanation layer — a static, precompiled lookup (no backend, no
// LLM). Keyed by (axis, answer pattern), where the pattern is the axis's answers
// encoded 1 = first pole (E/N/T/J/A), 0 = second, in QUESTION order (see
// AxisScore.pattern in lib/quizScore.ts). O(1) pure lookup.
//
// Coverage: 4 MBTI axes × 8 patterns + Identity × 4 = 36 phrases. Each phrase
// follows one grammar: (1) cite the specific scenario answered against the
// result — the highest-weight one, or "all three" when unanimous; (2) name the
// behavior; (3) tie it to the % with {pct} (substituted at render); (4) hedge to
// a level set by the score band — the margin mapping + ±2 spice lands these at
// strong (~56–66%), mid (~68–75%), low (~80–87%), none (~89–97%); (5) close
// with one emoji.
//
// Pattern position → question map (1 = first pole):
//   MIND     [Q1 ice-break(2), Q6 recharge(8), Q13 networking(4)]   1=E
//   ENERGY   [Q2 big-picture(3), Q7 why-built(6), Q11 new-tool(1)]  1=N
//   NATURE   [Q3 feedback(1), Q8 yardstick(5), Q12 empathy(2)]      1=T
//   TACTICS  [Q4 work-style(4), Q9 pivot(2), Q14 role-split(1)]     1=J
//   IDENTITY [Q5 demo-panic(3), Q10 rumination(7)]                  1=A
// ─────────────────────────────────────────────────────────────────────────────

import type { Phrase } from "@/data/dictionary";
import type { Axis } from "@/data/quiz";

export const EXPLANATIONS: Record<Axis, Record<string, Phrase>> = {
  MIND: {
    "0,0,0": { ko: "충전도 혼자, 네트워킹도 소수랑, 첫날도 관찰부터 — 세 질문 전부 안쪽으로 답했어요. 완전 내향형, 딱 {pct}% 의심 여지 없어요 🔋", en: "Recharge alone, network in small circles, hang back on day one — all three point inward. Fully introverted, {pct}%, no doubt 🔋" },
    "1,0,0": { ko: "첫날엔 먼저 말을 걸었지만, 정작 충전은 혼자 조용히 하는 쪽이었죠. 사교성은 장착해도 에너지는 안에서 나와요 — 꽤 강하게 {pct}% 내향이에요 🌙", en: "You broke the ice on day one, but you recharge quietly and alone. Social when needed, yet the energy comes from within — pretty firmly {pct}% introverted 🌙" },
    "0,0,1": { ko: "네트워킹에선 많은 사람과 인사하지만, 쉴 땐 혼자가 편하고 첫날도 관찰부터였어요. 확실히 안쪽 사람인데 가끔 밖으로 나가죠 — {pct}% 내향이에요 🍃", en: "You work the room at networking, but you rest alone and read the room first. Clearly an inside type who steps out now and then — {pct}% introverted 🍃" },
    "1,0,1": { ko: "먼저 말도 걸고 네트워킹도 열심이지만, 진짜 충전은 결국 혼자였어요. 겉보기엔 활발해도 속은 내향 — 어느 정도 {pct}% 안쪽이긴 한데 바깥 기운도 꽤 있어요 🌗", en: "You break the ice and work the room, but real recharging still happens alone. Lively outside, introvert inside — leaning inward {pct}%, though there's outward energy too 🌗" },
    "0,1,0": { ko: "먼저 나서지도, 네트워킹에 뛰어들지도 않았지만, 사람들과 수다로 충전하는 걸 보면 결국 밖에서 힘을 얻네요 — 어느 정도 {pct}% 외향인데 혼자 시간도 꽤 필요해요 🌤️", en: "You didn't jump in first or work the room, but you recharge by chatting — energy from outside after all. Somewhat {pct}% extraverted, though you need alone time too 🌤️" },
    "1,1,0": { ko: "네트워킹은 소수랑 깊게 가는 편이지만, 첫날부터 말 걸고 수다로 충전하는 걸 보면 사람에서 힘을 얻어요 — {pct}% 외향, 확실한데 가끔 조용히도 있고 싶죠 ☀️", en: "You go deep with a few at networking, but you break the ice early and recharge by chatting — people fuel you. {pct}% extraverted, with the odd quiet moment ☀️" },
    "0,1,1": { ko: "첫날엔 좀 관찰부터 했지만, 충전도 네트워킹도 사람들 속에서 하는 사람이에요. 초반 탐색만 빼면 완전 바깥형 — 꽤 강하게 {pct}% 외향이에요 🔆", en: "You observed a bit on day one, but you recharge and network right in the crowd. Minus that early scan, fully outward — pretty firmly {pct}% extraverted 🔆" },
    "1,1,1": { ko: "첫날부터 말 걸고, 네트워킹도 풀파워, 충전도 사람들과 — 세 질문 전부 바깥이에요. 완전 외향형, 딱 {pct}% 의심 여지 없어요 🎉", en: "Break the ice on day one, full-power networking, recharge with people — all three point outward. Fully extraverted, {pct}%, no doubt 🎉" },
  },
  ENERGY: {
    "0,0,0": { ko: "큰 그림보다 지금 만들 것, 멘토 질문엔 데이터·사례, 툴은 스펙부터 — 세 질문 전부 현실 쪽이에요. 완전 현실형, {pct}% 확실 🔧", en: "Ship-now over big-picture, data for the mentor, specs first for a new tool — all three land concrete. Fully grounded, {pct}% for sure 🔧" },
    "1,0,0": { ko: "큰 그림은 그려봤지만, 정작 '왜 만들었냐'엔 데이터로 답하고 툴도 스펙부터 봤어요. 상상보다 손에 잡히는 걸 믿는 편 — {pct}% 현실, 가끔은 멀리 보긴 하죠 📊", en: "You sketched the big picture, but you justify with data and check specs first. You trust the tangible over the imagined — {pct}% grounded, with the occasional far look 📊" },
    "0,0,1": { ko: "새 툴 앞에선 잠깐 상상했지만, 큰 그림도 '왜'도 전부 현실·데이터로 답했어요. 발은 확실히 땅에 — 꽤 강하게 {pct}% 현실형이에요 🧱", en: "You daydreamed a little over a new tool, but big-picture and “why” both got concrete answers. Feet firmly down — pretty firmly {pct}% grounded 🧱" },
    "1,0,1": { ko: "큰 그림도 그리고 툴도 상상부터지만, '왜 만들었냐'엔 결국 데이터·사례로 답했죠. 아이디어는 넓어도 근거는 현실 — 어느 정도 {pct}% 현실인데 상상력도 꽤 있어요 🌓", en: "You picture the big idea and dream up tools, but you justify with data and examples. Wide ideas, grounded reasons — leaning concrete {pct}%, with real imagination too 🌓" },
    "0,1,0": { ko: "큰 그림도 툴도 현실부터 봤지만, '왜 만들었냐'엔 비전과 의미로 답했어요. 결정적인 순간엔 가능성을 보는 사람 — 어느 정도 {pct}% 직관인데 현실 감각도 탄탄해요 🌗", en: "You checked the big idea and tools concretely, but you answered “why” with vision and meaning. Possibility wins when it counts — leaning intuitive {pct}%, with a solid grip on reality 🌗" },
    "1,1,0": { ko: "새 툴은 스펙부터 봤지만, 큰 그림도 '왜'도 전부 비전·가능성으로 갔어요. 머리는 늘 멀리 — 꽤 강하게 {pct}% 직관형이에요 🔭", en: "You checked a tool's specs, but big-picture and “why” both went to vision and possibility. Your head lives far ahead — pretty firmly {pct}% intuitive 🔭" },
    "0,1,1": { ko: "처음엔 '지금 뭘 만들지' 현실부터 봤지만, 왜 만드는지와 새 툴 앞에선 상상과 의미로 부풀었죠. 큰 그림 쪽 사람 — {pct}% 직관, 가끔 현실 체크도 하고요 💫", en: "You started with “what can we build now,” but the “why” and a new tool sent you dreaming of meaning. A big-picture type — {pct}% intuitive, with the odd reality check 💫" },
    "1,1,1": { ko: "큰 그림, 비전, 무한한 상상 — 세 질문 전부 가능성 쪽이에요. 완전 직관형, {pct}% 확실 🚀", en: "Big picture, vision, boundless imagination — all three point at possibility. Fully intuitive, {pct}% for sure 🚀" },
  },
  NATURE: {
    "0,0,0": { ko: "아이디어 지적도 기분 안 상하게, 충돌 기준도 다들 납득하는가, 멘붕엔 다독임부터 — 세 질문 전부 사람 쪽이에요. 완전 감성형, {pct}% 확실 💗", en: "Kind critiques, “is everyone okay” as the yardstick, comfort first in a meltdown — all three point at people. Fully feeling, {pct}% for sure 💗" },
    "1,0,0": { ko: "아이디어가 별로일 땐 논리로 딱 짚지만, 정작 충돌 기준도 멘붕 대응도 사람 마음이 먼저였죠. 팩트는 말해도 결정은 감성 — {pct}% 감성형이에요 🫶", en: "You call out a weak idea on logic, but your yardstick and comfort instinct both put people first. You'll state the facts, but you decide on feeling — {pct}% feeling 🫶" },
    "0,0,1": { ko: "밤샌 팀원에겐 문제부터 짚었지만, 아이디어 피드백도 충돌 기준도 사람 기분이 먼저였어요. 대체로 마음을 먼저 보는 편 — {pct}% 감성, 가끔 문제부터 보긴 해요 💞", en: "You went problem-first with a burned-out teammate, but feedback and yardstick both put feelings first. Mostly heart-first — {pct}% feeling, with the odd problem-first moment 💞" },
    "1,0,1": { ko: "지적도 솔직하게, 멘붕엔 문제부터지만, 팀이 충돌할 땐 결국 '다들 납득하나'를 봤어요. 겉은 이성인데 결정은 사람 — 어느 정도 {pct}% 감성인데 이성도 꽤 있어요 🌗", en: "Blunt feedback, problem-first on a meltdown — but when the team clashes you check “is everyone on board.” Rational surface, people-first calls — leaning feeling {pct}%, with plenty of logic 🌗" },
    "0,1,0": { ko: "피드백도 부드럽게, 멘붕엔 다독임부터지만, 정작 충돌 기준은 '뭐가 더 합리적인가'였죠. 결정적 순간엔 논리가 이기는 사람 — 어느 정도 {pct}% 이성인데 다정함도 많아요 🌓", en: "Gentle feedback, comfort first on a meltdown — but your yardstick in a clash is “what's more rational.” Logic wins when it counts — leaning thinking {pct}%, with real warmth 🌓" },
    "1,1,0": { ko: "밤샌 팀원은 먼저 다독였지만, 피드백도 충돌 기준도 논리와 효율로 갔어요. 대체로 이성이 앞서는 편 — {pct}% 이성, 사람 챙기는 순간도 있고요 🧊", en: "You comforted the burned-out teammate first, but feedback and yardstick both ran on logic. Mostly head-first — {pct}% thinking, with moments of real care 🧊" },
    "0,1,1": { ko: "아이디어 지적은 부드럽게 돌려 말했지만, 충돌 기준도 멘붕 대응도 전부 효율·문제 해결로 갔죠. 판단은 확실히 논리 — {pct}% 이성형이에요 ⚙️", en: "You softened a critique, but yardstick and meltdown response both ran on efficiency and problem-solving. Judgment is firmly logical — {pct}% thinking ⚙️" },
    "1,1,1": { ko: "논리로 딱 짚고, 합리로 판단하고, 멘붕엔 문제부터 — 세 질문 전부 이성 쪽이에요. 완전 이성형, {pct}% 확실 🧠", en: "Blunt on logic, rational in judgment, problem-first in a crisis — all three point at reason. Fully thinking, {pct}% for sure 🧠" },
  },
  TACTICS: {
    "0,0,0": { ko: "작업은 흐름대로, 마감 앞 아이디어엔 갈아엎기, 역할도 다 같이 되는 대로 — 세 질문 전부 즉흥이에요. 완전 즉흥형, {pct}% 확실 🎲", en: "Ride the flow, tear it up for a better idea, roll roles together as you go — all three point spontaneous. Fully prospecting, {pct}% for sure 🎲" },
    "1,0,0": { ko: "작업 스타일은 시간표부터 짜지만, 막판 아이디어엔 갈아엎고 역할도 되는 대로 갔죠. 큰 틀은 계획, 나머진 유연 — 어느 정도 {pct}% 계획인데 즉흥도 꽤 있어요 🌗", en: "You map the schedule to work, but you'll tear up the plan late and roll roles as you go. Framework planned, the rest flexible — leaning planner {pct}%, with plenty of spontaneity 🌗" },
    "0,0,1": { ko: "역할·순서는 딱 나눴지만, 작업도 흐름대로, 막판엔 갈아엎는 쪽이었어요. 정리 좋아하는 즉흥러 — 꽤 강하게 {pct}% 즉흥형이에요 🌊", en: "You split roles cleanly, but you work by flow and tear things up late. A tidy improviser — pretty firmly {pct}% prospecting 🌊" },
    "0,1,0": { ko: "막판 아이디어 앞에선 원래 계획을 지켰지만, 작업도 역할도 다 흐름대로 갔죠. 대체로 즉흥인데 리스크는 피하는 편 — {pct}% 즉흥이에요 ⛵", en: "You stuck to the plan when a late idea hit, but your work style and roles both flowed freely. Mostly spontaneous, risk-averse when it counts — {pct}% prospecting ⛵" },
    "1,1,0": { ko: "역할 나누는 건 느슨했지만, 작업은 시간표대로, 막판 아이디어도 원래 계획 고수. 리스크 앞에선 계획을 지키는 사람 — 꽤 강하게 {pct}% 계획형이에요 📅", en: "Roles were loose, but you work to schedule and held the plan against a late idea. You protect the plan under risk — pretty firmly {pct}% judging 📅" },
    "1,0,1": { ko: "막판 아이디어엔 갈아엎었지만, 작업 스타일도 역할 분담도 딱딱 계획대로였죠. 기본은 계획형인데 좋은 기회엔 유연 — {pct}% 계획이에요 🗂️", en: "You tore it up for a late idea, but your work style and role-splitting were both by-the-plan. A planner at heart who flexes for a good opening — {pct}% judging 🗂️" },
    "0,1,1": { ko: "막판엔 계획 고수, 역할도 딱 나눴지만, 정작 작업 스타일은 일단 만들며 흐름을 탔죠. 큰 작업은 즉흥, 디테일은 정리 — 어느 정도 {pct}% 즉흥인데 계획성도 꽤 있어요 🌓", en: "You held the plan late and split roles cleanly, but your actual work style was build-and-flow. Spontaneous on the big work, tidy in details — leaning prospecting {pct}%, with real planning 🌓" },
    "1,1,1": { ko: "시간표부터, 계획 고수, 역할도 딱딱 — 세 질문 전부 계획 쪽이에요. 완전 계획형, {pct}% 확실 📐", en: "Schedule first, hold the plan, roles split clean — all three point at planning. Fully judging, {pct}% for sure 📐" },
  },
  IDENTITY: {
    "0,0": { ko: "데모 터지면 심장 쿵, 입상 못 하면 밤새 곱씹기 — 두 질문 다 흔들리는 쪽이에요. 완전 예민형(Turbulent), {pct}% 확실 🌊", en: "Heart drops when the demo breaks, replay the loss all night — both point to turbulence. Fully Turbulent, {pct}% for sure 🌊" },
    "1,0": { ko: "데모가 터져도 '어떻게든 되겠지' 침착했지만, 입상 못 한 밤엔 결국 곱씹었죠. 순간의 위기엔 강해도 결과는 오래 남는 편 — {pct}% 예민이에요 🌗", en: "You stayed calm when the demo broke, but you replayed the loss that night. Steady in the moment, yet outcomes linger — {pct}% Turbulent 🌗" },
    "0,1": { ko: "데모 터졌을 땐 심장이 쿵 했지만, 입상 못 한 건 '잘했으니 됐지' 툭툭 털었어요. 순간엔 흔들려도 길게는 단단한 편 — {pct}% 안정이에요 🌓", en: "Your heart dropped when the demo broke, but you shook off the loss with “we did well.” Rattled in the moment, sturdy over time — {pct}% Assertive 🌓" },
    "1,1": { ko: "데모 터져도 침착, 입상 못 해도 툭툭 — 두 질문 다 단단한 쪽이에요. 완전 안정형(Assertive), {pct}% 확실 🛡️", en: "Calm when the demo breaks, shake off the loss — both point to steadiness. Fully Assertive, {pct}% for sure 🛡️" },
  },
};

// O(1) lookup. Substitutes {pct} in both locales. Returns null (and warns) if a
// pattern key is somehow missing, so the UI can hide the explanation gracefully.
export function getExplanation(axis: Axis, pattern: number[], pct: number): Phrase | null {
  const key = pattern.join(",");
  const raw = EXPLANATIONS[axis]?.[key];
  if (!raw) {
    if (typeof console !== "undefined") {
      console.warn(`[quiz] no explanation for axis=${axis} pattern=${key}`);
    }
    return null;
  }
  const sub = (s: string) => s.replace(/\{pct\}/g, String(pct));
  return { ko: sub(raw.ko), en: sub(raw.en) };
}
