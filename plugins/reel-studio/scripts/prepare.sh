#!/usr/bin/env bash
# Usage: prepare.sh <input-video> <workdir> <theme-dir>
# Normalizes the video to 1080x1920 @30fps, extracts 16 kHz audio for ASR,
# and creates a Remotion project in <workdir>/rem with the chosen theme installed.
set -euo pipefail
IN="$1"; WD="$2"; THEME="$3"
HERE="$(cd "$(dirname "$0")" && pwd)"; TPL="$HERE/../engine/template"
[ -f "$THEME/kit.tsx" ] || { echo "theme dir must contain kit.tsx: $THEME"; exit 1; }
mkdir -p "$WD"; cd "$WD"
ffmpeg -v error -y -i "$IN" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" \
  -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 src.mp4
ffmpeg -v error -y -i src.mp4 -vn -ac 1 -ar 16000 audio16k.wav
mkdir -p rem
cp -r "$TPL"/. rem/
mkdir -p rem/src/theme rem/public rem/stills
cp "$THEME/kit.tsx" rem/src/theme/kit.tsx
cp "$THEME/theme.json" rem/src/theme/theme.json
[ -f "$THEME/example/Video.tsx" ] && cp "$THEME/example/Video.tsx" rem/src/Video.example.tsx
ln -f src.mp4 rem/public/src.mp4 2>/dev/null || cp src.mp4 rem/public/src.mp4   # a symlink 404s in Remotion
echo "{\"theme\": \"$THEME\"}" > reel.json
FONTS=$(python3 -c "import json;print(' '.join(json.load(open('rem/src/theme/theme.json')).get('npm',[])))")
cd rem && npm install --silent --no-audit --no-fund $FONTS >/dev/null
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 ../src.mp4)
echo "ready: $WD  duration=${DUR}s  theme=$(python3 -c "import json;print(json.load(open('src/theme/theme.json'))['name'])")"
