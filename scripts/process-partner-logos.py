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

Second job: build the marquee's copies. The logo band sizes every mark with the
same `max-h-10 / max-w-[82%]` box, so a logo that ships with transparent padding
baked into its canvas renders visibly smaller than a tightly-cropped neighbour
(Brand Boost filled 40%x30% of its file; the zero100 WebPs fill ~100%). The band
therefore reads from white/trimmed/, which is the same art cropped to its alpha
bounding box so every mark fills its tile the same way. The partner wall above
keeps using the untrimmed originals — its LogoTile has its own `big` sizing
calibrated against them.

    python3 scripts/process-partner-logos.py
"""
from PIL import Image
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CI = ROOT.parent / "CI"
OUT = ROOT / "public" / "partners" / "logos" / "white"
TRIMMED = OUT / "trimmed"

MAX_EDGE = 900
LO, HI = 40, 110  # colour-distance → alpha ramp, for the "color" mode

# Every white-mono mark gets a trimmed copy. Both the marquee band and the
# partner wall read from trimmed/: sizing there normalises each logo by its
# rendered area, which is only meaningful when the file's dimensions describe
# the INK rather than whatever transparent canvas the brand shipped.

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


def trim_all():
    """Crop every mark to its alpha bbox so they all fill their tile the same."""
    TRIMMED.mkdir(parents=True, exist_ok=True)
    for src in sorted(OUT.glob("*.png")):
        slug = src.stem
        im = Image.open(src)
        bbox = im.getbbox()
        if not bbox:
            print(f"  {slug:24s} -- empty alpha, skipped")
            continue
        cropped = im.crop(bbox)
        dst = TRIMMED / f"{slug}.png"
        cropped.save(dst, "PNG", optimize=True)
        print(f"  {slug:24s} {im.size[0]}x{im.size[1]} -> "
              f"{cropped.size[0]}x{cropped.size[1]}  "
              f"{dst.stat().st_size / 1024:.1f} KB")


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
    trim_all()


if __name__ == "__main__":
    main()
