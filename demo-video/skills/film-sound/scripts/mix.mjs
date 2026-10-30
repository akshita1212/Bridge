// The film's soundtrack from its cue list: the UI's own clicks, taps and typing, a few real recordings, one music bed.
// node mix.mjs --cues audio/cues.json --out audio/mix.wav [--music <file>|none] [--offset 0] [--bed 0.55]
//              [--duck "27.3-37.6:0.32,…"] [--fade-in 1.8] [--fade-out 2.1] [--map <map.json>] [--fx 0.8] [--seed 11]
// cues.json is what the film writes (tools/frames.mjs --cues): { duration, cues: [{ t, kind, gain }] }.
// Kinds: key, click, tap are synthesized (short, quiet, the ones a founder liked); key-real picks a real keypress;
// any other kind is looked up in the map (default: assets/sfx/map.json) and placed as real recordings.
// --music: a file, or the name of a bundled track ("vol12" → assets/music/…-vol-12-…mp3); --offset starts the track later
// (seconds into it) so its lift meets the film's key moment; --duck lowers it inside windows (start-end:amount).
// The result is one static gain to −1 dBFS peak; set the final loudness when muxing (options.mjs, mux.sh).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ffmpeg, parseArgs } from "./lib.mjs";

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SR = 48000;

export function trackPath(name) {
  if (!name || name === "none") return null;
  if (fs.existsSync(name)) return path.resolve(name);
  const m = /^vol-?(\d+)$/i.exec(name);
  if (m) { const f = path.join(SKILL, "assets/music", `happy-beats-business-moves-vol-${m[1]}-by-ende-dot-app.mp3`); if (fs.existsSync(f)) return f; }
  throw new Error(`music not found: ${name}`);
}
function decode(file, filters = "anull") {
  const r = spawnSync(ffmpeg(), ["-hide_banner", "-loglevel", "error", "-i", file, "-af", filters, "-ac", "2", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`ffmpeg could not read ${file}: ${r.stderr}`);
  const raw = r.stdout, x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4), n = x.length / 2;
  const l = new Float32Array(n), rr = new Float32Array(n); for (let i = 0; i < n; i++) { l[i] = x[2 * i]; rr[i] = x[2 * i + 1]; } return [l, rr];
}
const smooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

