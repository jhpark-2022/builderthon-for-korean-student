#!/usr/bin/env python3
# 크로싱서울_팀매칭판.docx 생성기 (2026-10-08, 현장 팀 매칭 브리프 6).
#
# Supabase의 crossing_match_board 뷰(/match에서 올라온 이름, 나라, AI 유형, 역할, 선호 트랙 순위)를 읽어
# 운영진용 매칭판을 만든다.
#
#   python3 scripts/build-match-board.py
#
#   표 1  역할(plan/dev/design/growth) x 나라별 인원
#   표 2  팀 제안. 3~4명, 한 팀 안에 역할이 겹치지 않게, 한국과 그 밖의 나라가 섞이게, 서로의 궁합 유형과
#         1순위 트랙이 같으면 우선. **제안일 뿐이고 최종 배정은 운영진이 한다.**
#   표 3  전체 명단(유형, 모델, 역할, 선호 트랙 순위)
#   표 4  겹친 이름(있을 때만). 같은 이름과 나라로 올라온 행이 여럿이면 가장 새것만 남기고 여기에 적는다.
#         한 사람이 브라우저 둘(카카오톡 인앱, Safari)에서 올리면 기기 토큰이 달라 두 행이 된다. 이름만 같은
#         다른 사람일 수도 있으니 운영진이 이 표를 보고 확인한다. 뷰에 id, created_at(마이그레이션 0007)이 있으면
#         같이 적고, 없어도 돈다.
#
# 자격증명은 website/.env.local의 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY(service_role, RLS 우회).
# 결과 docx는 레포 밖에 두고 커밋하지 않는다. 사람 이름은 그 파일에만 들어간다: 이 스크립트는 화면에
# 이름을 찍지 않는다(건수만).

import os
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from roster_lib import REPO, KST, EM, load_env, fetch, kst, add_table, open_doc  # noqa: E402

OUT = Path(os.environ["MATCH_BOARD_OUT"]) if os.environ.get("MATCH_BOARD_OUT") else (
    REPO.parent.parent / "12월 빌더톤" / "Execution" / "Tracking" / "크로싱서울_팀매칭판.docx"
)
TEAM_SIZE = 4
ROLES = ["plan", "dev", "design", "growth"]
ROLE_KO = {"plan": "기획", "dev": "개발", "design": "디자인", "growth": "그로스"}
COUNTRY = {"KR": "한국", "SG": "싱가포르"}


def match_map():
    """data/quiz.ts에서 유형별 궁합 유형 둘을 읽는다(12월판도 궁합 구조는 8월과 같다)."""
    src = (REPO / "data" / "quiz.ts").read_text(encoding="utf-8")
    return {m.group(1): re.findall(r'"([A-Z]{4})"', m.group(2))
            for m in re.finditer(r'mbti:\s*"([A-Z]{4})"[\s\S]*?match:\s*\[([^\]]*)\]', src)}


def track_labels():
    """data/matchTracks.ts의 {id: 한국어 이름}. 목록이 비어 있으면 {}."""
    src = (REPO / "data" / "matchTracks.ts").read_text(encoding="utf-8")
    body = src[src.index("export const MATCH_TRACKS"):]
    return dict(re.findall(r'\{\s*id:\s*"([^"]+)",\s*label:\s*\{\s*ko:\s*"([^"]*)"', body))


def dedupe(rows):
    """같은 (이름, 나라)는 updated_at이 가장 새것 하나만. (남긴 사람들, 겹친 묶음들)을 돌려준다."""
    groups = {}
    for r in rows:
        key = (" ".join(str(r["name"]).split()).casefold(), r["study_country"])
        groups.setdefault(key, []).append(r)
    kept, collisions = [], []
    for g in groups.values():
        g.sort(key=lambda r: r.get("updated_at") or "", reverse=True)
        kept.append(g[0])
        if len(g) > 1:
            collisions.append(g)
    kept.sort(key=lambda r: (r["role_key"], r["study_country"], r["name"]))
    return kept, collisions


