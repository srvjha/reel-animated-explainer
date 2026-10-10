---
name: saffron-ledger
description: "Reel theme: saffron ledger. Warm cream paper with saffron and India green accents and navy ink; stamped cards with hard shadows, a ledger-ruled backdrop, receipt-slip captions where the spoken word gets a saffron highlighter, rupee amounts that count, phone mockups and official logos (UPI, NPCI, apps) shown inline with the title. Icons are Phosphor duotone, not Lucide. Load it when editing a reel with reel-studio about payments, fintech, India-specific tech, or whenever an orange and green look is wanted."
---

# Theme: Saffron Ledger

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How UPI payments work, 169 s, 13 scenes).

**Identity:** warm paper #F9EED6 with a drifting orange halftone star-dot layer (`theme/halftone.png`, copy it to `public/`), saffron/green margin rules and faint rupee/bank/QR icons; cream card with saffron | white | green top bands and a 10 px navy hard shadow; Outfit display, IBM Plex Sans body, IBM Plex Mono labels. Saffron = money moving / focus, green = success and the "right" way, red only for fees and failures.

## Assets
- Official logos go in `public/logos/` and are drawn with `<Logo>` or the example's `LogoTile` (white tile, ink border). Never redraw or recolour them. Crop transparent margins; turn a white JPG background transparent before use.
- `cfg.logo` + `cfg.logoH` put the logo **inline, left of the title** in the header. A wide wordmark needs a lower `logoH` (about 58).
- Do not use national emblems or government seals; use a plain "Government" node instead.
- Icons: `npm i @phosphor-icons/core` and copy `assets/duotone/<name>-duotone.svg` to `public/icons/<name>.svg`.

## Speaker cut-out
The theme is built for a background-removed speaker: run reel-studio's `cutout/matte.py` (split the video into 2 segment files on a 2-CPU machine; 3 parallel jobs run out of memory) and `cutout/build_speaker.py`, then set `cfg.speaker: 'speaker.webm'`. The speaker then stands on the halftone paper full screen, and in card mode sits on paper inside the stamped window. Without `cfg.speaker` the raw camera video is used.

## Layout
- `talk`: speaker full screen; overlays are stamped plates in the band y 1170 to 1560 (below the mic); captions at y 1590. Rows of logos use equal-size `PopTile`s so they line up and spring in.
- `card`: header at y 38, card at y 130 with **scenes in 1000 x 840**, captions at y 990, speaker window x 40 y 1160, 1000 x 720 with a green hard shadow.
- `full`: card stretches to 1000 x 1530 (`FULL_H`), speaker hidden.
- `cfg.face {y0, y1}`: source rows from above the hair to below the mic; check a still.

## Components (`./theme/kit`)
`Heading kicker title` (green underline grows in), `Node icon|logo label sub tone on dim`, `Logo`, `Icon`, `Rs t0 to from dec sign` (counts rupees with Indian grouping), `Phone`, `Flow` (rupee packets on a dashed rail), `Tag`, `Appear`. The example adds `LogoTile`, `Chip`, `Card`, `Stamp` (check / cross), a receipt `Row`, and talk-mode `Band`/`Plate`/`Big`.

## Do / don't
- Fee maths must add up; label example numbers as illustrative when the speaker does.
- Captions follow the speech word for word.
- Keep every title on one line; never leave a single word alone on a line; no slanted plates.
