---
name: reel-animated-explainer
description: Edit vertical talking-head reels into animated explainers or news roundups, with speech-synced diagrams, styled captions and sound effects. Use when someone uploads a reel video to edit.
---

# Reel Animated Explainer

Turns a vertical talking-head video (1080x1920) into a polished reel. Two formats:

- **Explainer:** the raw video has an empty (black) area at the top and the creator talking below it. Replace the empty area with an animated, diagram-based explainer that plays in sync with what they say, and add captions.
- **News roundup:** full-frame talking head. Add news cards and screenshots in a lower band while they talk, captions, and comedy sound effects.

## Step 0: Intake questions (always ask first)

Ask these in one message before doing anything. Skip any the user already answered, and never assume defaults for the series name or episode.

1. **Format:** explainer (animated diagrams in the empty area) or news roundup (cards over the video)?
2. **Series name** for the on-screen label (e.g. "Building Backend Systems"), or none?
3. **Episode number and topic** (e.g. "Episode 7: How Database Indexes work")?
4. **Transcript:** do you have an exact transcript with timestamps? If yes, paste it; it will be used word for word.
5. **Caption language:** as spoken (e.g. Hinglish in Roman script) or translated (e.g. English)?
6. **Theme:** which theme did your last reel use, so this one can be different? Any colours to avoid?
7. **Extras:** sound effects? Real screenshots to show (news format)? Anything in the background to fix (e.g. window glare)?
8. **Deliverables:** also want an Instagram caption and hashtags? Any file size limit?

After the answers, work through the rest without further check-ins, unless something blocks you.

## Hard rules

1. **Never remove or replace the creator's camera background** (no segmentation or cut-outs). It gives splashy edges on hair and hands. Small local fixes, like dimming window glare, are fine.
2. **Transcripts are sacred:** when the user gives one, only split it into lines. Never reword.
3. **Rotate themes:** don't reuse the previous reel's theme. Respect every colour the user bans.
4. **No fabricated screenshots:** never recreate a real tweet or post UI. Use the user's real screenshots, or clearly designed quote cards (name, handle, date, exact quote, "Posted on X").
5. **Show a preview grid** of frames from every scene before the full render. Check frames from the final exported file before delivering.
6. **Never leave a single word alone on a line**, in titles, cards or captions. Either fit the text on one line, or split it into two balanced lines with at least 2 words each (e.g. "How Connection Pooling" / "works in PostgreSQL", not "How" / "Connection Pooling" / "works in PostgreSQL").
7. **Brand icons:** for a technology's logo (e.g. the PostgreSQL elephant), ask the user for the official image file and use it as is. Until it arrives, use a plain text badge; never redraw a logo by hand.
8. **Verify facts** in news roundups against sources for the date window. Flag vendor-run benchmarks and anything outside the window.

## Workflow

1. **Inspect:** `ffprobe` for resolution, fps and duration; grab 4 to 6 frames with ffmpeg and look at them.
2. **Measure the empty area (explainer):** sample every 0.5 to 1 s, find the first row with mean brightness > 12, and store the bottom edge per second. It can move between cuts. The panel must cover the maximum nearby edge at every moment, so a black strip never shows.
3. **Transcript:**
   - If one was given, use it word for word.
   - Otherwise transcribe with Whisper (small or medium, correct language, `initial_prompt` listing the technical terms) on short windows. Mixed-language speech (e.g. Hinglish) is hard for ASR: combine a multilingual and an English pass, rebuild the lines, and tell the user which lines are uncertain.
4. **Plan scenes:** one scene per idea, starting within 0.5 s of when the speaker starts that point. Write a timeline table (t0, t1, scene, visuals) before coding.
5. **Build the panel:** a Python/PIL per-frame renderer piped as raw RGBA into ffmpeg (see `scripts/panel_example.py` for the cream theme and `scripts/panel_example_blueprint.py` for the dark blue theme with a technology logo). Preview 12 to 16 timestamps in one grid image, fix any overlap or overflow, then render.
6. **Captions:** `scripts/build_captions.py` (exact text, voiced-time sync, keyword highlights) produces an ASS file, burned in with ffmpeg's `ass` filter.
7. **Render:** a master at CRF 18, plus a two-pass H.264 copy at about 1750k video / 128k audio, which keeps a ~2 min reel under 30 MB.
8. **Deliver:** the video, a one-line summary per scene, any uncertain caption lines, and (if asked) a short Instagram caption and 5 to 6 hashtags.

## Explainer scene recipe

1. **Hook:** a real-life example or a bold claim, animated (e.g. a parcel delivered, then a phone notification pops up; or a big highlighted title).
2. **Title card:** "How <Topic> works" in large serif, key term in the accent colour, plus a "Problem statement ->" chip.
3. **Problem first:** animate the bad path step by step (sequential steps lighting up, a timer counting up, a full-scan counter, a CPU meter to 100%), then a tilted stamp ("BLOCKING CODE", "DB CRASH").
4. **Solution:** a flow diagram with data moving along arrows (dots, message chips), showing why it's better ("responded in 120 ms", "3 hops vs 10M rows").
5. **Name the parts:** highlight components one by one (Producer, Queue, Consumer).
6. **Comparisons** as side-by-side panels, with the one being discussed highlighted.
7. **Scale, failure, trade-offs:** counters, extra workers appearing, crash, retry 1/3 to 3/3, dead letter queue, storage bars, write fan-out.
8. **Tools and options** as cards sliding in one by one, each with a one-line use case.
9. **Ending:** one big takeaway line, or the speaker's closing question ("Answer in the comments"). Don't reveal the answer to a closing question.

