"use strict";
// The starter film: a 15-second example of every engine part on one frozen screen (snap/app).
// Title card → the real screen flies in → a cursor opens a lead → the score counts up with a drawn note →
// a reply is typed and sent → the end card. Copy this file's shape for your own film.

// ───────────────────────────── the timeline (seconds). Plan it on a beat grid when the music has one.
const TL = {
  logo: .15, title: 1.15, sub: 1.55, settle: 1.05, introOut: 2.85,
  deskIn: 3.1, cap1: 3.4, click1: 5.0, scoreUp: 5.3, note1: 5.9,
  cap2: 8.2, clickReply: 8.8, type: 9.25, send: 11.5, sent: 11.65,
  end: 12.9, endLine: 13.5, endVoice: 14.0, endCta: 14.3, FIN: 15,
};
const CHAPTERS = [
  { t: TL.cap1, end: TL.cap2 - .15, num: "01", title: "Every lead, ranked.", sub: "New leads land on top with a score that keeps up with the conversation." },
  { t: TL.cap2, end: TL.end - .1, num: "02", title: "Reply in one click.", sub: "Write once, send, and the thread moves on." },
];
const E = { world: el("world"), deskobj: el("deskobj"), desk: el("desk"), scrim: el("scrim"), lockup: el("lockup"), title: el("title"),
  cap: el("cap"), rail: el("rail"), arrows: el("arrows"), notes: el("notes"), taps: el("taps"), you: el("cur-you"), endcard: el("endcard") };
const YOU = makeCursor(E.you, 1200, 760);
const SCORE = new Track(40).to(TL.scoreUp, 86, SP.num);
const REPLY = "Of course! The cat is welcome. Saturday at 11?";
const R = {};

