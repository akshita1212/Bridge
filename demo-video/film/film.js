"use strict";
// Bridge: product demo film (final cut, 112 s). Every product frame is the real Bridge prototype, frozen on its demo project
// (snap/<name>), animated here as a pure function of time. See STORYBOARD.md for the scenes and decisions.

// ───────────────────────────── timeline (seconds). Every moment of the film is here: retime a scene by editing
// its numbers (and the ones after it). Sound cues are written from these same times, so the sound follows.
// Names starting with "cap" are when a chapter caption comes in; the chapter list below uses them.
const TL = {
  // opening
  logo: .1, name: .45, settle: 1.5, title: 1.75, sub: 2.6, introOut: 4,
  // 01 home
  homeIn: 4.3, cap1: 4.7,
  // 02 create a project, people and roles
  createIn: 8.8, cap2: 9.2, typeName: 10.6, typeAbout: 11.9, p1: 14.4, p2: 15.6, p3: 16.8, roleNote: 17.6, create: 21.2,
  // 03 sources arrive over the weeks
  ovIn: 22.3, cap3: 22.7, src0: 24.2, srcGap: 1.15, ready: 32.4,
  // 04 Overview: the summary
  cap4: 35.6, ctx: 36.2, head: 37, body: 38.4, stats: 40.2, peopleNote: 41.4,
  // 05 Overview: the cards
  cap5: 47.6, scroll1: 48, scroll2: 52.2, blockNote: 54,
  // 06 evidence and confidence (a card's Insight evidence panel)
  capEv: 58.6, evBack: 58.9, evClick: 60.4, evIn: 60.55, srcNote: 61.4, conf: 63, confNote: 63.6, evClose: 67.3, evOut: 67.45,
  // 07 Timeline (further down the same Overview)
  tlIn: 68.6, cap6: 69, shift1: 71, shift2: 72.3, shift3: 73.6, moveNote: 74.2, impact: 75.4, actScroll: 78.4,
  // 08 ask the agent
  cap7: 81.6, clickAgent: 83.1, agentIn: 83.25, q1: 84.3, send1: 85.9, a1: 86.1,
  // 09 audio or video from the agent
  cap8: 93.1, q2: 94.1, send2: 96, a2: 96.2, q3: 99.5, send3: 101.4, a3: 101.6,
  // thank you
  end: 106.7, endLine: 107.4, endVoice: 108.2, FIN: 112,
};
const CHAPTERS = [
  { t: TL.cap1, end: TL.createIn - .3, num: "01", title: "One place for every project.", sub: "Documents, decisions and people come together, and Bridge turns them into one shared understanding." },
  { t: TL.cap2, end: TL.ovIn - .3, num: "02", title: "Start a project, bring your team.", sub: "Name it, add the people, and say what each one does: product, design, engineering, research." },
  { t: TL.cap3, end: TL.cap4 - .3, num: "03", title: "Everyone adds what they have.", sub: "Over the weeks, documents, calls, designs and links arrive. Bridge reads every one." },
  { t: TL.cap4, end: TL.cap5 - .3, num: "04", title: "The Overview starts with a summary.", sub: "What the project is, where it stands, and who is on it in which role." },
  { t: TL.cap5, end: TL.capEv - .3, num: "05", title: "Then what matters most.", sub: "The main idea and must-knows, then the open questions, blockers and needs." },
  { t: TL.capEv, end: TL.tlIn - .3, num: "06", title: "Every finding shows its proof.", sub: "Open any card to see the exact source it came from, and how confident Bridge is." },
  { t: TL.cap6, end: TL.cap7 - .3, num: "07", title: "Decisions move the timeline.", sub: "Further down the Overview: when a decision shifts a date, the Timeline shows it, and Decision impact says why." },
  { t: TL.cap7, end: TL.cap8 - .3, num: "08", title: "Ask the agent anything.", sub: "Answers come from the whole project, with the sources they came from." },
  { t: TL.cap8, end: TL.end - .2, num: "09", title: "Get it as audio or video.", sub: "Ask for a summary to listen to or a short video, right in the chat." },
];
// exposed for player.html (scrubbing and chapter jumps); the film itself does not use these
window.TL = TL; window.CHAPTERS = CHAPTERS;
const E = { world: el("world"), deskobj: el("deskobj"), desk: el("desk"), scrim: el("scrim"), lockup: el("lockup"), title: el("title"),
  cap: el("cap"), rail: el("rail"), arrows: el("arrows"), notes: el("notes"), taps: el("taps"), you: el("cur-you"), endcard: el("endcard") };
