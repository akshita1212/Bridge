# Storyboard: Bridge product demo (final cut, 112 s)

**The ask (Akshat).** A product demo of Bridge that explains what it is, a little of how it works, and shows its
features. Slow and simple, in Bridge's own design. The order: what Bridge is → create a project and add people with
their roles → people add documents over time → Bridge builds the common context (the Overview) → what matters
(main idea, must-know, questions, blockers, needs) → the proof and confidence behind each finding → the timeline, moved
by decisions → ask the agent anything → ask the agent for audio or video → thank you.

**Subject.** One Bridge, "Product Handoff", the prototype's demo project. Our side is Akshat (the cursor, a Designer).
The team: Aditi Sharma (Product Manager), Rohan Mehta (Engineer), Jo Chen (Researcher).

**Look.** Bridge's light paper ground (#F6F7ED), navy ink (#001F3F), lime accent (#DBE64C), green (#00804C),
Plus Jakarta Sans and DM Mono. Captions sit in a left column over a paper scrim; the real product sits to the right.
Motion uses the landing page's curve, cubic-bezier(.16, 1, .3, 1).

## Scenes
Times are seconds; each is a `TL` value in `film/film.js`.

| # | Time | Caption (title · line) | On screen | Frozen screen |
|---|---|---|---|---|
| 00 | 0–4.3 | Bridge · "One shared understanding for every project." · "Documents, decisions and people, in one place." | Mark and name arrive; title word by word; all lift away | — |
| 01 | 4.3–8.8 | One place for every project. · Documents, decisions and people come together… | Home comes in and zooms | `home` |
| 02 | 8.8–22.3 | Start a project, bring your team. · Name it, add the people, and say what each one does… | New Bridge: name and one line type in; Aditi, Rohan, Jo join with job roles; Create Bridge | `create` |
| 03 | 22.3–35.6 | Everyone adds what they have. · Over the weeks… Bridge reads every one. | Sources arrive one by one (Jan 14 → Mar 6); "Understanding ready" | `ov` |
| 04 | 35.6–47.6 | The Overview starts with a summary. · What the project is, where it stands, and who is on it in which role. | Summary writes itself; numbers; people with roles | `ov` |
| 05 | 47.6–58.6 | Then what matters most. · The main idea and must-knows, then the open questions, blockers and needs. | Scroll through the cards; note on the blocker | `ov` |
| 06 | 58.6–68.6 | Every finding shows its proof. · Open any card to see the exact source… and how confident Bridge is. | Back to "Timeline revised to March 15"; Insight evidence panel; Confidence fills to High | `evidence` |
| 07 | 68.6–81.6 | Decisions move the timeline. · Further down the Overview… Decision impact says why. | Milestones slip, "Moved by a decision"; Decision impact; Activity | `ov` |
| 08 | 81.6–93.1 | Ask the agent anything. · Answers come from the whole project, with the sources… | Lime corner button; "What's blocking us?" (Send lights up); answer with sources | `agent0`, `agent1` |
| 09 | 93.1–106.7 | Get it as audio or video. · Ask for a summary to listen to or a short video… | Audio summary card, then a video card, in the chat | `agent2`, `agent3` |
| 10 | 106.7–112 | Thank you. · Every project, understood. | Paper rises with the mark | — |

## Decisions (each can be overturned in one line)
- D1 The title is the line "One shared understanding for every project.", not "Product demo".
- D2 Light paper ground throughout; no dark film ground.
- D3 Scene 03 uses the source rail's real rows, with their "x days ago" rewritten to the project's dates.
- D4 Overview is one space: Summary → cards → Timeline (Milestones, Decision impact, Activity). No toggle, no separate
  Timeline space. The word "Map" is not used.
- D5 Roles are jobs (Product Manager, Designer, Engineer, Researcher, Stakeholder), each with what they own.
- D6 Workspace and Work are not shown.
- D7 The agent's mic button is visible but never mentioned; Send turns lime while text is typed.
- D8 No footer text on the thank-you card. The music credit goes wherever the film is shared instead.
- D9 Music: "Happy Beats / Business Moves Vol. 12" (the slowest bed), UI clicks and typing only.

## Feedback rounds (what changed and why)
1. **v1** (112 s): first cut. Landing headline as title, "Start a Bridge" ending.
2. **v2**: "start like a product demo", short opening; Map renamed Overview with a summary first; roles as jobs
   (not Owner/Editor); Thank-you ending. Then: "Timeline is part of the Overview, not an extra thing" → one Overview page.
3. **v3**: remove the grey footer text; Send must light up while typing; add a mic icon (don't mention it); a proper
   title instead of "Product demo"; align every note's text with its arrow.
4. **v4**: the home scene took too long ("nothing happens on that screen"): halved to 4.5 s.
5. **v5 (final)**: add the confidence score: the Insight evidence panel on a key finding, as its own point (06).

## Real vs sample
- Real UI: the Bridge prototype in this repo (`src/`), frozen by `tools/snap.mjs` from the local dev server.
- Sample data: the prototype's built-in demo project and team. No live system was touched; every write was blocked.
