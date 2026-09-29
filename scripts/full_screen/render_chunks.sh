# Render in 360-frame chunks (a fresh Chromium per chunk: one long run ran out of memory), then mux audio.
# usage: SRC=/path/video.mp4 bash render_chunks.sh   (run from the work folder that holds web/, alpha/, music.wav, sfx.wav)
set -e
mkdir -p parts
cd web
N=$(ffprobe -v error -select_streams v -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$SRC")
for s in $(seq 0 360 $((N-1))); do
  e=$((s+360)); [ $e -gt $N ] && e=$N
  f=../parts/p$(printf %05d $s).mp4
  [ -f $f ] && continue
  python3 compose.py render $s $e | ffmpeg -v error -y -f rawvideo -pix_fmt rgb24 -s 1080x1920 -r 30 -i - -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p $f.tmp.mp4
  mv $f.tmp.mp4 $f; echo part $s done
done
cd ..
ls parts/p*.mp4 | sed "s/^/file '/;s/$/'/" > parts.txt
ffmpeg -v error -y -f concat -safe 0 -i parts.txt -i "$SRC" -i music.wav -i sfx.wav \
 -filter_complex "[1:a]asplit=2[v1][v2];[2:a][v2]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[m];[v1][m][3:a]amix=inputs=3:normalize=0,alimiter=limit=0.95[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest master.mp4
ffmpeg -v error -y -i master.mp4 -c:v libx264 -preset medium -b:v 1750k -pass 1 -an -f null /dev/null
ffmpeg -v error -y -i master.mp4 -c:v libx264 -preset medium -b:v 1750k -pass 2 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart final.mp4
echo DONE
