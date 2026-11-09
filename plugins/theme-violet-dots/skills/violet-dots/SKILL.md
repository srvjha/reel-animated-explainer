---
name: violet-dots
description: "Reel theme: violet dots. Light dotted canvas (cool off-white, slate dots) with indigo / violet / teal accents, built for AI and LLM system design. Talk (speaker full screen) and split (a two-way window: explainer panel on top with rounded bottom corners, speaker in the lower half with his real background) alternate to and fro with animated 0.6 s transitions. Parts: ChatWindow mock (model logo header, user and assistant bubbles, thinking dots, word-by-word streaming), Tok chips, Gpu core grid, Meter bars, pipeline Nodes with Wires and travelling packets, Card, Tag, Head. Space Grotesk + JetBrains Mono. No stock media needed. Load it for reels about LLMs, inference, tokens, streaming, GPUs, AI products, or whenever a light dotted look with the talk/split back-and-forth is wanted."
---

# Theme: Violet Dots

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. Reference reel: `theme/example/Video.tsx` (AI System Design Ep 1: why ChatGPT takes time to start streaming, 114 s, 9 cuts alternating talk and split, 7 panel scenes).

**Identity:** #F6F7FB canvas, #C9CEE3 dots (30 px), indigo #4F46E5, violet #7C3AED, teal #0D9488, amber #D97706, rose #E11D48, ink #111827, tint #EEF0FF.

## Layout
- `cfg = {cuts, split: 960, box, talkZoom, talkDy, overlays, screenOverlays, capSkip}`.
  - `cuts`: `{a, b, m: 'talk' | 'split'}`. Each cut animates from the previous mode over 0.6 s, so the reel moves to and fro without hard cuts.
  - `box: [top, height]`: where the camera picture sits in a letterboxed 1080x1920 source (find it with `ffmpeg cropdetect`). Talk zooms it to fill; split puts its top at the panel bottom.
  - `talkZoom` / `talkDy`: extra zoom and downward nudge for the talk shot so the head is not cropped.
  - `overlays` draw inside the panel; `screenOverlays` over the whole frame (intro chips with logos, the one-line title card auto-sized to fit 980 px, an outro takeaway).
- `Head` = indigo mono pill + one-line Space Grotesk title (size 60) at the panel top. Panel content between y 190 and y 920.
- Captions move from y 1490 (talk) to y 1660 (split), white with the spoken word on a yellow pill.
- On-screen text English; captions follow the spoken words (fix technical slips like "compound bound" to "compute bound"); label numbers as illustrative.

## Logos and music
Logos: `claude.png`, `chatgpt.svg` (OpenAI knot on a white rounded tile, from Wikimedia Commons). Music from Mixkit through the user's browser: a constant bed ("Digital Clouds") at about -30 dB RMS and a hook track ("Epical Drums 01") under the intro plus 3 s stingers before new sections; write the result over `music.wav` after `mix_audio.py`.

## Do / don't
- Keep the speaker's real background. No banners or stamp plates. Titles on one line; never a single word alone on a line.
