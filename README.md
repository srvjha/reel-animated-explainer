# reel-animated-explainer

An agent skill that turns a vertical talking-head video into a polished Instagram reel or YouTube Short: speech-synced animated diagrams, styled captions and sound effects.

Built while editing the **Building Backend Systems** series (Message Queues, Database Indexes) and a weekly tech news roundup.

## Demo

<p align="center">
  <img src="demo/preview.gif" width="260" alt="Split-panel mode: B+Tree search animation above the speaker, with Hinglish captions">
  &nbsp;&nbsp;
  <img src="demo/full-screen-preview.gif" width="260" alt="Full-screen mode: connection blocks filling behind the cut-out speaker, then LIMIT HIT">
</p>

**Left:** split-panel mode. **Right:** full-screen mode. **[Watch a full split-panel reel (Database Indexes, 1:57)](demo/database-indexes-reel.mp4)**

## What it does

- **Picks the mode from your video:**
  - **Split panel:** you record in the bottom part of a 9:16 frame and leave the top empty. The empty area becomes an animated explainer (problem, solution, flow diagrams, comparisons, stamps, takeaway), each scene timed to when you say it.
  - **Full screen:** you fill the frame. You are cut out and placed over a black and blue grid background, with pixel titles behind your head, full-screen animated clips, word-by-word captions with highlight plates, a chiptune music bed that ducks under your voice, and 8-bit sound effects. Caption and headline styles are adapted from [veedstudio/open-edit](https://github.com/veedstudio/open-edit) recipes.
- **News roundup variant:** news cards, real screenshots, stat bars and comedy stamps in a lower band, with synthesized sound effects.
- **Captions:** your transcript word for word, timed to your actual speaking pace, with keyword highlights, and never a single word alone on a line.
- **Themes:** rotates so consecutive reels don't look the same.
- **Asks once:** confirms the mode it detected, then asks for the episode, transcript, caption language, last theme and extras in one message.

## Install

**Claude Code (global):**
```bash
git clone https://github.com/srvjha/reel-animated-explainer ~/.claude/skills/reel-animated-explainer
```

**Claude app:** upload the `SKILL.md` as a skill in your settings, or ask Claude to save it for you.

## Use

Attach your video and say:

> Edit this reel using the reel-animated-explainer skill.

It will ask its intake questions, show a preview grid of the scenes, then render.

## Requirements

- ffmpeg
- Python 3 with `numpy` and `pillow` (plus `faster-whisper` if you don't provide a transcript)
- Fonts: Poppins, Lora, DejaVu Sans Mono

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | Mode detection, intake questions, shared rules and checklist |
| `modes/split-panel.md` | Black-top layout: panel measurement, scene recipe, theme library, ASS captions |
| `modes/full-screen.md` | Full-screen layout: look, timeline pattern, pipeline, timing budget |
| `scripts/split_panel/` | `panel_example.py` (cream theme), `panel_example_blueprint.py` (dark blue, logo in boxes), `build_captions.py` |
| `scripts/full_screen/` | `matte.py` (speaker cut-out), `asr_anchors.py` + `align_words.py` (word timings), `build_layers.py` (example HTML/CSS layers), `compose.py` (Chromium render + composite), `audio.py` (music and SFX), `render_chunks.sh` |

Full-screen extras: Playwright with Chromium, `onnxruntime`, `mediapipe`, `opencv-python`, and the fonts from npm (`@fontsource/archivo-black`, `@fontsource/press-start-2p`, `@fontsource/jetbrains-mono`).

## License

MIT
