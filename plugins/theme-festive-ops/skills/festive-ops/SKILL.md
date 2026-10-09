---
name: festive-ops
description: "Reel theme: festive ops. Light grey blueprint canvas with sale orange, app blue and slate ink; captions styled as a notification toast; white diagram card with phone mockups, push toasts, job chips and worker tiles; the brand's app icon sits inline with the title. Speaker full screen for the intro hook and punchlines, then in a framed window below the card, scaled hair to mic (never cropped). Load it when editing a reel with reel-studio about e-commerce, sales, notifications or any bright product-flavoured topic."
---

# Theme: Festive Ops

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How Amazon sends sale notifications at scale, 126 s, 11 scenes).

**Identity:** canvas #E8ECF0 with a drifting blueprint grid and faint floating bell/package icons; white card with an orange-to-blue top stripe; Sora display, DM Sans body, JetBrains Mono labels. Orange #FF9900 = the thing in focus, blue = delivery/new capacity, red only for failure, green only for "fine".

## Assets
- Brand logo the user attaches goes to `public/` and is set as `cfg.logo`; it is drawn **inline, left of the title** (header and title rows), never stacked above it. Crop away white margins first.
- A sale or campaign banner makes a strong 2 s intro hook in talk mode (band y 985 to 1555, spinning ray burst behind).
- Icons: copy from `lucide-static` / `simple-icons` (firebase, apple, android) into `public/icons/`.

## Layout
- `talk`: speaker full screen; overlays in the band y 980 to 1560; captions (slate pill) at y 1590.
- `card`: header (logo + title) at y 40, card at y 130 with **scenes in 1000 x 840**, captions at y 990, speaker window x 40 y 1160, 1000 x 720.
- `full`: card stretches to 1000 x 1530 (`FULL_H`), speaker hidden, captions at y 1690.
- `cfg.face {y0, y1}`: source rows from above the hair to below the mic; check a still.

## Components (`./theme/kit`)
`Heading kicker title`, `Node icon label sub hot cool bad dim`, `Toast img|icon title body`, `Phone w h` (children on the screen), `Icon`, `Flow`, `Tag`, `Meter`, `Count` (Indian digit grouping), `Appear`. The example adds `Chip`, `JobChip`, `Badge`, `TitleRow` (logo inline with title) and talk-mode `Band`/`BigT`/`Shade`.

## Do / don't
- Captions follow the speech word for word; correct facts only in on-screen titles (and ask first).
- Keep every title on one line; never leave a single word alone on a line.
- Do not invent discounts or numbers the speaker did not say.