const YOU = makeCursor(E.you, 1200, 700);
const LAND = bezier(.16, 1, .3, 1);            // the landing page's motion curve (Landing.tsx: ease [0.16, 1, 0.3, 1])
const R = {};
const missing = [];
const need = (v, label) => { if (!v) missing.push(label); return v; };
const findText = (doc, sel, text) => [...doc.querySelectorAll(sel)].find(e => e.textContent.trim() === text) ?? null;

// The project's weeks: rail rows arrive in date order, each row's time rewritten to its date.
const SOURCES_IN = [
  ["Assessment Framework v3.pdf", "Jan 14"], ["UX Research Session.mp4", "Feb 3"], ["Stakeholder Interview.mp3", "Feb 10"],
  ["Component Library v4", "Feb 18"], ["Design Brief — Q1 2025", "Mar 6"], ["Project Timeline — 2025", "Live"],
];
const SHIFTS = [["Gateway redesign", "shift1"], ["Framework v4", "shift2"], ["Handoff", "shift3"]];
const Q1 = "What's blocking us?", Q2 = "Make a 2-minute audio summary", Q3 = "Now turn it into a short video";

film({
  duration: TL.FIN,

  async init() {
    const names = ["home", "create", "ov", "evidence", "agent0", "agent1", "agent2", "agent3"];
    await loadSnaps(Object.fromEntries(names.map(n => [n, E.desk])));
    const D = DOC;

    // demo-only text: the workspace belongs to Akshat
    for (const n of ["home", "create"]) { const w = findText(D[n], "p", "Jamie's workspace"); if (w) w.textContent = "Akshat's workspace"; }

    // 02 create
    R.name = need(D.create.getElementById("nb-name"), "nb-name"); R.about = need(D.create.getElementById("nb-about"), "nb-about");
    R.nameText = R.name.value; R.aboutText = R.about.value;
    R.people = [...need(D.create.querySelector("[data-testid=people]"), "people").children];
    R.count = [...D.create.querySelectorAll("p")].find(p => /people · everyone/.test(p.textContent));
    R.createBtn = need(D.create.querySelector("[data-testid=create-bridge]"), "create button");
    R.modal = need(D.create.querySelector("[data-testid=new-bridge]"), "modal");

    // 03–05 overview
    const ov = D.ov;
    R.ovScroll = need(ov.querySelector("[data-testid=summary]")?.closest(".overflow-y-auto"), "ov scroller");
    R.rows = SOURCES_IN.map(([title, when]) => {
      let e = findText(ov, "p", title); while (e && e.parentElement && e.parentElement.children.length < 6) e = e.parentElement;
      need(e, "row " + title);
      const time = e && [...e.querySelectorAll("span,p")].reverse().find(x => /ago$|^Live$/.test(x.textContent.trim()));
      if (time) time.textContent = when;
      return e;
    });
    R.railList = R.rows[0]?.parentElement;
    R.ready = [...ov.querySelectorAll("div")].find(x => x.textContent.trim() === "Understanding ready" && /rounded-full/.test(x.className));
    R.summary = need(ov.querySelector("[data-testid=summary]"), "summary");
    R.head = ov.querySelector("[data-testid=summary-headline]"); R.body = ov.querySelector("[data-testid=summary-body]");
    R.head.innerHTML = words(R.head.textContent.trim()); R.body.innerHTML = words(R.body.textContent.trim().replace(/\s+/g, " "));
    R.stats = ov.querySelector("[data-testid=summary-stats]"); R.peopleRow = need(ov.querySelector("[data-testid=people-row]"), "people row");
    R.peopleChips = [...R.peopleRow.children];
    R.g1 = findText(ov, "p", "Key findings"); R.g2 = need(findText(ov, "p", "Questions, blockers & needs"), "group 2");
    R.cardsAfter = R.g1 ? [...R.g1.parentElement.parentElement.children].filter(n => n !== R.summary && n.querySelector(".grid")) : [];
    R.blocker = findText(ov, "p", "Sign-off owner not confirmed");

    // 05b the evidence panel (Insight evidence: source reference, confidence, linked sources)
    const ev = D.evidence;
    R.evPanel = need(findText(ev, "p", "Insight evidence")?.closest(".flex-col, aside, div[class*='border-l']") , "evidence panel");
    R.evHead = findText(ev, "p", "Insight evidence");
    R.evClose = R.evHead && [...R.evHead.parentElement.parentElement.querySelectorAll("button")][0];
    R.srcRef = need(findText(ev, "p", "Source reference")?.parentElement, "source reference");
    R.confLabel = need(findText(ev, "p", "Confidence"), "confidence label");
    R.confBar = R.confLabel && R.confLabel.parentElement.querySelector(".h-full.rounded-full");
    R.confWord = R.confLabel && R.confLabel.parentElement.querySelector("span");
    R.confW = R.confBar ? R.confBar.style.width : "92%";
    R.evCard = findText(D.ov, "p", "Timeline revised to March 15");

    // 06 the Timeline section of the same Overview
    const tl = ov;
    R.tlSection = need(ov.querySelector("[data-testid=timeline-section]"), "timeline section");
    R.milestones = [...tl.querySelectorAll("[data-testid=milestone]")];
    R.shift = SHIFTS.map(([label]) => {
      const m = R.milestones.find(x => x.textContent.includes(label));
      return { planned: m?.querySelector("[data-testid=planned]"), now: m?.querySelector("[data-testid=now]"), tag: m?.querySelector("[data-testid=moved-tag]") };
    });
    R.shift.forEach((s, i) => { need(s.now, "shift " + i); s.plannedText = s.planned?.textContent; s.nowText = s.now?.textContent; });
    R.tlChip = tl.querySelector("[data-testid=tl-chip]");
    R.impact = [...tl.querySelectorAll("[data-testid=impact-card]")];
    R.activity = tl.querySelector("[data-testid=activity]");
    R.lime = need(ov.querySelector('[aria-label="Ask the agent"]'), "agent button");

    // 07 + 08 agent (opened over the Overview's Timeline section)
    for (const n of ["agent0", "agent1", "agent2"]) R[n + "in"] = need(D[n].querySelector('input[placeholder="Type a message…"]'), n + " input");
    R.send = [...D.agent0.querySelectorAll("button")].find(b => b.textContent.trim() === "Send");
    [R.sendBtn0, R.sendBtn1, R.sendBtn2] = ["agent0", "agent1", "agent2"].map(n => need(D[n].querySelector("[aria-label=Send]"), n + " send"));
    R.panelScroll = n => D[n].querySelector(".overflow-y-auto.px-4");
    R.audio = D.agent2.querySelector("[data-testid=agent-output]");

    // title + thank you
    E.lockup.querySelector(".name").innerHTML = "Bridge".split("").map(c => `<span>${c}</span>`).join("");
    E.title.querySelector("h1").innerHTML = words("One shared understanding") + "<br>" + words("for every project.", "w g");
    E.title.querySelector("p").innerHTML = words("Documents, decisions and people, in one place.");
    E.endcard.querySelector("h2").innerHTML = words("Thank you.");
    E.endcard.querySelector("p").innerHTML = words("Every project, understood.");
    R.lockW = E.lockup.offsetWidth; R.lockH = E.lockup.offsetHeight;

    // positions measured at the scroll they are used at
    const at = (sc, top, fn) => { const keep = sc.scrollTop; sc.scrollTop = top; const v = fn(); sc.scrollTop = keep; return v; };
    const maxOv = R.ovScroll.scrollHeight - R.ovScroll.clientHeight, scY = box(R.ovScroll).y;
    R.ovS1 = Math.min(maxOv, R.g1 ? box(R.g1).y - scY - 20 : 380);
    R.ovS2 = Math.min(maxOv, box(R.g2).y - scY - 20);
    R.ovS3 = Math.min(maxOv, box(R.tlSection).y - scY);                       // = scrollIntoView(start), as in the agent freezes
    R.ovS4 = Math.min(maxOv, R.ovS3 + 260);
    // the agent freezes sit on the same Overview, scrolled to exactly where scene 6 leaves it
    for (const n of ["agent0", "agent1", "agent2", "agent3"]) { const sc = DOC[n].querySelector("[data-testid=summary]")?.closest(".overflow-y-auto"); if (sc) sc.scrollTop = R.ovS3; }
    R.bx = {
      rail: box(R.railList), summary: box(R.summary), people: box(R.peopleRow),
      g1: at(R.ovScroll, R.ovS1, () => box(R.g1 || R.g2)),
      blocker: R.blocker ? at(R.ovScroll, R.ovS2, () => box(R.blocker)) : null,
      evCard: at(R.ovScroll, R.ovS1, () => box(R.evCard)), evPanelBox: box(R.evHead.parentElement.parentElement.parentElement),
      srcRef: box(R.srcRef), conf: box(R.confBar ? R.confBar.parentElement : R.confLabel), evCloseBox: R.evClose ? box(R.evClose) : null,
      tlTop: at(R.ovScroll, R.ovS3, () => box(tl.querySelector("[data-testid=timeline]"))), impact: at(R.ovScroll, R.ovS3, () => box(tl.querySelector("[data-testid=impact]"))),
      tag: at(R.ovScroll, R.ovS3, () => box(R.shift[0].tag || R.shift[0].now)),
      lime: box(R.lime), send: box(R.send),
      panel: box(D.agent0.querySelector(".fixed.right-8") || R.agent0in.closest("div")),
      modal: box(R.modal), roles: box(R.people[1].querySelector("select")), createBtn: box(R.createBtn),
      audio: R.audio ? box(R.audio) : null,
    };
    if (missing.length) console.warn("MISSING " + missing.join(", "));
  },

  schedule() {
    const B = R.bx, c = b => [b.cx, b.cy], full = { x: 0, y: 0, w: 1470, h: 860 }, main = { x: 300, y: 40, w: 1170, h: 700 };
    CAMERA.start(735, 430, .8);
    // 01 home
    CAMERA.to(TL.homeIn - .1, full, CAMERA.region, 1);
    CAMERA.to(TL.cap1 + .9, { x: 300, y: 60, w: 1170, h: 640 }, CAMERA.region, 1.15, SP.soft);
    // 02 create
    CAMERA.to(TL.createIn, { x: B.modal.x - 40, y: B.modal.y - 30, w: B.modal.w + 80, h: B.modal.h + 60 }, CAMERA.region, 1.45);
    // 03 sources: the rail, then the whole Bridge when it's ready
    CAMERA.to(TL.ovIn, { x: 0, y: 0, w: 820, h: 860 }, CAMERA.region, 1.3);
    CAMERA.to(TL.ready - .2, full, CAMERA.region, 1);
    // 04 summary
    CAMERA.to(TL.ctx, { x: B.summary.x - 30, y: B.summary.y - 40, w: B.summary.w + 60, h: B.summary.h + 80 }, CAMERA.region, 1.6);
    // 05 cards: the Overview main area while it scrolls
    CAMERA.to(TL.scroll1 - .2, main, CAMERA.region, 1.25);
    // 05b evidence: back to the card, then the card and its evidence panel side by side
    CAMERA.to(TL.evBack, main, CAMERA.region, 1.25);
    CAMERA.to(TL.evIn + .3, { x: 760, y: 40, w: 710, h: 560 }, CAMERA.region, 1.7);
    CAMERA.to(TL.evClose - .2, main, CAMERA.region, 1.25);
    // 06 timeline: keep scrolling down the Overview, then frame the milestones and decision impact
    CAMERA.to(TL.tlIn + .9, { x: B.tlTop.x - 30, y: B.tlTop.y - 30, w: B.tlTop.w + 60, h: B.tlTop.h + 60 }, CAMERA.region, 1.55);
    CAMERA.to(TL.impact - .2, { x: B.tlTop.x - 30, y: B.tlTop.y - 30, w: B.tlTop.w + 60, h: B.impact.y + B.impact.h - B.tlTop.y + 60 }, CAMERA.region, 1.5);
    CAMERA.to(TL.actScroll, main, CAMERA.region, 1.25);
    // 07 agent
    CAMERA.to(TL.cap7, { x: 500, y: 200, w: 970, h: 660 }, CAMERA.region, 1.3);
    CAMERA.to(TL.agentIn + .2, { x: B.panel.x - 60, y: B.panel.y - 40, w: B.panel.w + 120, h: B.panel.h + 80 }, CAMERA.region, 1.55);

    // cursor (Akshat)
    YOU.windows.push([TL.p1 - 1.2, TL.create + .6], [TL.evClick - 1.3, TL.evClick + .2], [TL.evClose - 1.2, TL.evClose + .5],
      [TL.clickAgent - 1.3, TL.send1 + .5], [TL.send2 - 1.1, TL.send2 + .5], [TL.send3 - 1.1, TL.send3 + .5]);
    curMove(YOU, TL.p1 - 1.2, [B.roles.cx - 120, B.roles.cy + 120]);
    curMove(YOU, TL.roleNote - .4, [B.roles.x - 70, B.roles.cy + 60]);
    click(YOU, TL.create, c(B.createBtn));
    curMove(YOU, TL.evClick - 1.3, [B.evCard.cx + 160, B.evCard.cy + 140]);
    click(YOU, TL.evClick, [B.evCard.cx, B.evCard.y + 18]);
    if (B.evCloseBox) { curMove(YOU, TL.evClose - 1.2, [B.evCloseBox.cx - 120, B.evCloseBox.cy + 90]); click(YOU, TL.evClose, c(B.evCloseBox)); }
    curMove(YOU, TL.clickAgent - 1.3, [B.lime.cx - 220, B.lime.cy - 90]);
    click(YOU, TL.clickAgent, c(B.lime));
    click(YOU, TL.send1, c(B.send));
    curMove(YOU, TL.send2 - 1.1, [B.send.cx - 80, B.send.cy + 70]); click(YOU, TL.send2, c(B.send));
    curMove(YOU, TL.send3 - 1.1, [B.send.cx - 80, B.send.cy + 70]); click(YOU, TL.send3, c(B.send));

    // notes
    note(TL.roleNote, TL.create - .3, () => toScreen(B.roles.x + B.roles.w + 6, B.roles.cy), [70, 60], "Everyone's job on the project", "Product · Design · Engineering · Research", .3);
    note(TL.peopleNote, TL.cap5 - .5, () => toScreen(B.people.x + 200, B.people.y + B.people.h + 4), [-60, 90], "Who is on it", "and what they do", -.25);
    if (B.blocker) note(TL.blockNote, TL.capEv - .4, () => toScreen(B.blocker.x + B.blocker.w * .5, B.blocker.y + B.blocker.h + 6), [-60, 110], "What's stuck", "and who can unblock it", .25);
    note(TL.srcNote, TL.evClose - .4, () => toScreen(B.srcRef.x - 6, B.srcRef.cy), [-310, 55], "The exact source", "the line it came from", .2);
    note(TL.confNote, TL.evClose - .4, () => toScreen(B.conf.x - 6, B.conf.cy), [-310, 60], "How sure Bridge is", "High, Medium or Low", .2);
    note(TL.moveNote, TL.impact - .1, () => toScreen(B.tag.cx, B.tag.y + B.tag.h + 4), [-120, 120], "Moved by a decision", "two weeks, after the stakeholder call", -.25);
    if (B.audio) note(TL.a2 + .8, TL.q3 - .3, () => toScreen(B.audio.x - 8, B.audio.cy), [-330, 40], "Ready to listen", "made from every source", -.3);

    // sound cues
    for (const [text, t0, step] of [[R.nameText, TL.typeName, .06], [R.aboutText, TL.typeAbout, .035], [Q1, TL.q1, .06], [Q2, TL.q2, .05], [Q3, TL.q3, .05]])
      for (let i = 0; i < text.length; i += 2) cue(t0 + i * step, "key", .45);
    cue(TL.logo + .05, "logo");
    for (const t of [TL.homeIn, TL.createIn, TL.ovIn, TL.end]) cue(t, "slide", .8);
    SOURCES_IN.forEach((_, i) => cue(TL.src0 + i * TL.srcGap, "place", .5));
    for (const t of [TL.p1, TL.p2, TL.p3]) cue(t, "place", .5);
    for (const [, k] of SHIFTS) cue(TL[k], "toggle", .5);
    for (const t of [TL.a1, TL.a2, TL.a3]) cue(t, "soft", .5);
    cue(TL.conf, "soft", .4);
  },

  draw(t) {
    CAMERA.draw(t, E.world);

    // ── opening: the mark switches on, the name rises, the lockup steps back as the title arrives word by word,
    //    then everything lifts away (the title leads its card)
    const inL = LAND((t - TL.logo) / .6), sb = EASE.lift((t - TL.settle) / .8), lift = EASE.lift((t - TL.introOut) / .55);
    const k = lerp(1, .5, sb), cy = lerp(540, 350, sb) - 18 * lift;
    apply(E.lockup, { left: `${(960 - R.lockW / 2).toFixed(1)}px`, top: `${(cy - R.lockH / 2 + 20 * (1 - inL)).toFixed(1)}px`,
      transform: `scale(${(k * (.92 + .08 * inL)).toFixed(4)})`, opacity: (clamp(inL * 1.4) * (1 - lift)).toFixed(3), visibility: t < TL.introOut + .6 ? "visible" : "hidden" });
    [...E.lockup.querySelectorAll(".name span")].forEach((s, i) => { const v = LAND((t - TL.name - i * .04) / .45); apply(s, { opacity: v.toFixed(3), transform: `translateY(${(20 * (1 - v)).toFixed(1)}px)` }); });
    riseWords(E.title.querySelector("h1"), t, TL.title, TL.introOut, .06);
    riseWords(E.title.querySelector("p"), t, TL.sub, TL.introOut + .04, .04);

    // ── the product
    const de = spr(t, TL.homeIn, { w: 7, z: .95 }), dOp = clamp(de * 2.2) * (t < TL.end + 1.2 ? 1 : 0);
    css(E.deskobj, "opacity", dOp.toFixed(3)); css(E.deskobj, "visibility", dOp > .002 ? "visible" : "hidden");
    css(E.desk, "transform", `perspective(2600px) translateY(${(120 * (1 - de)).toFixed(1)}px) rotateX(${(8 * (1 - clamp(de))).toFixed(3)}deg) scale(${(.95 + .05 * clamp(de)).toFixed(4)})`);
    if (dOp > .002) {
      screens([["home", TL.homeIn - .3, TL.createIn], ["create", TL.createIn, TL.ovIn], ["evidence", TL.evIn, TL.evOut],
        ["agent0", TL.agentIn, TL.a1], ["agent1", TL.a1, TL.a2], ["agent2", TL.a2, TL.a3], ["agent3", TL.a3, 999]], t);
      { const a = clamp((t - TL.ovIn) / .24) * (1 - clamp((t - TL.evIn) / .14)), b = clamp((t - TL.evOut) / .24) * (1 - clamp((t - TL.agentIn) / .14)); frameVis("ov", Math.max(a, b)); }
      drawCreate(t); drawOverview(t); drawTimeline(t); drawEvidence(t); drawAgent(t);
    }
    css(E.scrim, "opacity", (clamp((t - TL.cap1 + .3) / .6) * (1 - clamp((t - TL.end) / .4))).toFixed(3));
    drawCaption(t, CHAPTERS, E.cap, E.rail);
    drawNotes(t, E.arrows, E.notes);
    cursorDraw(YOU, t); ripples(t, E.taps);

    // ── thank you: paper rises, the mark, "Thank you.", one line, the credit
    const r1 = EASE.lift((t - TL.end) / .95);
    css(E.endcard, "visibility", t >= TL.end ? "visible" : "hidden"); css(E.endcard, "transform", `translateY(${((1 - r1) * 1080).toFixed(1)}px)`);
    { const v = rise(t, TL.end + .5, null); apply(E.endcard.querySelector(".mark"), fx(v.o, 0, v.dy * 2)); }
    riseWords(E.endcard.querySelector("h2"), t, TL.endLine, null, .08);
    riseWords(E.endcard.querySelector("p"), t, TL.endVoice, null);
  },
});

