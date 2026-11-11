import { naru, register as registerCopy, registerNoteShort, registerNoteOpen, decemberPartners } from "@/data/naru";
import { type Phrase } from "@/data/dictionaryCore";

// DECIDED 2026-11-07 (redesign/crossing): 이 페이지 전용 한국어 문구. 영어는 data/naru.ts의 원문 그대로입니다.
// 한국어의 \n은 데스크톱에서 줄을 나누는 자리입니다(CrossingSeoul의 Lines). 폰에서는 이어서 흐릅니다.
// 날짜, 단계 이름(컨텍스트 열기, 찾기, 확인받기, 만들기, 공유하기), 성과 공유회, 미션, 숫자는 바꾸지 않았습니다.

const d = naru.december;
const h = naru.eventHero;
const ko = (text: string, from: Phrase): Phrase => ({ ko: text, en: from.en });
const kos = (texts: string[], from: readonly Phrase[]): Phrase[] =>
  from.length === texts.length ? texts.map((x, i) => ko(x, from[i])) : [...from];

const stage = (n: number) => d.stages.find((s) => s.dayOffset === n)!;

export const copy = {
  catchAnswer: ko("먼저 생각하고, 현업에 물어보고,\n팀마다 다른 걸 만들어 서로 보여 줘요.", h.catchAnswer),
  sub: ko("만드는 건 이제 AI 몫이에요.\n그래서 이번 닷새는 거의 다, 무엇을 왜 만들지 정하는 데 쓸 거예요.\n정한 게 맞았는지는 직접 만든 결과물이 증명하죠.", h.sub),
  // DECIDED 2026-11-09 (docs/brand-voice-brief.md D3): 새 화면에 남은 합니다체 한 줄을 해요체로. 그 전 "나루가 엽니다."
  naruLine: ko("학생들이 직접 꾸리는 그룹, 나루가 열어요.", h.naruLine),
  photosCaption: ko("8월 싱가포르, 제로백 빌더톤", h.photosCaption),
  photosMore: (n: number): Phrase => ({ ko: `사진 ${n}장 더 보기`, en: `View ${n} photos` }),

  noteShort: ko("등록 시작은 11월 16일(월).\n팀 없이 혼자 등록하면 돼요.", registerNoteShort),
  noteOpen: ko("팀 없이 혼자 등록하면 돼요.", registerNoteOpen),
  previewCta: ko("등록 폼 먼저 보기", registerCopy.previewCta),

  programHeading: ko("닷새, 이렇게 보내요", d.programHeading),
  scheduleLead: ko(
    "등록은 혼자, 팀은 Day 1 현장에서.\n규칙은 하나에요: AI가 쓴 걸 고치지 말고, 내가 쓴 걸 AI한테 고치게 할 것.\n닷새 안에 다 못 풀어도 괜찮아요. 중요한 건 답보다, 얼마나 깊이 팠는지예요.",
    d.scheduleLead,
  ),
  facts: kos(
    [
      "한 팀에 한국 학생과 싱가포르 학생이, 직접 만드는 사람과 숫자를 보는 사람이 섞여요.\n나라끼리 겨루는 대항전이 아니라는 뜻이죠.",
      "4일 모두 아침부터 저녁까지 열려 있어요. 노트북은 각자 챙겨 오세요.",
      "Day 2와 Day 3에 하나씩. 기준은 팀이 같이 있었는지, 한 장이 어떻게 바뀌었는지예요.\n해낸 팀이라면 전부, 그날 세션이 끝난 뒤 지원받아요.",
    ],
    d.facts.map((f) => f.v),
  ),

  line: {
    0: ko("어느 회사가 어떤 고민을 들고 오는지 미리 알려 드려요. 자세한 얘기는 Day 1에 회사가 직접.", stage(0).line),
    1: ko("팀을 꾸리고, 그 일에서 누가 어디서 막히는지 하나를 골라요. 왜 거기인지는 팀이 먼저 한 장으로 적어 두세요.", stage(1).line),
    2: ko("고른 병목이 맞는지 멘토를 찾아가 물어봐요.\n일을 해 본 사람은 바로 반박하거든요. 그 말을 듣고 한 장을 고치는 날이에요.", stage(2).line),
    3: ko("그 병목 하나만 푸는 작은 툴을 만들어요. 회사가 정말 가져다 쓸 수 있을지, 멘토에게 한 번 더 물어보세요.\n일요일이라 만들기와 Open tables는 Zoom으로 하고, 멘토만 직접 찾아가요. 닷새를 다 현장에서 하면 지치거든요.", stage(3).line),
    4: ko("이슈를 낸 회사 앞에서 고른 병목과 만든 툴을 발표하고 질문을 받아요.\n회사로서는 같은 고민에 대한 서로 다른 답을 한자리에서 보는 셈이죠.\n끝나면 멘토에게 뭘 만들었는지 한 줄로 먼저 연락해 주세요.", stage(4).line),
  } as Record<number, Phrase>,

  chips: {
    1: kos(["현장에서 팀 꾸리기"], stage(1).chips),
    4: kos(["시상, 마무리"], stage(4).chips),
  } as Record<number, Phrase[]>,

  carryTitle: ko("우리 팀 생각을 적은 한 장", stage(1).submit!),
  carryTodo: kos(["현장에서 팀 꾸리기", "팀 생각을 한 장으로 먼저 쓰기 (AI는 고칠 때만)", "Day 2에 멘토에게 들고 가기"], d.carryDetail.todo),
  carrySubmit: kos(["PDF로 올려 둬도 돼요", "시간표 페이지에서 Day 1을 고르면 돼요", "미션은 Day 2, 3에만 있어요"], d.carryDetail.submit),

  milestone: {
    // DECIDED 2026-11-08 (docs/mission-card-brief.md S1, S2).
    2: ko("멘토 만나고, PO session 듣고, 고친 한 장 올리기", stage(2).milestone!),
    3: ko("멘토 만나고, Open tables에서 나누고, 발표 자료 올리기", stage(3).milestone!),
  } as Record<number, Phrase>,
  milestoneConditionsLabel: ko("이걸 다 하면 돼요", d.milestoneConditionsLabel),
  milestoneSubmitLabel: ko("올리는 것", d.milestoneSubmitLabel),
  // DECIDED 2026-11-08 (docs/mission-card-brief.md S3, S4): 조건 넷. kos는 길이가 같을 때만 덮어쓰므로 data/naru.ts의 conditions도 넷입니다.
  conditions: {
    2: kos(["팀원 절반 넘게 현장에 오기", "멘토 한 분 이상을 절반 넘게 같이 찾아가기", "PO session에 같이 있기", "반박 들은 대로 한 장을 고쳐서 올리기"], stage(2).milestoneDetail!.conditions),
    3: kos(["팀원 절반 넘게 Zoom에 들어오기", "멘토 한 분 이상을 절반 넘게 같이 찾아가기", "Open tables에서 어디까지 왔는지 나누기", "발표 자료 올리기"], stage(3).milestoneDetail!.conditions),
  } as Record<number, Phrase[]>,
  // S5~S7: 확인 칩 셋과 카드 아래 두 줄. "시간표 페이지"는 CrossingSeoul이 링크로 그립니다.
  checkLabels: {
    staff: ko("운영진 체크", d.checkLabels.staff),
    photo: ko("사진 1장", d.checkLabels.photo),
    pdf: ko("PDF 1장", d.checkLabels.pdf),
  },
  milestoneReward: ko("다 하면 그날 세션이 끝난 뒤 지원을 받아요.", d.milestoneReward),
  milestoneUpload: ko("사진과 PDF는 시간표 페이지에서, 날마다 한 번씩.", d.milestoneUpload),
  // 2026-11-08: 펼친 미션 카드(mission-card-brief)부터 이 화면은 submit을 그리지 않습니다. 확인 칩이 대신합니다. 키는 남겨 둡니다.
  submit: {
    2: kos(["멘토랑 팀이 같이 찍은 사진", "고친 한 장 (PDF)", "현장 출석은 운영진이 체크해요"], stage(2).milestoneDetail!.submit ?? []),
    3: kos(["멘토랑 팀이 같이 찍은 사진", "발표 자료 (슬라이드 PDF)", "Zoom 출석은 운영진이 체크해요"], stage(3).milestoneDetail!.submit ?? []),
  } as Record<number, Phrase[]>,

  // DECIDED 2026-11-09 (사용자: "각 세션 클릭하면 세션 설명이 나오게"): 세션 이름을 누르면 펼쳐지는 설명. 영어와 근거는 data/naru.ts stages[n].session.detail.
  // 같은 날 사용자("설명이 너무 긴 거 같아"): 네 줄에서 두 줄씩으로.
  sessionDetail: {
    1: kos(["자기 프로덕트를 Lovable로 기획부터 운영까지 해 온 Carraway & Gatsby가 진행해요.", "생각을 화면으로 빨리 띄워, 멘토에게 한 장과 같이 보여 줄 시안을 만드는 법을 배워요."], stage(1).session?.detail ?? []),
    2: kos(["현업 PO 세 명이 뭘 왜 만들기로 했고 어디서 멈췄는지 들려줘요.", "주제는 덜어내기, 하나를 남기려고 뭘 뺐는지예요. 끝엔 셋이 대담해요."], stage(2).session?.detail ?? []),
    3: kos(["만드는 날, 팀과 팀이 Zoom에 모여 어디까지 왔는지 나눠요.", "막힌 지점을 다른 팀에 묻고 서로의 생각을 빌려 가요."], stage(3).session?.detail ?? []),
  } as Record<number, Phrase[]>,
  dayFlowLabel: ko("하루 일정 보기", d.dayFlowLabel),
  matchLabel: ko("AI 유형 테스트 해 보기", stage(1).matchCta!.label),
  voteLocked: ko("성과 공유회 날 현장에서 열려요.", stage(4).voteCta!.lockedNote!),
  timetableLabel: ko("멘토 시간표, 미션 올리기", stage(1).timetableCta!.label),
  timetableNote: ko("Day 1부터 3까지 써요. Day 1(12.18) 낮 12시에 열리고, 칸은 노트북으로 넣어 주세요.", d.timetableNote),

  // 2026-11-09 (사용자): Day 1 연사 카드. 키는 "날-흐름 줄 번호". data/naru.ts의 speaker.agenda와 같은 길이.
  speakerLabel: {
    "1-0": ko("나눌 이야기 (30분)", stage(1).flow![0].speaker!.agendaLabel),
    "1-4": ko("워크숍에서 하는 것", stage(1).flow![4].speaker!.agendaLabel),
  } as Record<string, Phrase>,
  speakerAgenda: {
    "1-0": kos(
      [
        "요즘 세대와 한국의 창업 생태계를 보며 느끼는 것",
        "학생이 아이디어를 진지하게 꺼내 보고 현업 피드백을 받을 자리가 왜 부족한지",
        "그래서 내년에 준비하는 이니셔티브와 그 배경, 준비 중인 프로그램 소개",
      ],
      stage(1).flow![0].speaker!.agenda,
    ),
    "1-4": kos(
      [
        "회사가 이 이슈로 뭘 풀고 싶은지, 목적부터 정하기",
        "AI와 거꾸로 대화를 쌓아 Lovable 시안 띄우기 (같이 실습)",
        "'내가 이걸 매일 쓸까?' 묻기, 끝난 뒤엔 남아서 질문 받기",
      ],
      stage(1).flow![4].speaker!.agenda,
    ),
  } as Record<string, Phrase[]>,

  flow: {
    1: kos(
      [
        "오프닝 세션. 더벤처스 조여준 파트너님이 열어요",
        "출제사 30분. 아직 손으로 하는 일이 뭔지, 왜 그렇게 하는지 회사가 직접 설명해요",
        "팀 꾸리기. AI 유형 테스트 결과를 보고 현장에서 정해요. 팀마다 싱가포르 학생이 1~2명씩 들어가요",
        "트랙 고르기. 1~3순위를 적으면 운영진이 고르게 나눠요",
        "Lovable workshop. 자기 프로덕트를 기획부터 운영까지 해 온 Carraway & Gatsby가 진행해요",
        "멘토 시간표 열림. Day 2, 3 칸을 노트북으로 넣어요",
        "팀 생각 한 장 쓰기. PDF로 올려 두면 칸을 잡은 멘토가 미리 읽어요",
      ],
      (stage(1).flow ?? []).map((r) => r.what),
    ),
    2: kos(
      [
        "멘토 찾아가기. 잡아 둔 시간에 팀이 같이, 한 장을 들고",
        "PO session. 현업 PO 세 명이 뭘 왜 만들기로 했고 어디서 멈췄는지 들려주고, 이어서 대담",
        "미션 올리기. 멘토랑 찍은 사진, 고친 한 장 PDF",
      ],
      (stage(2).flow ?? []).map((r) => r.what),
    ),
    3: kos(
      [
        "멘토 찾아가기. 만든 툴을 들고 가서 회사가 쓸 수 있을지 물어보기",
        "만들기. 그 병목 하나만 푸는 작은 툴",
        "Open tables. 막힌 데를 다른 팀에 물어보고 서로 아이디어 빌려 가기",
        "미션 올리기. 멘토랑 찍은 사진, 발표 자료 PDF",
      ],
      (stage(3).flow ?? []).map((r) => r.what),
    ),
    4: kos(
      [
        "트랙별 발표. 출제사, 멘토, 투자사 앞에서 고른 병목과 만든 툴, 숫자 하나로 본 효과를 보여 줘요. 출제사는 트랙마다 1시간 반을 비워 두고 와요",
        "트랙별 인기투표",
        "시상과 마무리. 출제사가 트랙마다 한 팀, 투자사가 한 팀을 고르고 인기투표 결과도 같이 발표해요. 출제사가 고른 팀은 행사가 끝난 뒤 그 회사와 한 번 더 만나요",
        "끝나면 멘토에게 뭘 만들었는지 한 줄로 먼저 연락하기",
      ],
      (stage(4).flow ?? []).map((r) => r.what),
    ),
  } as Record<number, Phrase[]>,

  mentorsIntro: ko("멘토링에서 듣는 건 전문 지식보다 현업의 감각이에요. 누가 돈을 내고 결재하는지, 실제로 누구 책상에서 어떻게 돌아가는지처럼 일해 본 사람이면 아는 것들이죠.", d.mentorsIntro),
  mentorsTalkLabel: ko("이런 얘기를 듣게 돼요", d.mentorsTalkLabel),
  mentorsTalkTitles: kos(["솔직한 반응", "신입한테 바랐던 것", "받게 될 질문"], d.mentorsTalk.map((x) => x.title)),
  mentorsTalkBody: kos(
    [
      "안 살 것 같다는 말도 그대로 들어요.",
      "한 장은 신입의 첫 보고서처럼 읽혀요.",
      "한 장에서 가장 약한 곳 하나를 짚어요.",
    ],
    d.mentorsTalk.map((x) => x.body),
  ),
  mentorsTalkNote: ko("반박은 솔직하게 들어요. 그래도 점수는 매기지 않아요.", d.mentorsTalkNote),
  mentorsListNote: ko("몇 분만 먼저 소개해요. 모두 각자의 현업에서 AI를 적극적으로 쓰는 분들이고, 다른 분야 멘토도 더 와요.", d.mentorsListNote),

  gainsHeading: ko("끝나고 손에 남는 것", naru.gains.heading),
  // 2026-11-10 (사용자, 스크린숏: "여기 2줄"): 셋째 줄 "과정은 마지막 날, 그 회사 앞에서 보여 줄 차례예요."를 뺌. 그 말은 아래 04가 받음(brand 5장).
  gainsSpine: ko(
    "학생에게는 '이걸 왜 아직 손으로 하지?'부터 묻는 습관이 남아요.\n회사에는 그 일에 바로 써 볼 만한 작은 툴 하나가 남고요.",
    naru.gains.spine.heading,
  ),
  gainsTitles: kos(
    ["이름이 걸린 회사의 실제 이슈", "현업의 반박", "회사가 써 볼 수 있는 툴", "이슈를 낸 회사의 질문", "한국과 싱가포르가 섞인 팀"],
    naru.gains.items.map((x) => x.title),
  ),
  gainsBodies: kos(
    [
      "어느 회사의 어떤 일인지, 회사 이름까지 다 알고 시작하죠.",
      "한 장과 시안을 들고 현업 멘토를 찾아가요. 일해 본 사람의 반박을 듣고 생각을 고쳐요.\n내가 쓴 거니까, 고칠 수도 있는 거예요.",
      "고친 생각은 작은 툴로. 정말 쓸 만한지는 숫자 하나로 확인해요.",
      "마지막 날 그 회사 앞에서 발표하고, 실제로 써 볼 수 있겠느냐는 질문까지 받아 봐요.",
      "Day 1에 만난 팀 그대로, 끝까지.",
    ],
    naru.gains.items.map((x) => x.body),
  ),

  leadNote: ko("컨소시엄 핵심 회사 다섯 곳", decemberPartners.groups[0].lead!.note),
};
