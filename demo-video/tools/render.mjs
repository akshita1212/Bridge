// Render the film to video (picture only; the sound skill muxes the audio).
// node tools/render.mjs <out.mp4> [--fps 60] [--sub 3] [--crf 16] [--from s] [--to s] [--img jpeg|png]
// Frames are captured from headless Chromium and piped straight into ffmpeg. With --sub K, K subframes per frame are
// averaged (tmix) for motion blur: --fps 60 --sub 3 is the master; --fps 30 --sub 1 is a fast draft.
import { spawn } from "node:child_process";
import { chromium, ffmpeg, filmContext, openFilm, parseArgs, SIZE } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const out = args._[0];
if (!out) { console.log("usage: node tools/render.mjs <out.mp4> [--fps 60] [--sub 3] [--crf 16] [--from s] [--to s]"); process.exit(1); }
const fps = +(args.fps ?? 30), sub = +(args.sub ?? 1), crf = String(args.crf ?? 18), format = args.img ?? "jpeg";
const browser = await chromium().launch();
const ctx = await filmContext(browser, { viewport: { width: SIZE.w, height: SIZE.h } });
const page = await openFilm(ctx);
const dur = await page.evaluate(() => window.DURATION);
const from = +(args.from ?? 0), to = Math.min(+(args.to ?? dur), dur);
const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
const vf = sub > 1 ? `tmix=frames=${sub}:weights='${Array(sub).fill(1).join(" ")}',select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/(${fps}*TB),` : "";
const ff = spawn(ffmpeg(), ["-hide_banner", "-loglevel", "error", "-y",
  "-f", "image2pipe", "-framerate", String(fps * sub), "-c:v", format === "png" ? "png" : "mjpeg", "-i", "-",
  "-vf", `${vf}scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`, "-r", String(fps), "-c:v", "libx264", "-preset", "slow", "-crf", crf, "-tune", "film",
  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
const write = buf => new Promise(r => ff.stdin.write(buf) ? r() : ff.stdin.once("drain", r));
const cdp = await ctx.newCDPSession(page);
const started = Date.now();
for (let f = f0; f < f1; f++) {
  for (let k = 0; k < sub; k++) {
    // subframes are centred on the frame's time, so blur trails both ways like a real shutter
    const t = f / fps + (sub > 1 ? (k - (sub - 1) / 2) / (fps * sub) : 0);
    await page.evaluate(v => window.seek(v), Math.max(0, t));
    const shot = await cdp.send("Page.captureScreenshot", format === "png" ? { format: "png" } : { format: "jpeg", quality: 94 });
    await write(Buffer.from(shot.data, "base64"));
  }
  if ((f - f0) % (fps * 2) === 0) console.log(`frame ${f - f0}/${f1 - f0}  t=${(f / fps).toFixed(2)}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise(r => ff.on("close", r));
console.log("done", out, ((Date.now() - started) / 1000).toFixed(0) + "s");
await browser.close();
