#!/bin/sh
# Contact sheet of stills: tools/sheet.sh <dir of t*.png> <out.png> [cols] [tile width]
# Look at the whole film on one page before rendering it (or before showing anyone).
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
F="${FFMPEG:-$(node --input-type=module -e "import('$DIR/lib.mjs').then(m => console.log(m.ffmpeg()))")}"
IN="$1"; OUT="$2"; COLS="${3:-4}"; TW="${4:-640}"
N=$(ls "$IN"/t*.png | wc -l | tr -d ' ')
ROWS=$(( (N + COLS - 1) / COLS ))
"$F" -hide_banner -loglevel error -y -pattern_type glob -i "$IN/t*.png" -vf "scale=$TW:-1,tile=${COLS}x${ROWS}:padding=4" -frames:v 1 "$OUT"
echo "sheet → $OUT ($N stills)"
