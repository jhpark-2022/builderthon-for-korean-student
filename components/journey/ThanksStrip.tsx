"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 8월 기록 히어로 바로 아래의 "함께해 주신 분들" 얼굴 띠.
//
// DECIDED 2026-10-26 (사용자: "이런 분들이 함께해주셨다는 거를 8월 페이지 시작하자마자 보여줘야함", 얼굴 띠, 얼굴 아래에
// 이름, 소속, 역할): 같은 날 8월 멘토와의 미팅에서 도와준 분들을 홈페이지에 크레딧으로 남기고 더 위에 두라는 조언을 받았습니다.
// brand 3장 원칙 4(조직이 아니라 사람을 앞에 세운다). 로고 띠(HeroPartnerStrip)는 그대로 그 아래에 둡니다.
//
// 사람은 새로 적지 않습니다. dict.speakers.people, dict.judges.people, dict.mentoring.mentors에서 이름(ko)으로 한 사람씩 모읍니다.
// 한 사람은 한 번만 나오고, 줄은 첫 역할(연사, 피드백 패널, 멘토 순)로 정합니다. 맡은 역할은 모두 적습니다.
// 누르면 그 역할의 챕터(#speakers, #feedback-panel, #mentoring)로 내려갑니다.
// 폰에서는 한 줄에 네 분(카드 5.25rem). 세 분이면 띠가 한 화면 반을 넘고 한 분이 혼자 떨어졌습니다.
// 사진이 없으면 이름 첫 글자를 둡니다(2026-10-26 기준 열여섯 분 모두 사진 있음). 사진이 생기면 dictionary.ts의 img에 넣으면 여기에도 나옵니다.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import { dict, type Phrase } from "@/data/dictionary";
import { META } from "@/components/ui/typography";

type Tfn = (p: Phrase) => string;
type RoleKey = "speaker" | "panel" | "mentor";

const ROLE: Record<RoleKey, { label: Phrase; href: string }> = {
  speaker: { label: { ko: "연사", en: "Speaker" }, href: "#speakers" },
  panel: { label: { ko: "피드백 패널", en: "Feedback panel" }, href: "#feedback-panel" },
  mentor: { label: { ko: "멘토", en: "Mentor" }, href: "#mentoring" },
};
const ORDER: RoleKey[] = ["speaker", "panel", "mentor"];
// 히어로 조각 그림의 밝은 면 위에서도 읽히게. HeroPartnerStrip 라벨과 같은 그림자입니다.
const SHADOW = "drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]";
const HEADING: Phrase = { ko: "함께해 주신 분들", en: "With thanks to" };

// 멘토 카드에는 사진이 비어 있지만 같은 분의 사진이 다른 자리(schedule.ts)에 이미 있는 경우.
const EXTRA_IMG: Record<string, string> = { "김지훈 이사님": "/partners/people/kim-ji-hoon.jpg" };

type Person = { key: string; name: Phrase; org: Phrase | null; img: string; roles: RoleKey[] };

function collect(): Person[] {
  const map = new Map<string, Person>();
  const add = (name: Phrase, role: RoleKey, img: string, org: Phrase | null) => {
    const p = map.get(name.ko) ?? { key: name.ko, name, org: null, img: "", roles: [] };
    if (!p.roles.includes(role)) p.roles.push(role);
    // 사진은 피드백 패널(people/의 정사각 사진)을 먼저, 그다음 연사, 멘토.
    if (!p.img && img) p.img = img;
    if (!p.org && org && org.ko) p.org = org;
    map.set(name.ko, p);
  };
  dict.judges.people.forEach((j) => add(j.name, "panel", j.img, j.org));
  dict.speakers.people.forEach((s) => add(s.name, "speaker", s.img, null));
  dict.speakers.panel.people.forEach((s) => add(s.name, "speaker", s.img, null));
  dict.mentoring.mentors.forEach((m) => add(m.name, "mentor", m.img || EXTRA_IMG[m.name.ko] || "", m.org));
  const list = [...map.values()];
  list.forEach((p) => p.roles.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)));
  return list;
}

const PEOPLE = collect();

export default function ThanksStrip({ t }: { t: Tfn }) {
  return (
    <section aria-labelledby="thanks-title" className="mt-14 flex flex-col items-center gap-[20px] sm:mt-16">
      <h2 id="thanks-title" className={`${META} font-semibold text-white/75 ${SHADOW}`}>{t(HEADING)}</h2>
      {ORDER.map((role) => {
        const row = PEOPLE.filter((p) => p.roles[0] === role);
        if (!row.length) return null;
        return (
          <div key={role} className="flex w-full flex-col items-center gap-[10px]">
            <p className={`${META} font-semibold text-accent ${SHADOW}`}>{t(ROLE[role].label)}</p>
            <ul className="flex max-w-5xl flex-wrap justify-center gap-x-[2px] gap-y-[12px] sm:gap-x-[8px] sm:gap-y-[14px]">
              {row.map((p) => (
                <li key={p.key} className="w-[5.25rem] sm:w-[7.5rem]">
                  <a
                    href={ROLE[role].href}
                    className="group flex flex-col items-center gap-[6px] rounded-xl px-[2px] py-[6px] sm:px-[4px] text-center transition-colors hover:bg-white/[0.04]"
                  >
                    {p.img ? (
                      <Image src={p.img} alt="" width={112} height={112} className="h-12 w-12 rounded-full sm:h-14 sm:w-14 object-cover ring-1 ring-white/15 transition group-hover:ring-white/40" />
                    ) : (
                      <span aria-hidden className={`flex h-12 w-12 items-center sm:h-14 sm:w-14 justify-center rounded-full bg-white/[0.06] ring-1 ring-white/15 ${META} font-bold text-white/80 transition group-hover:ring-white/40`}>
                        {t(p.name).trim().charAt(0)}
                      </span>
                    )}
                    <span className={`break-keep ${META} font-semibold leading-snug text-white ${SHADOW}`}>{t(p.name)}</span>
                    {p.org && <span className={`-mt-[4px] break-keep ${META} leading-snug text-white/80 ${SHADOW}`}>{t(p.org)}</span>}
                    <span className={`-mt-[4px] break-keep ${META} leading-snug text-white/65 ${SHADOW}`}>{p.roles.map((r) => t(ROLE[r].label)).join(", ")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
