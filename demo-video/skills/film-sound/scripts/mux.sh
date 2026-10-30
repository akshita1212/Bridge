#!/bin/sh
# Put a mix under a picture-only render: mux.sh <video.mp4> <mix.wav> <out.mp4> [gain dB, default 0] [audio bitrate, default 256k]
# Find the gain with loudness.sh: target −17 LUFS for a web/social film (gain = −17 − measured I).
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
F="${FFMPEG:-$(node --input-type=module -e "import('$DIR/lib.mjs').then(m => console.log(m.ffmpeg()))")}"
"$F" -hide_banner -loglevel error -y -i "$1" -i "$2" -map 0:v -map 1:a -af "volume=${4:-0}dB" -c:v copy -c:a aac -b:a "${5:-256k}" -shortest -movflags +faststart "$3" && echo "muxed → $3"
