// Re-render frozen screens from disk (no app server) and save frozen.png beside ref.png, to compare them by eye.
// node tools/check-snap.mjs <name> [name ...]
// If frozen.png differs from ref.png (missing fonts, broken layout, an invisible panel), fix the freeze before animating.
import fs from "node:fs";
import { ROOT, chromium, filmContext } from "./lib.mjs";

const browser = await chromium().launch();
for (const name of process.argv.slice(2)) {
  const ref = fs.readFileSync(`${ROOT}/snap/${name}/ref.png`);
  const w = ref.readUInt32BE(16), h = ref.readUInt32BE(20);
  const ctx = await filmContext(browser, { viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(`http://film.local/snap/${name}/index.html`); await page.waitForTimeout(800);
  await page.screenshot({ path: `${ROOT}/snap/${name}/frozen.png` });
  console.log("checked", name, `${w}x${h}`, "→ snap/" + name + "/frozen.png");
  await ctx.close();
}
await browser.close();
