# Brand moments: logo, title card, the big change, the ending

The founder's verdict on the first version: the product parts were "coming out great", but the logo opening, the
"becomes a tenant" moment and the ending were "very bad". All three were invented for the film. The fix was to take
them from the brand's own website and port them exactly. Do that from the start.

## Find the brand's motion
Open the website's source (or the design system) and list:
- the logo animation (a loader, a "switch on", a reveal) and its timings;
- the headline motion (words or letters rising: duration, stagger, distance) and the CSS easing curves
  (`--ease-out`, `--ease-lift`, …);
- cards the site uses to show the product's outcome (a status card, a timeline);
- the closing chapter (the last section: its background, people, headline, buttons);
- colours, fonts, the icon sprite, photography.

## Port it to `seek(t)`
- CSS `cubic-bezier(a, b, c, d)` → `bezier(a, b, c, d)` in the engine.
- A CSS animation with a duration and delay → progress `EASE((t - start) / duration)`.
- Staggered words or letters → start times `t0 + k * stagger`.
- A looping keyframe animation (a gentle drift) → a closed-form periodic function of t (ping-pong the phase and
  interpolate between the keyframes), never a running animation.
- A JS loader built from timed steps → a function of milliseconds that returns the shape at that moment (the logo's
  `switchOnFrame(ms)` returned the pill, the morphing knob path and the door for any ms).
Keep the website's numbers. Note every source file you ported from in the film's README.

## Title card (rule: the title leads its card)
What worked, at 1920 × 1080:
1. The logo switches on at its full lockup size, centred (never shrinking while it animates). ~3 s.
2. It glides left as the name's letters rise in after it (letters 34 ms apart, 0.45 s each, a 30-unit rise in the logo's SVG).
3. As the headline arrives, the whole lockup **steps back**: scale 0.78 → 0.34 and up from y 500 to 408 over 0.85 s on
   the lift curve, so the headline (84 px, bold, tight tracking) is the first thing read. The founder's ask: "make the
   logo size smaller so that it's easier for the user to understand what the video is about".
4. The headline arrives word by word (0.4 s, 45 ms apart, 10 px rise); a serif-italic voice line (36 px) follows.
5. Everything lifts 18 px and fades together (0.6 s), and the first scene starts.
A soft real sound under the switch, or none.

## The big state change (lead → tenant)
Use the website's own outcome card if it has one (Autoproperty's tenancy card: Lead pill → ✓ Tenant, four timeline
rows filling one after another, "Home for 31 days" counting up). Show it over the real record, and at the same moment
change the record's own status pill (with the blur pulse), so the brand moment and the product agree.

## Ending
The website's closing chapter, not a new animation: a light page rises over the dark (0.95 s, lift curve); the
story's people gather from the edges to their spots with their status badges and drift gently; the closing line
arrives word by word; the voice line; the call-to-action buttons; then one or two short quotes. The music credit sits
in the footer (CC BY music requires it). Hold the last frame about 2 s while the music fades.

## What not to do
- No logo that flies into a corner, shrinks or spins.
- No invented "soup" of particles, glows or swooshes for the ending.
- No empty rectangle as a transition between scenes.
