"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { dict, type Phrase } from "@/data/dictionary";
import LinkedInLink from "@/components/ui/LinkedInLink";
import { days } from "@/data/schedule";
import { naru } from "@/data/naru";
import { useLocale } from "@/lib/LocaleContext";
import { H3 } from "@/components/ui/typography";

// ─────────────────────────────────────────────────────────────────────────────
// 제로백 빌더톤이 무엇이었는지 설명하는 탭 블록. #record 안에 삽니다.
//
// DECIDED 2026-09-15: 숫자와 사진만으로는 이 이벤트가 설명되지 않습니다.
// "74명이 신청했다"는 신뢰를 주지만, 처음 오는 사람에게 "그래서 8일 동안 뭘 한
// 거냐"와 "누가 왔느냐"는 답이 없어요. 그 둘이 이 이벤트를 설명하는 진짜
// 재료이고, 기업에 우리를 설명할 때도 같은 둘을 씁니다.
//
// ── 데이터를 옮겨 적지 않습니다 ─────────────────────────────────────────────
// 여기 그려지는 사람과 일정은 **전부 8월 정본에서 직접 읽습니다.**
//
//   data/schedule.ts  days              8일의 모양
//   dict.mentoring    mentors           멘토
//   dict.speakers     people, panel     연사, Day 8 간담회
//   dict.judges       people            피드백 패널
//
// 복사해 두면 한쪽만 고쳐지기 시작합니다. 사람 이름이 두 페이지에서 어긋나는
// 것은 이 사이트가 저지를 수 있는 가장 나쁜 오류예요. 8월 페이지에서 이름이나
// 소속이 바뀌면 이 블록도 같이 바뀝니다. data/naru.ts의 record.tabs에는 라벨과
// 안내 문장만 있습니다.
//
// 링크드인은 반드시 살립니다. 8월 페이지의 모든 인물 카드가 달고 있던 것이고,
// 이 자리에서 가장 값이 큰 요소예요. 매니페스토 VIII이 말하는 대로 커뮤니티의
// 이야기는 제도가 아니라 사람으로 전달되는데, 이름만 적어 두면 그 사람이 누구인지
// 확인할 방법이 없습니다. 링크 하나가 "실명이 박힌 진짜 사람들이 왔다"를 증명하고,
// 그게 이 페이지가 기업과 다음 참가자에게 하려는 말의 전부입니다.
// 소개 한 줄(intro·bio·note·points)과 얼굴 사진도 같은 이유로 그립니다.
// 정본에 있는 것을 화면에서 빼 두면 그냥 이름 목록이 됩니다.
//
// 다만 "확정/미확정" 배지와 예약 안내는 없습니다. 그건 진행 중인 이벤트 페이지가
// 하는 일이고, 이 자리는 끝난 이벤트의 요약입니다. 세션의 시각과 장소, FAQ는
// 아래 링크로 8월 페이지에 가면 전부 있습니다.
//
// ── 왜 탭인가 ────────────────────────────────────────────────────────────────
// 길이 때문입니다. 8일 + 멘토 열셋 + 연사와 패널 열이 넘는 사람을 한 번에
// 펼치면 이 챕터 하나가 페이지의 절반이 됩니다. 한 번에 하나만 보이면 깊이는
// 그대로 두고 길이만 줄일 수 있어요. 아코디언이 아니라 탭인 이유는 셋이 서로
// 대안이기 때문입니다. 무엇을 했나, 누가 도왔나, 누가 왔나. 하나를 읽는 동안
// 나머지 둘이 열려 있을 이유가 없습니다.
// ─────────────────────────────────────────────────────────────────────────────

type TabId = "format" | "mentors" | "people";

// 멘토의 stages는 "사람"이 아니라 "도움의 종류"입니다 (dict.mentoring의 주석).
// 1 = 예약제 1:1 빌드 멘토링, 2 = 드롭인 1:1, 3 = Day 7 피치 세션.
// stages가 비어 있으면 1:1 멘토링이 아니라 Day 1·2의 세션을 맡은 분입니다.
//
// 8월 페이지는 stage가 둘인 멘토를 두 박스에 모두 세웁니다(조인이 원래 그렇게
// 설계돼 있어요). 여기서는 한 번만 세웁니다. 같은 얼굴이 한 화면에 두 번 나오면
// 요약이 아니라 목록이 되고, 이 자리는 요약입니다. 대신 칩을 둘 답니다.
function stageChips(stages: readonly number[], t: (p: Phrase) => string): string[] {
  const m = naru.record.tabs.mentors;
  if (!stages.length) return [t(m.stageWarmup)];
  const out: string[] = [];
  if (stages.includes(1) || stages.includes(2)) out.push(t(m.stageBuild));
  if (stages.includes(3)) out.push(t(m.stagePitch));
  return out;
}