def propose(people, matches):
    """팀 제안. 드문 역할부터 한 사람씩, 점수가 가장 높은 팀에 넣는다."""
    n = len(people)
    if n == 0:
        return []
    teams = [[] for _ in range(max(1, -(-n // TEAM_SIZE)))]
    rarity = Counter(p["role_key"] for p in people)
    order = sorted(people, key=lambda p: (rarity[p["role_key"]], p["study_country"] == "KR", p["name"]))

    def score(team, p):
        if len(team) >= TEAM_SIZE:
            return None
        s = 0
        s += 3 if all(q["role_key"] != p["role_key"] for q in team) else -2
        if team:
            kr = [q["study_country"] == "KR" for q in team]
            mixed = any(kr) and not all(kr)
            s += 2 if (not mixed and (p["study_country"] == "KR") != kr[0]) else 0
            s += sum((q["mbti"] in matches.get(p["mbti"], [])) + (p["mbti"] in matches.get(q["mbti"], [])) for q in team)
            top = (p.get("track_ranking") or [None])[0]
            s += sum(1 for q in team if top and (q.get("track_ranking") or [None])[0] == top)
        return (s, -len(team))  # 같은 점수면 사람이 적은 팀부터

    for p in order:
        best = max((i for i in range(len(teams)) if score(teams[i], p) is not None), key=lambda i: score(teams[i], p))
        teams[best].append(p)
    return [t for t in teams if t]


def main():
    url, key = load_env()
    raw = fetch(url, key, "crossing_match_board?select=*")
    people, collisions = dedupe(raw)
    matches = match_map()
    tracks = track_labels()

    def country(c):
        return COUNTRY.get(c, c)

    def ranking(p):
        r = p.get("track_ranking") or []
        return " > ".join(tracks.get(t, t) for t in r) if r else ("-" if tracks else "(트랙 미정)")

    doc = open_doc(OUT)
    doc.add_paragraph("크로싱 서울 팀 매칭판", style="Title")
    now = datetime.now(KST).strftime("%Y년 %m월 %d일 %H:%M")
    doc.add_paragraph(f"추출 시각: {now} (KST){EM}올라온 사람 {len(people)}명")

    doc.add_paragraph("1. 역할과 나라별 인원", style="Heading 1")
    countries = sorted({p["study_country"] for p in people}, key=lambda c: (c != "KR", c != "SG", c))
    rows = [[ROLE_KO[r]] + [sum(1 for p in people if p["role_key"] == r and p["study_country"] == c) for c in countries]
            + [sum(1 for p in people if p["role_key"] == r)] for r in ROLES]
    rows.append(["합계"] + [sum(1 for p in people if p["study_country"] == c) for c in countries] + [len(people)])
    add_table(doc, ["역할"] + [country(c) for c in countries] + ["합계"], rows)

    doc.add_paragraph("2. 팀 제안 (제안일 뿐이고 최종 배정은 운영진이 합니다)", style="Heading 1")
    doc.add_paragraph("3~4명, 한 팀 안에 역할이 겹치지 않게, 한국과 그 밖의 나라가 섞이게, 궁합 유형과 1순위 트랙이 같으면 우선.")
    teams = propose(people, matches)
    trows = []
    for i, team in enumerate(teams, 1):
        roles = [q["role_key"] for q in team]
        kr = [q["study_country"] == "KR" for q in team]
        notes = []
        if len(set(roles)) < len(roles):
            notes.append("역할 겹침")
        if len(team) > 1 and (all(kr) or not any(kr)):
            notes.append("한 나라뿐")
        if len(team) < 3:
            notes.append("인원 부족")
        for q in team:
            trows.append([i, q["name"], country(q["study_country"]), ROLE_KO[q["role_key"]], f'{q["mbti"]}-{q["identity"]}', q["model"], ranking(q), ", ".join(notes)])
    add_table(doc, ["팀", "이름", "나라", "역할", "유형", "AI 모델", "선호 트랙 순위", "확인할 것"], trows)

    doc.add_paragraph("3. 전체 명단", style="Heading 1")
    add_table(doc, ["No", "이름", "나라", "역할", "유형", "AI 모델", "선호 트랙 순위", "올린 시각"], [
        [i, p["name"], country(p["study_country"]), ROLE_KO[p["role_key"]], f'{p["mbti"]}-{p["identity"]}', p["model"], ranking(p), kst(p["updated_at"])]
        for i, p in enumerate(people, 1)
    ])

    if collisions:
        doc.add_paragraph("4. 겹친 이름 (가장 새로 올린 행만 위 표에 썼습니다)", style="Heading 1")
        doc.add_paragraph("같은 이름과 나라로 올라온 행입니다. 한 사람이 브라우저 둘에서 올렸는지, 이름이 같은 다른 사람인지 확인해 주세요.")
        crow = []
        for g in collisions:
            for j, q in enumerate(g):
                crow.append([q["name"], country(q["study_country"]), f'{q["mbti"]}-{q["identity"]}', ROLE_KO[q["role_key"]],
                             kst(q["created_at"]) if q.get("created_at") else "-", kst(q["updated_at"]),
                             str(q["id"])[:8] if q.get("id") else "-", "씀" if j == 0 else "뺌"])
        add_table(doc, ["이름", "나라", "유형", "역할", "처음 올린 시각", "고친 시각", "행 id", "처리"], crow)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(OUT))
    flagged = sum(1 for r in trows if r[-1])
    print(f"{OUT.name}: {len(people)}명(올라온 행 {len(raw)}개, 겹친 이름 {len(collisions)}묶음에서 {len(raw) - len(people)}행 뺌), "
          f"팀 제안 {len(teams)}개, 확인할 것이 붙은 줄 {flagged}개 → {OUT.parent}")


if __name__ == "__main__":
    main()
