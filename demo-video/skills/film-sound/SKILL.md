---
name: film-sound
description: Score a product demo, how-to or launch video the professional way: the UI's own clicks, taps and typing placed from the film's cue list, one licensed slow music bed timed to the film, a real recording at the logo or nothing, music options levelled to the same loudness for the person to choose, then mux and loudness checks. Use this whenever a product film, screen recording, explainer or animated video needs music, sound effects, a soundtrack, background audio, audio options, or "better sound", even if the user only says the audio feels cheap, confusing or too fast. Works with the product-film skill's cues, or with any list of timed events.
---

# Sound for a product film

The founder's verdict on a first synthesized score: "the background sound is a very unprofessional sound… other than
clicks and typing sounds, all other sounds are very confusing… either have a good sound behind the logo or don't have
any." What they accepted: the UI's own small sounds, one produced and licensed music bed at a slow pace, a real switch
recording under the logo, a soft real slide on the six big moves, and a choice of beds at equal loudness. They picked
the slowest track.

## Principles (and why)
- **Fewer sounds, all motivated.** A sound only where something visibly happens (a click, a tap, a key, the logo). A
  whoosh on every move tires the ear and reads as template.
- **Real recordings over synthesis** for anything bigger than a click. Synthesized blips and chimes sound cheap.
  Short synthesized clicks, taps and typing are fine: quiet, dry, varied.
- **One bed, slow and produced.** Calm, low "busyness" (few onsets, low brightness). Start it partway in so its lift
  meets the film's key moment, duck it under speech-like moments (a call playing), fade it out under the last frame.
- **Taste is the person's call.** Offer the same cut with three or four beds at the same loudness (−17 LUFS). Keep the
  current one among them. Never present options at different loudness: the loudest wins unfairly.
- **Licences are part of the work.** Credit CC BY music on screen ("Music: Sascha Ende, ende.app (CC BY 4.0)"). Note
  every file's source in the film's README.

## Workflow
1. **Cues from the film.** The film writes timed events (`cue(t, kind, gain)`); export them:
   `node tools/frames.mjs --cues audio/cues.json` (product-film skill). Any JSON of the shape
   `{ "duration": 71.5, "cues": [{ "t": 2.0, "kind": "logo" }, …] }` works.
2. **Pick candidate beds** (`references/choosing-music.md`): measure them with `node scripts/music-stats.mjs vol12 80`,
   check each is longer than the film plus its offset, and choose offsets so the lift lands on the key moment.
3. **Mix**: `node scripts/mix.mjs --cues audio/cues.json --out audio/mix.wav --music vol12 --offset 3 --duck "27.3-37.6:0.32"`.
   Built-in kinds: `key`, `click`, `tap` (synthesized), `key-real` (real keypresses). Other kinds come from
   `assets/sfx/map.json` (`logo`, `slide`, `soft`, `toggle`, `place`); copy and edit the map for a new film (`--map`).
4. **Options**: `node scripts/options.mjs --video render/video.mp4 --cues audio/cues.json --outdir deliver/music-options
   --tracks "vol9:1.3,vol1:0,vol11:1,vol12:3"` → `A - vol9.mp4`, `B - vol1.mp4`, … all at −17 LUFS, with a table of
   loudness and true peak. Send them; let the person choose.
5. **Final mux**: `sh scripts/loudness.sh audio/mix.wav`, then `sh scripts/mux.sh render/video.mp4 audio/mix.wav
   deliver/film.mp4 <gain dB> 256k` with gain = −17 − measured. Share copy: the same at 192k.
6. **Check**: `sh scripts/loudness.sh deliver/film.mp4` → I ≈ −17 LUFS, true peak ≤ −1 dBFS. Say plainly that you
   measured the audio but could not listen to it; the person's ears decide.

## Levels that worked
| Layer | Level in mix.mjs | Notes |
|---|---|---|
| Music bed | 0.55 before the final gain | fade in 1.8 s, fade out 2.1 s, −32 % under a call |
| Click (cursor) | 0.9 + a 0.5 echo 75 ms later | band-passed noise at 4.2 kHz with a tiny low thump |
| Tap (phone) | 0.9 blip 950 → 620 Hz + 0.4 click | short, round |
| Key (typing) | 0.32–0.5, random pitch and pan | every second character |
| Logo | switch_007 at 0.55 + soft impact at 0.3, low-passed at 900 Hz | once |
| Big moves | card-slide-1 at 0.26, band-limited 180 Hz–4.2 kHz | at most six in 70 s |

## Files
- `scripts/mix.mjs` (also importable: `mix(options)`), `scripts/options.mjs`, `scripts/music-stats.mjs`,
  `scripts/mux.sh`, `scripts/loudness.sh`, `scripts/lib.mjs` (finds ffmpeg: `FFMPEG`, ffmpeg-static, or the PATH).
- `assets/music/`: five "Happy Beats / Business Moves" tracks by Sascha Ende (CC BY 4.0) with beat and cue analyses.
- `assets/sfx/`: Kenney CC0 effects (interface, ui, soft impacts, card slides and places), 32 real keypresses (CC0),
  `map.json`, `ANALYSIS.md` (brightness and safety of each effect).
- `references/choosing-music.md`, `references/library.md` (what each file is and its licence).