// ── 사진은 피드백 패널에만 (DECIDED 2026-09-15) ────────────────────────────
// 멘토와 연사와 Day 8 간담회에서는 뺐습니다.
//
// 이 자리에서 사진이 하는 일은 "누구인지 알아보게 하는 것"이 아니라 "이 사람이
// 무게가 있다"를 말하는 것입니다. 그런데 정본에 얼굴이 있는 사람과 없는 사람이
// 섞여 있어서, 멘토 열하나 중 셋만 얼굴이 붙으면 그 셋이 더 중요한 사람처럼
// 보입니다. 사진이 정보가 아니라 순서가 되는 거예요. 이름과 소개와 링크드인은
// 열하나 모두가 똑같이 갖고 있으니, 그것만 남기면 카드가 고르게 섭니다.
//
// 피드백 패널만 예외인 이유는 여덟 명 전원이 얼굴을 갖고 있기 때문입니다.
// 빠지는 사람이 없으니 사진이 순서를 만들지 않고, 결과 공유회에서 앞에 앉아
// 있던 얼굴들이라 이 이벤트의 무게를 가장 직접적으로 말하는 자리이기도 합니다.
//
// 다시 붙일 생각이면 그 그룹 전원에게 얼굴이 있는지 먼저 확인하세요.
// 한 명이라도 비면 붙이지 않는 편이 낫습니다.
// alt는 빈 문자열입니다. 이름이 바로 옆에 텍스트로 있어서, alt에 같은 이름을
// 넣으면 스크린리더가 두 번 읽습니다. 위 주석대로 이 초상이 하는 일은
// "누구인지 알아보게 하는 것"이 아니라 "무게가 있다"를 말하는 것이고, 그건
// 시각적으로만 하는 일입니다.
function Avatar({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      width={96}
      height={96}
      sizes="48px"
      className="h-12 w-12 shrink-0 rounded-full border border-white/12 object-cover"
    />
  );
}

