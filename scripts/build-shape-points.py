#!/usr/bin/env python3
"""
기슭 형상의 점 집합을 굽습니다 (2026-09-17, 배경 형상 브리프).

    python3 scripts/build-shape-points.py

입력
  public/naru/naru-symbol.svg                 싱가포르 본섬. 로고 심볼의 섬 패스(M/L/Z 스물한 꼭짓점).
                                              남쪽 해안의 주황 점은 가져오지 않습니다.
  scripts/data/seoul-kostat-2013.geojson      서울특별시 행정 경계. 통계청 센서스용 행정구역경계(2013)를
                                              southkorea/southkorea-maps가 GeoJSON으로 정리한 것에서
                                              서울 피처 하나만 떼어 둔 파일(7,700 꼭짓점).
                                              출처·라이선스는 lib/background/shapes/README.md.
출력
  lib/background/shapes/singapore.ts, seoul.ts   Float32Array [x, y, edge, phase] × 2,000.
                                              x·y는 형상의 바운딩 박스 너비를 [-1, 1]에 맞춘 값(북쪽이 +y),
                                              edge는 가장자리 점이면 1, 속이면 0.
                                              순서는 가장자리 먼저(섞음), 그다음 속(섞음). 런타임은 앞에서부터
                                              particles / 2 개만 씁니다. 폰의 450점으로도 윤곽이 남습니다.

방법
  1. 서울은 Douglas-Peucker로 60~90 꼭짓점까지 단순화(목표 80). 경도에 cos(위도)를 곱해
     동서 축척을 맞춥니다. 싱가포르는 SVG 좌표 그대로(y는 아래가 +라 뒤집습니다).
  2. 512×512에 래스터라이즈(여백 6%). 윤곽에서 안쪽으로 바운딩 박스 너비의 6% 이내가
     "가장자리"(MinFilter 침식으로 구함).
  3. 푸아송 디스크(Bridson). 가장자리 반지름 r, 속은 r·√3(밀도 1/3). r은 총 2,000점이
     되도록 이분 탐색.
  4. 두 형상 모두 같은 너비로 정규화합니다. 실제 크기 비율은 무시합니다(브리프 1).
"""
from __future__ import annotations

import json
import math
import random
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "public/naru/naru-symbol.svg"
SEOUL = ROOT / "scripts/data/seoul-kostat-2013.geojson"
OUT = ROOT / "lib/background/shapes"
N_POINTS = 2000
CANVAS = 512
MARGIN = 0.06
# DECIDED 2026-09-17 (배경 수정 브리프): 띠 폭 6% → 3%, 가장자리 점 비율 75%. 6%에서는
# 두꺼운 테두리로 보였고 선처럼 읽히려면 띠가 좁아야 합니다. 밀도 배수는 상수가
# 아니라 띠 넓이에서 역산합니다(띠가 좁을수록 밀도가 높아야 75%가 나옵니다).
EDGE_FRAC = 0.03      # 바운딩 박스 너비 대비 가장자리 띠
EDGE_SHARE = 0.75     # 전체 점 중 가장자리 점의 비율(어느 접두사를 잘라도 같게 섞음)
DP_TARGET = (60, 90)  # 서울 단순화 꼭짓점 범위
SEED = 20260917


# ── 입력 ─────────────────────────────────────────────────────────────────────
def singapore_ring() -> list[tuple[float, float]]:
    d = re.search(r'<path d="([^"]+)"', SVG.read_text()).group(1)
    nums = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", d)]
    pts = [(nums[i], -nums[i + 1]) for i in range(0, len(nums), 2)]  # SVG y는 아래가 +. 뒤집어 북쪽을 +y로.
    return pts


