#!/usr/bin/env python3
"""
One-off: turn the 4 raster brand logos the site received (solid-bg color/mono
marks) into the site's logo convention — WHITE MONO on a TRANSPARENT square,
matching the existing simple-icons SVGs (public/logos/*.svg).

Approach (works for both mono and multicolor marks): sample the flat background
color from the image corners, take each pixel's Euclidean color distance from
that bg, ramp it to an alpha (near-bg → transparent, far → opaque, smooth AA in
between), and flatten every surviving pixel to pure white. Then trim to the
alpha bounding box and center on a 512x512 transparent canvas with ~8% padding.

Rasters that also carry a wordmark (Midjourney = sailboat + "Midjourney") are
pre-cropped to just the icon mark so they stay consistent with the icon-only
peers. Re-run after dropping fresh originals in public/logos/.

    python3 scripts/process-logos.py
"""
from PIL import Image
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOGOS = ROOT / "public" / "logos"

CANVAS = 512
PAD = 0.08          # transparent margin on each side of the square
LO, HI = 40, 110    # color-distance → alpha ramp (bg noise floor / full-opaque)

# source filename → (output slug, optional pre-crop as (top,bottom) fractions)
JOBS = [
    ("Character.jpg",            "characterai.png",     None),
    ("Pi (Inflection).jpeg",     "pi.png",              None),
    ("Microsoft Copilot.jpeg",   "microsoftcopilot.png", None),
    # boat is the top ~2/3; drop the "Midjourney" wordmark below the y=200 gap
    ("Midjourney.avif",          "midjourney.png",      (0.0, 0.66)),
]


def bg_color(a):
    """Median of the four corner pixels — the flat background."""
    h, w, _ = a.shape
    corners = np.array([a[0, 0], a[0, w - 1], a[h - 1, 0], a[h - 1, w - 1]])
    return np.median(corners, axis=0)


def to_white_mono(a):
    bg = bg_color(a)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    alpha = np.clip((dist - LO) / (HI - LO), 0.0, 1.0) * 255.0
    h, w, _ = a.shape
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, 0:3] = 255                      # flatten mark to pure white
    out[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def trim_and_center(img):
    bbox = img.getbbox()                       # bbox of non-zero alpha
    if bbox:
        img = img.crop(bbox)
    inner = round(CANVAS * (1 - 2 * PAD))
    w, h = img.size
    scale = inner / max(w, h)
    img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    w, h = img.size
    canvas.paste(img, ((CANVAS - w) // 2, (CANVAS - h) // 2), img)
    return canvas


def main():
    for src, out, crop in JOBS:
        p = LOGOS / src
        im = Image.open(p).convert("RGB")
        a = np.asarray(im).astype(int)
        if crop:
            h = a.shape[0]
            a = a[int(crop[0] * h):int(crop[1] * h), :, :]
        img = trim_and_center(to_white_mono(a))
        # White-mono is fully described by the alpha channel, so store as LA
        # (grayscale L=255=white + alpha) — same look, ~40% smaller than RGBA.
        rgba = np.asarray(img)
        img = Image.fromarray(np.dstack([rgba[:, :, 0], rgba[:, :, 3]]), "LA")
        dst = LOGOS / out
        img.save(dst, "PNG", optimize=True)
        kb = dst.stat().st_size / 1024
        print(f"  {src:28s} -> {out:20s} {img.size[0]}x{img.size[1]}  {kb:.1f} KB")


if __name__ == "__main__":
    main()
