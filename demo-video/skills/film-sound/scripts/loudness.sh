#!/bin/sh
# Loudness of a file's audio: loudness.sh <file>  → integrated LUFS, loudness range, true peak.
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
F="${FFMPEG:-$(node --input-type=module -e "import('$DIR/lib.mjs').then(m => console.log(m.ffmpeg()))")}"
"$F" -hide_banner -nostats -i "$1" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -A14 "Summary" | grep -E "I:|LRA:|Peak:"
