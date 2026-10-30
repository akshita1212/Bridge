// How busy a track is, to pick a calm bed by numbers before listening: onsets per second, brightness (high-band share)
// and loudness swing over the first N seconds. Lower onsets and brightness read calmer and more professional.
// node music-stats.mjs <file> [seconds]
import { spawnSync } from "node:child_process";
import { ffmpeg } from "./lib.mjs";
import { trackPath } from "./mix.mjs";

const [name, secs = "80"] = process.argv.slice(2);
const file = trackPath(name), SR = 11025;
const raw = spawnSync(ffmpeg(), ["-hide_banner", "-loglevel", "error", "-i", file, "-t", secs, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 }).stdout;
const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
const hop = 220, n = Math.floor(x.length / hop);
const e = new Float32Array(n), hf = new Float32Array(n); let prev = 0;
for (let i = 0; i < n; i++) { let s = 0, d = 0; for (let k = i * hop; k < (i + 1) * hop; k++) { s += x[k] * x[k]; const dd = x[k] - prev; prev = x[k]; d += dd * dd; } e[i] = s / hop; hf[i] = d / hop; }
const flux = []; for (let i = 1; i < n; i++) flux.push(Math.max(0, Math.sqrt(e[i]) - Math.sqrt(e[i - 1])));
const mean = flux.reduce((a, b) => a + b, 0) / flux.length, sd = Math.sqrt(flux.reduce((a, b) => a + (b - mean) ** 2, 0) / flux.length);
let onsets = 0, last = -99; flux.forEach((v, i) => { if (v > mean + 1.5 * sd && i - last > 4) { onsets++; last = i; } });
const E = e.reduce((a, b) => a + b, 0), H = hf.reduce((a, b) => a + b, 0);
const per = []; const w = Math.round(SR / hop); for (let i = 0; i + w <= n; i += w) per.push(10 * Math.log10(e.slice(i, i + w).reduce((a, b) => a + b, 0) / w + 1e-12));
const dur = x.length / SR;
console.log(file.split("/").pop(), `(${dur.toFixed(0)} s analysed)`, "onsets/s", (onsets / dur).toFixed(2), "brightness", (H / E).toFixed(3), "loudness swing dB", (Math.max(...per) - Math.min(...per)).toFixed(1));
