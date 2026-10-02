---
name: yellow-ticker
description: "Reel theme: yellow ticker. Speaker stays full screen; a yellow dotted card on the chest holds scenes that swipe in like a deck; black one-line ticker captions; split-flap boards. Load it when editing a reel in this theme with reel-studio."
---

# Theme: Yellow Ticker

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` ("What is an IP address?", 70 s).

**Identity:** Swiss-poster yellow `#FFD60A` on ink `#0B0B0B`, green `#19C37D` for "correct", red `#FF4B2B` sparingly. Syne 800 headlines, Sora 800 captions, DM Mono labels. Thick ink outlines with hard offset shadows. Bouncy pluck music at 120 bpm.

**Best for:** short concept explainers (45 to 90 s) with many small beats: networking, "what is X", definitions with a concrete example.

## Layout
- Speaker: full frame the whole time, slow push-in, quick zoom punches from `cfg.punches`.
- Title chip: top, centred, one line, visible in `cfg.titleWindows` (usually the hook and the summary).
- Caption bar: black pill at y 1000 to 1104, ONE line (maxc 22). Words land as spoken, current word underlined in yellow, keywords yellow. Lines roll up like a ticker.
- Scene card: yellow dotted card under the bar. **Scenes draw in a 1020 x 560 box** (origin top-left of the card). Each scene swipes in from the right and out to the left with a small tilt.

## Config
```ts
export const cfg: Config = {
  title: 'What is an IP address?',            // one line, about 24 chars max at size 54 (titleSize to shrink)
  titleWindows: [[0, 13.0], [62.4, 999]],
  punches: [[T.yahin - 0.1, 0.07]],           // [t, amount]
};
export const scenes: Scene[] = [{a: 0, b: 2.0, el: C0}, ...];   // contiguous, no gaps
```

## Components (`./theme/kit`)
- `Appear t0 t1? from='up'|'left'|'right'|'scale' style` absolute-positioned spring pop.
- `Tag c bg size` straight chip with hard shadow (labels, values, verdicts). `Big size` Syne headline.
- Icons: `Laptop`, `Phone`, `TV`, `Router (hot)`, `Server`, `Cloud`, `Envelope (to, from, w)`; all take `s` scale and `label`.
- `Dash x1 y1 x2 y2 k` dashed connector drawn as k goes 0 to 1. `Flap text t0 size` split-flap board for numbers/codes.
- Tokens: `YEL INK PAPER RED GREEN GREY SOFT`, fonts `SYNE SORA MONO`, `BOX_W BOX_H`.

## Sound (`sound.py` SFX)
`swish` (scene changes, `d`), `pop` (items appearing), `ding` (`f`, reveal moments), `stamp` (verdicts), `flap` (repeat ~30 x 0.04 s under a Flap board), `click` (typing, repeat 0.05 s).

## Do / don't
- Keep at most ~5 elements per scene; the card is small. Text inside the card at 22 px minimum.
- Never put a second line in the caption bar; the builder keeps pages to one line.
- Don't tint the speaker or add a background: the real room stays.
