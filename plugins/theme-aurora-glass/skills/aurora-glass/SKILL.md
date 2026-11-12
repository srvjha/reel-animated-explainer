---
name: aurora-glass
description: "Reel theme: aurora glass. Deep night canvas with a drifting blue/aqua aurora bloom and faint dot grid, frosted glass panels with a top highlight, focus-pull (blur to sharp) page reveals. Hard cuts between the speaker (full screen, real background, punch-in zoom via cut.z) and full-screen pages. Captions follow herk-edit-kit house style (1 to 3 words, Montserrat ExtraBold caps in one dark box, aqua concept / red wrong / green payoff, Abril Fatface on soft words). Parts: Panel (glass, optional glow), Tag, Bar, Bubble, Wire with packets, Head, Note. Load it for AI / LLM system design explainers (caching, embeddings, vector search, thresholds)."
---

# Theme: Aurora Glass

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Reference reel: `theme/example/Video.tsx` (AI System Design Ep 3: why your normal Redis cache won't work for AI chatbots, 126.8 s, 23 cuts, 17 page scenes).

**Identity:** #060A12 canvas, aqua #38BDF8, blue #3B82F6 aurora, red #FF5A6A, green #4ADE80, amber #FBBF24 for numbers and examples, white #F1F5F9, muted #94A3B8. Space Grotesk 700 + JetBrains Mono.

## Layout
- `cfg.cuts`: `{a, b, m: 'talk' | 'page', z?}`. `z` (e.g. 1.3) makes a talk cut a punch-in. Pages land with a 0.35 s focus pull and an aurora swell.
- `Head` at y 160, content y 360 to 1500. Captions: talk y 1430 (punch-in 1470), page y 1640.
- `data.json` carries `caps` (chunks from words: break at punctuation, pauses over 0.18 s, or 3 words; colour by keyword) and `words` for the `T(word, after)` helper.

## Audio
Music bed fades in over 4 s from silence and sits about 17 dB under the voice with sidechain ducking (he found a loud bed from the first second distracting). Master -14 LUFS, true peak -1.5 dBTP. Soft taps and clicks only (`sound.py`).

## Do / don't
- Never show the speaker and the explainer in two frames at once. Keep his real background.
- No banners or stamp plates. Titles on one line; never a single word alone on a line.
- Label example numbers (similarity scores, thresholds, vector values) as illustrative.
