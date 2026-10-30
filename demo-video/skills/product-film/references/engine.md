# The engine (`film/engine.js`) and patterns

Every frame is `seek(t)`: a pure function of time. No timers, no CSS animations, no state carried from the previous
frame. That is what lets the renderer jump to any time, render sub-frames for motion blur, and make stills on demand.

## Contents
1. The harness
2. Motion primitives
3. Frozen screens
4. Camera
5. Cursors, taps, notes, captions
6. Sound cues
7. Patterns from the "Lead to tenant" film

## 1. The harness
```js
film({
  duration: TL.FIN,
  async init() { await loadSnaps({ app: E.desk, sheet2: E.desk }); /* measure real elements into R */ },
  schedule() { /* camera moves, cursor paths, notes, cues: anything that needs measured positions */ },
  draw(t) { /* set every element for time t */ },
});
```
`init` then `schedule` run once; then `window.seek`, `window.DURATION`, `window.CUES` and `window.READY` are set for the
tools. An error during init lands in `window.INIT_ERROR` and the tools print it.

Write values with `css(node, prop, value)`, `txt`, `html` and `apply(node, {…})`: they skip writes that did not change,
which keeps long renders fast.

## 2. Motion primitives
- `stepR(tau, { w, z })`: a closed-form spring step (0 → 1). `w` stiffness, `z` damping (1 = no overshoot).
- `SP` presets: `cam` (no overshoot, for the camera), `ui` (small settle), `snap`, `soft`, `text`, `cur`, `num` (slow,
  for counters).
- `new Track(v0).to(t, v, SP.num).to(t2, v2)` then `.at(t)`: a value that springs to each new target at its time
  (scores, camera, cursors).
- `vis(t, tin, tout)`: enter on a spring, exit short and early → `{ o, b, dy }` (opacity, blur, y). `fx(o, b, dy)` turns
  it into styles.
- `bezier(x1, y1, x2, y2)`: any CSS cubic-bezier as a function. `EASE.out` and `EASE.lift` are the Autoproperty
  website's; replace them with the target brand's own curves.
- `rise(t, tin, tout, k)` and `riseWords(el, t, t0, tout)`: a website-style headline, word by word (`words()` wraps
  them in spans first).
- `typed(text, t0, step, t)`: the text typed so far.
- `smooth(a, b, v)`: smoothstep, for cross-fading two images on a moving card.

## 3. Frozen screens
`loadSnaps({ name: hostElement })` loads `snap/<name>/index.html` into iframes and switches off every animation and
transition inside them, so the film owns all motion. `DOC[name]` is each document, `FR[name]` its iframe.
`frameVis(name, opacity, blur, transform)` shows one; `screens([[name, from, to], …], t)` cross-fades a sequence (steps
of a sheet, the moments of a tab).

Find real elements by test id, role or label: `DOC.app.querySelector('[data-testid="score-pill"]')`,
`byText(DOC.app, "button", /^Continue$/)`. Log a list of anything missing at the end of init; a renamed button in the
product should fail loudly, not silently draw nothing.

## 4. Camera
The frozen desktop screen sits in a world at (0, 0). `CAMERA.start(cx, cy, z)`, then
`CAMERA.to(t, { x, y, w, h }, region, zmax, spring)` frames a world rectangle inside a screen region (by default
640, 76, 1220 × 928: right of the captions). Zoom springs in log space, so zooming in and out feel the same speed.
`CAMERA.draw(t, worldEl)` applies it; `toScreen(x, y)` converts world points for cursors, notes and taps.

One move per idea: frame the list to show "a new lead arrived", push to the record to read the reply, push to the
score to explain it, pull back. A zmax around 1.6–2.4 keeps UI text sharp at 1080p.

## 5. Cursors, taps, notes, captions
- `const YOU = makeCursor(el("cur-you"), x, y)`; `YOU.windows.push([from, to])` (visible spans);
  `curMove(YOU, t, [x, y])`; `click(YOU, t, [x, y])` arrives 0.55 s early, presses at t (a ripple and a cue). The cursor
  leans with its speed and its name pill lags a little: small things that make it feel alive. A second cursor (the AI,
  in another colour) can "write" the agent's replies.
- `tap(t, () => [sx, sy])`: a finger tap on a phone; measure the target before any scrolling.
- `note(t0, t1, () => toScreen(x, y), [dx, dy], "Score keeps up", "with every reply", bend)`: a short label and a
  hand-drawn arrow to a live target. Two lines at most. `drawNotes(t, svgEl, labelsEl)`.
- `drawCaption(t, CHAPTERS, capEl, railEl)`: chapter number, title and one line, word by word; the rail shows where we are.
- `ripples(t, hostEl)` draws click ripples and taps.

## 6. Sound cues
`cue(t, kind, gain)`: `click()` and `tap()` add theirs; add `key` cues while typing (every second character reads as
real typing), and named kinds for real recordings (`logo`, `slide`). `node tools/frames.mjs --cues audio/cues.json`
writes them for the film-sound skill. Because cues come from the same timeline, retiming the film retimes the sound.

## 7. Patterns from the "Lead to tenant" film

**A phone that rises and taps.** The phone is a device frame (`#phoneobj` > `.body`, `.screen` with a status bar and
an iframe area 390 × 800). Position it in screen space with a spring and a tilt; swap its screens with `screens()`.
```js
const e = spr(t, TL.phoneIn, { w: 8.5, z: .86 });
const px = 1250, py = lerp(1560, 540, e), tilt = 26 * (1 - clamp(e));
css(E.phoneobj, "transform", `translate(${px - 209}px,${py - 436}px)`);
css(E.phone, "transform", `perspective(2200px) rotateX(${tilt * .6}deg) rotateY(${-tilt * .4}deg)`);
const phoneScreen = (x, y) => [px - 209 + 14 + x, py - 436 + 58 + y];   // iframe point → screen, for taps
```

**Typing into the real field.** Keep the final text from the frozen input, then each frame set
`input.value = typed(full, t0, .045, t)`; add `key` cues for every second character.

**Messages arriving.** Hide later messages in the frozen thread; show each at its time with `vis()` (a small rise);
let the thread's scroll follow by springing `thread.scrollTop` to the measured bottom, not by jumping per line.

**A counting score.** `const SCORE = new Track(0).to(17.9, 58, SP.num).to(20.45, 71, SP.num)…`; each frame write the
rounded value, the band word ("Strong", "Very high") and an SVG arc's `stroke-dasharray`.

**A transcript writing itself.** Wrap each transcript line's words in spans; show words up to the recording's real
timings; reveal lines one by one and spring the scroll to the measured height so far. Write the summary in once
(35 ms a word) after the recording ends.

**Sheet steps.** Freeze each step (`d-b1` … `d-b4`); cross-fade with a small blur while the stepper fills; the cursor
presses Continue on the measured button of the step it leaves.

**A pill changing word.** At the moment of the change, set the text and give it a short Gaussian blur pulse:
`const q = Math.exp(-((t - T) / .1) ** 2); css(pill, "filter", q > .02 ? `blur(${6 * q}px)` : "none")`.

**A card that becomes another screen (never empty).** Capture both ends as images (`tools/capture.mjs`: the phone's
receipt screen; the inbox row it becomes) and fly a card from one rectangle to the other with `morphCard()`, fading the
first image out over 5–50 % and the second in over 30–75 %. Open a gap in the list just before it lands
(`spr(t, TL.land - .5)`), then outline the new row.