def seoul_ring() -> list[tuple[float, float]]:
    g = json.loads(SEOUL.read_text())
    geom = g["features"][0]["geometry"] if g.get("type") == "FeatureCollection" else g["geometry"]
    ring = geom["coordinates"][0] if geom["type"] == "Polygon" else geom["coordinates"][0][0]
    lat0 = sum(p[1] for p in ring) / len(ring)
    k = math.cos(math.radians(lat0))
    return [(p[0] * k, p[1]) for p in ring]


# ── Douglas-Peucker ─────────────────────────────────────────────────────────
def _dist(p, a, b):
    ax, ay = a; bx, by = b; px, py = p
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def dp(points, eps):
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    idx, dmax = 0, 0.0
    for i in range(1, len(points) - 1):
        d = _dist(points[i], a, b)
        if d > dmax:
            idx, dmax = i, d
    if dmax > eps:
        return dp(points[: idx + 1], eps)[:-1] + dp(points[idx:], eps)
    return [a, b]


def simplify_closed(ring, target=DP_TARGET):
    # 닫힌 고리는 가장 먼 두 점으로 반을 갈라 각각 단순화합니다.
    if ring[0] == ring[-1]:
        ring = ring[:-1]
    far = max(range(len(ring)), key=lambda i: math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]))
    half1, half2 = ring[: far + 1], ring[far:] + [ring[0]]
    xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
    span = max(max(xs) - min(xs), max(ys) - min(ys))
    lo, hi = 0.0, span
    best = None
    for _ in range(60):
        eps = (lo + hi) / 2
        out = dp(half1, eps)[:-1] + dp(half2, eps)[:-1]
        n = len(out)
        if target[0] <= n <= target[1]:
            best = out; break
        if n > target[1]:
            lo = eps
        else:
            hi = eps
        best = out
    return best


# ── 래스터 ───────────────────────────────────────────────────────────────────
def rasterize(ring):
    xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    w, h = maxx - minx, maxy - miny
    usable = CANVAS * (1 - 2 * MARGIN)
    scale = usable / w                      # 너비를 기준으로 맞춥니다(두 형상이 같은 너비)
    off_x = CANVAS * MARGIN
    off_y = (CANVAS - h * scale) / 2        # 세로는 가운데
    px = [((x - minx) * scale + off_x, CANVAS - (off_y + (y - miny) * scale)) for x, y in ring]  # 화면 y는 아래가 +
    img = Image.new("L", (CANVAS, CANVAS), 0)
    ImageDraw.Draw(img).polygon(px, fill=255)
    return img, (minx, maxx, miny, maxy), scale, off_x, off_y


def edge_mask(mask, band_px):
    k = 2 * band_px + 1
    eroded = mask.filter(ImageFilter.MinFilter(k))
    return mask, eroded  # 가장자리 = mask − eroded


# ── 푸아송 디스크 (Bridson) ─────────────────────────────────────────────────
def poisson(inside, radius_of, rng, size=CANVAS):
    """inside(x, y) -> bool, radius_of(x, y) -> r. 반지름이 자리마다 다른 Bridson."""
    cell = max(1.0, min(radius_of(x, y) for x in range(0, size, 32) for y in range(0, size, 32) if True) / math.sqrt(2))
    grid = {}
    pts, active = [], []

    def ok(p):
        r = radius_of(*p)
        gx, gy = int(p[0] / cell), int(p[1] / cell)
        span = int(math.ceil(r / cell)) + 1
        for i in range(gx - span, gx + span + 1):
            for j in range(gy - span, gy + span + 1):
                for q in grid.get((i, j), ()):
                    if math.hypot(p[0] - q[0], p[1] - q[1]) < min(r, radius_of(*q)):
                        return False
        return True

    def add(p):
        pts.append(p); active.append(p)
        grid.setdefault((int(p[0] / cell), int(p[1] / cell)), []).append(p)

    # 시작점 여러 개(형상이 여러 조각일 수 있음)
    for _ in range(4000):
        p = (rng.uniform(0, size), rng.uniform(0, size))
        if inside(*p) and ok(p):
            add(p)
            if len(pts) >= 12:
                break
    while active:
        i = rng.randrange(len(active))
        base = active[i]
        r = radius_of(*base)
        found = False
        for _ in range(24):
            ang = rng.uniform(0, 2 * math.pi)
            rad = rng.uniform(r, 2 * r)
            p = (base[0] + rad * math.cos(ang), base[1] + rad * math.sin(ang))
            if 0 <= p[0] < size and 0 <= p[1] < size and inside(*p) and ok(p):
                add(p); found = True
                break
        if not found:
            active.pop(i)
    return pts


