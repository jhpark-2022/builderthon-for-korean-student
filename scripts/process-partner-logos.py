#!/usr/bin/env python3
"""
One-off: turn brand logos from the shared CI folder into the partner-wall
convention — WHITE MONO on TRANSPARENT, natural aspect ratio (not squared),
matching the files already in public/partners/logos/white/.

Two source shapes are handled:
  • "dark"  — a dark mark on a white/transparent sheet (L^IFE). Alpha comes
              straight from darkness, so outlines and counters survive.
  • "color" — a multicolour mark on a flat light background (싱가포르 한인회).
              Alpha comes from each pixel's colour distance to the sampled
              background, then everything surviving is flattened to white.

Both are trimmed to the alpha bbox and downscaled so the long edge is 900px —
these render ~40px tall, so anything larger is wasted bytes.

    python3 scripts/process-partner-logos.py
"""
from PIL import Image
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CI = ROOT.parent / "CI"
OUT = ROOT / "public" / "partners" / "logos" / "white"

MAX_EDGE = 900
LO, HI = 40, 110  # colour-distance → alpha ramp, for the "color" mode

# source filename → (output slug, mode)
JOBS = [
    ("life_logo.png", "life.png", "dark"),
    ("싱가포르 한인회.jpg", "korean-association.png", "color"),
]


def from_dark(im):
    """Dark-on-light sheet → alpha = darkness (transparent pixels stay out)."""
    rgba = np.asarray(im.convert("RGBA")).astype(int)
    lum = rgba[:, :, :3].mean(axis=2)
    alpha = np.clip(255 - lum, 0, 255) * (rgba[:, :, 3] / 255.0)
    return alpha


def from_color(im):
    """Colour mark on a flat bg → alpha = distance from the sampled bg colour."""
    a = np.asarray(im.convert("RGB")).astype(int)
    h, w, _ = a.shape
    corners = np.array([a[0, 0], a[0, w - 1], a[h - 1, 0], a[h - 1, w - 1]])
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    return np.clip((dist - LO) / (HI - LO), 0.0, 1.0) * 255.0


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for src, out, mode in JOBS:
        im = Image.open(CI / src)
        alpha = (from_dark if mode == "dark" else from_color)(im)
        h, w = alpha.shape
        # white mono is fully described by alpha → store as LA (L=255 + alpha)
        img = Image.fromarray(
            np.dstack([np.full((h, w), 255, np.uint8), alpha.astype(np.uint8)]), "LA"
        )
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        w, h = img.size
        if max(w, h) > MAX_EDGE:
            s = MAX_EDGE / max(w, h)
            img = img.resize((round(w * s), round(h * s)), Image.LANCZOS)
        dst = OUT / out
        img.save(dst, "PNG", optimize=True)
        print(f"  {src:24s} -> {out:24s} {img.size[0]}x{img.size[1]}  "
              f"{dst.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
