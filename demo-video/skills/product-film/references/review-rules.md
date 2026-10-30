# Review rules (learned from real feedback)

Check every rule on the stills before showing anyone, and again on the render. Each came from the founder's feedback
on the "Lead to tenant" film (27–28 Oct 2026).

| ID | Rule | Why (their words) | Check |
|---|---|---|---|
| FILM-1 | **Real UI only.** Every product screen is the product's own code frozen on sample data, never a mock-up or redraw; no write reaches a live system. | Brief: "use the real UI". | Each scene names the route or component it was frozen from. |
| FILM-2 | **Brand moments are the brand's own.** Logo, titles, the big state change and the ending reuse the website's grammar, not new inventions. | "Rather than that I would suggest using the inline headline… Have something from there rather than creating something like soup." | Each brand moment names its website source file. |
| FILM-3 | **The title leads its card.** When the headline arrives under the logo, the logo steps back (smaller, higher); it never shrinks while it animates in. | "The logo size is very big. If we can make the logo size smaller so that it's easier for the user to understand what the video is about." | On the title frame the headline is the largest text; the lockup is under half its first size. |
| FILM-4 | **No empty boxes in motion.** Anything moving between screens carries real content the whole way; the place it lands opens before it arrives. | "There is a blank rectangle… Rather than blank, can we have it in a grid or in some way?" | Step the transition at 0.1 s; no frame shows a plain filled rectangle. |
| FILM-5 | **Real, quiet sound.** UI clicks, taps and typing; one produced, licensed, slow music bed; a real sound at the logo or none; no synthesized whooshes or chimes; credit what the licence asks for. | "Other than clicks and typing sounds, all other sounds are very confusing… Either have a good sound behind the logo or don't have any." | Every sound file has a source and licence; the credit is on screen. |
| FILM-6 | **Real names for our side.** The person using the product is a real team member; customers come from the brand's story; never an invented staff name. | "Can you call it Akshat rather than Maja?… If it's the name, then we have to call it a name." | Grep the film and its data for invented staff names. |
| FILM-7 | **Taste picks come as levelled options.** Same cut with each option, the current one kept, all at the same loudness; the person picks. | "Can you give me options for some background audios? I like this one also." (They picked the slowest track.) | Options differ only in that choice; loudness measured. |

## How the rounds went (what to expect)
- **v1** (the brief): real UI, homepage design and motion, an arrow guiding through, logo and text animation, not too
  long, "a cool ending". The product walkthrough landed at once.
- **v2**: the invented ending, logo opening and "becomes a tenant" moment were rejected; synthesized music and effects
  were "unprofessional"; only the clicks and typing were kept; the cursor's invented name was replaced with the real
  team member's. Fix: port the website's own moments; licensed music; real recordings.
- **v3**: "only two very small things": the logo too big under the title (FILM-3) and a blank card in a transition
  (FILM-4). Plus music options at equal loudness (FILM-7).
- **Final**: they chose a music option; everything else stayed.

## Before showing a cut
- Every asked-for step is in the film, in the asked order, and named in the caption.
- Stills every second on one contact sheet: nothing clipped, nothing empty, one thing in focus per moment.
- The title frame and the last frame read on a phone screen.
- Sound: only the kinds above; loudness about −17 LUFS, true peak under −1 dB.
- A README with sources, licences and what is sample data.
- Keep the previous cut beside the new one; say exactly what changed and nothing else.