def sample(mask, eroded, rng):
    m = mask.load(); e = eroded.load()
    inside = lambda x, y: m[int(x), int(y)] > 0
    is_edge = lambda x, y: e[int(x), int(y)] == 0
    # 띠와 속의 넓이에서 밀도 배수를 역산합니다. 점 밀도 ∝ 1/r².
    area_all = sum(1 for v in mask.getdata() if v)
    area_in = sum(1 for v in eroded.getdata() if v)
    area_edge = max(area_all - area_in, 1)
    density_ratio = (EDGE_SHARE / area_edge) / ((1 - EDGE_SHARE) / max(area_in, 1))

    def run(r_edge):
        r_in = r_edge * math.sqrt(density_ratio)
        radius_of = lambda x, y: r_edge if is_edge(x, y) else r_in
        return poisson(inside, radius_of, rng)

    lo, hi = 1.5, 20.0
    best = None
    for _ in range(14):
        r = (lo + hi) / 2
        rng.seed(SEED)
        pts = run(r)
        if abs(len(pts) - N_POINTS) < 25:
            best = pts; break
        if len(pts) > N_POINTS:
            lo = r
        else:
            hi = r
        best = pts
    edge = [p for p in best if is_edge(*p)]
    inner = [p for p in best if not is_edge(*p)]
    rng.seed(SEED + 1); rng.shuffle(edge); rng.shuffle(inner)
    return edge, inner


def arc_phase(ring):
    """가장자리 점의 위상: 단순화한 고리를 따라 간 호 길이 비율(0..1). 윤곽을 따라
    흐르는 빛(셰이더)이 이 값을 씁니다. 속 점은 중심 기준 각도 비율."""
    pts = ring[:-1] if ring[0] == ring[-1] else ring
    segs = []
    total = 0.0
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        segs.append((a, b, total, L)); total += L
    cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)

    def of(p, edge):
        if not edge:
            return (math.atan2(p[1] - cy, p[0] - cx) / (2 * math.pi)) % 1.0
        best = None
        for a, b, s0, L in segs:
            if L == 0:
                continue
            t = max(0.0, min(1.0, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (L * L)))
            q = (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))
            d = math.hypot(p[0] - q[0], p[1] - q[1])
            if best is None or d < best[0]:
                best = (d, (s0 + t * L) / total)
        return best[1]
    return of


def normalize(pts, edge_flag, scale, off_x, off_y, bbox, phase_of):
    minx, maxx, miny, maxy = bbox
    w = maxx - minx
    cx_px = off_x + w * scale / 2
    cy_px = CANVAS - (off_y + (maxy - miny) * scale / 2)
    half = w * scale / 2
    out = []
    for x, y in pts:
        nx, ny = (x - cx_px) / half, -(y - cy_px) / half
        out.append((nx, ny, edge_flag, phase_of((nx, ny), edge_flag)))
    return out


def interleave(edge, inner, share):
    """어느 접두사를 잘라 써도 가장자리 비율이 share가 되도록 섞습니다(폰은 앞 300점,
    데스크톱은 앞 900점만 씁니다)."""
    out = []
    ei = ii = 0
    while ei < len(edge) or ii < len(inner):
        want_edge = (len(out) + 1) * share > ei
        if (want_edge and ei < len(edge)) or ii >= len(inner):
            out.append(edge[ei]); ei += 1
        else:
            out.append(inner[ii]); ii += 1
    return out


