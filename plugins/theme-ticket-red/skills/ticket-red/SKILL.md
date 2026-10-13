---
name: ticket-red
description: "Reel theme: ticket red. Whitish warm paper with ticket red and deep red, dark ink; perforated ticket cards (notches + tear line), cinema seat maps with a stage, a white card with a red header band that carries the logo and title inline, ticket-stub captions where the spoken word gets a red highlight, and the background-removed speaker on the paper. Phosphor duotone icons. Load it when editing a reel with reel-studio about booking, tickets, events, inventory, concurrency or race conditions, or when a red and white look is wanted."
---

# Theme: Ticket Red

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How BookMyShow prevents double booking, 125 s, concert-ticket intro + 5 scenes).

**Identity:** paper #FFF6F4 with a drifting dot grid and soft red glows, ticket red #F84464, deep red #C4123F, ink #1F1F2B; Poppins display, Inter body, JetBrains Mono for code and labels. Green only for "free / committed", amber for "held / locked / waiting", blue for the second user.

## Layout
- `talk`: speaker full screen on the paper; overlays (ticket cards, plates with a red left edge) in the band y 1130 to 1560; captions at y 1590.
- `card`: card at y 130; its red band (top 76 px) carries `cfg.logo` on a white chip and `cfg.title` inline; **scenes in 1000 x 840**, headings at y 94; captions at y 992; speaker window x 40 y 1160, 1000 x 720.
- `full`: card stretches to 1000 x 1530 (`FULL_H`), speaker hidden.
- Speaker cut-out: reel-studio `cutout/matte.py` (two segment files at most on an 8 GB / 2 CPU machine; no stills while they run) + `build_speaker.py`, then `cfg.speaker: 'speaker.webm'`; `cfg.cutBottom` hides a desk the matte kept.

## Components (`./theme/kit`)
`Ticket w h notch color` (perforated card), `Seat size state label` (free / taken / hot / held / ok), `Node icon|logo label sub tone on dim`, `Heading`, `Flow`, `Tag`, `Icon`, `Logo`, `Appear`. The example adds `SeatMap`, `Lane` (two users racing), a typed SQL block, an expiry countdown ring, `Chip`, `Box`, `Mark`, `PopIn`, and talk-mode `Band`/`Plate`/`Big`.

## Do / don't
- An artist or event photo the user supplies can headline the intro ticket; do not invent venues, dates or prices.
- Label example values (timers, timestamps) as examples.
- Keep every title on one line; never leave a single word alone on a line.
