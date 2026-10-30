# Storyboard and timeline

Write this before freezing anything. It is cheap to change here and expensive after rendering.

## What goes in it
1. **The ask, in the person's order.** List the flow exactly as they described it ("the form on a phone, the lead in
   the inbox, the agent talking while the score updates, the call transcript, the four contract steps, the three
   signing steps, the lead becoming a tenant"). Every item is a scene; nothing they asked for is dropped or merged
   without saying so.
2. **One subject carried through.** One applicant (customer, order, ticket) from the first tap to the end. If the
   brand website already tells a story with a named person, use that person and their facts, so the film and the site
   agree. ("Ingrid Haugen, a nurse moving from Oslo, flat 301 at Fjellsiden 12, 12 900 kr, keys on 1 December".)
3. **One takeaway per scene**, written as its caption: a number, a short title, one line. ("02 · Autoproperty AI
   answers. The lead lands in your inbox. The agent replies on its own, and every reply moves her score.")
4. **The look**: the ground (the website's dark or light page), the product theme, type, the motion grammar, where the
   captions sit (a left column over a scrim, the product to its right worked well at 1920 × 1080).
5. **Decisions, numbered** (D1, D2 …): every creative call the person might disagree with, one line each, so they can
   overturn any in one sentence. ("D3 Three steps of signing = the Contract tab's own 'What happens next' track.")
6. **Real vs sample**: what is real product code, what is sample data, which assets come from where.

## Pacing that worked (71.5 s, six chapters)
| Part | Length | Notes |
|---|---|---|
| Title card | ~6.5 s | logo 3 s, name, headline word by word, all lift away together |
| Each chapter | 9–12 s | caption in first, then the action; leave 1–2 s settled at the end to read the result |
| State change (lead → tenant) | ~5 s | the brand's own card, the product's pill changes at the same moment |
| Ending | ~8 s | the brand's closing chapter, the call to action, the music credit |

Rules of thumb: a cursor arrives about 0.5 s before it clicks; a typed field at 30–45 ms a character; the camera
moves once per beat of meaning, not continuously; never two things competing for the eye; a new screen gets 0.25 s to
fade in, 0.14 s to go.

## The timeline object
Put every time in one object at the top of `film.js`, in seconds, so the whole film can be retimed in one place and
the sound cues follow automatically.

```js
// 120 BPM: a beat is 0.5 s, a bar 2 s. Snap chapter starts and big moves to the grid when the music has one.
const TL = {
  logo0: -0.05, lockup: 3.15, settle: 4.4, title: 4.6, sub: 5.0, lift: 6.3,
  phoneIn: 6.75, cap1: 7.0, typeName: 7.75, tap1: 10.0, about: 10.125, …, received: 14.625,
  deskIn: 15.75, land: 16.75, clickRow: 17.5, open: 17.625, m2: 19.0, m3: 20.25, …,
  close: 63.4, headline: 64.35, cta: 65.45, FIN: 71.5,
};
```

## The scene table (the one from the "Lead to tenant" film, as an example)
| # | Time (s) | Caption | What happens |
|---|---|---|---|
| 0 | 0–6.75 | (brand) | The website's loader: the logo switches on at lockup size, the name rises in letter by letter; the lockup steps back as the headline arrives word by word; everything lifts away |
| 1 | 6.75–15.75 | 01 · She applies from one link | A phone rises; the real application form; fields type themselves; taps on Next; "Application received" |
| 2 | 15.75–27.25 | 02 · The AI answers | The phone's receipt shrinks into her real inbox row; the cursor opens it; the agent's replies land; the score counts 58 → 71 → 84; a peek explains the score |
| 3 | 27.25–38.25 | 03 · Every call, written down | The call row opens; the recording plays; the transcript writes word by word; the summary writes itself |
| 4 | 38.25–48.75 | 04 · Create the contract | ⋯ → Create contract; four steps, each body swapping with a blur |
| 5 | 48.75–58.25 | 05 · Signed in three steps | She signs on her phone; the manager countersigns; the move-in starts |
| 6 | 58.25–63.4 | 06 · She is a tenant | The website's tenancy card: Lead → ✓ Tenant, the move-in timeline fills, "Home for 31 days" |
| 7 | 63.4–71.5 | (ending) | The website's closing chapter rises over the dark; the people gather; the closing line; call to action; music credit |
