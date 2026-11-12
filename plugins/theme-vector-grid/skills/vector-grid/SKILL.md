---
name: vector-grid
description: "Reel theme: vector grid. Use when the reel must be edited with herk-edit-kit (HyperFrames + GSAP) rather than Remotion, or for AI system design explainers about caching, embeddings, vector search, similarity, thresholds or invalidation. Dark graph paper, teal concept color, red wrong way, green payoff; hard-cut split / full / face / punch-in layouts with kit-style boxed captions."
---

# Theme: Vector Grid (herk-edit-kit)

Reference reel: `theme/example/gen.py` (AI System Design Ep 3: why your normal Redis cache won't work for AI chatbots, 126.8 s, 18 scenes, 167 caption chunks).

## Pipeline
1. Clone https://github.com/nateherkai/herk-edit-kit, `npm ci`, `npm run new-video -- <slug>`.
2. Transcribe with faster-whisper (language `hi` + a romanized Hinglish prompt) to `[start, end, word]`.
3. `cut.py`: find real silences (`silencedetect -26dB d=0.2`), keep 0.07 s each side, snap to frames. Cut video by frame number (`fps=30,select=between(n,..)`) and audio by the same times in one pass, so lips stay in sync.
4. `words.py`: fix ASR spellings into readable Hinglish and remap word times onto the cut timeline.
5. `gen.py`: writes `compositions/sNN.html` (one 1080x880 sub-composition per scene, own paused timeline) and `index.html` (graph-paper background, clip-path face layer, `#stagewrap` holding the scene mounts, layout sets and captions on the main timeline). Every entrance is keyed to a spoken word with `T(word, after)`.
6. Fonts come from `@fontsource` npm packages into `assets/fonts` (Google Fonts is not reachable in the render sandbox). Logos from the `simple-icons` package.
7. `npx hyperframes lint`, then render with `HYPERFRAMES_BROWSER_PATH` set to the Playwright headless shell. Render video only, mix audio separately (`sfx.py` + music, voice -15 LUFS, music about 11 dB under with sidechain ducking, master -14 LUFS / -1.5 dBTP), then mux.

## Do / don't
- Keep the speaker's real background. No banners or stamp plates. Never a single word alone on a line.
- Label example numbers (thresholds, similarity scores, vector values) as illustrative.
- Face never gone for much more than 3.5 s; alternate split / full / punch-in by beat.
