# Split-panel mode (empty black area on top)

For videos recorded with the creator in the bottom part of the frame and the top left empty (black). The empty area becomes an animated diagram panel synced to the speech; the creator's real background stays untouched.

## Measure the empty area

Sample every 0.5 to 1 s, find the first row with mean brightness above 12, and store the bottom edge per second. It can move between cuts. The panel must cover the maximum nearby edge at every moment, so a black strip never shows.

## Panel layout

- Canvas 1080 wide x (edge + 60) tall, overlaid at 0,0.
- **Wavy bottom edge:** `y = edge + 14 + 10*sin(2*pi*x/150 + t*2.2)`. Transparent below it, with a 7 to 8 px solid line along the wave.
- **Series label** top-left (y 100 to 140): small red bar + the series name in small caps.
- **Scene title** below it in bold serif (Lora Bold, about 60 px), sliding in.
- Keep content below y=100 (platform top UI) and above the wave.
- **Background:** grid texture drifting slowly (offset `t*6, t*4`), grain, a few twinkling specks.
- **Motion:** ease-out slide or fade, back-ease pop for chips and stamps, 0.3 s scene cross-fades, self-drawing arrows, dots moving along paths.
- **Boxes with an icon:** icon at the left inside the box, label centred in the remaining space and shrunk to fit.

## Scene recipe

1. **Hook:** a real-life example or a bold claim, animated.
2. **Title card:** "How <Topic> works" on two balanced lines, key term in the accent colour, plus a "Problem statement ->" chip.
3. **Problem first:** the bad path step by step (timer, full-scan counter, CPU meter), then a tilted stamp ("BLOCKING CODE", "LIMIT HIT").
4. **Solution:** a flow diagram with data moving along arrows, showing why it's better.
5. **Name the parts** one by one.
6. **Comparisons** side by side, the active one highlighted.
7. **Scale, failure, trade-offs:** counters, extra workers, crash, retries, storage bars.
8. **Tools and options** as cards sliding in, each with a one-line use case.
9. **Ending:** one takeaway line, or the speaker's closing question (don't reveal its answer).

## Theme library (rotate)

| Theme | Base | Grid | Ink/text | Accents |
|---|---|---|---|---|
| Dark graph paper | #080A0D | #181D24 / #242B34 | #F0F3F6 | orange #FF9F1C, teal #2EC4B6, red #EF4444, green #22C55E, blue #3B82F6, yellow #FACC15 |
| Cream graph paper | #F6F2E9 | #E2DCCE / #D2CABA | ink #1B2430 | teal #0C8C7C, orange #E87700, red #D63031, green #2B8A3E, blue #1C6EC4, highlighter #FFD43B |
| Blueprint (dark blue) | #0E3A5C | #1D4E75 / #2A6190 | #EAF2FA | amber #FFB703, cyan #4CC9F0, coral #FF6B6B, lime #95D5B2 |
| Chalkboard | #1F3A2E | #2B4A3C | chalk #EDEDE4 | yellow #FFD166, coral #EF8354, sky #8ECAE6 |
| Newsprint | #EFE9DD | dotted #D9D0BF | #222222 | red #C0392B, navy #1D3557, mustard #E9A23B |

## Captions (ASS, burned in)

`scripts/split_panel/build_captions.py`: Poppins Bold 58, white, black outline 7, shadow 3, bottom-centre, MarginV chosen so the text sits on the chest between the hands (typically 300 to 390 at 1920 height). At most 2 lines, about 46 characters per chunk, balanced `\N` breaks, single-word chunks merged into a neighbour, timed by voiced time, a few key terms highlighted in the theme accent, and pop-in `{\fscx85\fscy85\t(0,120,\fscx103\fscy103)\t(120,200,\fscx100\fscy100)}`.

## Render

```bash
python3 panel.py | ffmpeg -y -i SRC.mp4 -f rawvideo -pix_fmt rgba -s 1080x{H} -r 30 -i - \
  -filter_complex "[0:v]scale=1080:1920:flags=lanczos,fps=30,setsar=1[b];[b][1:v]overlay=0:0:eof_action=pass,ass=caps.ass:fontsdir=<fonts>[v]" \
  -map "[v]" -map 0:a -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k master.mp4
```

Examples: `scripts/split_panel/panel_example.py` (cream theme) and `panel_example_blueprint.py` (dark blue, logo in boxes).

## News roundup variant

Full-frame speaker with cards in a lower band (canvas 1080x660 at y about 990): title, quote, launch, stat bars, comedy stamps and real screenshots (never fabricated tweet UIs), English captions at Poppins Bold 80 above the band, and synthesized comedy SFX (riser + boom, whoosh per card, record scratch, sad trombone).