film({
  duration: TL.FIN,

  async init() {
    await loadSnaps({ app: E.desk });
    const d = DOC.app;
    R.rows = [...d.querySelectorAll(".row")]; R.score = d.getElementById("score"); R.reply = d.getElementById("reply");
    R.send = d.getElementById("send"); R.thread = d.getElementById("thread");
    // a new message for the sent reply, built in the real thread so it inherits the product's own styles
    R.sentMsg = d.createElement("div"); R.sentMsg.className = "msg us"; R.sentMsg.innerHTML = `<p>${REPLY}</p>`; R.thread.appendChild(R.sentMsg);
    E.title.querySelector("h1").innerHTML = words("How a reply gets sent.");
    E.title.querySelector("p").innerHTML = words("From the inbox to the answer.");
    E.endcard.querySelector("h2").innerHTML = words("Every lead, answered.");
    E.endcard.querySelector("p").innerHTML = words("acme.example");
    R.lockW = E.lockup.offsetWidth; R.lockH = E.lockup.offsetHeight;
  },

  // Everything that needs measured positions: camera moves, cursor paths, notes and sound cues.
  schedule() {
    const c = b => [b.cx, b.cy];
    CAMERA.start(735, 430, .8);
    CAMERA.to(TL.deskIn - .1, { x: 0, y: 0, w: 1470, h: 860 }, CAMERA.region, 1.0);
    CAMERA.to(TL.click1 + .2, { x: 440, y: 0, w: 1030, h: 520 }, CAMERA.region, 1.6);
    CAMERA.to(TL.cap2 + .2, { x: 460, y: 200, w: 1010, h: 660 }, CAMERA.region, 1.6);
    YOU.windows.push([TL.click1 - 1.1, TL.click1 + .8], [TL.clickReply - 1, TL.sent + .6]);
    const row = box(R.rows[0]);
    curMove(YOU, TL.click1 - 1.2, [row.cx + 140, row.cy + 240]);
    click(YOU, TL.click1, [row.cx + 30, row.cy]);
    click(YOU, TL.clickReply, [box(R.reply).x + 120, box(R.reply).cy]);
    click(YOU, TL.send, c(box(R.send)));
    const sc = box(R.score);
    note(TL.note1, TL.cap2 - .2, () => toScreen(sc.x - 6, sc.cy), [-330, 110], "Score keeps up", "with every reply", -.3);
    for (let i = 0; i < REPLY.length; i += 2) cue(TL.type + i * .045, "key", .5);
    cue(TL.logo + .1, "logo"); cue(TL.deskIn, "slide"); cue(TL.end, "slide");
  },

  draw(t) {
    CAMERA.draw(t, E.world);
    // title card: the lockup arrives big, steps back (smaller, higher) as the headline comes in, then all lift away
    const inL = EASE.out((t - TL.logo) / .6), sb = EASE.lift((t - TL.settle) / .85), lift = EASE.lift((t - TL.introOut) / .6);
    const k = lerp(1, .42, sb), cy = lerp(520, 360, sb) - 18 * lift;
    apply(E.lockup, { left: `${(960 - R.lockW / 2).toFixed(1)}px`, top: `${(cy - R.lockH / 2 + 20 * (1 - inL)).toFixed(1)}px`,
      transform: `scale(${k.toFixed(4)})`, opacity: (inL * (1 - lift)).toFixed(3), visibility: t < TL.introOut + .8 ? "visible" : "hidden" });
    riseWords(E.title.querySelector("h1"), t, TL.title, TL.introOut);
    riseWords(E.title.querySelector("p"), t, TL.sub, TL.introOut + .04);

    // the product: flies in on a spring with a small tilt, then the camera works inside it
    const de = spr(t, TL.deskIn, { w: 8, z: .9 }), dOp = clamp(de * 2.2) * (t < TL.end + 1.2 ? 1 : 0);
    css(E.deskobj, "opacity", dOp.toFixed(3)); css(E.deskobj, "visibility", dOp > .002 ? "visible" : "hidden");
    css(E.desk, "transform", `perspective(2600px) translateY(${(140 * (1 - de)).toFixed(1)}px) rotateX(${(10 * (1 - clamp(de))).toFixed(3)}deg) scale(${(.94 + .06 * clamp(de)).toFixed(4)})`);
    if (dOp > .002) {
      frameVis("app", 1);
      // the real screen's own DOM, set for time t
      R.rows[0].style.background = t >= TL.click1 ? "rgba(255,255,255,.12)" : "";
      txt(R.score, String(Math.round(SCORE.at(t))));
      const v = t < TL.type ? "" : t < TL.sent ? typed(REPLY, TL.type, .045, t) : "";
      if (R.reply.value !== v) R.reply.value = v;
      const m = vis(t, TL.sent, null, .16, SP.ui); apply(R.sentMsg, { ...fx(m.o, 0, m.dy * .8), display: t >= TL.sent - .01 ? "" : "none" });
    }
    css(E.scrim, "opacity", (clamp((t - TL.cap1 + .2) / .5) * (1 - clamp((t - TL.end) / .4))).toFixed(3));
    drawCaption(t, CHAPTERS, E.cap, E.rail);
    drawNotes(t, E.arrows, E.notes);
    cursorDraw(YOU, t); ripples(t, E.taps);

    // the end card rises over everything; the closing line arrives word by word
    const rise1 = EASE.lift((t - TL.end) / .95);
    css(E.endcard, "visibility", t >= TL.end ? "visible" : "hidden"); css(E.endcard, "transform", `translateY(${((1 - rise1) * 1080).toFixed(1)}px)`);
    riseWords(E.endcard.querySelector("h2"), t, TL.endLine, null);
    riseWords(E.endcard.querySelector("p"), t, TL.endVoice, null);
    for (const [sel, t0] of [[".cta", TL.endCta], [".foot", TL.endCta + .3]]) { const v = rise(t, t0, null); apply(E.endcard.querySelector(sel), fx(v.o, 0, v.dy)); }
  },
});
