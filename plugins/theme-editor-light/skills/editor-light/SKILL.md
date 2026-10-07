---
name: editor-light
description: "Reel theme: editor light. Butter-yellow graph paper, light code-editor windows where code types in with syntax highlighting, a background-removed speaker as a white-outlined sticker with a live background (outlined marquee words, drifting code chips), and highlighter captions on a white card. Load it when editing a technical or code-heavy reel in this theme with reel-studio."
---

# Theme: Editor Light

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` ("What is middleware?", 106 s).

**Identity:** paper `#FFF7DA` with a 48/240 px graph grid, ink `#17191E`, coral `#FF6B4A` accent, blue, teal, green, red, amber for syntax and states. Instrument Sans headlines with an Instrument Serif italic accent word, Outfit captions, Fira Code for code. Bright arranged lo-fi bed with key clicks and dings.

**Best for:** code and API topics (middleware, auth, validation, ORMs, caching code paths) where showing real snippets helps.

## Needs a cut-out speaker
This theme expects `rem/public/speaker.webm`, a VP9 video with alpha. Make it with reel-studio's `scripts/cutout/`:
1. `SRC=<video> python3 matte.py segs.json` in the work dir (needs `isnet_medium.onnx`, see the script header; `segs.json` = `[[t0, t1], ...]` where the speaker is visible, skip `full` windows to save time; about 2 s per computed frame on 2 CPUs).
2. Write the frame count to `nframes`, then `python3 build_speaker.py`: tightens edges, drops non-person leftovers with a MediaPipe mask, keeps the largest blob, encodes `rem/public/speaker.webm`.
Check one frame at half scale before rendering: edges should be clean against the paper.

## Layout (`cfg.modes`, contiguous)
- `talk`: speaker large (white sticker outline + shadow), live background, `cfg.stickers` labels near the head (keep y 280 to 460, outside the face).
- `split`: card on top (**scenes draw in 1000 x 880**), the speaker scaled 0.6 stands in front of its bottom edge. Keep scene content above y ~720 in the centre (the head rises to about y 940 of the card).
- `full`: card grows to **1000 x 1290**, speaker hidden.
- Title chip top-left: `cfg.file` tab + `cfg.title` (one line).
- Captions: white card at y ~1500, 2 lines (maxc 24); spoken word gets a coral highlighter, keywords blue, upcoming words faint.

## Config
```ts
export const cfg: Config = {
  title: 'What is middleware?', file: 'middleware.ts',
  modes: [{a: 0, b: 7.6, m: 'talk'}, {a: 7.6, b: 27.2, m: 'split'}, {a: 28.4, b: 40.2, m: 'full'}, ...],
  marquee: ['MIDDLEWARE', 'req → res', 'next()'],
  chips: ['app.use()', 'next()', 'res.status(401)'],
  stickers: [{t0: 0.3, t1: 2.6, text: 'middleware?', x: 70, y: 300, color: CORAL, rot: -6}],
};
```

## Components (`./theme/kit`)
- `Editor file lines at hi w size cps`: lines type in at `at[i]`, `hi` highlights a line in a window (`{line, t0, t1, color}`). Built-in JS/TS highlighting.
- `Terminal lines`, `Req method path color status`, `Gate label sub state='idle'|'active'|'pass'|'block'`, `VArrow`.
- `Heading t0 n title accent color`, `Tag color solid size`, `Appear`.
- Tokens: `PAPER INK SUB CARD LINE CORAL BLUE GREEN RED AMBER TEAL`, fonts `HEAD SERIF SANS CODE`.

## Sound (`sound.py` SFX)
`key` (repeat ~0.07 s while code types), `pop`, `ding`, `swoosh` (`d`), `error`, `success`, `thump`.

## Do / don't
- Code must be real and runnable-looking; keep lines under ~55 chars at size 26.
- Never put code under the speaker in split mode; move it up or switch to full.
- Don't use this theme without a clean cut-out; fall back to another theme if the matte is poor.
