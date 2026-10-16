#!/bin/sh
# Turn an ad into what the site needs:
#   <name>.mp4       8 s muted loop for the monitor and previews (long side ≤ 1280)
#   <name>-full.mp4  the whole ad with sound for the viewer (long side ≤ 1920)
#   <name>-0…5.jpg   six scrub stills (540 px tall)
# Never upscales past the source. Needs ffmpeg.
#   npm run media -- path/to/ad.mov [name] [loop-start-seconds]
set -e
in="$1"; name="${2:-$(basename "${in%.*}" | tr 'A-Z ' 'a-z-')}"; ss="${3:-0}"
[ -f "$in" ] || { echo "usage: npm run media -- <video> [name] [loop-start]"; exit 1; }
out="$(dirname "$0")/../public/media"; mkdir -p "$out"
fit() { echo "scale=w='if(gt(iw,ih),min($1,iw),-2)':h='if(gt(iw,ih),-2,min($1,ih))':flags=lanczos"; }
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
len=$(awk -v d="$d" -v s="$ss" 'BEGIN { l = d - s; print (l > 8 ? 8 : l) }')

ffmpeg -v error -y -ss "$ss" -i "$in" -t "$len" -an -vf "$(fit 1280)" \
  -c:v libx264 -crf 21 -maxrate 3500k -bufsize 7000k -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart "$out/$name.mp4"
ffmpeg -v error -y -i "$in" -vf "$(fit 1920)" \
  -c:v libx264 -crf 19 -maxrate 6000k -bufsize 12000k -preset slow -profile:v high -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$out/$name-full.mp4"
for i in 0 1 2 3 4 5; do
  t=$(awk -v s="$ss" -v l="$len" -v i="$i" 'BEGIN { print s + l * (i + 0.5) / 6 }')
  ffmpeg -v error -y -ss "$t" -i "$in" -frames:v 1 -vf "scale=-2:'min(540,ih)':flags=lanczos" -q:v 3 "$out/$name-$i.jpg"
done
echo "$name: $(du -h "$out/$name.mp4" | cut -f1) loop, $(du -h "$out/$name-full.mp4" | cut -f1) full"
