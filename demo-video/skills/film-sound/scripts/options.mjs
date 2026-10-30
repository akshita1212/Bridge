// The same cut with several music beds, all at the same loudness, so a person can pick by ear (taste picks come as
// levelled options; keep the current bed among them).
// node options.mjs --video render/film-video.mp4 --cues audio/cues.json --outdir deliver/music-options
//                  --tracks "vol9:1.3,vol1:0,vol11:1,vol12:3" [--duck "a-b:amt,…"] [--lufs -17] [--abr 192k]
// Each track is name:offset (seconds into the track where the film starts). Prints loudness and true peak per option.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { mix } from "./mix.mjs";
import { ffmpeg, parseArgs, loudness } from "./lib.mjs";

const o = parseArgs(process.argv.slice(2));
if (!o.video || !o.cues || !o.outdir || !o.tracks) { console.log('usage: node options.mjs --video <film.mp4> --cues <cues.json> --outdir <dir> --tracks "vol9:1.3,vol12:3" [--lufs -17]'); process.exit(1); }
const target = +(o.lufs ?? -17);
fs.mkdirSync(o.outdir, { recursive: true });
const rows = [];
o.tracks.split(",").forEach((spec, i) => {
  const [name, offset = "0"] = spec.split(":"), letter = String.fromCharCode(65 + i);
  const wav = path.join(o.outdir, `${letter}-${path.basename(name).replace(/\.\w+$/, "")}.wav`);
  mix({ ...o, music: name, offset, out: wav });
  const pre = loudness(wav), gain = +(target - pre.I).toFixed(1);
  const mp4 = path.join(o.outdir, `${letter} - ${path.basename(name).replace(/\.\w+$/, "")}.mp4`);
  const r = spawnSync(ffmpeg(), ["-hide_banner", "-loglevel", "error", "-y", "-i", o.video, "-i", wav, "-map", "0:v", "-map", "1:a", "-af", `volume=${gain}dB`,
    "-c:v", "copy", "-c:a", "aac", "-b:a", o.abr ?? "192k", "-shortest", "-movflags", "+faststart", mp4], { encoding: "utf8" });
  if (r.status !== 0) { console.log("mux failed", r.stderr); process.exit(1); }
  const post = loudness(mp4);
  rows.push({ option: letter, track: name, offset: +offset, gainDb: gain, LUFS: post.I, peak: post.peak, file: mp4 });
  if (post.peak > -1) console.log(`warning: ${letter} true peak ${post.peak} dBFS (over −1); lower --lufs or the bed`);
});
console.table(rows.map(({ file, ...r }) => r));
for (const r of rows) console.log(r.option, "→", r.file);
