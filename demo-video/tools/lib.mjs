// Shared by the film tools. ROOT is the film folder (the parent of tools/).
// Playwright and ffmpeg-static come from the film folder's own node_modules ("npm install" there), or from the folder named
// in FILM_NODE_MODULES (a project that already has them). FFMPEG may point at any ffmpeg binary; otherwise ffmpeg-static,
// otherwise "ffmpeg" on the PATH. FILM_SIZE sets the stage size (default 1920x1080).
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const own = createRequire(path.join(ROOT, "package.json"));
export function load(name) {
  try { return own(name); } catch (e) {
    if (process.env.FILM_NODE_MODULES) return createRequire(path.join(path.resolve(process.env.FILM_NODE_MODULES), "noop.js"))(name);
    throw new Error(`"${name}" is not installed. Run "npm install" in ${ROOT}, or set FILM_NODE_MODULES to a folder that has it.`);
  }
}
export const chromium = () => load("playwright").chromium;
export function ffmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { const p = load("ffmpeg-static"); if (p && fs.existsSync(p)) return p; } catch {}
  return "ffmpeg";
}
export const SIZE = (() => { const [w, h] = (process.env.FILM_SIZE ?? "1920x1080").split("x").map(Number); return { w, h }; })();

/** Flags: --name value. Positional arguments are everything that is not a flag or a flag's value. */
export function parseArgs(argv, flags = []) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) { const k = a.slice(2); if (flags.includes(k)) out[k] = true; else out[k] = argv[++i]; }
    else out._.push(a);
  }
  return out;
}

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".woff2": "font/woff2", ".woff": "font/woff",
  ".ttf": "font/ttf", ".otf": "font/otf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".avif": "image/avif", ".json": "application/json", ".txt": "text/plain", ".wav": "audio/wav", ".mp3": "audio/mpeg" };
/** A browser context that serves the film folder as http://film.local/ and blocks everything else (no network, no writes). */
export async function filmContext(browser, opts) {
  const ctx = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: "reduce", colorScheme: "dark", ...opts });
  await ctx.route("http://film.local/**", route => {
    const file = path.join(ROOT, decodeURIComponent(new URL(route.request().url()).pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ status: 200, contentType: TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream", body: fs.readFileSync(file) });
  });
  await ctx.route(/^(?!http:\/\/film\.local\/)/, route => route.abort());
  return ctx;
}

/** Open the film page and wait until init() has measured everything. Exits on an init error. */
export async function openFilm(ctx, page = "film/index.html") {
  const p = await ctx.newPage();
  p.on("console", m => { if (["warning", "error"].includes(m.type())) console.log("console", m.type(), m.text().slice(0, 300)); });
  p.on("pageerror", e => console.log("pageerror", e.message.split("\n").slice(0, 3).join(" | ")));
  await p.goto(`http://film.local/${page}`);
  await p.waitForFunction(() => window.READY || window.INIT_ERROR, null, { timeout: 180000 });
  const err = await p.evaluate(() => window.INIT_ERROR);
  if (err) { console.log("INIT_ERROR", err); process.exit(1); }
  return p;
}
