// Stills of the film, or its sound cues.
// node tools/frames.mjs <outdir> <t> [t ...]          stills at given seconds
// node tools/frames.mjs <outdir> --every 0.5 [from] [to]   a still every step seconds
// node tools/frames.mjs --cues audio/cues.json         write { duration, tl, cues } for the sound skill
import fs from "node:fs";
import { chromium, filmContext, openFilm, SIZE } from "./lib.mjs";

const argv = process.argv.slice(2);
const browser = await chromium().launch();
const ctx = await filmContext(browser, { viewport: { width: SIZE.w, height: SIZE.h } });
const page = await openFilm(ctx);
if (argv[0] === "--cues") {
  const data = await page.evaluate(() => ({ duration: window.DURATION, tl: window.TL ?? null, cues: window.CUES }));
  fs.writeFileSync(argv[1], JSON.stringify(data, null, 1));
  console.log("cues", data.cues.length, "→", argv[1]);
  await browser.close(); process.exit(0);
}
const [out, ...rest] = argv;
fs.mkdirSync(out, { recursive: true });
let times = rest.map(Number);
if (rest[0] === "--every") {
  const step = +rest[1], from = +(rest[2] ?? 0), to = +(rest[3] ?? await page.evaluate(() => window.DURATION));
  times = []; for (let t = from; t <= to + 1e-9; t += step) times.push(+t.toFixed(3));
}
for (const t of times) {
  await page.evaluate(v => window.seek(v), t);
  await page.screenshot({ path: `${out}/t${t.toFixed(2).padStart(6, "0")}.png` });
}
console.log("frames", times.length, "→", out);
await browser.close();
