# Gotchas (each one cost real time)

**Freezing**
- Serialize stylesheets from their **source text**, not the CSSOM: `cssText` empties shorthands that use `var()`, so a
  `font:` with variables comes back blank and the frozen page loses its type. `snap.mjs` already does this.
- `html, body { overflow: hidden }` in a frozen page kills sticky footers. Hide the scrollbars instead (snap.mjs does).
- Native selects: find them by their selected option's text; reveal their value through `color` if the product dims it.
- Inputs, textareas, selects, details, progress and scroll positions are live state: snap.mjs writes them into
  attributes so the frozen copy keeps them. A canvas becomes an image.
- Phone pages: freeze at 390 × 800 so a 44 px status bar fits above them inside an 844 px screen.
- A client-only export used from a server page fails (`X.find is not a function`): keep shared fixture data in a plain
  module, not in a "use client" file.
- Long dev-server sessions grow the bundler's cache; restart the dev server between freezing sessions if it slows.

**Animating**
- Switch off every animation and transition inside frozen pages (`loadSnaps` does). Otherwise a just-revealed frame
  sits on an entry animation's first keyframe (opacity 0) and a panel looks missing, only when seeking out of order.
- Measure elements in `init()` after fonts load, and measure positions in the pose where you use them (a row's
  position after the list opened a gap, a button inside an opened call).
- Auto-scrolling transcripts snap per line if you set scrollTop per line; spring it to the measured total height.
- A morph card with no content reads as a bug (FILM-4): capture both ends as images.

**Rendering**
- Blur from `--sub 3` costs three captures a frame; render drafts at `--fps 30 --sub 1` and only the master at 60/3.
- JPEG capture at quality 94 is visually lossless and far faster than PNG; use `--img png` only for flat-colour art.
- A share copy under 30 MB (CRF ~24, AAC 192k) passes chat and phone limits; keep the master at CRF 16.

**Shell and tools**
- zsh does not split `$var` into words: pass multi-part arguments one by one (a music option once came out silent).
- Keep one heavy job at a time on a laptop: a render, a dev server and a browser test together will swap.
