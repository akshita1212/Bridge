# Product film skills

The method, tools and sounds behind the Autoproperty "Lead to tenant" film (Oct 2026), packaged so you can make the
same kind of film for another product.

| Folder | What it is |
|---|---|
| `product-film/` | **The animation skill.** Freeze the product's real screens on sample data, animate them with a pure `seek(t)` film (camera, cursors, typing, drawn arrows, captions, a title card, an ending), render to 1080p60 with motion blur, QA. Includes the engine, every tool, and a starter film that runs as is. |
| `film-sound/` | **The audio skill.** The UI's own clicks, taps and typing from the film's cue list, one licensed music bed timed to the film, a real recording at the logo, music options levelled to the same loudness, mux and loudness checks. Includes five licensed tracks and a curated set of CC0 effects. |
| `upstream/` | The two skills the film borrowed from, as supplied (MIT): `product-launch-motion` (the render technique) and `brag` (the audio library). Text and references only; see `upstream/README.md`. |

## Install
Each skill is a folder with a `SKILL.md`. Put both where your agent looks for skills:
- **Claude Code**, all projects: copy `product-film/` and `film-sound/` into `~/.claude/skills/`.
- **Claude Code**, one project: copy them into `<project>/.claude/skills/`.
- **Codex** and other agents that read `.agents/skills/`: copy them there.
Then ask for a film in plain words ("make a how-to video of our onboarding from the real app"); the skills load
themselves.

## Requirements
- Node 18 or newer.
- In each film folder: `npm install` (Playwright and ffmpeg-static) and `npx playwright install chromium`.
  `sh product-film/scripts/new-film.sh <dir> --install` does both.
- The product running locally (or a URL you may read), and sample data for it.

## Try it in two minutes
```
sh product-film/scripts/new-film.sh ~/films/try --install
cd ~/films/try
node tools/frames.mjs render/stills 1 5 10 13.5            # stills of the starter film
node tools/render.mjs render/video.mp4                     # a 15 s draft (about 20 s to render)
node tools/frames.mjs --cues audio/cues.json
node ../../<path to>/film-sound/scripts/mix.mjs --cues audio/cues.json --out audio/mix.wav --music vol12 --offset 3
sh ../../<path to>/film-sound/scripts/mux.sh render/video.mp4 audio/mix.wav deliver/try.mp4
```

## Licences
- The skills' own code and text: free to use and change.
- Music: "Happy Beats / Business Moves" by Sascha Ende, CC BY 4.0. Credit on screen: "Music: Sascha Ende, ende.app (CC BY 4.0)".
- Effects: Kenney (CC0); keypresses: unicae_games (CC0).
- `upstream/`: MIT, copyright their authors (see each LICENSE).
