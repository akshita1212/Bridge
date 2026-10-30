#!/bin/sh
# Start a film folder: scripts/new-film.sh <dir> [--install]
# Copies the starter film (engine, an example film, an example app and its shot list, sample data) and the tools into <dir>,
# writes a package.json for Playwright and ffmpeg-static, and with --install runs npm install and fetches Chromium.
set -e
SKILL=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DEST="$1"
[ -n "$DEST" ] || { echo "usage: new-film.sh <dir> [--install]"; exit 1; }
[ -e "$DEST/film/film.js" ] && { echo "$DEST already has a film; nothing copied"; exit 1; }
mkdir -p "$DEST"
cp -R "$SKILL/assets/starter/." "$DEST/"
mkdir -p "$DEST/tools" "$DEST/audio" "$DEST/render" "$DEST/deliver"
cp "$SKILL/scripts/tools/"* "$DEST/tools/"
[ -f "$DEST/package.json" ] || cat > "$DEST/package.json" <<'JSON'
{
  "name": "product-film",
  "private": true,
  "type": "module",
  "devDependencies": { "playwright": "^1.48.0", "ffmpeg-static": "^5.2.0" }
}
JSON
if [ "$2" = "--install" ]; then
  (cd "$DEST" && npm install && npx playwright install chromium)
fi
echo "Film folder ready: $DEST"
echo "Next: npm install (if you skipped --install), then"
echo "  node tools/frames.mjs render/stills 1 4 6 10 14   # stills of the starter film"
echo "  node tools/render.mjs render/draft.mp4             # a fast draft"
