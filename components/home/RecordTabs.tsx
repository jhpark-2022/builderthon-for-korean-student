"use client";

import { useId, useState } from "react";
import { dict, type Phrase } from "@/data/dictionary";
import { days } from "@/data/schedule";
import { naru } from "@/data/naru";
import { useLocale } from "@/lib/LocaleContext";

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
// 그래서 여기에는 "확정/미확정" 배지도, 링크드인 링크도, 예약 안내도 없습니다.
// 그건 진행 중인 이벤트 페이지가 하는 일이고, 이 자리는 끝난 이벤트의 요약이라
// 누가 있었는가까지만 말합니다. 더 보고 싶은 사람은 아래 링크로 8월 페이지에
// 가면 되고, 거기에는 소개와 링크와 FAQ가 전부 있습니다.
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

function Person({
  name,
  org,
  role,
  chips = [],
}: {
  name: string;
  org?: string;
  role?: string;
  chips?: string[];
}) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
      <p className="break-keep text-sm font-semibold leading-snug text-white">{name}</p>
      {/* 소속과 직함을 한 줄에 잇지 않습니다. 가운뎃점은 하우스 스타일이
          금지하고(dictionary.ts 상단), U+2002으로 이으면 직함 자체가 이미
          U+2002을 품고 있어서("이사 Director") 경계가 보이지 않습니다.
          두 줄이면 구분자가 필요 없습니다. */}
      {org && <p className="mt-1 break-keep text-xs leading-snug text-white/65">{org}</p>}
      {role && <p className="mt-0.5 break-keep text-xs leading-snug text-white/45">{role}</p>}
      {chips.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
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

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <p className="mb-3 flex items-baseline gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/45">
      {children}
      {count !== undefined && <span className="text-[#A99AD6]">{count}</span>}
    </p>
  );
}

export default function RecordTabs() {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabId>("format");
  const uid = useId();
  const tabs = naru.record.tabs;

  const TABS: { id: TabId; label: Phrase }[] = [
    { id: "format", label: tabs.format.label },
    { id: "mentors", label: tabs.mentors.label },
    { id: "people", label: tabs.people.label },
  ];

  return (
    <div className="mx-auto mt-16 max-w-5xl text-left">
      <SectionLabel>{t(tabs.label)}</SectionLabel>

      {/* 가로 스크롤 레일. 탭 셋의 라벨이 en에서 길어(Speakers and the panel)
          390px에 세 개가 나란히 들어가지 않습니다. 줄바꿈 대신 스크롤을 고른
          것은 헤더의 섹션 레일과 같은 이유입니다. 탭은 한 줄에 있어야 탭으로
          읽힙니다. */}
      <div
        role="tablist"
        aria-label={t(tabs.label)}
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((x) => {
          const on = x.id === tab;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`${uid}-tab-${x.id}`}
              aria-selected={on}
              aria-controls={`${uid}-panel-${x.id}`}
              onClick={() => setTab(x.id)}
              // min-h 44px는 엄지가 닿아야 하는 것이면 언제나 지키는 값입니다.
              className={`inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition ${
                on
                  ? "border-naru-orange/40 bg-naru-orange/10 text-white"
                  : "border-white/12 bg-white/[0.04] text-white/65 hover:border-white/25 hover:text-white"
              }`}
            >
              {t(x.label)}
            </button>
          );
        })}
      </div>

      {/* ── 탭 1 · 8일의 형식 ───────────────────────────────────────────── */}
      {tab === "format" && (
        <div role="tabpanel" id={`${uid}-panel-format`} aria-labelledby={`${uid}-tab-format`} className="mt-6">
          <p className="break-keep text-sm leading-relaxed text-white/70">{t(tabs.format.intro)}</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tabs.format.facts.map((f) => (
              <li key={f.value.en} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
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
            <ol className="grid gap-2 sm:grid-cols-2">
              {days.map((d) => (
                <li
                  key={d.day}
                  className="flex items-baseline gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span className="shrink-0 text-[0.68rem] font-black tracking-[0.12em] text-[#A99AD6]">
                    DAY {d.day}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-keep text-sm font-semibold leading-snug text-white">
                      {t(d.theme)}
                    </span>
                    <span className="mt-0.5 block text-xs text-white/45">
                      {d.date} {t(d.weekday)}
                      {/* 구분자는 U+2002. 가운뎃점을 쓰지 않습니다. */}
                      {d.hours ? ` ${d.hours}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* ── 탭 2 · 멘토 ─────────────────────────────────────────────────── */}
      {tab === "mentors" && (
        <div role="tabpanel" id={`${uid}-panel-mentors`} aria-labelledby={`${uid}-tab-mentors`} className="mt-6">
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
                  chips={stageChips(m.stages, t)}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── 탭 3 · 연사와 피드백 패널 ───────────────────────────────────── */}
      {tab === "people" && (
        <div role="tabpanel" id={`${uid}-panel-people`} aria-labelledby={`${uid}-tab-people`} className="mt-6">
          <p className="break-keep text-sm leading-relaxed text-white/70">{t(tabs.people.intro)}</p>

          <div className="mt-6">
            <SectionLabel count={dict.speakers.people.length}>
              {t(tabs.people.speakersLabel)}
            </SectionLabel>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {dict.speakers.people.map((p) => (
                <li key={p.name.en + p.day.en} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#A99AD6]">
                    {t(p.day)}
                  </p>
                  <p className="mt-1.5 break-keep text-sm font-semibold leading-snug text-white">{t(p.name)}</p>
                  <p className="mt-1 break-keep text-xs leading-snug text-white/55">{t(p.role)}</p>
                  <p className="mt-2 break-keep text-xs leading-snug text-white/70">{t(p.topic)}</p>
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
                <Person key={p.name.en} name={t(p.name)} role={t(p.role)} />
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
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {dict.judges.people.map((p) => (
                <Person key={p.name.en} name={t(p.name)} org={t(p.org)} role={t(p.role)} />
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="mt-6 break-keep text-xs leading-relaxed text-white/45">
        {t(tabs.archiveNote)}
      </p>
    </div>
  );
}
