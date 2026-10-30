"use strict";
// engine.js · a pure seek(t) film engine (from the Autoproperty "Lead to tenant" film, Oct 2026).
// Nothing animates on its own: every frame is computed from t, so any frame can be rendered in any order.
// Load before film.js. Everything here is a plain global, so film.js reads like one file.

// ───────────────────────────── math
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOutBack = t => { const c1 = 1.45, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const smooth = (a, b, v) => { const q = clamp((v - a) / (b - a)); return q * q * (3 - 2 * q); };

/** Closed-form spring step response: 0 before tau = 0, settles at 1. w = stiffness (rad/s), z = damping ratio. */
function stepR(tau, { w, z }) {
  if (tau <= 0) return 0;
  if (z >= 1) { const x = w * tau; return 1 - Math.exp(-x) * (1 + x); }
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
/** A value that springs to each new target at its time. Schedule with .to(t, v, spring), read with .at(t). */
class Track {
  constructor(v0) { this.v0 = v0; this.cur = v0; this.ev = []; }
  to(t, v, sp = SP.ui) { if (v !== this.cur) { this.ev.push([t, v - this.cur, sp]); this.cur = v; } return this; }
  at(t) { let v = this.v0; for (const [ti, d, sp] of this.ev) v += d * stepR(t - ti, sp); return v; }
}
/** Spring presets. cam: no overshoot; ui: a small settle; snap: quick; num: slow counters. */
const SP = { cam: { w: 6.2, z: 1 }, ui: { w: 15, z: .84 }, soft: { w: 9, z: 1 }, snap: { w: 22, z: .82 }, text: { w: 24, z: 1 }, cur: { w: 10, z: .9 }, num: { w: 4.2, z: 1 } };
const spr = (t, t0, sp = SP.ui) => stepR(t - t0, sp);
/** Enter on a spring, exit short and early. Returns opacity o, blur b (px), y offset dy, raw progress e. */
function vis(t, tin, tout, dOut = .16, sp = SP.text) {
  const e = stepR(t - tin, sp), x = tout == null ? 0 : clamp((t - tout) / dOut), xo = x * x;
  return { o: clamp(e) * (1 - xo), b: (1 - clamp(e)) * 10 + xo * 10, dy: (1 - clamp(e)) * 18 - xo * 12, e };
}

/** CSS cubic-bezier(x1, y1, x2, y2) as a function of progress 0…1. Use the brand website's own curves. */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = u => ((ax * u + bx) * u + cx) * u, Y = u => ((ay * u + by) * u + cy) * u, dX = u => (3 * ax * u + 2 * bx) * u + cx;
  return p => { p = clamp(p); let u = p; for (let i = 0; i < 8; i++) { const d = dX(u); if (Math.abs(d) < 1e-6) break; u = clamp(u - (X(u) - p) / d); } return Y(u); };
}
const EASE = { out: bezier(.2, .8, .2, 1), lift: bezier(.32, .72, 0, 1), io: bezier(.65, 0, .35, 1) };
/** A word rising in (0.4 s from 10 px below) and out (0.28 s to 8 px above, 12 ms apart): a website-style headline. */
function rise(t, tin, tout, k = 0, inDur = .4, outDur = .28) {
  const i = EASE.out((t - tin) / inDur), o = tout == null ? 0 : EASE.out((t - tout - k * .012) / outDur);
  return { o: i * (1 - o), dy: 10 * (1 - i) - 8 * o };
}
/** Wrap each word in a span so it can move on its own clock. */
function words(s, cls = "w") { return s.split(/(\s+)/).map(w => /^\s+$/.test(w) ? w : `<span class="${cls}">${w}</span>`).join(""); }
/** Animate every span.w inside el: word k starts at t0 + k * gap and leaves at tout. */
function riseWords(el, t, t0, tout, gap = .045) { [...el.querySelectorAll(".w")].forEach((s, k) => { const v = rise(t, t0 + k * gap, tout, k); apply(s, fx(v.o, 0, v.dy)); }); }

// ───────────────────────────── DOM writes (cached, so a frame only touches what changed)
const el = id => document.getElementById(id);
const css = (node, k, v) => { if (!node) return; const key = "__" + k; if (node[key] !== v) { node[key] = v; node.style[k] = v; } };
const txt = (node, s) => { if (node && node.__t !== s) { node.__t = s; node.textContent = s; } };
const html = (node, s) => { if (node && node.__h !== s) { node.__h = s; node.innerHTML = s; } };
const fx = (o, b, dy = 0, extra = "") => ({ opacity: o.toFixed(3), filter: b > .05 ? `blur(${b.toFixed(2)}px)` : "none", transform: `translateY(${dy.toFixed(2)}px) ${extra}` });
function apply(node, s) { if (!node) return; for (const k in s) css(node, k, s[k]); }
const box = node => { const r = node.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };
/** The shortest element under sel whose text matches re (finds a button by its label). */
const byText = (doc, sel, re) => [...doc.querySelectorAll(sel)].filter(e => re.test(e.textContent.trim())).sort((a, b) => a.textContent.length - b.textContent.length)[0] ?? null;
/** Text typed so far: one character every `step` seconds from t0. */
const typed = (s, t0, step, t) => s.slice(0, clamp(Math.floor((t - t0) / step) + 1, 0, s.length));

// ───────────────────────────── frozen screens (snap/<name>/index.html, made by tools/snap.mjs)
const FR = {}, DOC = {};
/** Load each frozen screen into an iframe under its host. hosts = { name: hostElement }. */
async function loadSnaps(hosts, base = "../snap") {
  await Promise.all(Object.entries(hosts).map(([name, host]) => new Promise(res => {
    const f = document.createElement("iframe"); f.src = `${base}/${name}/index.html`; f.dataset.name = name;
    f.addEventListener("load", res, { once: true }); host.appendChild(f); FR[name] = f;
  })));
  for (const name of Object.keys(hosts)) {
    DOC[name] = FR[name].contentDocument; await DOC[name].fonts.ready;
    // The film owns all motion: the product's own animations finish at once, so a frame never depends on how long its
    // screen has been visible (otherwise a just-revealed frame sits on an entry animation's first keyframe: invisible).
    const st = DOC[name].createElement("style");
    st.textContent = "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;transition:none!important}";
    DOC[name].head.appendChild(st);
  }
}
/** Show one frozen screen: opacity, blur, transform. */
function frameVis(name, o, blur = 0, transform = "") {
  const f = FR[name]; css(f, "visibility", o > .002 ? "visible" : "hidden"); css(f, "opacity", o.toFixed(3));
  css(f, "filter", blur > .05 ? `blur(${blur.toFixed(2)}px)` : "none"); css(f, "transform", transform || "none");
}
/** Cross-fade a list of [name, from, to] screens: each fades in over fin s at `from` and out over fout s at `to`. */
function screens(list, t, fin = .24, fout = .14) { for (const [n, a, b] of list) { const i = clamp((t - a) / fin), x = clamp((t - b) / fout); frameVis(n, i * (1 - x), (1 - i) * 6 + x * 6); } }

// ───────────────────────────── camera: one move at a time, framing a rectangle of the world
const STAGE = { w: 1920, h: 1080 };
const CAMERA = {
  region: { x: 640, y: 76, w: 1220, h: 928 },   // where on screen the framed rectangle should sit (right of the captions)
  cx: new Track(0), cy: new Track(0), lz: new Track(0), now: { cx: 0, cy: 0, z: 1 },
  /** Start the camera looking at world point (cx, cy) at zoom z. */
  start(cx, cy, z) { this.cx = new Track(cx); this.cy = new Track(cy); this.lz = new Track(Math.log(z)); this.now = { cx, cy, z }; },
  /** At time t, spring to frame world rect r = {x, y, w, h} inside `reg` (zoom capped at zmax). Zoom moves in log space. */
  to(t, r, reg = this.region, zmax = 2.4, sp = SP.cam) {
    const z = Math.min(reg.w / r.w, reg.h / r.h, zmax), rcx = r.x + r.w / 2, rcy = r.y + r.h / 2;
    this.cx.to(t, rcx - (reg.x + reg.w / 2 - STAGE.w / 2) / z, sp); this.cy.to(t, rcy - (reg.y + reg.h / 2 - STAGE.h / 2) / z, sp); this.lz.to(t, Math.log(z), sp);
  },
  /** Evaluate at t and transform the world element. */
  draw(t, world) {
    this.now = { cx: this.cx.at(t), cy: this.cy.at(t), z: Math.exp(this.lz.at(t)) };
    const c = this.now; css(world, "transform", `translate(${STAGE.w / 2}px,${STAGE.h / 2}px) scale(${c.z.toFixed(5)}) translate(${(-c.cx).toFixed(3)}px,${(-c.cy).toFixed(3)}px)`);
  },
};
/** World (desk) coordinates to screen pixels, with the current camera. */
const toScreen = (x, y) => [STAGE.w / 2 + CAMERA.now.z * (x - CAMERA.now.cx), STAGE.h / 2 + CAMERA.now.z * (y - CAMERA.now.cy)];

// ───────────────────────────── sound cues: the film writes them, the sound skill turns them into audio
const CUES = [];
const cue = (t, kind, gain = 1) => CUES.push({ t: +t.toFixed(4), kind, gain });

// ───────────────────────────── cursors (world coordinates), clicks, taps
const CURSORS = [], TAPS = [];
/** A named cursor drawn into `node` (an element with an svg arrow and a .pill label). Visible only inside its windows. */
function makeCursor(node, x0, y0) { const c = { node, x: new Track(x0), y: new Track(y0), clicks: [], windows: [] }; CURSORS.push(c); return c; }
function curMove(c, t, p, sp = SP.cur) { c.x.to(t, p[0], sp); c.y.to(t, p[1], sp); }
/** Arrive 0.55 s before t, press at t (a ripple and a "click" cue). */
function click(c, t, p, kind = "click") { curMove(c, t - .55, p); c.clicks.push(t); cue(t, kind); }
function cursorDraw(c, t) {
  const node = c.node, on = c.windows.some(([a, b]) => t >= a - .4 && t <= b + .4);
  const o = c.windows.reduce((m, [a, b]) => Math.max(m, clamp((t - a) / .3) * (1 - clamp((t - b) / .3))), 0);
  if (!on || o < .002) { css(node, "opacity", "0"); return; }
  const [sx, sy] = toScreen(c.x.at(t), c.y.at(t));
  const vx = (c.x.at(t + .01) - c.x.at(t - .01)) / .02 * CAMERA.now.z;
  const press = c.clicks.reduce((m, tc) => Math.max(m, Math.exp(-Math.pow((t - tc) / .06, 2))), 0);
  const born = c.windows.reduce((m, [a]) => Math.max(m, t >= a - .4 ? stepR(t - a + .3, SP.ui) : 0), 0);
  css(node, "opacity", o.toFixed(3));
  css(node, "transform", `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) rotate(${clamp(-vx * .004, -12, 12).toFixed(2)}deg) scale(${(born * (1 - .16 * press)).toFixed(3)})`);
  css(node.querySelector(".pill"), "transform", `translate(${clamp(-vx * .01, -24, 24).toFixed(1)}px,0)`);
}
/** A finger tap at screen point pos() (for phone screens: measure the target before any scroll). */
function tap(t, pos) { TAPS.push({ t, pos }); cue(t, "tap"); }
function ripples(t, host) {
  let out = "";
  for (const c of CURSORS) for (const tc of c.clicks) if (t >= tc && t < tc + .5) {
    const k = (t - tc) / .5, [sx, sy] = toScreen(c.x.at(tc), c.y.at(tc)), r = 10 + 34 * easeOut(k);
    out += `<div class="ripple" style="width:${2 * r}px;height:${2 * r}px;transform:translate(${sx - r}px,${sy - r}px);opacity:${(1 - k) * .8}"></div>`;
  }
  for (const tp of TAPS) if (t >= tp.t - .12 && t < tp.t + .45) {
    const k = (t - tp.t) / .45, p = tp.pos(t), r = k < 0 ? 22 * (1 + k * 2) : 22 + 18 * easeOut(k);
    out += `<div class="tap" style="width:${2 * r}px;height:${2 * r}px;transform:translate(${p[0] - r}px,${p[1] - r}px);opacity:${k < 0 ? 1 + k * 4 : (1 - k) * .9}"></div>`;
  }
  html(host, out);
}

// ───────────────────────────── notes: a short label and a hand-drawn arrow to a live target
const NOTES = [];
/** target() returns a screen point; offset places the label relative to it; bend curves the arrow (+/-). */
function note(t0, t1, target, offset, text, sub = "", bend = .25) { NOTES.push({ t0, t1, target, offset, text, sub, bend }); }
/** Draw every note for time t: labels go into labelHost (created on first use), arrows into the svg host. */
function drawNotes(t, svgHost, labelHost, color = "currentColor") {
  let svg = "";
  for (const n of NOTES) {
    if (!n.node) { n.node = document.createElement("div"); n.node.className = "note"; n.node.innerHTML = `${n.text}${n.sub ? `<small>${n.sub}</small>` : ""}`; labelHost.appendChild(n.node); }
    const node = n.node, v = vis(t, n.t0, n.t1);
    if (v.o < .003) { css(node, "opacity", "0"); continue; }
    const [tx, ty] = n.target(t), lx = tx + n.offset[0], ly = ty + n.offset[1];
    apply(node, fx(v.o, v.b, v.dy)); css(node, "left", `${lx.toFixed(1)}px`); css(node, "top", `${ly.toFixed(1)}px`);
    const nb = node.__box ?? (node.__box = { w: node.offsetWidth, h: node.offsetHeight });
    const ax = lx + (n.offset[0] < 0 ? nb.w + 14 : -14), ay = ly + nb.h * .45;
    const dx = tx - ax, dy = ty - ay, len = Math.hypot(dx, dy) || 1, ex = tx - dx / len * 16, ey = ty - dy / len * 16;
    const mx = (ax + ex) / 2 - dy * n.bend, my = (ay + ey) / 2 + dx * n.bend;
    const draw = easeOut(inv(n.t0 + .1, n.t0 + .7, t)) * (1 - clamp((t - n.t1) / .2));
    const ang = Math.atan2(ey - my, ex - mx), hx = Math.cos(ang), hy = Math.sin(ang);
    const head = `M${(ex - hx * 12 - hy * 8).toFixed(1)} ${(ey - hy * 12 + hx * 8).toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${(ex - hx * 12 + hy * 8).toFixed(1)} ${(ey - hy * 12 - hx * 8).toFixed(1)}`;
    svg += `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" pathLength="1" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1 1" stroke-dashoffset="${(1 - draw).toFixed(3)}" opacity="${v.o.toFixed(3)}"/>`;
    if (draw > .96) svg += `<path d="${head}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="${(v.o * inv(.96, 1, draw)).toFixed(3)}"/>`;
  }
  html(svgHost, svg);
}

// ───────────────────────────── chapter captions (number, title, one line), words rising one by one
let capIndex = -1;
/** chapters = [{ t, end, num, title, sub }]. capEl holds .num, h2 and p. railEl (optional) shows the chapter dots. */
function drawCaption(t, chapters, capEl, railEl) {
  const i = chapters.findIndex(c => t >= c.t - .05 && t < c.end + .35);
  if (i !== capIndex) {
    capIndex = i;
    if (i >= 0) { const c = chapters[i]; capEl.querySelector(".num").innerHTML = words(`${c.num}  /  ${String(chapters.length).padStart(2, "0")}`); capEl.querySelector("h2").innerHTML = words(c.title); capEl.querySelector("p").innerHTML = words(c.sub ?? ""); capEl.__h = capEl.offsetHeight; }
  }
  if (i < 0) { css(capEl, "opacity", "0"); if (railEl) css(railEl, "opacity", "0"); return; }
  const c = chapters[i]; css(capEl, "opacity", "1"); css(capEl, "top", `${(STAGE.h / 2 - capEl.__h / 2 - 40).toFixed(1)}px`);
  [...capEl.querySelectorAll(".w")].forEach((s, k) => { const v = vis(t, c.t + k * .045, c.end + k * .012); apply(s, fx(v.o, v.b, v.dy)); });
  if (railEl) { css(railEl, "opacity", "1"); html(railEl, chapters.map((_, k) => k === i ? `<b>${String(k + 1).padStart(2, "0")}</b>` : "<i></i>").join("")); }
}

// ───────────────────────────── a card that flies between two rectangles carrying real images (never empty)
/** k: 0→1 progress. from/to: screen rects {x, y, w, h, r}. imgs: [{ node, aspect: h/w, show: [a0, a1] or hide: [a0, a1] }]. */
function morphCard(node, k, from, to, o, imgs = []) {
  const x = lerp(from.x, to.x, k), y = lerp(from.y, to.y, k), w = lerp(from.w, to.w, k), h = lerp(from.h, to.h, k), r = lerp(from.r ?? 24, to.r ?? 12, k);
  apply(node, { opacity: o.toFixed(3), transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`, width: `${w.toFixed(1)}px`, height: `${h.toFixed(1)}px`, borderRadius: `${r.toFixed(1)}px` });
  for (const im of imgs) {
    const ih = w * im.aspect, op = im.show ? smooth(im.show[0], im.show[1], k) : 1 - smooth(im.hide[0], im.hide[1], k);
    apply(im.node, { width: `${w.toFixed(1)}px`, height: `${ih.toFixed(1)}px`, transform: `translateY(${(im.center ? (h - ih) / 2 : 0).toFixed(1)}px)`, opacity: op.toFixed(3) });
  }
}

// ───────────────────────────── the harness: render.mjs / frames.mjs drive window.seek(t)
/** film({ duration, init: async () => {}, schedule: () => {}, draw: t => {} }). init loads and measures; schedule plans
 *  camera moves, cursor paths, notes and cues from measured positions; draw(t) sets every element for time t. */
function film({ duration, init, schedule, draw }) {
  window.DURATION = duration;
  window.seek = t => draw(clamp(t, 0, duration));
  (async () => {
    await init(); await document.fonts.ready;
    schedule?.();
    window.CUES = CUES.sort((a, b) => a.t - b.t);
    window.seek(0); window.READY = true;
  })().catch(e => { console.error("INIT FAILED", e); window.INIT_ERROR = String(e && e.stack || e); });
}
