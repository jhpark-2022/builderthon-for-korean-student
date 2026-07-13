# Changelog — July 13, 2026 (quiz phase 4)

**Project:** Builderthon marketing site (Next.js)
**Branch:** `main`
**Window covered:** the `/quiz` fourth pass — axis-explanation tone rewrite

- **Axis explanations rewritten in B-grade self-roast tone** — `data/quizExplanations.ts`: all 36 phrases (4 MBTI axes × 8 patterns + Identity × 4) rewritten to trade flat-but-correct descriptions for funnier, recognizable behavioral details + affectionate self-roast, keeping the same grammar and structure. Each still cites the highest-weight against-result scenario, ties to `{pct}`, and closes on one emoji; the English side carries the same deadpan joke rather than a literal translation. Hedge wording stays locked to each pattern's score band (strong ~56–66% → "사실상 반반", none ~89–97% → "다 알아요"/flex), so number and confidence never diverge. Verified: `verify-quiz.mjs` (36/36 keys, bands intact), `{pct}` present in both locales for all 36, `tsc --noEmit` clean.
