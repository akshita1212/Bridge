# The bundled library and its licences

## Music (`assets/music/`): CC BY 4.0, credit required
"Happy Beats / Business Moves" by Sascha Ende ([ende.app](https://ende.app/en)), licensed under
[CC BY 4.0](https://ende.app/en/standard-license). Put this credit on screen (the ending's footer) and in the README:
**"Music: Sascha Ende, ende.app (CC BY 4.0)"**.

| Name for mix.mjs | File | Length | Tempo | Character |
|---|---|---|---|---|
| `vol1` | happy-beats-business-moves-vol-1-by-ende-dot-app.mp3 | 2:44 | 120 BPM | calmer opening; a quiet stretch, then lifts |
| `vol9` | …-vol-9-… | 1:54 | 115 BPM | the warmest; quiets in the middle, lifts again at the end |
| `vol10` | …-vol-10-… | 1:00 | 110 BPM | short: only for films under ~55 s |
| `vol11` | …-vol-11-… | 1:28 | 115 BPM | the least busy rhythm, even and steady |
| `vol12` | …-vol-12-… | 1:58 | 110 BPM | the slowest; quiet first seconds, fuller from ~3 s (the founder's pick) |

`cues/<track>.music-cues.json|md`: beats, tempo and strong cues per track (from the brag skill's analysis), for timing
big moments to the music.

## Effects (`assets/sfx/`): CC0, no credit required
From [Kenney](https://kenney.nl/) via the brag skill: `interface/` (clicks, switches, bongs, drops), `ui/` (clicks,
switches, rollovers), `impact/impactSoft_*` (soft, warm hits), `casino/card-slide-*` and `card-place-*` (paper slides).
`keyboard/keypress-001…032.wav`: "Keyboard Soundpack #1" by unicae_games ([OpenGameArt](https://opengameart.org/content/keyboard-soundpack-1-typing-and-single-keystrokes)), CC0.

`ANALYSIS.md` rates each effect's brightness and high-frequency risk (it covers the brag skill's full library; the
files not listed above are not bundled here). Prefer warm, low-risk effects for polished films.

## The default map (`assets/sfx/map.json`)
| Kind | Sound | Used for |
|---|---|---|
| `logo` | switch_007 + a soft impact, low-passed | the logo switching on |
| `slide` | card-slide-1, band-limited | big scene moves (at most ~6 in a minute) |
| `soft` | impactSoft_medium_001 | a quiet accent |
| `toggle` | switch_002 | a switch in the UI |
| `place` | card-place-1 | a card landing |
Copy the map into the film folder and pass `--map` to change it. Paths are relative to the map file; a path not found there falls back to this skill's `assets/sfx/`, so a copied map keeps working.
