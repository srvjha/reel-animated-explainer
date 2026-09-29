# Full-screen mode (speaker fills the frame)

For videos where the creator fills the whole 9:16 frame (no empty black area). The creator is cut out, placed over a designed background, and the reel alternates between the speaker, "depth" moments with text behind them, and full-screen animated clips. Caption and headline styles are borrowed from [veedstudio/open-edit](https://github.com/veedstudio/open-edit) recipes (template-034 captions, hook-244 pixel headline), rendered with Chromium instead of the VEED engine (which ships only for macOS and Windows).

## Look (default "arcade" style)

- **Background:** black to very dark navy gradient (#040507 to #0A1120) with a blue grid (#3B82F6 at about 10% alpha every 60 px, 22% every 240 px), a subtle blue perspective floor grid, and faint scanlines. **No warm glow, no sun or circle shapes**: they clashed with the diagrams.
- **Captions (template-034):** word by word at each word's spoken time, Archivo Black about 74 px, white with a hard black offset shadow, left-aligned board above the bottom UI (bottom about 318 px). Key terms pop in on a **yellow plate** (#FFE500, black text). Two lines per page at most; a line that is too wide shrinks to fit in the browser; never a single word alone on a line.
- **Headlines (hook-244):** Press Start 2P, cream fill with an orange-red extruded shadow, each glyph lighting up like a neon sign in random order. Title words sit **behind the speaker's head** (depth).
- **Plates:** small tilted stickers at the top (yellow, cream or green), red strike-through for "don't do this" words, a giant red counter numeral top-right (e.g. "1000", then "20"), and the closing line as **red CTA plates** (#FF2E12).
- **Clips:** full-screen terminal typing, pixel diagrams (boxes, pipes, queues, pool slots), wiping in and out (clip-path, 0.28 s).
- **Audio:** a synthesized chiptune bed at about -20 dB, ducked under the voice with ffmpeg `sidechaincompress`, plus 8-bit SFX (blip on plates, coin on "reuse", bit-crushed boom and game-over jingle on a failure, power-up on the main title, whoosh on clips).

## Timeline pattern

1. **Hook (depth):** big pixel title behind the head, series tag top-left, a small "in <Tech> + logo" sticker on the shoulder. Captions start after the spoken title.
2. **Speaker moments** with plates and counter numerals, and a slow alternating zoom (1.0 and 1.1, +5% over the segment).
3. **Full-screen clips** for the mechanism (e.g. terminal handshake, bottleneck, how the pool works), timed to the words.
4. **Failure moment (depth):** something fills up behind the speaker (blocks plus a 000/100 counter), then a shaking "LIMIT HIT" with a flash and a short screen shake.
5. **Callback (depth):** the main title slams in again when the speaker names the solution.
6. **Finale (depth):** the production tool as a big title, and the takeaway as red CTA plates.

## Pipeline (scripts/full_screen)

| Step | Script | Notes |
|---|---|---|
| Word timings | `asr_anchors.py`, `align_words.py` | Hinglish ASR is unreliable. Run the English pass, hand-pick about 100+ clearly heard words as anchors, and spread the rest by loudness. **Ask the creator for a transcript with rough timestamps first**: it saves about 30 minutes. |
| Cut-out | `matte.py` | ISNet (medium) plus a MediaPipe body core, every 3rd frame, blended in between. Skip the inside of full-screen clips. About 2 s per computed frame on 2 CPUs. |
| Layers | `build_layers.py` (example) | Writes `front.html` and `behind.html`: CSS keyframes with absolute delays; anchors come from `words.json`. |
| Composite | `compose.py` | Playwright seeks every animation to t, screenshots both layers, composites behind + cut-out speaker + front. `preview t1 t2 ...` makes a grid. |
| Audio | `audio.py` | music.wav + sfx.wav from the timeline anchors. |
| Render | `render_chunks.sh` | 360-frame chunks with a fresh browser each (one long run ran out of memory at about 1800 frames), concat, audio mix, then the two-pass 1750k copy. |

## Timing budget (107 s reel, 2 CPUs)

Cut-out about 20 min, render about 25 min, encode about 5 min. With a transcript supplied, about 50 minutes end to end. If the creator's Mac is linked, VEED's background removal and the open-edit engine can run there instead.

## Checks

- Preview grid from `compose.py preview` before the full render. The preview seeks with ffmpeg, so a fast head move can look ghosted there; the sequential render is exact.
- Blocks, titles and counters must not be hidden behind the speaker's body: fill from the top, keep counters in the corners.
- Frames checked from the final exported file.
