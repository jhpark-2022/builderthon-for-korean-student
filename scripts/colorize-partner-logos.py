#!/usr/bin/env python3
"""
12월 "함께하는 곳"의 로고를 원래 색으로 (2026-10-21, 사용자: "로고들의 색감을 살려줘").

흰색 단색(process-partner-logos.py)과 달리 색을 남깁니다. 다만 사이트 바탕이 어두운 남색이라
그대로 두면 검정, 남색 글자가 사라집니다. 그래서 픽셀마다:
  - 채도가 낮거나(검정, 회색) 아주 어두우면 흰색으로 바꿉니다.
  - 색이 있으면 색상과 채도는 두고, 밝기만 MIN_L 아래면 MIN_L까지 올립니다(남색은 밝은 파랑 틴트, 짙은 초록은 초록 틴트).
밝은 판은 깔지 않습니다(어두운 바탕에 밝은 판 금지, 2026-10-08).

바탕 지우기: 투명 바탕 원본은 그 알파를 쓰고, 흰 바탕 원본은 흰색과의 거리로 알파를 만든 뒤
그 알파로 흰색을 걷어 낸 색을 되돌립니다(가장자리에 흰 테가 남지 않게).

    python3 scripts/colorize-partner-logos.py
"""
import colorsys
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CI_DEC = ROOT.parent.parent / "12월 빌더톤" / "CI"
LOGOS = ROOT / "public" / "partners" / "logos"
OUT = LOGOS / "color"
MAX_EDGE = 900
LO, HI = 30, 110      # 흰색과의 거리 → 알파
SAT_MIN = 0.22        # 이보다 채도가 낮으면 무채색으로 보고 흰색
DARK_V = 0.18         # 이보다 어두우면 색이 있어도 흰색(검정에 가까운 잉크)
MIN_L = 0.66          # 색이 있는 픽셀의 최소 밝기(HLS의 L)

JOBS = [
    # 같은 날 메인 후원과 장소도 색으로 해 봤다가 "너무 잘 안보이내"로 흰색 단색에 되돌렸습니다. 원래 색은 이 둘과
    # 크라이치즈버거(손으로 바깥 흰 바탕만 지운 파일, public/partners/logos/color/crycheeseburger.png)에만 씁니다.
    (CI_DEC / "Lovable.png", "lovable.png"),
    (CI_DEC / "Bloom.png", "bloom.png"),
]


def load(path: Path) -> Image.Image:
    if path.suffix == ".svg":
        # macOS Quick Look으로 래스터화합니다(흰 바탕 정사각형으로 나옵니다).
        tmp = Path(tempfile.mkdtemp())
        subprocess.run(["qlmanage", "-t", "-s", "1600", "-o", str(tmp), str(path)], capture_output=True, check=True)
        return Image.open(tmp / (path.name + ".png")).convert("RGBA")
    return Image.open(path).convert("RGBA")


def cut_background(im: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    a = np.asarray(im).astype(float)
    rgb, alpha = a[:, :, :3], a[:, :, 3] / 255.0
    if (alpha < 0.5).mean() > 0.1:
        # 투명 바탕 원본: 그 알파가 곧 모양입니다.
        return rgb, alpha
    # 흰 바탕: 흰색과의 거리 → 알파, 그리고 흰색을 걷어 낸 색으로 되돌림
    dist = np.sqrt(((255 - rgb) ** 2).sum(axis=2))
    alpha = np.clip((dist - LO) / (HI - LO), 0, 1)
    safe = np.where(alpha > 0.01, alpha, 1)[:, :, None]
    rgb = np.clip((rgb - (1 - alpha[:, :, None]) * 255) / safe, 0, 255)
    return rgb, alpha


def recolor(rgb: np.ndarray) -> np.ndarray:
    out = np.empty_like(rgb)
    flat_in = rgb.reshape(-1, 3) / 255.0
    flat_out = out.reshape(-1, 3)
    for i, (r, g, b) in enumerate(flat_in):
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        v = max(r, g, b)
        sat_v = 0 if v == 0 else (v - min(r, g, b)) / v
        if sat_v < SAT_MIN or v < DARK_V:
            flat_out[i] = (255, 255, 255)
            continue
        l = max(l, MIN_L)
        r2, g2, b2 = colorsys.hls_to_rgb(h, l, s)
        flat_out[i] = (r2 * 255, g2 * 255, b2 * 255)
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for src, out in JOBS:
        im = load(src)
        if max(im.size) > 1600:
            k = 1600 / max(im.size)
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        rgb, alpha = cut_background(im)
        rgb = recolor(rgb)
        img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
        bbox = Image.fromarray((alpha * 255).astype(np.uint8)).point(lambda p: 255 if p > 8 else 0).getbbox()
        if bbox:
            img = img.crop(bbox)
        if max(img.size) > MAX_EDGE:
            k = MAX_EDGE / max(img.size)
            img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
        img.save(OUT / out, "PNG", optimize=True)
        print(f"  {out:20s} {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    main()
