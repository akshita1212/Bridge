// Freeze real product screens into static pages the film can animate.
// node tools/snap.mjs <shots.mjs> [name ...] --origin http://localhost:3000 [--auth auth.json] [--out snap]
// For each shot: open the route on the running app, answer its API reads from the shot's api() (every other non-GET is
// aborted, so nothing is ever written), run the shot's actions, then save the DOM and the stylesheets' SOURCE text as
// snap/<name>/index.html + style.css, with fonts and images copied into snap/assets/. Also saves snap/<name>/ref.png.
// --auth is a Playwright storage state (signed-in cookies) for routes behind a sign-in; shots with auth: false skip it.
import { pathToFileURL } from "node:url";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT, chromium, parseArgs } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const [shotsFile, ...only] = args._;
if (!shotsFile || !args.origin) { console.log("usage: node tools/snap.mjs <shots.mjs> [name ...] --origin http://localhost:3000 [--auth auth.json] [--out snap]"); process.exit(1); }
const ORIGIN = new URL(args.origin).origin;
const OUT = path.resolve(ROOT, args.out ?? "snap");
const shots = (await import(pathToFileURL(path.resolve(shotsFile)).href)).default.filter(s => !only.length || only.includes(s.name));
fs.mkdirSync(`${OUT}/assets`, { recursive: true });

const assetCache = new Map();
async function localAsset(url) {
  if (assetCache.has(url)) return assetCache.get(url);
  const res = await fetch(url).catch(() => null);
  if (!res?.ok) { console.log("  asset failed", res?.status, url); assetCache.set(url, url); return url; }
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = (path.extname(new URL(url).pathname) || "." + (res.headers.get("content-type") ?? "bin").split("/").pop().split(";")[0]).slice(0, 8);
  const file = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16) + ext;
  fs.writeFileSync(`${OUT}/assets/${file}`, buf);
  assetCache.set(url, `../assets/${file}`);
  return `../assets/${file}`;
}
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
async function rewrite(text) {
  const urls = [...new Set(text.match(new RegExp(`${esc(ORIGIN)}/[^"')\\s,]+`, "g")) ?? [])];
  for (const u of urls) text = text.split(u).join(await localAsset(u.replace(/&amp;/g, "&")));
  return text;
}
const absolute = (text, base) => text.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => u.startsWith("data:") || u.startsWith("#") ? m : `url("${new URL(u, base).href}")`);