// ───────────────────────────── scene parts (each sets the frozen DOM for time t)
function show(node, t, t0, dy = 14) { if (!node) return; const v = vis(t, t0, null, .16, SP.ui); apply(node, fx(v.o, v.b * .4, v.dy * dy / 18)); }
const springScroll = (node, target) => { if (node && Math.abs(node.scrollTop - target) > .5) node.scrollTop = target; };

function drawCreate(t) {
  if (t < TL.createIn - .5 || t > TL.ovIn + .5) return;
  const name = t < TL.typeName ? "" : typed(R.nameText, TL.typeName, .06, t), about = t < TL.typeAbout ? "" : typed(R.aboutText, TL.typeAbout, .035, t);
  if (R.name.value !== name) R.name.value = name; if (R.about.value !== about) R.about.value = about;
  const ts = [0, TL.p1, TL.p2, TL.p3];
  R.people.forEach((row, i) => { if (i) show(row, t, ts[i]); });
  const n = 1 + ts.slice(1).filter(x => t >= x).length;
  if (R.count) txt(R.count, `${n} ${n === 1 ? "person" : "people"} · everyone sees the same context`);
}

function drawOverview(t) {
  if (t < TL.ovIn - .5 || t > TL.agentIn + .5) return;
  // 03: the rail fills over the weeks; the main area waits for "Understanding ready"
  R.rows.forEach((row, i) => show(row, t, TL.src0 + i * TL.srcGap, 22));
  const ready = clamp((t - TL.ready) / .5);
  if (R.ready) { const q = Math.exp(-(((t - TL.ready - .1) / .18) ** 2)); apply(R.ready, { opacity: (.25 + .75 * ready).toFixed(3), transform: `scale(${(1 + .18 * q).toFixed(3)})` }); }
  apply(R.ovScroll, { opacity: vis(t, TL.ready + .1, null, .16, SP.soft).o.toFixed(3) });
  // 04: the summary writes itself, then the numbers and the people with their roles
  riseWords(R.head, t, TL.head, null, .05);
  [...R.body.querySelectorAll(".w")].forEach((s, k) => { const v = rise(t, TL.body + k * .022, null); apply(s, { opacity: v.o.toFixed(3) }); });
  show(R.stats, t, TL.stats);
  R.peopleChips.forEach((n, i) => show(n, t, TL.stats + .5 + i * .3));
  R.cardsAfter.forEach(n => show(n, t, TL.cap5 - .4));
  // 05 + 06: scroll down through the cards, on to the Timeline section, then to the activity and back up to it
  const sc = t < TL.scroll1 ? 0 : t < TL.scroll2 ? R.ovS1 * stepR(t - TL.scroll1, SP.cam)
    : t < TL.evBack ? lerp(R.ovS1, R.ovS2, stepR(t - TL.scroll2, SP.cam))
    : t < TL.tlIn ? lerp(R.ovS2, R.ovS1, stepR(t - TL.evBack, SP.cam))
    : t < TL.actScroll ? lerp(R.ovS1, R.ovS3, stepR(t - TL.tlIn, SP.cam))
    : lerp(R.ovS3, R.ovS4, stepR(t - TL.actScroll, SP.cam) * (1 - stepR(t - TL.cap7, SP.cam)));
  springScroll(R.ovScroll, sc);
}

