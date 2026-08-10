#!/usr/bin/env python3
"""
Measure the OPTICAL MASS of each trimmed partner mark, for the hero strip's
sizing rule (see `mass` in components/journey/Journey.tsx).

Why this exists
---------------
The hero strip used to draw every mark at the same box height. That makes a
row of logos look wrong, because a logo's apparent size is not its bounding
box: a bold compact wordmark (Nuldam) reads twice as big as a hairline
wordmark (ONWORD LAB) drawn to the same height, and a lockup whose box also
contains a second line or an icon (BRAND BOOST, aws, 싱가포르 한인회) reads
smaller than its box, because only part of the box is the name.

What the eye actually equalises is INK — how much of the row a mark paints —
tempered by SILHOUETTE, the area the mark occupies as a shape. Outlined marks
(REmited's pill, L^IFE) paint very little ink but read as their full outline,
so ink alone would blow them up; silhouette alone would shrink the bold marks
too far. The geometric mean of the two behaves on every mark in this set.

    mass = sqrt(ink_coverage * silhouette_coverage)     # 0..1, of the trimmed box

Journey.tsx multiplies that by the mark's aspect ratio to get the ink a 1px-tall
render would paint, and solves for the height that matches the strip's target.

Usage
-----
    python3 scripts/measure-logo-mass.py

Prints one `mass:` value per mark, ready to paste into confirmedPartnerTiers.
Re-run it whenever a mark is added or its artwork is replaced; a wrong `mass`
only makes that one logo the wrong size, but it will be visibly the wrong size.
"""
from PIL import Image
import numpy as np
from pathlib import Path
import math
import sys

ROOT = Path(__file__).resolve().parent.parent
TRIMMED = ROOT / "public" / "partners" / "logos" / "white" / "trimmed"

# Ink below this alpha is antialiasing, not shape — it must not open or close a
# column when measuring the silhouette.
SOLID = 0.35


def measure(path: Path):
    a = np.asarray(Image.open(path).convert("RGBA"))[..., 3].astype(np.float32) / 255.0
    h, w = a.shape
    ink = float(a.sum() / (w * h))
    solid = a > SOLID
    # Silhouette: per column, everything between the topmost and bottommost ink
    # counts. Filling columns (not rows) is deliberate — these marks are read
    # left to right, and it is the vertical extent at each x that the eye
    # integrates into "how tall is this logo".
    filled = 0
    for c in range(w):
        rows = np.flatnonzero(solid[:, c])
        if rows.size:
            filled += int(rows[-1] - rows[0] + 1)
    sil = filled / (w * h)
    return w, h, ink, sil, math.sqrt(ink * sil)


def main(names):
    files = ([TRIMMED / f"{n}.png" for n in names] if names
             else sorted(TRIMMED.glob("*.png")))
    print(f"{'mark':24} {'w':>5} {'h':>5} {'ink':>6} {'sil':>6} {'mass':>6}")
    for f in files:
        if not f.exists():
            print(f"{f.name:24} MISSING", file=sys.stderr)
            continue
        w, h, ink, sil, mass = measure(f)
        print(f"{f.stem:24} {w:5d} {h:5d} {ink:6.3f} {sil:6.3f} {mass:6.3f}")


if __name__ == "__main__":
    main(sys.argv[1:])