const browser = await chromium().launch();
for (const shot of shots) {
  const ctx = await browser.newContext({ storageState: shot.auth === false || !args.auth ? undefined : args.auth, viewport: { width: shot.w, height: shot.h },
    deviceScaleFactor: 1, colorScheme: shot.scheme ?? "dark", reducedMotion: "reduce" });
  await ctx.route("**/*", route => {
    const req = route.request(); const url = new URL(req.url());
    if (url.origin === ORIGIN && url.pathname.startsWith(shot.apiPrefix ?? "/api/") && shot.api) {
      const hit = shot.api(url, req.method(), req);
      if (process.env.DEBUG) console.log("  answered", req.method(), url.pathname, JSON.stringify(hit ?? null).slice(0, 60));
      if (hit?.__raw) return route.fulfill({ status: 200, contentType: hit.__type, body: hit.__raw });
      if (hit !== undefined) return route.fulfill({ status: hit?.__status ?? 200, contentType: "application/json", body: JSON.stringify(hit?.__body ?? hit) });
    }
    // Never write: anything that is not a read is refused, even if the shot forgot to answer it.
    if (!["GET", "HEAD"].includes(req.method())) { console.log("  aborted", req.method(), url.pathname); return route.abort(); }
    if (url.origin === ORIGIN && url.pathname.startsWith(shot.apiPrefix ?? "/api/") && shot.api) console.log("  passthrough", url.pathname);
    return route.continue();
  });
  if (shot.init) await ctx.addInitScript(shot.init);
  const page = await ctx.newPage();
  page.on("pageerror", e => console.log("  pageerror", e.message.split("\n")[0]));
  await page.goto(ORIGIN + shot.path, { waitUntil: "load", timeout: 180000 });
  await page.waitForTimeout(shot.wait ?? 3500);
  if (shot.actions) await shot.actions(page);
  await page.mouse.move(shot.w - 2, 2);   // no hover states in the frozen copy
  await page.waitForTimeout(600);
  await page.evaluate(() => document.fonts.ready);
  const dir = `${OUT}/${shot.name}`; fs.mkdirSync(dir, { recursive: true });
  for (const sel of shot.remove ?? ["nextjs-portal"]) await page.evaluate(s => document.querySelectorAll(s).forEach(n => n.remove()), sel);
  await page.screenshot({ path: `${dir}/ref.png` });
  const frozen = await page.evaluate(() => {
    document.querySelectorAll("script, noscript, link[rel=preload], link[rel=modulepreload], link[rel=prefetch], template").forEach(n => n.remove());
    // live state that the DOM does not hold by itself
    for (const i of document.querySelectorAll("input")) {
      if (i.type === "checkbox" || i.type === "radio") { if (i.checked) i.setAttribute("checked", ""); else i.removeAttribute("checked"); }
      else if (i.type !== "file") i.setAttribute("value", i.value);
    }
    for (const t of document.querySelectorAll("textarea")) t.textContent = t.value;
    for (const s of document.querySelectorAll("select")) for (const o of s.options) { if (o.selected) o.setAttribute("selected", ""); else o.removeAttribute("selected"); }
    for (const d of document.querySelectorAll("details")) { if (d.open) d.setAttribute("open", ""); else d.removeAttribute("open"); }
    for (const p of document.querySelectorAll("progress")) p.setAttribute("value", String(p.value));
    for (const el of document.querySelectorAll("*")) if (el.scrollTop > 0 || el.scrollLeft > 0) el.setAttribute("data-snap-scroll", `${el.scrollLeft},${el.scrollTop}`);
    for (const c of document.querySelectorAll("canvas")) { try { const img = document.createElement("img"); img.src = c.toDataURL(); img.className = c.className; img.setAttribute("style", c.getAttribute("style") ?? ""); img.width = c.clientWidth; img.height = c.clientHeight; c.replaceWith(img); } catch {} }
    for (const img of document.querySelectorAll("img")) { if (img.currentSrc) img.setAttribute("src", img.currentSrc); img.removeAttribute("srcset"); img.removeAttribute("sizes"); img.removeAttribute("loading"); }
    for (const el of document.querySelectorAll("use[href^='/']")) el.setAttribute("href", location.origin + el.getAttribute("href"));
    const abs = (text, base) => text.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => u.startsWith("data:") || u.startsWith("#") ? m : `url("${new URL(u, base).href}")`);
    // Stylesheet SOURCE text, not the CSSOM: cssText empties shorthands that use var() (a `font:` with var() comes back blank).
    const css = [...document.styleSheets].map(sheet => sheet.ownerNode?.tagName === "LINK" ? { href: sheet.href } : { text: abs(sheet.ownerNode?.textContent ?? "", location.href) });
    document.querySelectorAll("style, link[rel=stylesheet]").forEach(n => n.remove());
    for (const img of document.querySelectorAll("img[src^='/']")) img.setAttribute("src", location.origin + img.getAttribute("src"));
    for (const el of document.querySelectorAll("[style*='url(']")) el.setAttribute("style", abs(el.getAttribute("style"), location.href));
    const attrs = el => [...el.attributes].map(a => `${a.name}="${a.value.replace(/"/g, "&quot;")}"`).join(" ");
    // Hide scrollbars instead of overflow:hidden on html/body (that would break sticky footers in the frozen page).
    return { css, html: `<!doctype html><html ${attrs(document.documentElement)}><head><meta charset="utf-8"><link rel="stylesheet" href="style.css"><style>html{scrollbar-width:none}::-webkit-scrollbar{display:none}*{caret-color:transparent!important}</style></head>${document.body.outerHTML}<script>for(const e of document.querySelectorAll('[data-snap-scroll]')){const[x,y]=e.dataset.snapScroll.split(',');e.scrollLeft=+x;e.scrollTop=+y}</script></html>` };
  });
  const parts = [];
  for (const part of frozen.css) parts.push(part.href ? absolute(await (await fetch(part.href)).text(), part.href) : part.text);
  const css = parts.join("\n");
  fs.writeFileSync(`${dir}/style.css`, await rewrite(css));
  fs.writeFileSync(`${dir}/index.html`, await rewrite(frozen.html));
  console.log("snap", shot.name, `${(css.length / 1024) | 0} KB css, ${(frozen.html.length / 1024) | 0} KB html`);
  await ctx.close();
}
await browser.close();
