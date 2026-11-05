---
name: red-signal
description: "Reel theme: red signal. Red and black streaming-player look, made for voice-over reels (no speaker shots needed). Hard cuts between full-screen stock clips (darkened, light red grade, push-in) and near-black pages with a red dot grid, each page revealed by a slanted red ribbon sweeping left to right. Parts: video Player mock (blur, played/buffered bar, quality badge, spinner), Signal bars, Chunk blocks shaded by quality (240p dark red to 4K bright), QBadge, dark Cards, red Tags. Bebas Neue titles, Inter captions on a red pill, JetBrains Mono labels. Load it when editing a reel with reel-studio about streaming, video, CDNs, buffering, adaptive bitrate, media pipelines, or whenever a red and black dotted look is wanted."
---

# Theme: Red Signal

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. Reference reel: `theme/example/Video.tsx` (How Netflix changes video quality automatically, 109 s voice-over, 13 cuts, 10 page scenes, 9 stock clips).

**Identity:** #09090A canvas, #4A1216 dot grid (34 px), red #E50914, deep red #8A0B12, cards #141416 with #2A2A2F edge, white #F5F5F1. Quality shades: 240p #4A0D11, 480p #7A1017, 720p #B0101C, 1080p #E50914, 4K #FF5A60.

## Voice-over reels
No camera video? Make the source for `prepare.sh` from the audio: `ffmpeg -f lavfi -i color=c=black:s=1080x1920:r=30 -i voice.m4a -shortest ... src.mp4`. Leave `cfg.speaker` unset; use only `clip` and `page` cuts.

## Layout
- `cfg.cuts`: `{a, b, m}` with `m = 'page' | 'clip'` (clip takes `src`, `from`, `zoom`, `pos`). The previous clip keeps playing under the ribbon while the page is revealed. Put several scenes inside one page cut instead of page-to-page cuts.
- `Head` = red mono label + Bebas title (size 120, one line, about 22 characters max) at y 150.
- Captions: page y 1600, clip y 1480, `maxc 22`. `cfg.capSkip` hides captions while the hook overlay shows the first line big (the example puts the logo inline before the brand word).
- On-screen text English; captions follow the spoken words; label example numbers as illustrative.

## Stock clips and music
Pexels clips downloaded through the user's browser (search with `fetch('/search/videos/<q>/?orientation=portrait')` on pexels.com, then click `https://www.pexels.com/download/video/<id>/` links). Music from Mixkit: click the card's download button on a mixkit.co tag page. Write the track over `music.wav` after `mix_audio.py` (about -30 dB RMS; it is sidechain ducked under the voice).

## Sound
`sound.py` SFX: `sheet` (ribbon), `drop`, `ping`, `tap`, `hex` (chunk), `sonar`, `match`, `whoosh`, `pop`, `tick`.

## Do / don't
- No banners or stamp plates. Titles on one line; never leave a single word alone on a line.
