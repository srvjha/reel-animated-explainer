---
name: launch-promo
description: "Reel theme: launch promo. For product promo reels: a talking-head problem/solution with the product's real screen recordings cut in. Brand canvas with a browser-frame card that plays each recording through a virtual camera (zoom into the part that matters, pan, speed up), the speaker kept in a window below, a brand reveal and a comment-to-get-the-link CTA. Load it when editing a product or launch promo with reel-studio."
---

# Theme: Launch Promo

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (Shortlist promo, 57 s, four 2560x1440 demos).

**Identity:** neutral cream canvas with a dot grid and soft brand-colour glows, white browser card, serif wordmark (Source Serif 4), Plus Jakarta Sans captions. Set `cfg.brand.color` to the product's real accent: sample it from a button in the recording (`ffmpeg -frames:v 1` + read the pixel).

## Workflow for the demos
1. Copy each recording into `rem/public/` (`demo1.mp4`...). Make one contact sheet per clip with a 256 px grid (`drawgrid`) at 6 timestamps; note the source times of each meaningful moment and the source-pixel box of the UI that shows it.
2. Map narration to clips: which sentence is each feature. Cut the dead parts (loading spinners, typing) by splitting one recording into several `Demo` scenes with different `s0..s1`.
3. Speed: `rate = (s1 - s0) / (b - a)` is automatic. Keep 1x to 2x when the viewer must read; up to 3 to 4x for typing or scrolling. Above 1.3x a small "2.1x" badge shows.
4. Camera keys (source seconds, source px): `z = 1` fits the whole width; a side panel ~700 px wide reads well at `z = 2560 / 700`. Ease between keys; pan down as content appears.
5. Add a `Step n text` label to each demo scene so the feature is named.

## Layout
- `cfg.modes`: `talk` (speaker full screen, captions low, overlays) and `card` (canvas + browser card 1000 x 960 at y 150 with **scenes in 1000 x 900**, captions on the cream band at y ~1128, speaker window y 1320 to 1880).
- `cfg.face`: source rows of the speaker shown in the window (face plus mic). Check a still; faces sit lower in the frame than you expect.
- Overlays: hook pill + rejected-resume style prop, brand reveal card, CTA (wordmark, comment keyword box, bonus pill under the captions). Keep overlays off the face (talk-mode head is about y 500 to 1100).

## Components (`./theme/kit`)
`Demo src a b s0 s1 keys`, `Pill color solid`, `Serif`, `ResumeDoc title stamp`, `JD role co color`, `Appear`. Write product-specific helpers (like `Step`) in Video.tsx.

## Do / don't
- Only show the real product; never mock UI that does not exist.
- One feature per demo scene, named by its step label, timed to the sentence that mentions it.
- Keep the CTA keyword exactly as spoken.
