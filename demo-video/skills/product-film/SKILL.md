---
name: product-film
description: Make a polished product demo, how-to, walkthrough or launch film from the product's REAL UI, rendered frame by frame to MP4 with a camera, cursors, typing, drawn arrows, captions, a brand title card and an ending. Use this whenever someone wants a video of their app, a product demo or explainer video, a "how to use" film, an animated feature walkthrough, a launch or marketing video built from real screens, or wants to redo or improve such a film, even if they never say "film" or "skill" (e.g. "make a video showing how a lead becomes a tenant in our app"). Pairs with the film-sound skill for music and UI sounds.
---

# Product film from the real UI

This is how the Autoproperty "Lead to tenant" film was made (Oct 2026): 71 seconds, 1080p60, accepted by the founder
after three rounds. The method generalises to any web product.

**The idea in one line:** run the product's real screens on sample data, freeze each one into a static page, then
animate those pages' own DOM with a film script where every frame is a pure function of time, `seek(t)`, and render the
frames to video. Nothing is redrawn by hand, so the film shows the product as it is, and any frame can be re-rendered
alone.

Why this way and not a screen recording or a mock-up:
- A screen recording is stuck with real timing, real loading and the real cursor. Here you choose every move.
- A mock-up drifts from the product and gets caught. A frozen real screen is the product, pixel for pixel.
- `seek(t)` makes the film deterministic: stills at any second for review, motion blur by rendering sub-frames, and a
  change at 40 s never disturbs 10 s.

## What you need
- Node 18+, and in the film folder `npm install` (Playwright and ffmpeg-static), then `npx playwright install chromium`.
  If a project nearby already has them, set `FILM_NODE_MODULES=<that project>` and `FFMPEG=<path to ffmpeg>` instead.
- The product running locally (or a URL you are allowed to read), and sample data for it.
- The brand's website or design system (logo, colours, fonts, its motion) for the title card and the ending.

## Workflow
Keep a task list with these steps. Show stills before you render the full film. Rendering is the slow, expensive step,
and the person can correct direction from stills in a minute.

1. **Start a film folder.** `sh <this skill>/scripts/new-film.sh <dir> [--install]` copies the starter film (a
   working 15 s example of every part), the tools and a package.json. Run the starter once (`node tools/frames.mjs
   render/stills 1 5 10`) to prove the setup before touching anything.
2. **Write the storyboard** (`references/storyboard.md`): the flow the person asked for, in their order; one subject
   carried through (one applicant, one customer); one takeaway per scene; a timeline on a beat grid; numbered
   decisions they can overturn in one line. Reuse the brand website's own story, people and copy where it fits.
3. **Freeze the screens** (`references/freezing.md`): one shot per screen state, API reads answered with sample data,
   every write aborted. Check each freeze (`node tools/check-snap.mjs <name>`) against its `ref.png`.
4. **Build the film** (`references/engine.md`): edit `film/film.js`. Measure the real elements in `init()`, plan the
   camera, cursors, notes and sound cues in `schedule()`, and set the real DOM for time t in `draw(t)`.
5. **Brand moments** (`references/brand-moments.md`): the logo, the title card, the big state change and the ending
   come from the brand's own website motion, ported, not invented.
6. **Review with stills**: `node tools/frames.mjs render/stills --every 1` then `sh tools/sheet.sh render/stills
   render/sheet.png`. Look at every frame for empty boxes, clipped text, the wrong thing in focus, unreadable captions.
   Check the rules in `references/review-rules.md`.
7. **Sound**: export the cues (`node tools/frames.mjs --cues audio/cues.json`) and use the **film-sound** skill.
8. **Render**: a draft at `--fps 30 --sub 1` (seconds to minutes), the master at `--fps 60 --sub 3 --crf 16`
   (3 sub-frames blended = motion blur). Mux the audio (film-sound), then `sh tools/qa.sh <film.mp4> render/qa`.
9. **Deliver**: the master, a share copy under 30 MB (`--crf 24`, AAC 192k), stills of every scene, and a README that
   lists sources, licences and what is sample data.
10. **Iterate**: take feedback per round, keep the earlier cut, fix only what was asked, and turn each piece of
   feedback into a written rule for the next film (`references/review-rules.md` shows the ones learned so far).

```
node tools/snap.mjs shots/app.mjs --origin http://localhost:3000 [--auth auth.json]   # freeze screens
node tools/check-snap.mjs app                                                         # freeze vs reference
node tools/frames.mjs render/stills 2 8 15  |  --every 1  |  --cues audio/cues.json    # stills / sound cues
sh tools/sheet.sh render/stills render/sheet.png 4 480                                 # one-page contact sheet
node tools/capture.mjs app film/img/row.png --selector ".row"                          # real image for a morph card
node tools/render.mjs render/video.mp4 --fps 60 --sub 3 --crf 16                       # picture only
sh tools/qa.sh deliver/film.mp4 render/qa                                              # storyboard, jumps, loudness
```

## Rules that matter most
These came from real feedback. The reasons are in `references/review-rules.md`.
- **Real UI only, sample data only.** Never write to a live system: the freezer aborts every non-GET request. Use
  invented customers, and real names only for your own team (the PM in the film was "Akshat", never an invented name).
- **Brand moments are the brand's own.** Port the website's loader, word motion, cards and closing chapter. An
  invented flourish reads as cheap next to the real website.
- **The title leads its card.** The logo can arrive big, but when the headline comes in the logo steps back,
  smaller and higher.
- **No empty boxes in motion.** A card flying between screens carries real images of both ends (`tools/capture.mjs`);
  the place it lands opens before it arrives.
- **Sound stays quiet and real** (film-sound): UI clicks, taps and typing, one licensed music bed, a real sound at the
  logo or nothing.
- **Taste choices come as options.** Same cut, each option, same loudness; keep the current one; let the person pick.

## Working practice
- One heavy job at a time on a laptop: a render, a dev server and a browser test at once will swap memory.
- Stop the dev server and any background job when done. Note where every output landed.
- The film's own README records: what is real UI, what is sample data, every asset's source and licence, how to
  re-freeze and re-render.

## Files in this skill
- `scripts/new-film.sh`: start a film folder.
- `scripts/tools/`: `snap.mjs`, `check-snap.mjs`, `capture.mjs`, `frames.mjs`, `render.mjs`, `qa.sh`, `sheet.sh`,
  `lib.mjs` (copied into each film folder's `tools/`).
- `assets/starter/`: `film/engine.js` (the engine), `film/film.js` (the example film), `film/index.html` (the stage and
  its CSS), `example-app/` (a stand-in product), `shots/example.mjs`, `data/sample.mjs`, `snap/app/` (its frozen copy).
- `references/`: `storyboard.md`, `freezing.md`, `engine.md`, `brand-moments.md`, `review-rules.md`, `gotchas.md`.
