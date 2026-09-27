# reel-animated-explainer

An agent skill that turns a vertical talking-head video into a polished Instagram reel or YouTube Short: speech-synced animated diagrams, styled captions and sound effects.

Built while editing the **Building Backend Systems** series (Message Queues, Database Indexes) and a weekly tech news roundup.

## Demo

<p align="center">
  <img src="demo/preview.gif" width="300" alt="B+Tree search animation synced to the speaker, with Hinglish captions">
</p>

**[Watch the full reel (Database Indexes, 1:57)](demo/database-indexes-reel.mp4)**

## What it does

- **Explainer mode:** record yourself in the bottom part of a 9:16 frame and leave the top empty. The skill fills the empty area with an animated explainer: problem, solution, flow diagrams, comparisons, stamps, and a takeaway, each scene timed to when you say it.
- **News roundup mode:** news cards, real screenshots, stat bars and comedy stamps in a lower band, with synthesized sound effects.
- **Captions:** uses your transcript word for word, split into short lines and timed to your actual speaking pace, with keyword highlights.
- **Themes:** rotates between dark graph paper, cream graph paper, blueprint, chalkboard and newsprint, so consecutive reels don't look the same.
- **Asks first:** series name, episode, transcript, caption language, last theme used and extras, before it builds anything.

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
| `SKILL.md` | The skill: intake questions, rules, workflow, scene recipe, themes, caption spec |
| `scripts/panel_example.py` | Full working example of an animated panel (Database Indexes episode, cream graph-paper theme) |
| `scripts/build_captions.py` | Builds speech-synced ASS captions from a timestamped transcript |

## License

MIT
