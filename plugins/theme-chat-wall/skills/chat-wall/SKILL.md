---
name: chat-wall
description: "Reel theme: chat wall. Messenger-style beige doodle wallpaper, teal chat-window title bars, light-green outgoing bubbles, sent/delivered/read ticks, phone mockups with chat headers and online/offline status, captions as a chat bubble whose ticks turn blue when the line ends, and the background-removed speaker standing on the wallpaper. Phosphor duotone icons. Load it when editing a reel with reel-studio about messaging, chat apps, notifications or real-time delivery."
---

# Theme: Chat Wall

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How WhatsApp delivers messages when you are offline, 79 s, 9 scenes).

**Identity:** wallpaper #ECE5DD with a drifting doodle layer (`theme/doodles.png`, copy it to `public/`), teal #008069 bars, outgoing bubble #D9FDD3, read-tick blue #53BDEB, red only for failure; Nunito display, Inter body, JetBrains Mono labels.

## Speaker cut-out
Run reel-studio's `cutout/matte.py` (two segment files in parallel at most on a 2-CPU machine; do not render stills at the same time or a job gets killed), then `cutout/build_speaker.py`, and set `cfg.speaker: 'speaker.webm'`. Without it the raw camera video is used.

## Layout
- `talk`: speaker full screen on the wallpaper; overlays (white plates with a green underline, chat bubbles, status pills) in the band y 1170 to 1560; captions at y 1590.
- `card`: white card at y 130 whose teal bar (top 78 px) carries the logo and title inline; **scenes in 1000 x 840**, headings start at y 92 inside the card; captions at y 990; speaker window x 40 y 1160, 1000 x 720.
- `full`: card stretches to 1000 x 1530 (`FULL_H`), speaker hidden.

## Components (`./theme/kit`)
`Bubble text out ticks read time`, `Ticks n read`, `Phone title status online dim` (chat header + wallpaper screen), `Node icon|logo label sub tone on dim`, `Heading`, `Flow ... broken` (line turns red and stops at `broken`), `Tag`, `Icon`, `Logo`, `Appear`. The example adds `Server`, `Status` (online / offline pill), `Packet` (bubble travelling a path), `Cross`, `Chip`, `PopIn`, talk-mode `Band`/`Plate`/`Big`.

## Do / don't
- Ticks mean what the app means: one = reached the server, two = delivered, blue = read. Only show blue when the speaker talks about reading.
- Captions follow the speech word for word.
- Keep every title on one line; never leave a single word alone on a line.
