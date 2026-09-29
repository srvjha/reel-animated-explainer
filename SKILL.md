---
name: reel-animated-explainer
description: Edit vertical talking-head reels into animated explainers, either a split layout (diagram panel over an empty black top) or full screen (speaker cut out over a designed background with clips, word-by-word captions and music). Use when someone uploads a reel video to edit.
---

# Reel Animated Explainer

Turns a vertical talking-head video (1080x1920) into a polished reel. Two modes, picked from the video itself:

| Mode | The raw video looks like | Guide |
|---|---|---|
| **Split panel** | Empty black area on top, speaker below | `modes/split-panel.md` |
| **Full screen** | Speaker fills the frame | `modes/full-screen.md` |

## Step 0: detect, then ask once

1. **Detect the mode yourself:** `ffprobe` the video, grab 4 to 6 frames and look. Mean brightness below 12 across the top rows means split panel; otherwise full screen. Confirm in one line ("Full-screen video, so I'll use the full-screen mode. OK?") instead of asking from scratch.
2. **Ask the rest in one message** (skip anything already answered, never assume a series name or episode number):
   - Series name and episode number/topic for the on-screen label and caption.
   - Transcript: exact text, ideally with rough timestamps (an SRT is perfect). It is used word for word, and it saves about 30 minutes of timing work on mixed-language speech.
   - Caption language: as spoken (e.g. Hinglish in Roman script) or translated.
   - Last reel's theme, so this one differs, and any colours to avoid.
   - Extras: logo files for the technologies shown (never redraw a logo), sound effects, music, screenshots.
   - Deliverables: Instagram caption and hashtags? File size limit?
3. After the answers, work through without further check-ins unless something blocks you.

## Hard rules (both modes)

1. **Transcripts are sacred:** only split into lines, never reword.
2. **Never leave a single word alone on a line** in titles, cards or captions: one line, or balanced lines with at least 2 words each.
3. **Rotate themes** and respect banned colours.
4. **Brand icons:** use the official logo file as is; until it arrives, a plain text badge.
5. **No fabricated screenshots** of real posts; use real screenshots or clearly designed quote cards.
6. **Preview first:** a grid of frames from every scene before the full render, and frames checked from the final export.
7. **Background removal only in full-screen mode**, with a good matte (see the guide). In split-panel mode, keep the creator's real background.

## Shared steps

- **Word or line timing:** use the transcript's timestamps when given. Otherwise transcribe (whisper.cpp or faster-whisper, short windows with `no_context`), and for mixed-language speech anchor on clearly heard words and spread the rest by voiced time (`scripts/full_screen/align_words.py`). Tell the user which lines are uncertain.
- **Plan scenes** as a timeline table (t0, t1, scene, visuals), each starting within 0.5 s of when the speaker starts that point.
- **Render:** a master at CRF 18, then a two-pass H.264 copy at about 1750k video / 128k audio, which keeps a ~2 min reel under 30 MB.
- **Deliver:** the video, a one-line summary of what changed, uncertain caption lines, and, if asked, an Instagram caption: "Episode N: How <Topic> works", one hook line, one comment prompt, 5 to 6 hashtags.

## Before delivering

- [ ] Mode matches the video; theme differs from the last reel; no banned colours
- [ ] No black gaps (split) or matte flicker and halos (full screen)
- [ ] Every scene starts when the speaker starts that point
- [ ] Captions exact, readable, never over the face, no single-word lines
- [ ] No text overflows, or hides behind the speaker when it must be read
- [ ] Frames checked from the final exported file
