Design an updated high-fidelity desktop web app UI for a product called “Bridge”.

Bridge is a commercial AI-powered understanding workspace. It helps users drop documents, videos, audio, notes, links, images, and references into a blank canvas, then turns scattered context into simple, source-grounded understanding.

The product should feel like:

* Figma for understanding
* Wispr Flow for effortless input
* Gamma for transforming messy information into clear outputs
* a calm workspace, not a chatbot
* simple at the start, powerful only when explored

The current UI direction is good, but simplify the product further.

Important UX change:
Remove the top mode tabs: Visual Map, Quick Brief, Source View, Timeline, Deep Dive.
Replace them with only 3 workspace modes:

1. Map
2. Timeline
3. Sources

Move these 3 modes to a bottom-center mode switcher, inspired by Figma’s bottom mode controls. The user should switch modes from the bottom, not the top.

The top bar should remain minimal:

* Back/Home
* Bridge file name
* small “Understanding ready” or subtle processing status
* Search
* Share
* Theme toggle
* User avatar

Remove the “Empty / Sources / Processing / Ready” segmented status from the top. Processing should not be a user-facing mode. Processing is always happening quietly in the background whenever sources change. Show it only as a small calm chip like:
“Updating…”
“Reading new source…”
“Map refreshed”
“3 gaps found”

Do not make processing a navigation item.

Visual style:
Use a minimal, premium, commercial SaaS UI.
Light mode first, dark mode also.
Use the palette:

* Warm off-white: #F6F7ED
* Lime accent: #DBE64C
* Deep navy: #001F3F
* Green: #00804C
* Soft green: #74C365
* Blue: #1E488F
* Charcoal text and dark mode surfaces

Design language:

* clean like Figma
* calm like Linear
* effortless like Wispr Flow
* polished transformation feel like Gamma
* lots of white space
* minimal text
* no overwhelming AI dashboard
* no chatbot-first UI
* no dotted-line chaos
* source-grounded and trustworthy
* simple first, deeper only on click

Core layout:
Use a 3-area workspace:

Left: Sources Rail
Center: Active Workspace
Right: Context / Evidence Panel

The right panel is hidden by default and opens only when the user clicks something.

LEFT SOURCES RAIL
Keep the left source rail.
It should show all uploaded materials in a simple list:

* PDF
* video
* audio
* image
* note
* link
* document
* transcript

Each source item should show:

* icon or thumbnail
* file name
* read / new / updating state
* tiny source type
* optional duration or page count

Keep it narrow and calm.
The left side should always feel simple.

BOTTOM INPUT BAR
Keep the bottom input bar exactly as a key product feature.
It should feel like the easiest way to add context.

Bottom input bar actions:

* Upload
* Paste link
* Write note
* Record
* More

This bar should float at the bottom center.
It should feel like Figma’s creation tools: always available, never intrusive.

Also place the 3 workspace modes near the bottom, either above or beside this bar:

* Map
* Timeline
* Sources

The bottom area should feel like the command area of the product.

MODE 1: MAP
Rename Visual Map + Quick Brief into “Map”.

Map is the default mode after sources are added.
It should not be a messy node graph.
Avoid excessive dotted lines.
Avoid overwhelming connection diagrams.

Map should be a clean visual understanding board.

It should show:

* Main Idea
* Must Know
* Open Questions
* Key Decisions
* Risks
* Next Actions
* Key Sources

Use visual clusters, cards, soft grouping, source chips, icons, and spatial arrangement.
Use very few lines. If relationships are needed, show them through:

* shared color accents
* source chips
* grouped cards
* hover highlights
* soft background regions
* numbered source references
* right-side evidence panel

Every insight card should be short.
Example cards:

* Main Idea
* Must Know
* Question
* Decision
* Risk
* Action

Each card should have small source chips:

* PDF
* Video
* Audio
* Note
* Inferred
* Needs confirmation

Interaction:
When the user clicks any Main Idea, Must Know, Question, Decision, or Risk:

* the right panel opens
* it shows the real source reference
* it shows the exact page, timestamp, video frame, audio waveform, or document snippet
* it shows related sources
* it shows whether the insight is source-based, user-added, or AI-inferred
* it allows adding a note or comment

Do not rely on dotted lines to explain relationships.
Use click-to-reveal evidence instead.

Map should feel like the simplest useful understanding of the whole Bridge.

MODE 2: TIMELINE
Timeline should show how context evolved over time.

It should include:

* source upload order
* meeting moments
* decisions
* changes
* contradictions
* unresolved questions
* user notes
* updates after new sources are added

Timeline cards should be compact but expandable.

Examples:

* “PDF uploaded”
* “Meeting changed deadline”
* “Stakeholder raised approval issue”
* “Diagram contradicts earlier framework”
* “User added note”
* “Map updated”

Clicking any timeline item opens the right panel with:

* exact source proof
* page / timestamp
* linked source
* notes
* related Map cards
* option to add comment

Timeline should feel useful for understanding sequence, change, and decisions.

MODE 3: SOURCES
Rename Source View + Deep Dive into “Sources”.

Sources is the deep working mode.
It is where the user reads, watches, listens, annotates, and works directly with the original material.

This mode should feel like a source studio, not a summary page.

Sources mode should allow:

* reading real PDFs/documents
* watching real videos with timestamps
* listening to audio with waveform
* viewing images and diagrams
* opening links
* reading transcripts
* taking notes
* adding comments
* placing post-its
* highlighting sections
* saving quotes or frames
* asking Bridge to explain a selected section
* generating a short audio explanation from selected material
* generating a short video/visual explanation from selected material
* turning selected source parts into Map cards
* linking notes to exact source moments