Keep on-screen text short. The diagram explains; the captions carry the words.

## Panel layout (explainer)

- Canvas 1080 wide x (empty-area edge + 60) tall, overlaid at 0,0.
- **Wavy bottom edge:** `y = edge + 14 + 10*sin(2*pi*x/150 + t*2.2)`. Transparent below it, with a 7 to 8 px solid line along the wave.
- **Series label** top-left (y 100 to 140): small red bar + the series name in small caps. Omit it if there's no series.
- **Scene title** below it in bold serif (e.g. Lora Bold, about 60px), sliding in.
- Keep content below y=100 (platform top UI) and above the wave.
- **Background animation:** grid texture drifting slowly (offset `t*6, t*4`), grain, a few twinkling specks.
- **Motion:** ease-out slide or fade, back-ease pop for chips and stamps, 0.3 s scene cross-fades, arrows that draw themselves, dots moving along paths.
- **Boxes with an icon:** put the icon at the left inside the box and centre the label in the remaining space, shrinking the font to fit, so they never overlap.

## Theme library (rotate)

| Theme | Base | Grid | Ink/text | Accents |
|---|---|---|---|---|
| Dark graph paper | #080A0D | #181D24 / #242B34 | #F0F3F6 | orange #FF9F1C, teal #2EC4B6, red #EF4444, green #22C55E, blue #3B82F6, yellow #FACC15 |
| Cream graph paper | #F6F2E9 | #E2DCCE / #D2CABA | ink #1B2430 | teal #0C8C7C, orange #E87700, red #D63031, green #2B8A3E, blue #1C6EC4, highlighter #FFD43B |
| Blueprint (dark blue) | #0E3A5C | #1D4E75 / #2A6190 | #EAF2FA | amber #FFB703, cyan #4CC9F0, coral #FF6B6B, lime #95D5B2 |
| Chalkboard | #1F3A2E | #2B4A3C | chalk #EDEDE4 | yellow #FFD166, coral #EF8354, sky #8ECAE6 |
| Newsprint | #EFE9DD | dotted #D9D0BF | #222222 | red #C0392B, navy #1D3557, mustard #E9A23B |

Keep a note of which theme each reel used (and which was the latest), so the next reel picks a different one. Never guess episode numbers; ask.

## Captions spec

- **Explainer:** Poppins Bold 58, white, black outline 7, shadow 3, bottom-centre. MarginV is chosen so the text sits on the chest just below the face, between the hands, a little above the platform's bottom UI (typically 340 to 390 at 1920 height). Check the face and hand position in frames first.
- **News roundup:** Poppins Bold 80, just above the card band.
- **Line length:** at most 2 lines, about 46 characters per chunk. Split at sentence or comma boundaries; attach short fragments like "So," to the next line.
- **Timing:** by voiced time inside each transcript segment.
- **Pop-in:** `{\fscx85\fscy85\t(0,120,\fscx103\fscy103)\t(120,200,\fscx100\fscy100)}`
- **Highlights:** colour a small set of key terms and numbers in the theme's accent. Don't highlight words that appear in almost every line.

## News roundup specifics

- **Cards** go in a lower band (canvas 1080x660 at y about 990) with an animated striped gradient tinted by a per-company accent colour.
- **Card types:** title, quote, launch (date pill + "LAUNCHED" + tag), stat rows with animated comparison bars, rotated comedy stamp, and image (real screenshot cropped to the readable part, rounded corners, shadow, optional date label).
- **Sound effects,** synthesized with numpy: riser + boom intro, a soft whoosh per card, record scratch, slide whistle + bonk, boing, and a sad trombone for sarcastic beats. Mix under the voice with `amix normalize=0` and `alimiter`.

## Optional fixes

- **Window or curtain glare:** in a feathered zone around the window, find pixels that are bright (lum > 105) and neutral (low saturation). Blur that mask at 1/4 resolution, then blend toward the curtain colour. Never touch the face or clothes.

## Render commands

```bash
python3 panel.py | ffmpeg -y -i SRC.mp4 -f rawvideo -pix_fmt rgba -s 1080x{H} -r 30 -i - \
  -filter_complex "[0:v]scale=1080:1920:flags=lanczos,fps=30,setsar=1[b];[b][1:v]overlay=0:0:eof_action=pass,ass=caps.ass:fontsdir=<fonts>[v]" \
  -map "[v]" -map 0:a -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k master.mp4
ffmpeg -y -i master.mp4 -c:v libx264 -preset medium -b:v 1750k -pass 1 -an -f null /dev/null
ffmpeg -y -i master.mp4 -c:v libx264 -preset medium -b:v 1750k -pass 2 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart final.mp4
```

Fonts: Poppins (Bold/Medium/Regular), Lora Bold for serif titles, DejaVu Sans Mono for code. Requirements: ffmpeg, Python 3 with numpy and pillow, and optionally faster-whisper.

## Instagram caption format (if requested)

- **Explainer:** first line "Episode N: How <Topic> works", then one short hook line in the reel's language, one comment prompt, and 5 to 6 hashtags.
- **News:** the series name with the date range, a two-line hook, a one-line list of the stories, and a comment prompt.
- Keep it to 3 to 4 lines.

## Before delivering

- [ ] No black gap between the panel and the video at any timestamp
- [ ] Theme differs from the last reel, and no banned colours
- [ ] Every scene starts when the speaker starts that point
- [ ] Captions are exact (when a transcript was given), readable, and never cover the face
- [ ] No text overflows or overlaps inside boxes
- [ ] Frames checked from the final exported file
