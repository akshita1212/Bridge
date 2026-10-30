// An image of a frozen screen, or of one element in it, for a card that flies between screens (never an empty box).
// node tools/capture.mjs <snap-name> <out.png> [--size 1470x860] [--scale 2] [--selector "css"] [--prep "js run first"]
// --prep runs in the page before the capture, e.g. to unselect a row or put the first message in its preview.
import { ROOT, chromium, filmContext, parseArgs } from "./lib.mjs";
import fs from "node:fs";

const args = parseArgs(process.argv.slice(2));
const [name, out] = args._;
if (!name || !out) { console.log('usage: node tools/capture.mjs <snap-name> <out.png> [--size WxH] [--scale 2] [--selector "css"] [--prep "js"]'); process.exit(1); }
let [w, h] = (args.size ?? "").split("x").map(Number);
if (!w) { const ref = fs.readFileSync(`${ROOT}/snap/${name}/ref.png`); w = ref.readUInt32BE(16); h = ref.readUInt32BE(20); }
const browser = await chromium().launch();
const ctx = await filmContext(browser, { viewport: { width: w, height: h }, deviceScaleFactor: +(args.scale ?? 2) });
const page = await ctx.newPage();
await page.goto(`http://film.local/snap/${name}/index.html`);
await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}" });
await page.waitForTimeout(600);
if (args.prep) await page.evaluate(args.prep);
let clip;
if (args.selector) clip = await page.evaluate(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return r && { x: r.left, y: r.top, width: r.width, height: r.height }; }, args.selector);
if (args.selector && !clip) { console.log("no element matches", args.selector); process.exit(1); }
await page.screenshot({ path: out, ...(clip ? { clip } : {}) });
console.log("captured", out, clip ? JSON.stringify(clip) : `${w}x${h}`);
await browser.close();