function drawTimeline(t) {
  if (t < TL.ovIn - .5 || t > TL.agentIn + .5) return;
  // each milestone slips at its moment, with a blur pulse; the chip and Decision impact follow
  R.shift.forEach((s, i) => {
    const T = TL[SHIFTS[i][1]], on = t >= T, q = Math.exp(-(((t - T) / .12) ** 2));
    txt(s.now, on ? s.nowText : s.plannedText);
    apply(s.now, { color: on ? "" : "var(--foreground)", filter: q > .02 ? `blur(${(5 * q).toFixed(2)}px)` : "none", display: "inline-block", transform: `scale(${(1 + .25 * q).toFixed(3)})` });
    if (s.planned) apply(s.planned, { opacity: on ? "1" : "0", display: on ? "" : "none" });
    if (s.tag) show(s.tag, t, T + .1);
  });
  if (R.tlChip) show(R.tlChip, t, TL.shift3 + .4);
  R.impact.forEach((n, i) => show(n, t, TL.impact + i * .35, 26));
  show(R.activity, t, TL.tlIn);
}

function drawAgent(t) {
  if (t < TL.agentIn - .5) return;
  const v0 = t < TL.q1 ? "" : t < TL.send1 ? typed(Q1, TL.q1, .06, t) : "";
  if (R.agent0in.value !== v0) R.agent0in.value = v0;
  const v1 = t < TL.q2 ? "" : t < TL.send2 ? typed(Q2, TL.q2, .05, t) : "";
  if (R.agent1in.value !== v1) R.agent1in.value = v1;
  const v2 = t < TL.q3 ? "" : t < TL.send3 ? typed(Q3, TL.q3, .05, t) : "";
  if (R.agent2in.value !== v2) R.agent2in.value = v2;
  for (const n of ["agent1", "agent2", "agent3"]) { const p = R.panelScroll(n); if (p && p.scrollTop !== p.scrollHeight) p.scrollTop = p.scrollHeight; }
  // Send lights up while there is text in the box, exactly as the product does
  [[R.sendBtn0, v0], [R.sendBtn1, v1], [R.sendBtn2, v2]].forEach(([b, v]) => { if (b) apply(b, v ? { background: "#DBE64C", color: "#001F3F" } : { background: "var(--secondary)", color: "var(--muted-foreground)" }); });
}

function drawEvidence(t) {
  if (t < TL.evIn - .5 || t > TL.evOut + .5) return;
  // the source reference rises in, then the confidence bar fills to its score
  show(R.srcRef, t, TL.evIn + .3);
  const k = stepR(t - TL.conf, SP.num);
  if (R.confBar) css(R.confBar, "width", `${(parseFloat(R.confW) * clamp(k)).toFixed(2)}%`);
  if (R.confWord) css(R.confWord, "opacity", clamp((t - TL.conf - .6) / .3).toFixed(3));
}
