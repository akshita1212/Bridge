---
name: bridge-demo-video
description: Everything about the Bridge product demo film in this folder (demo-video/) — what each scene shows, where every word, time and screen lives, and how to edit, re-freeze, re-time, re-sound and re-render it. Use whenever someone wants to change, extend, shorten, rebrand, re-voice or re-render the Bridge demo video, make a new cut or a similar film from it, or asks how the video was made.
---

# Bridge demo video

A 112-second, 1920 × 1080, 60 fps product demo of Bridge, made from the **real Bridge app** (this repo's `src/`) frozen
on its demo project and animated frame by frame. Every frame is a pure function of time, `seek(t)`, so any moment can
be re-rendered alone and the whole film can be retimed from one table.

It was made with the **product-film** and **film-sound** skills (copies in `skills/`). Read
`skills/product-film/SKILL.md` for the general method; this file is the specific map of *this* film.

## Start here
1. Read `STORYBOARD.md`: the scenes, their times, captions, decisions and the feedback that shaped them.
2. Open `index.html` (served, see below) to see every scene's still, its caption and the real screen it uses.
3. Open `player.html` to scrub the live film; it reloads your edits to `film/film.js`.

Serve the folder over http, because browsers block the frozen screens' iframes on `file://`:
```
cd demo-video && npx serve .        # or: python3 -m http.server 8000
```

## The scenes (seconds)
| # | Time | Caption | Screen (`snap/`) |
|---|---|---|---|
| 00 | 0–4.3 | Title: "One shared understanding for every project." | — |
| 01 | 4.3–8.8 | One place for every project. | `home` |
| 02 | 8.8–22.3 | Start a project, bring your team. (job roles) | `create` |
| 03 | 22.3–35.6 | Everyone adds what they have. | `ov` |
| 04 | 35.6–47.6 | The Overview starts with a summary. | `ov` |
| 05 | 47.6–58.6 | Then what matters most. | `ov` |
| 06 | 58.6–68.6 | Every finding shows its proof. (source + confidence) | `evidence` |
| 07 | 68.6–81.6 | Decisions move the timeline. | `ov` (Timeline section) |
| 08 | 81.6–93.1 | Ask the agent anything. | `agent0`, `agent1` |
| 09 | 93.1–106.7 | Get it as audio or video. | `agent2`, `agent3` |
| 10 | 106.7–112 | Thank you. | — |

## Where things live
| To change… | Edit | Notes |
|---|---|---|
| A caption's words | `film/film.js` → `CHAPTERS` | `title` and `sub`; the number badge is `num` |
| When anything happens | `film/film.js` → `TL` | One object, grouped by scene. Moving a scene = change its numbers and every later one by the same amount. Sound cues follow automatically. |
| The title or thank-you card | `film/film.js` → `init()` (the `E.title` / `E.endcard` lines) and `film/index.html` (`#lockup`, `#title`, `#endcard` styles) | |
| A note and its arrow | `film/film.js` → `schedule()`, the `note(...)` calls | `note(t0, t1, target, [dx, dy], "label", "small line", bend)`; the label's top-left sits at target + [dx, dy] and the arrow leaves from the label edge facing the target (`film/engine.js` → `drawNotes`) |
| Camera framing | `film/film.js` → `schedule()`, the `CAMERA.to(...)` calls | Each frames a rectangle of the 1470 × 860 screen |
| Cursor moves and clicks | `film/film.js` → `schedule()`, `curMove` / `click` and `YOU.windows` | The cursor's name pill is in `film/index.html` ("Akshat") |
| Typed text | `film/film.js` → `Q1`, `Q2`, `Q3` (agent) and the `create` freeze (name, roles) | Typing speed is the `typed(text, t0, step, t)` step |
| What a screen looks like | the app (`src/`), then re-freeze | See "Re-freeze" |
| Colours and fonts of captions | `film/index.html` `:root` | The app's own look comes from the frozen screens |
| Music and sound | `audio/cues.json` (written from `TL`) and the mix step | See "Sound" |

## Rules this film follows (from the feedback rounds)
- **Real UI only.** Every product frame is a frozen page of the actual app, never a mock-up. Small demo-only text
  fixes happen in `init()` (e.g. "Jamie's workspace" → "Akshat's workspace"), not in the app.
- **Bridge's words.** The space is called **Overview** (never "Map"); it is one page: Summary → cards → Timeline.
  Roles are **jobs** (Product Manager, Designer, Engineer, Researcher, Stakeholder).
- **Our side is Akshat** (the cursor). Customers and teammates come from the demo project.
- **Slow and simple.** One idea per scene, caption first, then the action, then a moment to read it. No scene where
  nothing happens: the home scene was halved for that reason.
- **Notes line up with arrows.** The arrow starts at the label edge facing its target; labels sit in empty space,
  never on top of a card.
- **Mic icon shown, not mentioned.** Send turns lime only while text is typed (the app does the same).
- **No footer text on the end card.** Music credit goes where the film is shared:
  "Music: Sascha Ende, ende.app (CC BY 4.0)".
- **Show stills before rendering.** Rendering takes ~30 minutes; stills take seconds.

## Commands
Run inside `demo-video/`. Needs Node 18+ and ffmpeg. Either `npm install && npx playwright install chromium` here, or
point at an existing install: `export FILM_NODE_MODULES=<folder with playwright> FFMPEG=<path to ffmpeg>`.
```
node tools/frames.mjs render/stills 5 30 64 90           # stills at those seconds
node tools/frames.mjs render/stills --every 2            # a still every 2 s
sh tools/sheet.sh render/stills render/sheet.png 6 400   # one contact sheet
node tools/render.mjs render/draft.mp4 --fps 30 --sub 1  # fast draft (minutes)
node tools/render.mjs render/video.mp4 --fps 60 --sub 3 --crf 16   # master (~30 min)
```

### Sound
```
node tools/frames.mjs --cues audio/cues.json
node skills/film-sound/scripts/mix.mjs --cues audio/cues.json --out audio/mix.wav --music vol12 --offset 2
sh skills/film-sound/scripts/loudness.sh audio/mix.wav          # note I (LUFS); gain = -17 - I
sh skills/film-sound/scripts/mux.sh render/video.mp4 audio/mix.wav output/bridge-product-demo.mp4 <gain> 256k
```
The track must outlast the film plus the offset (Vol. 12 is 117 s). For a longer film, add a longer licensed bed.
`audio/preview.m4a` is the final mix used by `player.html`; replace it after re-mixing
(`ffmpeg -i output/bridge-product-demo.mp4 -vn -c:a aac -b:a 160k audio/preview.m4a`).

### Re-freeze a screen (after the app changes)
```
# in the repo root: run the app's UI on port 5175
npx vite --port 5175 --strictPort
# in demo-video/: freeze all screens, or name some
node tools/snap.mjs shots/bridge.mjs --origin http://127.0.0.1:5175
node tools/snap.mjs shots/bridge.mjs ov evidence --origin http://127.0.0.1:5175
node tools/fix-fonts.mjs                # fonts must be local (renders run offline)
node tools/check-snap.mjs ov            # compare snap/ov/frozen.png with snap/ov/ref.png
```
`shots/bridge.mjs` says how each screen is reached: the route, clicks, typed text. Every `/api/` read is answered with
a 404 so the app shows its built-in demo project; every write is blocked. After re-freezing, check stills: element
lookups in `init()` are by text and `data-testid`, and a renamed label logs `MISSING …` in the console.

### Add a scene
1. Freeze its screen (add a shot to `shots/bridge.mjs`).
2. Add its times to `TL` and push every later time back by the scene's length.
3. Add its caption to `CHAPTERS` (renumber the later ones).
4. Show the screen in `draw()` (the `screens([...])` list), add camera moves, cursor, notes in `schedule()`, and any
   per-frame changes in a `drawX(t)` function like `drawEvidence`.
5. Stills → contact sheet → re-mix sound → render.

## Files
`film/` the film (stage, script, engine) · `snap/` frozen screens + `assets/fonts` · `shots/` freeze recipe ·
`tools/` freeze, stills, render, QA · `audio/` cues + preview mix · `skills/` the product-film and film-sound skills
(music Vol. 12 and CC0 effects included) · `output/` final video, share copy, stills, storyboard sheet ·
`index.html` folder map · `player.html` live player · `STORYBOARD.md` · `README.md`.
