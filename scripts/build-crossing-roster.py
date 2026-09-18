#!/usr/bin/env python3
# 크로싱서울_신청자_명단.docx 생성기 (2026-09-18, Supabase 등록 브리프 2.6).
#
# Supabase의 crossing_participants 뷰를 읽어 운영용 명단 문서를 만든다. 8월 스크립트
# (build-applicant-roster.py)와 공통 부분은 roster_lib.py에서 가져온다.
#
#   python3 scripts/build-crossing-roster.py
#
# 자격증명은 website/.env.local의 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
# service_role 키라 RLS를 우회한다. 절대 브라우저로 넘기지 말 것.
# answers jsonb는 data/crossingForm.ts의 스키마 순서로 열을 펼친다(아래 FORM_KEYS).
# 결과 docx는 레포에 커밋하지 않는다.

import json
import os
import re
import sys
from collections import OrderedDict
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from roster_lib import REPO, KST, EM, NO_ENTRY, load_env, fetch, kst, ranked, add_table, open_doc  # noqa: E402

EVENT = "crossing-seoul-2026-12"
# TODO: confirm. 명단 문서 경로.
OUT = Path(os.environ["ROSTER_OUT"]) if os.environ.get("ROSTER_OUT") else (
    REPO.parent.parent / "12월 빌더톤" / "Execution" / "Tracking" / "크로싱서울_신청자_명단.docx"
)
COUNTRY = {"KR": "한국", "SG": "싱가포르"}


def form_keys():
    """data/crossingForm.ts에서 fixed가 아닌 질문의 (scope, key, ko 라벨)을 스키마 순서로 읽는다."""
    src = (REPO / "data" / "crossingForm.ts").read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r'\{\s*key:\s*"([^"]+)",\s*scope:\s*"(registration|member)",[^}]*?label:\s*\{\s*ko:\s*"([^"]*)"', src, flags=re.S):
        block = m.group(0)
        if "fixed: true" in block:
            continue
        out.append((m.group(2), m.group(1), m.group(3)))
    return out


def main():
    url, key = load_env()
    rows = fetch(url, key, f"crossing_participants?select=*&event_slug=eq.{EVENT}&order=created_at.asc,ordinal.asc")
    keys = form_keys()
    reg_keys = [(k, l) for s, k, l in keys if s == "registration"]
    mem_keys = [(k, l) for s, k, l in keys if s == "member"]

    regs = OrderedDict()
    for r in rows:
        g = regs.setdefault(r["registration_id"], {"rows": [], **{k: r[k] for k in ("created_at", "join_type", "team_name", "wants_matching", "consent_at", "registration_answers")}})
        g["rows"].append(r)
    for no, g in enumerate(regs.values(), 1):
        g["no"] = no
        for m in g["rows"]:
            m["role"] = "대표" if m["ordinal"] == 1 else f"팀원{m['ordinal'] - 1}"
    people = [m for g in regs.values() for m in g["rows"]]

    def ans(d, k):
        v = (d or {}).get(k)
        if v is True:
            return "예"
        if v in (None, "", False):
            return ""
        return str(v)

    doc = open_doc(OUT)
    doc.add_paragraph("크로싱 서울 신청자 명단", style="Title")
    now = datetime.now(KST).strftime("%Y년 %m월 %d일 %H:%M")
    doc.add_paragraph(f"추출 시각: {now} (KST){EM}신청 건수 {len(regs)}건{EM}명단 인원 {len(people)}명")

    solo = sum(1 for g in regs.values() if g.get("join_type") != "team")
    team = len(regs) - solo
    matching = sum(1 for g in regs.values() if g.get("wants_matching"))
    countries = ranked([(COUNTRY.get(p.get("study_country") or "", p.get("study_country") or NO_ENTRY), i) for i, p in enumerate(people)])
    unis = ranked([((p.get("university") or "").strip() or NO_ENTRY, i) for i, p in enumerate(people)])

    doc.add_paragraph("1. 요약 통계", style="Heading 1")
    add_table(doc, ["구분", "값"], [
        ["총 신청 건수", f"{len(regs)}건"],
        ["명단 인원", f"{len(people)}명"],
        ["참가 유형", f"개인 {solo}건, 팀 {team}건"],
        ["팀 매칭 희망", f"{matching}건"],
        ["공부하는 나라", ", ".join(f"{k} {v}명" for k, v in countries) or "-"],
        ["학교", ", ".join(f"{k} {v}명" for k, v in unis) or "-"],
        ["최초 신청", kst(next(iter(regs.values()))["created_at"]) if regs else "-"],
        ["최근 신청", kst(list(regs.values())[-1]["created_at"]) if regs else "-"],
    ])

    doc.add_paragraph("2. 참가자 전체 명단 (1인 1행)", style="Heading 1")
    headers = ["No", "신청번호", "유형", "팀명", "역할", "이름", "이메일", "카카오톡 ID", "학교", "나라", "링크드인"] + [l for _, l in mem_keys] + [l for _, l in reg_keys] + ["신청일시", "비고"]
    add_table(doc, headers, [
        [i, regs[p["registration_id"]]["no"], "팀" if p.get("join_type") == "team" else "개인", p.get("team_name") or "-", p["role"],
         p["name"], p["email"], p["contact"], p.get("university") or "", COUNTRY.get(p.get("study_country") or "", p.get("study_country") or ""), p.get("linkedin") or "-"]
        + [ans(p.get("member_answers"), k) for k, _ in mem_keys]
        + [ans(p.get("registration_answers"), k) for k, _ in reg_keys]
        + [kst(p["created_at"]), ""]
        for i, p in enumerate(people, 1)
    ])

    doc.add_paragraph("3. 일괄 발송용 목록", style="Heading 1")
    emails, seen = [], set()
    for p in people:
        k = (p.get("email") or "").strip().lower()
        if k and k not in seen:
            seen.add(k); emails.append(p["email"])
    doc.add_paragraph("이메일 (쉼표 구분)", style="Heading 2")
    doc.add_paragraph(", ".join(emails))
    doc.add_paragraph(f"고유 이메일 {len(emails)}개")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(OUT))
    print(f"{OUT.name}: 신청 {len(regs)}건 / 명단 {len(people)}명 → {OUT}")


if __name__ == "__main__":
    main()