def emit(name: str, label: str, tris, aspect: float, meta: str):
    flat = []
    for x, y, e, ph in tris:
        flat += [round(x, 3), round(y, 3), float(e), round(ph, 3)]
    body = ",".join(f"{v:g}" for v in flat)
    ts = f'''// 자동 생성. 손으로 고치지 마세요. scripts/build-shape-points.py가 만듭니다.
// {meta}
// [x, y, edge, phase] × {len(tris)}. x·y는 너비를 [-1, 1]에 맞춘 값, 북쪽이 +y. edge 1 = 가장자리.
// phase: 가장자리 점은 윤곽을 따라 간 호 길이 비율(0..1), 속 점은 중심 기준 각도 비율.
// 순서: 가장자리 {int(EDGE_SHARE * 100)}% · 속 {int((1 - EDGE_SHARE) * 100)}%가 어느 접두사에서도 유지되게 섞음.
export const {name}_STRIDE = 4;
export const {name}_ASPECT = {aspect:.4f}; // 높이 / 너비
export const {name}_POINTS = new Float32Array([{body}]);
'''
    (OUT / f"{label}.ts").write_text(ts)
    print(label, len(tris), "points, aspect", round(aspect, 4), "size", len(ts) // 1024, "KB")


def build(label, name, ring, meta):
    rng = random.Random(SEED)
    mask, bbox, scale, off_x, off_y = rasterize(ring)
    band = int(EDGE_FRAC * (bbox[1] - bbox[0]) * scale)
    _, eroded = edge_mask(mask, band)
    edge, inner = sample(mask, eroded, rng)
    # 위상은 정규화 좌표계의 고리에서 잽니다.
    ring_n = normalize([(off_x + (x - bbox[0]) * scale, CANVAS - (off_y + (y - bbox[2]) * scale)) for x, y in ring], 1, scale, off_x, off_y, bbox, lambda p, e: 0.0)
    phase_of = arc_phase([(p[0], p[1]) for p in ring_n])
    tris = interleave(normalize(edge, 1, scale, off_x, off_y, bbox, phase_of), normalize(inner, 0, scale, off_x, off_y, bbox, phase_of), EDGE_SHARE)
    tris = tris[:N_POINTS]
    aspect = (bbox[3] - bbox[2]) / (bbox[1] - bbox[0])
    print(f"{label}: ring {len(ring)} vertices, edge band {band}px, edge {len(edge)} / inner {len(inner)}")
    emit(name, label, tris, aspect, meta)
    # 확인용 PNG
    prev = Image.new("RGB", (CANVAS, CANVAS), (7, 11, 31))
    d = ImageDraw.Draw(prev)
    for x, y, e, _ph in tris:
        px = off_x + (bbox[1] - bbox[0]) * scale / 2 + x * (bbox[1] - bbox[0]) * scale / 2
        py = CANVAS - (off_y + (bbox[3] - bbox[2]) * scale / 2) - y * (bbox[1] - bbox[0]) * scale / 2
        c = (201, 155, 180) if e else (107, 78, 158)
        d.ellipse((px - 1.2, py - 1.2, px + 1.2, py + 1.2), fill=c)
    prev.save(OUT / f"{label}-preview.png")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sg = singapore_ring()
    build("singapore", "SINGAPORE", sg, "출처: public/naru/naru-symbol.svg의 섬 패스(로고 심볼, 21 꼭짓점). 주황 점 제외.")
    se_raw = seoul_ring()
    se = simplify_closed(se_raw)
    build("seoul", "SEOUL", se, f"출처: 통계청 센서스용 행정구역경계 2013 (southkorea/southkorea-maps GeoJSON), 서울특별시. Douglas-Peucker {len(se_raw)} → {len(se)} 꼭짓점. 경도에 cos(위도) 보정.")


if __name__ == "__main__":
    main()
