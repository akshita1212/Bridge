#!/bin/sh
# QA of a rendered film: tools/qa.sh <film.mp4> <outdir>
# Prints the streams, a 1-per-second storyboard, the ten largest frame-to-frame jumps (hard cuts or glitches worth a look),
# and the loudness (integrated LUFS, range, true peak).
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
F="${FFMPEG:-$(node --input-type=module -e "import('$DIR/lib.mjs').then(m => console.log(m.ffmpeg()))")}"
IN="$1"; OUT="$2"; mkdir -p "$OUT"
"$F" -hide_banner -i "$IN" 2>&1 | grep -E "Duration|Stream"
"$F" -hide_banner -loglevel error -y -i "$IN" -vf "fps=1,scale=320:-1,tile=8x10:padding=3" -frames:v 1 "$OUT/storyboard.png"
"$F" -hide_banner -i "$IN" -vf "scale=480:-1,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=$OUT/diff.txt" -an -f null - 2>/dev/null
python3 -I - "$OUT/diff.txt" <<'PY'
import re, sys
vals = []; t = 0
for line in open(sys.argv[1]):
    m = re.search(r"pts_time:([\d.]+)", line)
    if m: t = float(m.group(1))
    m = re.search(r"YAVG=([\d.]+)", line)
    if m: vals.append((t, float(m.group(1))))
vals.sort(key=lambda x: -x[1])
print("largest frame jumps:", ", ".join(f"{t:.2f}s={v:.1f}" for t, v in vals[:10]))
PY
"$F" -hide_banner -nostats -i "$IN" -af ebur128=peak=true -f null - 2>&1 | grep -A14 "Summary" | grep -E "I:|LRA:|Peak:"
echo "storyboard → $OUT/storyboard.png"