function Person({
  name,
  org,
  role,
  bio,
  tag,
  chips = [],
  img,
  linkedin,
}: {
  name: string;
  org?: string;
  role?: string;
  bio?: string;
  tag?: string;
  chips?: string[];
  img?: string;
  linkedin?: string;
}) {
  return (
    <li className="flex flex-col rounded-2xl bg-white/[0.05] px-4 py-4">
      <div className="flex items-start gap-3">
        <Avatar src={img} />
        <div className="min-w-0 flex-1">
          <p className="break-keep text-sm font-semibold leading-snug text-white">{name}</p>
          {/* 소속과 직함을 한 줄에 잇지 않습니다. 가운뎃점은 하우스 스타일이
              금지하고(dictionary.ts 상단), U+2002으로 이으면 직함 자체가 이미
              U+2002을 품고 있어서("이사 Director") 경계가 보이지 않습니다.
              두 줄이면 구분자가 필요 없습니다. */}
          {org && <p className="mt-1 break-keep text-xs leading-snug text-white/65">{org}</p>}
          {role && <p className="mt-0.5 break-keep text-xs leading-snug text-white/55">{role}</p>}
        </div>
        {/* 링크드인은 카드 오른쪽 위 고정입니다. 카드마다 본문 길이가 달라서
            아래에 두면 줄이 들쭉날쭉해지고, 무엇보다 이름 옆에 있어야 "이
            사람"의 링크로 읽힙니다. */}
        {linkedin && <LinkedInLink url={linkedin} label={name} />}
      </div>
      {tag && (
        <p className="mt-3">
          <span className="inline-flex rounded-full border border-[#A99AD6]/25 bg-[#A99AD6]/10 px-2.5 py-0.5 text-[0.62rem] font-semibold text-accent">
            {tag}
          </span>
        </p>
      )}
      {/* line-clamp-3: 폰에서 멘토 열한 장이 1열로 쌓이면 1,800px 가까이
          됩니다. 소개를 세 줄로 자르면 장당 20~30px씩 줄고, sm부터는 풀어
          전문을 보여 줍니다. */}
      {bio && (
        <p className="mt-3 line-clamp-3 break-keep text-xs leading-relaxed text-white/60 sm:line-clamp-none">
          {bio}
        </p>
      )}
      {chips.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="inline-flex rounded-full border border-white/12 px-2 py-0.5 text-[0.62rem] font-semibold text-white/50"
            >
              {c}
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

// h4입니다. 이 블록 전체의 이름이 h3이고(headingId), 여기는 그 안의 구획이라서요.
// 원래 <p>였는데, 그러면 "날마다 무엇이 있었나", "문제 둘", "부문 넷", "멘토",
// "연사", "Day 8 커리어 간담회", "피드백 패널" 일곱 개가 heading 목록에서 통째로
// 사라집니다. 그 목록이 스크린리더 사용자가 이 탭 안을 훑는 유일한 수단인데,
// #record의 heading은 h2 하나와 h3 하나뿐이고 그 사이에 멘토 11명, 연사, 패널
// 8명, 8일 일정, 트랙 2, 부문 4가 heading 없이 들어 있었습니다.
//
// 크기와 색은 그대로입니다. heading이라는 것은 역할이지 글자 크기가 아닙니다.
function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h4 className="mb-3 flex items-baseline gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/55">
      {children}
      {count !== undefined && <span className="text-accent">{count}</span>}
    </h4>
  );
}

// ── 탭 패널 ──────────────────────────────────────────────────────────────────
// 셋을 모두 렌더하고 선택되지 않은 것은 hidden으로 감춥니다. 언마운트하면 안 되는
// 이유는 aria-controls입니다. 탭 셋이 각자 자기 패널 id를 가리키는데 그중 둘이
// DOM에 없으면 깨진 IDREF이고, 스크린리더의 "제어 대상으로 이동"이 아무 데도
// 가지 않습니다.
//
// tabIndex=0이 필요한 이유는 '8일의 형식' 패널입니다. 그 패널에는 포커스 가능한
// 자식이 하나도 없어서(전부 p와 li), 탭 버튼에서 Tab을 누르면 패널을 건너뛰고 그
// 아래 안내 문장으로 갑니다. 안에 무엇이 있는지 키보드로 닿을 방법이 없어요.
//
// className을 active일 때만 주는 것은 의도입니다. Tailwind의 display 유틸리티가
// className에 섞이면 [hidden]의 display:none을 이깁니다. 여기서는 hidden일 때
// 클래스가 아예 없으므로 UA 스타일시트가 그대로 이깁니다.
function TabPanel({
  uid,
  id,
  active,
  children,
}: {
  uid: string;
  id: TabId;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`${uid}-panel-${id}`}
      aria-labelledby={`${uid}-tab-${id}`}
      hidden={!active}
      tabIndex={0}
      className={active ? "mt-6 focus:outline-none" : undefined}
    >
      {children}
    </div>
  );
}

