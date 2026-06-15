# Hero background video

The hero (`Chapter id="top"`) can show a full-bleed background video instead of
just the WebGL field. It's wired up but **off by default** (placeholder state).

## How to turn it on

1. Make a short, seamless, **silent** loop (~8–15s). Source it however you like
   (AI: Sora / Runway / Veo / Kling · stock: Pexels / Coverr · or shoot it).

2. Optimise it for the web — small files, no audio, 1080p. With ffmpeg:

   ```bash
   # MP4 (H.264) fallback — Safari / iOS
   ffmpeg -i source.mp4 -t 12 -an -vf "scale=1920:-2" \
     -c:v libx264 -crf 28 -preset slow -movflags +faststart hero.mp4

   # WebM (VP9) — smaller, loaded first
   ffmpeg -i source.mp4 -t 12 -an -vf "scale=1920:-2" \
     -c:v libvpx-vp9 -crf 34 -b:v 0 hero.webm

   # Poster still (first frame), shown before the video loads / if it fails
   ffmpeg -i source.mp4 -vf "select=eq(n\,0)" -q:v 3 hero-poster.jpg
   ```

   Target: each video **≤ ~1–2MB** (zero100.org's hero is ~940KB webm / 1.4MB mp4).

3. Drop the three files in this folder:
   - `hero.webm`
   - `hero.mp4`
   - `hero-poster.jpg`

4. In `components/journey/Journey.tsx`, set `HERO_VIDEO.enabled = true`.

That's it — the rest of the page keeps the WebGL background; only the hero
swaps to video, with a dark legibility scrim baked in.
