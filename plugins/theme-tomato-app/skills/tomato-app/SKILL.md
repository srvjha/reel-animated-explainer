---
name: tomato-app
description: "Reel theme: tomato app. Warm food-delivery app look in tomato red on cream. Opens with the speaker full screen for the hook, then (cfg.splitAt) the camera slides into the lower half while a cream explainer panel with rounded bottom corners drops in on top; the speaker keeps his real background. Panel parts: Phone mock with a designed order-tracking screen, state Chips (done / now / todo / struck), service Nodes, Wires with travelling event packets, app Cards, Tags, push-notification Toast; Pexels stock clips can play inside the panel. Outfit + DM Mono. Load it for reels about apps, delivery, ordering, state machines, event pipelines, or whenever the explainer-on-top, speaker-below layout with a full-screen opening is wanted."
---

# Theme: Tomato App

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. Reference reel: `theme/example/Video.tsx` (How Zomato live order tracking works, 116 s, 8 panel scenes, 6 stock clips in the panel).

**Identity:** cream #FFF6F1 panel with a faint plus-mark pattern and peach glow, tomato red #E23744, ink #1C1C1C, greys #6F6A68 / #B9B1AE, line #F0D9D2, success green #24963F.

## Layout
- `cfg = {split: 1000, camDy, splitAt, clips, overlays, screenOverlays, capSkip}`.
  - `split`: panel height. `camDy`: how far the camera video moves down at the split so the face sits in the lower part (780 for a face around y 360 to 880 in the source).
  - `splitAt`: time the full-screen opening ends; the transition takes 0.65 s.
  - `clips`: `{a, b, src, from}` stock clips cropped to the panel (encode them 1080x1080).
  - `overlays` draw inside the panel (clip tags, toasts); `screenOverlays` over the whole frame (the big hook caption with the logo inline before the brand word, with `capSkip` hiding normal captions meanwhile).
- `Head` = red mono pill + one-line Outfit 800 title (size 62) at the panel top.
- Captions move from y 1450 (full screen) to y 1650 (split), white on a red pill.
- On-screen text English; captions follow the spoken words; label example IDs, coordinates and ETAs as illustrative.

## Stock clips and music
Pexels clips downloaded through the user's browser (search with `fetch('/search/videos/<q>/?orientation=portrait')` on pexels.com, then click `https://www.pexels.com/download/video/<id>/`). Music from Mixkit (click the card's download button). Write the track over `music.wav` after `mix_audio.py` at about -30 dB RMS.

## Do / don't
- Keep the speaker's real background. No banners or stamp plates. Titles on one line; never a single word alone on a line.