Sources mode layout:
Left: list of all sources
Center: real source viewer
Right: notes / evidence / explanation panel

For a PDF:

* show real page view
* allow highlights
* allow sticky notes
* allow “Explain this”
* allow “Add to Map”
* allow “Create audio summary”

For video:

* show video player
* show timeline thumbnails
* show transcript beside or below
* allow timestamp notes
* allow “clip this”
* allow “explain this moment”
* allow “add to Map”

For audio:

* show waveform
* show transcript
* allow timestamp notes
* allow “turn this into a visual explanation”

For images:

* show image viewer
* allow pin notes
* allow crop/selection
* allow “explain this visual”
* allow “connect to Map”

This Sources mode is where the user goes deep. But it should still feel clean and simple.

IMPORTANT FEEDBACK LOOP
Bridge should learn from the user’s work.

When the user:

* highlights a source
* adds a note
* creates a post-it
* confirms an insight
* rejects an AI assumption
* adds a comment
* clips a video
* creates an explanation

The Map and Timeline should update automatically.

Show subtle feedback:
“Map updated”
“Timeline updated”
“Source note linked”
“Question resolved”
“New must-know added”

This makes Bridge feel alive and useful without overwhelming the user.

RIGHT CONTEXT PANEL
The right panel should be the place for depth.
It opens only when needed.

Depending on what is clicked, it can show:

* source proof
* document preview
* page number
* timestamp
* video frame
* audio waveform
* related notes
* explanation
* comments
* confidence
* contradiction
* actions

Actions in the right panel:

* Add note
* Mark important
* Add to Map
* Ask Bridge
* Create audio
* Create visual
* Open source
* Resolve question

This right panel should be clean, not dense.

START EXPERIENCE
Create a commercial app flow.

Screens:

1. Landing page
2. Login / signup
3. Getting started
4. Home / files dashboard
5. Blank Bridge canvas
6. Bridge workspace with Map mode
7. Timeline mode
8. Sources mode
9. Right context panel open
10. Share modal
11. Received Bridge screen
12. Privacy/settings
13. Light mode workspace
14. Dark mode workspace
15. Component system

Landing page:
Use copy:
“Bridge makes scattered context simple.”
“Drop files, links, notes, audio, or video. Bridge turns them into a clear, source-grounded understanding map.”

CTA:
“Start a Bridge”

GETTING STARTED
Keep onboarding very light.
Ask only:
“How do you prefer to understand things?”

Visual cards:

* Visuals and references
* Short summaries
* Audio walkthroughs
* Source-first
* Timeline
* Deep reading

Allow skip:
“Skip — Bridge will adapt as I use it”

HOME / FILES DASHBOARD
Make this feel like Figma files.

Show:

* Recent Bridges
* Shared with me
* Drafts
* Team space
* New Bridge card

Bridge file cards:

* title
* preview thumbnail
* source count
* last updated
* collaborators
* status chip

BLANK CANVAS
A new Bridge opens to a blank canvas.

Show:
“Drop anything here.”
Subtext:
“Files, links, notes, audio, video, images — Bridge will organize the context.”

Actions:

* Upload
* Paste link
* Write note
* Record
* More

No form.
No wizard.
No mandatory setup.

COMMERCIAL SAAS DETAILS
Include:

* file dashboard
* workspace switcher
* team space
* search
* comments
* collaborators
* share permissions
* viewer / editor / commenter roles
* private notes
* privacy controls
* source library
* loading states
* empty states
* error states
* dark mode

SHARE MODAL
Create a simple share modal:

* invite people
* permission: View / Comment / Edit
* hide private notes by default
* allow questions
* require approval before sharing AI inferences
* copy link

RECEIVED BRIDGE
When someone receives a Bridge, show a simple opening screen:

* Bridge title
* who shared it
* purpose
* source count
* estimated time
* choose view:

  * Map
  * Timeline
  * Sources

The receiver should land in Map mode by default.

PRIVACY
Create a privacy settings screen:

* What Bridge remembers
* What stays private
* What gets shared
* Require approval for AI inferences
* Delete understanding profile
* Confidential mode

Use simple trust copy:
“Private notes stay private unless you share them.”
“Bridge adapts the view, not the truth.”

MICRO-INTERACTIONS
Include:

* drag/drop into canvas
* bottom input bar hover states
* bottom mode switch animation
* source cards softly rearrange
* source chip hover preview
* click insight → right panel opens
* clicked insight highlights original source
* PDF highlight animation
* video timestamp preview
* audio waveform scrub
* sticky note creation
* “Map updated” subtle toast
* “Question resolved” subtle toast
* light/dark transition
* share modal slide-in

DESIGN SYSTEM
Create reusable components:

* source rail item
* source card
* insight card
* question card
* decision card
* timeline item
* source viewer
* PDF viewer
* video viewer
* audio waveform card
* sticky note
* source chip
* evidence panel
* bottom input bar
* bottom mode switcher
* share modal
* collaborator avatar
* status chip
* privacy toggle

FINAL DIRECTION
Make Bridge radically simple.

Do not make it feel like:

* an AI dashboard
* a chatbot
* a dense knowledge graph
* a complicated research tool
* a workflow wizard
* a feature-heavy enterprise app

Make it feel like:

* a blank workspace where understanding grows
* simple on the surface
* powerful underneath
* visual-first
* source-grounded
* calm
* commercial
* intuitive
* easy to start
* easy to go deeper

Final output:
Generate a polished, high-fidelity desktop web app prototype for Bridge with light and dark mode. The main workspace should have 3 modes only: Map, Timeline, and Sources. The mode switch should be at the bottom, Figma-style. The Sources mode should be the deep working mode for real source reading, annotation, notes, post-its, audio/video interaction, and converting source selections into Map insights.