export function mix(o) {
  const { duration, cues } = JSON.parse(fs.readFileSync(o.cues, "utf8"));
  const N = Math.ceil((duration + .1) * SR);
  const L = new Float32Array(N), R = new Float32Array(N), ML = new Float32Array(N), MR = new Float32Array(N);
  const place = ([l, r], t, g = 1, pan = 0) => { const i0 = Math.round(t * SR), gl = g * Math.min(1, 1 - pan), gr = g * Math.min(1, 1 + pan); for (let i = 0; i < l.length; i++) { const k = i0 + i; if (k < 0 || k >= N) continue; L[k] += l[i] * gl; R[k] += r[i] * gr; } };

  // ── the bed: faded in, ducked where asked, faded out at the end
  const music = trackPath(o.music);
  if (music) {
    const [mL, mR] = decode(music), off = Math.round((+o.offset || 0) * SR), bed = +(o.bed ?? .55);
    const ducks = (o.duck ?? "").split(",").filter(Boolean).map(s => { const [a, b] = s.split(":"); const [t0, t1] = a.split("-").map(Number); return [t0, t1, +(b ?? .3)]; });
    const fi = +(o["fade-in"] ?? 1.8), fo = +(o["fade-out"] ?? 2.1);
    const env = t => {
      let g = Math.min(1, Math.max(0, t / fi)) ** 2;
      for (const [t0, t1, amt] of ducks) g *= 1 - amt * smooth((t - t0) / .9) * (1 - smooth((t - t1) / .9));
      return g * (1 - smooth((t - (duration - fo - .1)) / fo));
    };
    for (let i = 0; i < N; i++) { const k = i + off; if (k >= mL.length) break; const g = env(i / SR) * bed; ML[i] = mL[k] * g; MR[i] = mR[k] * g; }
    if (mL.length - off < N) console.log(`note: the track ends ${((N - (mL.length - off)) / SR).toFixed(1)} s before the film; pick a longer track or a smaller offset`);
  }

  // ── the UI's own sounds, synthesized (deterministic: the same cues give the same mix)
  let seed = +(o.seed ?? 11); const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const biquadBP = (f, q) => { const w = 2 * Math.PI * f / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q); const b0 = a, b2 = -a, a0 = 1 + a, a1 = -2 * c, a2 = 1 - a; let x1 = 0, x2 = 0, y1 = 0, y2 = 0; return x => { const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; }; };
  const click = (t, g = 1, f = 4200, pan = 0) => { const i0 = Math.round(t * SR), bp = biquadBP(f, 1.4); for (let i = 0; i < .03 * SR; i++) { const tt = i / SR; const v = (bp(rnd() * 2 - 1) * Math.exp(-tt * 900) * 2.2 + Math.sin(2 * Math.PI * 180 * tt) * Math.exp(-tt * 160) * .4) * g * .5; const k = i0 + i; if (k >= 0 && k < N) { L[k] += v * (1 - pan); R[k] += v * (1 + pan); } } };
  const blip = (t, f0, f1, dur, g) => { const i0 = Math.round(t * SR), n = Math.round(dur * SR); let ph = 0; for (let i = 0; i < n; i++) { const k = i / n, f = f0 * Math.pow(f1 / f0, Math.min(1, k * 1.6)); ph += f / SR; const v = Math.sin(2 * Math.PI * ph) * Math.exp(-k * 5) * Math.min(1, i / 40) * g * .3; const j = i0 + i; if (j >= 0 && j < N) { L[j] += v; R[j] += v; } } };

  // ── real recordings, from the map
  const mapFile = o.map ?? path.join(SKILL, "assets/sfx/map.json");
  const map = JSON.parse(fs.readFileSync(mapFile, "utf8")), mapDir = path.dirname(mapFile), cache = new Map();
  // a map's paths are relative to the map; a copied map can keep pointing at this skill's bundled effects
  const where = file => { const p = path.resolve(mapDir, file); return fs.existsSync(p) ? p : path.join(SKILL, "assets/sfx", file); };
  const sound = (file, filter) => { const key = file + "|" + (filter ?? ""); if (!cache.has(key)) cache.set(key, decode(where(file), filter ?? "anull")); return cache.get(key); };
  const keys = fs.readdirSync(path.join(SKILL, "assets/sfx/keyboard")).filter(f => f.endsWith(".wav")).sort();
  const unknown = new Set();
  for (const { t, kind, gain: g = 1 } of cues) {
    if (t < 0) continue;
    if (kind === "key") click(t, .32 * g, 3400 + rnd() * 1800, (rnd() - .5) * .3);
    else if (kind === "click") { click(t, .9 * g, 4200, .1); click(t + .075, .5 * g, 5200, .1); }
    else if (kind === "tap") { blip(t, 950, 620, .05, .9 * g); click(t, .4 * g, 2400); }
    else if (kind === "key-real") place(sound(path.join(SKILL, "assets/sfx/keyboard", keys[Math.floor(rnd() * keys.length)])), t, .35 * g, (rnd() - .5) * .3);
    else if (map[kind]) for (const layer of map[kind]) place(sound(layer.file, layer.filter), t + (layer.at ?? 0), (layer.gain ?? .5) * g, layer.pan ?? 0);
    else unknown.add(kind);
  }
  if (unknown.size) console.log("cue kinds with no sound (add them to the map, or ignore):", [...unknown].join(", "));

  // ── mix: the bed under the effects, one static gain to −1 dBFS
  const fxg = +(o.fx ?? .8); let peak = 0; const OL = new Float32Array(N), OR = new Float32Array(N);
  for (let i = 0; i < N; i++) { OL[i] = ML[i] + L[i] * fxg; OR[i] = MR[i] + R[i] * fxg; peak = Math.max(peak, Math.abs(OL[i]), Math.abs(OR[i])); }
  const g = Math.min(1.6, .89 / (peak || 1));
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, OL[i] * g)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, OR[i] * g)) * 32767), 46 + i * 4); }
  fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true });
  fs.writeFileSync(o.out, buf);
  return { out: o.out, music: music ? path.basename(music) : "none", duration, peak, gain: g, cues: cues.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const o = parseArgs(process.argv.slice(2));
  if (!o.cues || !o.out) { console.log("usage: node mix.mjs --cues audio/cues.json --out audio/mix.wav [--music vol12|file|none] [--offset s] [--duck a-b:amt,…]"); process.exit(1); }
  const r = mix(o);
  console.log(`${r.out}: ${r.music}, ${r.duration} s, ${r.cues} cues, gain ${r.gain.toFixed(2)}`);
}