export default function RecordTabs() {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabId>("format");
  const uid = useId();
  const tabs = naru.record.tabs;
  const headingId = `${uid}-tabs-heading`;
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());

  const TABS: { id: TabId; label: Phrase }[] = [
    { id: "format", label: tabs.format.label },
    { id: "mentors", label: tabs.mentors.label },
    { id: "people", label: tabs.people.label },
  ];

  // ── 키보드 ───────────────────────────────────────────────────────────────
  // APG Tabs, 자동 활성화입니다. 화살표가 포커스를 옮기면 그 자리에서 패널도
  // 바뀝니다. 수동 활성화(화살표로 옮기고 Enter로 열기)를 고르지 않은 것은
  // 패널 셋이 이미 전부 DOM에 있어서 여는 데 드는 비용이 없기 때문입니다.
  // 비용이 없으면 조작을 한 번 더 시킬 이유가 없습니다.
  //
  // 양 끝에서 감깁니다. 마지막 탭에서 오른쪽을 누르면 첫 탭입니다.
  const select = (id: TabId, moveFocus = false) => {
    setTab(id);
    if (moveFocus) tabRefs.current.get(id)?.focus();
  };

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = TABS.length - 1;
    let next: number;
    switch (e.key) {
      case "ArrowRight": next = i === last ? 0 : i + 1; break;
      case "ArrowLeft": next = i === 0 ? last : i - 1; break;
      case "Home": next = 0; break;
      case "End": next = last; break;
      default: return;
    }
    // 화살표는 이 가로 스크롤 레일을, Home/End는 페이지 전체를 움직입니다.
    // 둘 다 막지 않으면 포커스는 옮겨 가는데 화면이 같이 튑니다.
    e.preventDefault();
    select(TABS[next].id, true);
  };

  return (
    <div className="mx-auto mt-16 max-w-5xl border-t border-white/10 pt-10 text-left">
      <h3 id={headingId} className={H3}>
        {t(tabs.label)}
      </h3>

      {/* 가로 스크롤 레일. 탭 셋의 라벨이 en에서 길어(Speakers and the panel)
          390px에 세 개가 나란히 들어가지 않습니다. 줄바꿈 대신 스크롤을 고른
          것은 헤더의 섹션 레일과 같은 이유입니다. 탭은 한 줄에 있어야 탭으로
          읽힙니다. */}
      {/* 탭 줄과 패널을 한 덩어리로 감쌉니다. 이 챕터는 기본 상태에서 테두리
          상자가 서른 개였고 전부 같은 값이라, 탭 블록이 "다른 층위"로 보이지
          않았습니다. 바깥에 면을 한 겹 두고 안쪽 상자의 테두리를 걷으면 이중
          프레임이 사라지고 이 블록이 하나의 오브젝트가 됩니다. */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-7">
      <div
        role="tablist"
        // aria-label이 아니라 aria-labelledby입니다. 위 h3가 이미 눈에 보이는 같은
        // 문자열이라, aria-label로 복사해 두면 한쪽만 고쳐질 수 있습니다.
        aria-labelledby={headingId}
        // py-1.5: pb-1만 있으면 focus-visible 링의 outline-offset 3px 위쪽이
        // 잘립니다.
        className="flex gap-2 overflow-x-auto py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((x, i) => {
          const on = x.id === tab;
          return (
            <button
              key={x.id}
              ref={(n) => {
                if (n) tabRefs.current.set(x.id, n);
                else tabRefs.current.delete(x.id);
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${x.id}`}
              aria-selected={on}
              aria-controls={`${uid}-panel-${x.id}`}
              // roving tabindex. 탭 목록 전체가 Tab 한 번으로 들어오고 한 번으로
              // 나갑니다. 셋 다 0이면 role=tab이 "3개 중 1개"라고 알려 준 뒤에도
              // 빠져나가는 데 Tab을 세 번 눌러야 합니다.
              tabIndex={on ? 0 : -1}
              onClick={() => select(x.id)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              // min-h 44px는 엄지가 닿아야 하는 것이면 언제나 지키는 값입니다.
              className={`inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition ${
                on
                  // 테두리 /60, 바탕 /20. 이전 값(orange/40, /10)은 선택과
                  // 비선택 채움의 대비가 1.04:1이라 저시력 사용자에게
                  // 구분되지 않았습니다(1.4.11). 주황에서 accent로 바꾼 것은
                  // 별개 이유입니다. 탭 선택은 상태 표시이지 브랜드 강조가
                  // 아니고, 가장 아끼는 색을 UI 상태에 쓰면 의미를 잃습니다.
                  ? "border-accent/60 bg-accent/20 text-white"
                  : "border-white/12 bg-white/[0.04] text-white/65 hover:border-white/25 hover:text-white"
              }`}
            >
              {t(x.label)}
            </button>
          );
        })}
      </div>

      {/* ── 탭 1 · 8일의 형식 ───────────────────────────────────────────── */}
      <TabPanel uid={uid} id="format" active={tab === "format"}>
        <div>
          <p className="break-keep text-sm leading-relaxed text-white/70">{t(tabs.format.intro)}</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tabs.format.facts.map((f) => (
              <li key={f.value.en} className="rounded-2xl bg-white/[0.05] px-4 py-4">
                <p className="break-keep text-sm font-bold leading-snug text-white">{t(f.value)}</p>
                <p className="mt-1.5 break-keep text-xs leading-snug text-white/50">{t(f.label)}</p>
              </li>
            ))}
          </ul>

          {/* 8일. data/schedule.ts의 days를 그대로 읽습니다. summary는 쓰지
              않았습니다. 그 문장은 진행 중인 이벤트의 안내문이라 입장 시각과
              선착순 굿즈까지 들어 있어요. 끝난 이벤트의 요약에는 그날이 무엇을
              하는 날이었는지(theme)와 날짜면 충분합니다. */}
          <div className="mt-8">
            <SectionLabel>{t(tabs.format.railLabel)}</SectionLabel>
            {/* 상자가 아니라 행입니다. 여덟 개가 전부 "DAY n + 테마 + 날짜"인
                동형 데이터라 카드일 이유가 없고, 카드로 두면 이 패널에서만
                상자가 여덟 개 늡니다. 폰에서도 2열입니다. 한 행이 두 줄짜리라
                375px에서도 버팁니다. */}
            <ol className="grid grid-cols-2 gap-x-6">
              {days.map((d) => (
                <li
                  key={d.day}
                  className="flex items-baseline gap-2.5 border-b border-white/[0.07] py-3 sm:gap-3"
                >
                  <span className="shrink-0 text-[0.68rem] font-black tracking-[0.12em] text-accent">
                    DAY {d.day}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-keep text-sm font-semibold leading-snug text-white">
                      {t(d.theme)}
                    </span>
                    <span className="mt-0.5 block text-xs text-white/55">
                      {d.date} {t(d.weekday)}
                      {/* 구분자는 U+2002. 가운뎃점을 쓰지 않습니다. */}
                      {d.hours ? ` ${d.hours}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* 트랙 둘. 8월 정본(dict.tracks.items)에서 읽습니다. 이 이벤트가
              "실제 기업 문제"였다는 주장을 증명하는 자리라, 트랙 이름만 적고
              넘어가면 주장만 남습니다. 병목 한 줄과 상황 한 문단이 그 증거예요. */}
          <div className="mt-8">
            <SectionLabel>{t(tabs.format.tracksLabel)}</SectionLabel>
            <p className="mb-3 break-keep text-sm leading-relaxed text-white/70">
              {t(tabs.format.tracksNote)}
            </p>
            <ul className="grid gap-3 lg:grid-cols-2">
              {dict.tracks.items.map((tr) => (
                <li key={tr.num} className="rounded-2xl bg-white/[0.05] px-5 py-4">
                  <p className="flex items-center gap-2">
                    <span className="inline-flex rounded-md border border-white/12 px-1.5 py-0.5 text-[0.62rem] font-black text-white/50">
                      {tr.num}
                    </span>
                    <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">
                      {t(tr.kicker)}
                    </span>
                  </p>
                  <p className="mt-2 break-keep text-base font-bold leading-snug text-white">
                    {t(tr.title)}
                  </p>
                  <p className="mt-1.5 break-keep text-sm leading-snug text-[#F2B183]">
                    {t(tr.bottleneck)}
                  </p>
                  <p className="mt-3 break-keep text-xs leading-relaxed text-white/60">
                    {t(tr.situation)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* 부문 넷. 무순위라는 말은 위 칩에 이미 있지만, 그 말만으로는 "그럼
              뭘 보고 주는데"가 남습니다. 네 부문의 이름과 누가 지명하는지가
              그 답이고, 8월 정본이 그대로 들고 있습니다. */}
          <div className="mt-8">
            <SectionLabel count={dict.program.awards.items.length}>
              {t(tabs.format.awardsLabel)}
            </SectionLabel>
            <p className="mb-3 break-keep text-sm leading-relaxed text-white/70">
              {t(tabs.format.awardsNote)}
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {dict.program.awards.items.map((aw) => (
                <li key={aw.name.en} className="rounded-2xl bg-white/[0.05] px-4 py-4">
                  <p className="break-keep text-sm font-bold leading-snug text-white">{t(aw.name)}</p>
                  <p className="mt-1.5 break-keep text-[0.68rem] leading-snug text-accent">
                    {t(aw.meta)}
                  </p>
                  <p className="mt-2.5 break-keep text-xs leading-relaxed text-white/60">{t(aw.desc)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </TabPanel>

      {/* ── 탭 2 · 멘토 ─────────────────────────────────────────────────── */}
      <TabPanel uid={uid} id="mentors" active={tab === "mentors"}>
        <div>
          <p className="break-keep text-sm leading-relaxed text-white/70">{t(tabs.mentors.intro)}</p>
          <div className="mt-6">
            <SectionLabel count={dict.mentoring.mentors.length}>
              {t(tabs.mentors.countLabel)}
            </SectionLabel>
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {dict.mentoring.mentors.map((m) => (
                <Person
                  key={m.name.en}
                  name={t(m.name)}
                  org={t(m.org)}
                  role={t(m.role)}
                  bio={t(m.intro)}
                  chips={stageChips(m.stages, t)}
                  linkedin={m.linkedin || undefined}
                />
              ))}
            </ul>
          </div>
        </div>
      </TabPanel>

      {/* ── 탭 3 · 연사와 피드백 패널 ───────────────────────────────────── */}
      <TabPanel uid={uid} id="people" active={tab === "people"}>
        <div>
          <p className="break-keep text-sm leading-relaxed text-white/70">{t(tabs.people.intro)}</p>

          <div className="mt-6">
            <SectionLabel count={dict.speakers.people.length}>
              {t(tabs.people.speakersLabel)}
            </SectionLabel>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {dict.speakers.people.map((p) => (
                <li key={p.name.en + p.day.en} className="rounded-2xl bg-white/[0.05] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-accent">
                        {t(p.day)}
                      </p>
                      <p className="mt-1.5 break-keep text-sm font-semibold leading-snug text-white">
                        {t(p.name)}
                      </p>
                      <p className="mt-1 break-keep text-xs leading-snug text-white/55">{t(p.role)}</p>
                    </div>
                    {p.linkedin && <LinkedInLink url={p.linkedin} label={t(p.name)} />}
                  </div>
                  {/* 세션 제목과 그 안에서 무슨 이야기가 나왔는지. 제목만 두면
                      "무슨 얘기였는데"가 남고, 그 답이 정본의 points에 이미
                      있습니다. 그대로 읽습니다. */}
                  <p className="mt-3 break-keep text-sm font-semibold leading-snug text-white/90">
                    {t(p.topic)}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {p.points.map((pt, i) => (
                      <li key={i} className="flex gap-2 break-keep text-xs leading-relaxed text-white/60">
                        <span aria-hidden className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-white/30" />
                        {t(pt)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <SectionLabel>{t(tabs.people.panelLabel)}</SectionLabel>
            {/* 세션 제목만 가져옵니다. 8월 정본의 panel.lead("세 회사의 대표가
                한 무대에 오릅니다")는 열리기 전에 쓴 문장이라 현재형입니다.
                끝난 이벤트의 요약에 그대로 두면 아직 안 열린 세션으로 읽혀요.
                시제를 고치려고 그 문장을 여기 옮겨 적지는 않습니다. 그러면
                같은 문장이 두 파일에 살게 됩니다. 제목은 시제가 없습니다. */}
            <p className="mb-3 break-keep text-sm leading-relaxed text-white/70">
              {t(dict.speakers.panel.title)}
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-3">
              {dict.speakers.panel.people.map((p) => (
                <Person
                  key={p.name.en}
                  name={t(p.name)}
                  role={t(p.role)}
                  bio={t(p.note)}
                  linkedin={p.linkedin}
                />
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <SectionLabel count={dict.judges.people.length}>
              {t(tabs.people.judgesLabel)}
            </SectionLabel>
            <p className="mb-3 break-keep text-sm leading-relaxed text-white/70">
              {t(tabs.people.judgesNote)}
            </p>
            {/* 폰에서는 1열입니다. 2열을 시도했다가 되돌렸습니다(2026-09-15).
                이 카드에는 48px 아바타가 있어서, 375px에서 2열이면 글자 칸이
                90px 남짓으로 줄고 이름이 음절 단위로 세로로 쪼개집니다.
                통계 타일이 같은 폭에서 서는 것은 그쪽에 아바타가 없기 때문입니다.
                길이는 Person의 bio line-clamp-3이 대신 줄입니다. */}
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {dict.judges.people.map((p) => (
                <Person
                  key={p.name.en}
                  name={t(p.name)}
                  org={t(p.org)}
                  role={t(p.role)}
                  tag={t(p.tag)}
                  bio={t(p.bio)}
                  img={p.img}
                  linkedin={p.linkedin}
                />
              ))}
            </ul>
          </div>
        </div>
      </TabPanel>

      </div>

      <p className="mt-5 break-keep text-xs leading-relaxed text-white/55">
        {t(tabs.archiveNote)}
      </p>
    </div>
  );
}
