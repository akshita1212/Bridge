# Choosing and timing the music bed

## Measure before listening
`node scripts/music-stats.mjs <track> [seconds]` prints:
- **onsets per second**: how many hits. Fewer reads calmer.
- **brightness**: the high-band share. Lower reads warmer and less tiring.
- **loudness swing**: the range between quiet and loud seconds. A big swing gives a build to time against.

From the "Lead to tenant" film (first 80 s): Vol. 9 was the warmest (brightness 0.041 over 40 s), Vol. 12 the slowest
(110 BPM). The founder chose Vol. 12 after hearing all four at equal loudness. Numbers narrow the list; ears choose.

## Fit the film
- **Length**: the track must last the film's duration plus the offset. Vol. 10 (60 s) was too short for a 71.5 s
  film. `mix.mjs` warns when the track ends early.
- **Offset**: where in the track the film starts. Read the track's cue analysis (`assets/music/cues/<track>.music-cues.md`
  lists its strong cues and sections) and pick the offset that puts its lift on the film's key moment (in the film, the
  lead landing in the inbox at 16 s): offsets of 0–3 s were enough for these tracks.
- **Beat grid**: if the film was timed at 120 BPM and the track is 110–115 BPM, keep the film's grid for the visuals and
  let only the big moments (the inbox, the tenant card, the ending) meet the track's strong cues.
- **Ducking**: lower the bed about 30 % under anything that should be listened to (a call recording playing, a
  transcript). `--duck "27.3-37.6:0.32"`; the edges are smoothed over 0.9 s.
- **Ending**: the bed fades over the last ~2 s; the last frame holds while it does.

## Options for the person
Three or four candidates, the current one included, built from the same cues and the same picture with
`scripts/options.mjs`, all at −17 LUFS (the script measures each mix and sets the gain). Name them by letter and track,
describe each in one line (where it is calm, where it lifts), and say which one the film currently uses.

## When the library is not enough
Look for produced music with a clear licence for commercial video (CC BY with credit, or a paid library licence).
Downloading needs the person's go-ahead. Avoid AI-generated beds billed to a company account without asking. Never use a
production API key from the product for marketing sound.
