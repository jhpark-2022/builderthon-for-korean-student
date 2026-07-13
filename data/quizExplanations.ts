// ─────────────────────────────────────────────────────────────────────────────
// Answer-aware explanation layer — a static, precompiled lookup (no backend, no
// LLM). Keyed by (axis, answer pattern), where the pattern is the axis's answers
// encoded 1 = first pole (E/N/T/J/A), 0 = second, in QUESTION order (see
// AxisScore.pattern in lib/quizScore.ts). O(1) pure lookup.
//
// Coverage: 4 MBTI axes × 8 patterns + Identity × 4 = 36 phrases. Each phrase
// follows one grammar: (1) cite the specific scenario answered against the
// result — the highest-weight one, or "all three" when unanimous; (2) name the
// behavior with a concrete, B-grade-funny detail the taker will recognize in
// themselves (self-roast > generic praise); (3) tie it to the % with {pct}
// (substituted at render); (4) hedge to a level set by the score band — the
// margin mapping + ±2 spice lands these at strong (~56–66%), mid (~68–75%),
// low (~80–87%), none (~89–97%); (5) close with one emoji.
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
    "0,0,0": { ko: "첫날엔 벽에 붙어 관찰, 쉬는 시간엔 조용히 증발, 네트워킹에선 아는 사람 한 명 옆에 고정 — 세 질문 전부 안쪽이에요. {pct}% 내향. 집 가서 이불 속에서 오늘 한 대화 복기할 예정이죠? 🔋", en: "Day one: observing from the wall. Break time: quietly evaporating. Networking: glued to the one person you know — all three point inward. {pct}% introverted. Tonight's plan: replaying today's conversations under a blanket 🔋" },
    "1,0,0": { ko: "첫날에 “어디 학교세요?”까진 했어요. 근데 그거 하고 나서 화장실 가서 혼자 숨 고르는 타입이죠. 사교 모드는 켤 순 있는데 배터리가 광탈 — 꽤 강하게 {pct}% 내향이에요 🌙", en: "You did manage the “which school are you at?” — then slipped away to catch your breath alone. Social mode exists, the battery just drains on sight — pretty firmly {pct}% introverted 🌙" },
    "0,0,1": { ko: "명함은 돌려요, 일이니까요. 근데 쉬는 시간엔 기가 막히게 사라지고 첫날도 일단 관찰부터였죠. 확실히 내향인데 필요할 때 외향 스킨을 장착하는 편 — {pct}% 내향이에요 🎭", en: "You'll work the room — it's work. But you vanish beautifully on breaks and spent day one scanning. Clearly introverted, with an equippable extrovert skin — {pct}% introverted 🎭" },
    "1,0,1": { ko: "먼저 말도 걸고 명함도 돌리는데 왜 내향이냐고요? 진짜 충전은 혼자 있을 때만 되거든요. 밖에선 인싸, 집 오면 시체 — {pct}% 내향이긴 한데 사실상 반반이에요 🌗", en: "You break the ice AND work the room — so why introvert? Because actual recharging only happens alone. Life of the party out there, starfish on the bed at home — {pct}% introverted, basically a coin toss 🌗" },
    "0,1,0": { ko: "먼저 나서지도 않고 명함도 안 돌리는데, 결국 사람들이랑 수다 떨어야 살아나요. 낯은 가리는데 사람은 좋아함 — {pct}% 외향이긴 한데 안쪽 기운도 만만치 않아요 🌤️", en: "You don't jump in first or work the room, but chatting is what brings you back to life. Shy, yet people-powered — {pct}% extraverted, with serious inside energy 🌤️" },
    "1,1,0": { ko: "첫날부터 말 걸고 수다로 충전하는데, 네트워킹에선 정작 소수랑 진득하게 가요. 넓게 뿌리기보다 깊게 파는 외향 — {pct}% 외향, 확실한데 아무나랑 놀진 않아요 ☀️", en: "You break the ice early and recharge on chatter, but networking gets the go-deep-with-a-few treatment. An extravert who digs, not sprays — {pct}% extraverted, just picky ☀️" },
    "0,1,1": { ko: "첫날 5분은 스캔 타임이에요. 판 파악이 끝나면? 수다로 충전하고 명함 뿌리는 본체가 등판하죠 — 꽤 강하게 {pct}% 외향이에요 🔆", en: "Day one opens with a five-minute scan. Once the room is mapped, the main character logs in: recharging on chatter, cards flying — pretty firmly {pct}% extraverted 🔆" },
    "1,1,1": { ko: "첫날부터 말 걸고, 쉬는 시간에도 떠들고, 네트워킹에선 명함이 남아나질 않아요 — 세 질문 전부 바깥. {pct}% 외향, 데모데이 전에 팀원 전원 인스타 맞팔 예정 🎉", en: "Ice broken by minute one, chatting through every break, business cards raining — all three point outward. {pct}% extraverted; the whole team gets a follow request before demo day 🎉" },
  },
  ENERGY: {
    "0,0,0": { ko: "10년 뒤요? 일단 오늘 밤 빌드부터 살립시다. 멘토한텐 데이터 들이밀고 새 툴은 스펙 문서부터 정독 — 세 질문 전부 땅에 붙어 있어요. {pct}% 현실형, 꿈은 배포 후에 꿔요 🔧", en: "Ten years out? Let's survive tonight's build first. Data for the mentor, spec sheets for the new tool — all three feet-on-the-ground. {pct}% grounded; dreaming is scheduled post-deploy 🔧" },
    "1,0,0": { ko: "“10년 뒤엔...” 하고 큰 그림 한 번 그려보긴 했죠. 근데 멘토 앞에선 데이터부터 꺼내고 새 툴도 스펙부터 까요. 상상은 하는데 결재는 팩트가 함 — {pct}% 현실이에요 📊", en: "You did sketch the ten-year picture once. But the mentor got data and the new tool got a spec read. Imagination pitches; facts sign off — {pct}% grounded 📊" },
    "0,0,1": { ko: "새 툴 받으면 3초 정도 “우와 이걸로...” 해요. 딱 3초. 그다음엔 지금 만들 수 있는 거랑 데이터 얘기로 복귀하죠 — 꽤 강하게 {pct}% 현실형이에요 🧱", en: "A new tool gets three whole seconds of “imagine what this could—”. Three. Then it's back to what ships now and what the data says — pretty firmly {pct}% grounded 🧱" },
    "1,0,1": { ko: "회의에선 10년 뒤를 논하고 새 툴엔 상상부터 부푸는데, 정작 “왜 만들었어요?” 앞에선 데이터랑 사례가 튀어나와요. 몽상가 코스프레하는 현실주의자 — {pct}% 현실이긴 한데 거의 반반이에요 🌓", en: "You'll debate ten-year visions and daydream over new tools, but “why did you build this?” gets data and case studies. A realist cosplaying a dreamer — {pct}% grounded, basically split 🌓" },
    "0,1,0": { ko: "평소엔 “지금 뭘 만들지”랑 스펙 확인으로 사는데, “왜 만들었어요?” 그 순간에 비전이 터져 나와요. 발표 때만 시인이 되는 타입 — {pct}% 직관이긴 한데 현실 지분도 꽤 커요 🌗", en: "You live in ship-now and spec-checks — until “why did you build this?”, when the vision erupts. A poet strictly at pitch time — {pct}% intuitive, with a big grounded stake 🌗" },
    "1,1,0": { ko: "큰 그림 그리고 비전으로 답하는데, 새 툴만큼은 스펙부터 확인해요. 꿈은 크게 꾸되 장비는 검수하고 씀 — 꽤 강하게 {pct}% 직관형이에요 🔭", en: "Big pictures, vision answers — but a new tool still gets its specs checked first. Dream big, vet the gear — pretty firmly {pct}% intuitive 🔭" },
    "0,1,1": { ko: "주제 정해지면 일단 “지금 뭘 만들 수 있지”부터 봤는데, 왜 만드냐고 물으면 의미가 나오고 새 툴 앞에선 상상이 부풀어요. 손은 현실에, 머리는 우주에 — {pct}% 직관이에요 💫", en: "You opened with “what can we build right now,” but the “why” gets meaning and a new tool gets daydreams. Hands on earth, head in orbit — {pct}% intuitive 💫" },
    "1,1,1": { ko: "큰 그림, 비전, 새 툴 하나로 세계관 구축까지 — 세 질문 전부 우주로 갔어요. {pct}% 직관형. 근데 MVP는... 만들긴 할 거죠? 🚀", en: "Big picture, vision, and a full cinematic universe from one new tool — all three left orbit. {pct}% intuitive. The MVP is… still happening, right? 🚀" },
  },
  NATURE: {
    "0,0,0": { ko: "지적은 돌려 말하고, 판단 기준은 “다들 괜찮나”고, 멘붕 팀원은 일단 다독여요 — 세 질문 전부 사람 먼저. {pct}% 감성형, 이 팀 분위기는 당신이 지키고 있어요 💗", en: "Soft critiques, “is everyone okay” as the ruling, comfort before debugging — all three put people first. {pct}% feeling; team morale is your codebase 💗" },
    "1,0,0": { ko: "아이디어가 별로면 별로라고는 해요. 근데 충돌 나면 “다들 납득했나”부터 보고, 밤샌 팀원한텐 해결책보다 커피를 먼저 내밀죠. 입은 T인데 심장은 F — {pct}% 감성이에요 🫶", en: "You will say a weak idea is weak. But clashes get judged on “is everyone on board,” and the burned-out teammate gets coffee before solutions. T mouth, F heart — {pct}% feeling 🫶" },
    "0,0,1": { ko: "멘붕 온 팀원한테 “어디서 막혔어?”가 먼저 나오긴 해요. 근데 피드백은 기분 안 상하게 포장하고 충돌 기준도 결국 사람 마음이죠. 불났을 땐 문제부터, 평소엔 마음부터 — {pct}% 감성이에요 💞", en: "A meltdown does get “where are you stuck?” first. But feedback comes gift-wrapped and clashes get judged on hearts. Problem-first in a fire, heart-first otherwise — {pct}% feeling 💞" },
    "1,0,1": { ko: "지적도 직설, 멘붕엔 문제부터 — 근데 진짜 큰 충돌에선 “다들 납득하고 기분 괜찮나”를 봐요. 평소엔 팩트 폭격긴데 결정적 순간에 사람을 고름 — {pct}% 감성이긴 한데 거의 반반이에요 🌗", en: "Blunt feedback, problem-first meltdowns — yet when it really counts, the ruling is “is everyone actually okay with this.” A fact-cannon that picks people in the clutch — {pct}% feeling, basically split 🌗" },
    "0,1,0": { ko: "피드백은 부드럽게, 멘붕 팀원은 다독다독. 근데 의견 충돌이 나면 갑자기 “그래서 뭐가 더 합리적인데?”가 나와요. 다정한 얼굴로 스프레드시트 켜는 타입 — {pct}% 이성이긴 한데 다정 지분이 상당해요 🌓", en: "Gentle feedback, comfort for the burned-out — until a clash hits and out comes “okay, but what's actually rational?” Opens the spreadsheet with a warm smile — {pct}% thinking, with serious softness 🌓" },
    "1,1,0": { ko: "지적도 논리로, 충돌도 효율로 정리하는데, 밤새고 무너진 팀원 앞에선 “괜찮아? 좀 쉬어”가 먼저 나와요. 기계인 줄 알았는데 사람이었음 — {pct}% 이성이에요 🧊", en: "Critiques run on logic, clashes on efficiency — but a collapsed teammate still gets “you okay? go rest” first. Turns out the machine has a heart — {pct}% thinking 🧊" },
    "0,1,1": { ko: "별로인 아이디어에 “오 좋다!”로 시작은 해줘요. 딱 거기까지예요. 충돌 나면 합리가 기준이고 멘붕엔 “어디서 막혔어?”부터죠 — 꽤 강하게 {pct}% 이성이에요 ⚙️", en: "A weak idea does get an opening “love it!” — and that's where the mercy ends. Clashes run on logic, meltdowns get “where are you stuck?” — pretty firmly {pct}% thinking ⚙️" },
    "1,1,1": { ko: "지적은 직진, 판단은 합리, 멘붕엔 “어디서 막혔는데?” — 세 질문 전부 이성이에요. {pct}% 이성형. 위로는 버그 잡고 나서 하는 타입, 반박 시 당신 말이 맞음 🧠", en: "Straight critiques, rational rulings, “where exactly are you stuck?” in a crisis — all three run on reason. {pct}% thinking; comfort ships right after the bug fix 🧠" },
  },
  TACTICS: {
    "0,0,0": { ko: "시간표 없음, 계획은 갈아엎으라고 있는 것, 역할은 “하다 보면 정해짐” — 세 질문 전부 즉흥이에요. {pct}% 즉흥형. 신기하게 마감은 또 맞춰요, 심장이 좀 갈릴 뿐 🎲", en: "No schedule, plans exist to be torn up, roles “emerge naturally” — all three point spontaneous. {pct}% prospecting. The deadline somehow still gets hit… at some cardiac cost 🎲" },
    "1,0,0": { ko: "일단 시간표는 짜요. 근데 더 좋은 아이디어가 오면 갈아엎고 역할도 되는 대로 굴리죠. 계획표는 있는데 장식일 확률이 높음 — {pct}% 계획이긴 한데 몸은 즉흥이에요 🌗", en: "A schedule does get made. Then a better idea nukes it, and roles just roll. The plan exists — decoratively — {pct}% judging, with a spontaneous body 🌗" },
    "0,1,0": { ko: "작업도 흐름 타고 역할도 대충 굴리는데, 마감 12시간 전의 “더 좋은 아이디어”만큼은 “위험해, 참아”로 쳐내요. 즉흥인데 도박은 안 함 — {pct}% 즉흥이에요 ⛵", en: "You ride the flow and roll the roles, but the shiny 12-hours-out idea gets a firm “too risky, hold.” Spontaneous, not a gambler — {pct}% prospecting ⛵" },
    "0,0,1": { ko: "역할 분담표 하나는 기가 막히게 만들어요. 그리고 그게 계획성의 전부죠 — 작업은 흐름대로, 막판엔 갈아엎기. 꽤 강하게 {pct}% 즉흥형이에요 🌊", en: "You produce one immaculate role-assignment sheet. That's the entire planning department — the rest is flow and late-game rebuilds. Pretty firmly {pct}% prospecting 🌊" },
    "1,1,0": { ko: "시간표 짜고, 막판의 달콤한 유혹도 “위험해”로 쳐내요. 역할만 좀 느슨한데 그건 다 같이 붙는 게 좋아서고요 — 꽤 강하게 {pct}% 계획형이에요 📅", en: "Schedule made, late-game temptations rejected on sight. Only the roles run loose — and that's by choice — pretty firmly {pct}% judging 📅" },
    "1,0,1": { ko: "시간표도 짜고 역할도 딱딱 나누는데, 마감 12시간 전의 번뜩임엔 “가보자고”를 눌러버려요. 계획형인데 한 방 로망이 있음 — {pct}% 계획이에요 🗂️", en: "Schedules made, roles split clean — but the 12-hours-out spark gets a “let's GO.” A planner with exactly one gambling gene — {pct}% judging 🗂️" },
    "0,1,1": { ko: "막판 계획도 지키고 역할도 나누는데, 정작 손은 “일단 만들면서 생각하자”로 움직여요. 문서는 J인데 커밋 로그는 P — {pct}% 즉흥이긴 한데 사실상 반반이에요 🌓", en: "You hold the plan and split the roles, but the hands just start building. The docs say J; the commit log says P — {pct}% prospecting, basically split 🌓" },
    "1,1,1": { ko: "시간표, 계획 고수, 역할 분담까지 3연속 풀콤보 — {pct}% 계획형이에요. 노션에 이미 데모데이 D-day 위젯 있죠? 다 알아요 📐", en: "Schedule, plan held, roles split — a full combo. {pct}% judging. There's already a demo-day countdown widget in your Notion, isn't there 📐" },
  },
  IDENTITY: {
    "0,0": { ko: "데모 터지면 심장부터 떨어지고, 입상 못 한 날엔 침대에서 하이라이트 무한 재생 — 두 질문 다 흔들렸어요. {pct}% 예민(Turbulent). 근데 그 곱씹는 힘으로 다음 판을 진짜 잘하죠 🌊", en: "Demo breaks: heart drops. No podium: the bedtime highlight reel runs on loop — both landed turbulent. {pct}% Turbulent. That replaying is exactly why round two goes better 🌊" },
    "1,0": { ko: "데모 터진 순간엔 “어떻게든 되겠지” 침착했는데, 입상 못 한 밤엔 “그때 그것만...”이 새벽 3시까지 재생돼요. 위기엔 강한데 뒤끝이 긺 — {pct}% 예민이에요 🌗", en: "Mid-crisis you were all “we'll figure it out” — then the loss ran on loop till 3am. Strong in the moment, long in the aftertaste — {pct}% Turbulent 🌗" },
    "0,1": { ko: "데모 터질 땐 심장이 쿵 했지만, 결과는 “잘했으니 됐지”로 하루 만에 정리돼요. 순간 리액션만 크지 회복은 초고속 — {pct}% 안정이에요 🌓", en: "The demo break got a real heart-drop, but the loss was filed under “we did well” by morning. Big reactions, absurdly fast recovery — {pct}% Assertive 🌓" },
    "1,1": { ko: "데모가 터져도 “어떻게든 되겠지”, 입상 못 해도 “다음에 또” — 두 질문 다 강철이에요. {pct}% 안정(Assertive). 이 팀 멘탈 탱커는 당신입니다 🛡️", en: "Demo breaks: “we'll figure it out.” No podium: “next time.” Both answers pure steel. {pct}% Assertive — you're the team's designated mental tank 🛡️" },
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
