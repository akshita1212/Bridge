// ffmpeg for the sound scripts: FFMPEG, else ffmpeg-static from the current folder's node_modules (or FILM_NODE_MODULES),
// else "ffmpeg" on the PATH.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function ffmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  for (const base of [process.cwd(), process.env.FILM_NODE_MODULES].filter(Boolean)) {
    try { const p = createRequire(path.join(path.resolve(base), "noop.js"))("ffmpeg-static"); if (p && fs.existsSync(p)) return p; } catch {}
  }
  return "ffmpeg";
}
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith("--")) out[a.slice(2)] = argv[++i]; else out._.push(a); }
  return out;
}
/** Integrated loudness (LUFS), loudness range (LU) and true peak (dBFS) of a file's audio. */
export function loudness(file) {
  const r = spawnSync(ffmpeg(), ["-hide_banner", "-nostats", "-i", file, "-map", "0:a", "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
  const s = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  const num = re => { const m = re.exec(s); return m ? +m[1] : NaN; };
  return { I: num(/I:\s+(-?[\d.]+) LUFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/), peak: num(/Peak:\s+(-?[\d.]+) dBFS/) };
}
