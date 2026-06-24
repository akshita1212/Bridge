Design an updated high-fidelity desktop web app UI for a commercial AI product called “Bridge”.

Bridge is an AI-powered understanding workspace. It helps users drop documents, videos, audio, links, images, notes, transcripts, and references into one place, then turns scattered context into simple, source-grounded understanding.

Bridge should feel like:

* Figma for understanding
* Figma Slides for arranging and presenting source material spatially
* Wispr Flow for effortless input
* Gamma for transforming messy inputs into clear outputs
* NotebookLM-like source interaction, but more visual, spatial, and commercially polished

The product should not feel like:

* a chatbot
* an AI dashboard
* a dense knowledge graph
* a multi-step wizard
* a complicated research tool
* a generic SaaS template
* an overwhelming workspace full of options

It should feel:

* simple at first
* powerful only when explored
* minimal
* commercial
* calm
* visual-first
* source-grounded
* easy to enter
* easy to understand
* easy to go deeper when needed

Core product promise:
“Drop anything. Bridge makes it understandable.”

Use this palette:

* Warm off-white: #F6F7ED
* Lime accent: #DBE64C
* Deep navy: #001F3F
* Green: #00804C
* Soft green: #74C365
* Blue: #1E488F
* Charcoal / deep navy for dark mode

Create both light mode and dark mode.

Overall product structure:
Bridge has only two main workspace modes:

1. Map
2. Workspace

Do not include Quick Brief, Source View, Deep Dive, or Timeline as separate main tabs.

Map is for simple understanding.
Workspace is for deep source exploration, annotation, and creation.
Timeline becomes Activity / History in the top bar.

TOP BAR

Create a minimal top bar with:

* Home / back
* Bridge file name
* small status chip: “Understanding ready” or “Updating…”
* Search
* Activity / History icon
* Share
* Theme toggle
* User avatar

Activity / History should sit near Search and Share.
It should not be a main page or main mode.

Activity panel:
When clicked, open a small side drawer or dropdown showing:

* source uploaded
* map updated
* note added
* question created
* video explanation generated
* audio explanation generated
* highlight added
* source linked
* contradiction found
* Bridge shared
* new version created

Each activity item should be clickable and should jump the user to the related source, note, map card, or generated output.

BOTTOM CONTROLS

Use a Figma-like bottom-center control area.

Bottom mode switcher:

* Map
* Workspace

The mode switcher should feel like a lightweight Figma-style mode control.

Bottom input bar:
Keep this as a core product feature.

Actions:

* Upload
* Paste link
* Post-it
* Record
* More

The bottom input bar should float at the bottom center.
It should feel as easy as adding a shape, text box, or sticky note in Figma.

Button interactions must have visible UI feedback.

Upload interaction:
When user clicks Upload:

* open a clean upload modal
* show drag-and-drop area
* show supported formats
* show recent imports
* show upload progress
* show success state
* uploaded files appear directly on the Workspace canvas

Paste link interaction:
When user clicks Paste link:

* open a small popover
* show URL input field
* show loading preview state
* show website preview card
* show Add to Bridge button
* show invalid link error state

Post-it interaction:
When user clicks Post-it:

* create a small sticky-note popover
* user can type a quick note
* user can place it anywhere on the canvas
* note remembers where it was created
* note can be linked to a source, map card, page, timestamp, video moment, audio moment, or selected area

Record interaction:
When user clicks Record:

* open a compact recording panel
* show animated waveform
* show start / pause / stop controls
* show live transcript loading state
* allow saving recording to the Workspace

More menu:
When user clicks More:

* open a compact menu with:

  * Import from cloud
  * Add image
  * Add transcript
  * Add folder
  * Generate audio
  * Generate video
  * Generate document
  * Ask Bridge

MODE 1: MAP

Map is the simple understanding layer.
Map should be the default view after sources are added.

Map combines:

* visual map
* quick brief
* key questions
* must-know points
* decisions
* risks
* actions
* important source references

Map should not be a messy dotted-line diagram.
Avoid too many connection lines.
Use clean grouping instead.

Use:

* clusters
* cards
* source chips
* hover highlights
* soft background regions
* category colors
* icons
* thumbnails
* compact labels

Map should show these groups:

* Main Idea
* Must Know
* Open Questions
* Key Decisions
* Risks
* Next Actions
* Key Sources

Cards should be short, visual, and easy to scan.

Each Map card should include source chips:

* PDF
* Video
* Audio
* Image
* Link
* Note
* Inferred
* Needs confirmation

Map card interaction:
When user clicks any Main Idea, Must Know, Question, Decision, Risk, or Action card:

* open the right context panel
* show exact supporting source
* show page, timestamp, frame, transcript, image crop, or highlighted section
* show whether it is source-based, user-added, or AI-inferred
* show related sources
* show related notes
* allow actions:

  * Open in Workspace
  * Add note
  * Mark important
  * Ask Bridge
  * Resolve question
  * Create audio explanation
  * Create visual explanation
  * Create document from this

Map should update based on work done inside Workspace.

Show subtle toasts:

* “Map updated”
* “Question resolved”
* “New must-know added”
* “Source note linked”
* “New output created”

MODE 2: WORKSPACE

Workspace is the deep source-analysis space.
This replaces Source View, Deep Dive, and Workbench.

Workspace should feel like a spatial Figma Slides-style source canvas.

The user should be able to:

* zoom in and out
* pan around
* open many sources together
* arrange documents, videos, audio, images, notes, and links spatially
* group related sources
* place post-its around sources
* highlight exact sections
* add notes to specific page areas, timestamps, frames, or moments
* ask Bridge about selected sources
* generate audio, video, or document outputs from one source, multiple sources, or the whole Bridge

Workspace should not show each source as a separate page by default.
All sources should be able to live together on one large spatial canvas.

The Workspace should include:

* documents opened as page frames
* videos opened as playable cards with timeline thumbnails
* audio opened as waveform cards with transcript
* images opened as visual frames with pin notes
* links opened as preview cards
* notes opened as post-it cards
* generated outputs shown as new cards on the same canvas

LEFT RAIL

Keep the left rail as a simple source navigator.

Left rail should show:

* all sources
* source groups
* source type icons
* read / new / updating state
* filters
* search within sources

Filters:

* All
* Docs
* Media
* Notes
* Generated
* Questions

The left rail should remain narrow and calm.
It should not overwhelm the user.

WORKSPACE CANVAS BEHAVIOR

When sources are added:

* they appear as spatial cards on the canvas
* Bridge may lightly auto-arrange them
* related sources can be grouped softly
* connections should not be shown heavily by default
* relationship lines appear only on hover, selection, or when the user asks

When a source is selected:

* related sources softly highlight
* linked notes glow lightly
* related Map cards appear in the right panel
* source references become visible
* user can ask, create, annotate, or open deeper

PDF / Document behavior:

* show real document pages
* allow scroll and zoom
* allow highlights
* allow post-its on exact page areas
* allow “Explain this section”
* allow “Add to Map”
* allow “Create audio explanation”
* allow “Create summary document”

Slides behavior:

* show slide frames
* allow zooming into each slide
* allow comments and notes beside slides
* allow generated walkthrough
* allow presenting source sequence

Video behavior:

* show video player on canvas
* show timeline thumbnails
* show transcript at bottom or side
* allow timestamp notes
* allow clip selection
* allow “Explain this moment”
* allow “Add clip to Map”
* allow “Generate short video from selected moments”

Audio behavior:

* show waveform
* show transcript
* allow timestamp notes
* allow “Create visual explanation”
* allow “Create audio walkthrough”

Image behavior:

* show image on canvas
* allow pin notes
* allow crop / area selection
* allow “Explain this visual”
* allow “Add selected area to Map”

Link behavior:

* show website preview card
* allow opening preview
* allow extracting key sections
* allow saving references

Note behavior:

* show notes as post-its
* allow linking notes to sources
* allow converting notes into:

  * question
  * insight
  * task
  * risk
  * decision
  * Map card

RIGHT CONTEXT PANEL

The right panel is hidden by default.
It opens only when the user clicks a source, note, highlight, timestamp, Map card, generated output, or selected area.

Right panel should show:

* selected source preview
* metadata
* AI explanation
* related Map cards
* related notes
* comments
* transcript if relevant
* page number or timestamp
* source connections
* confidence
* provenance

Right panel actions:

* Ask Bridge
* Explain this
* Create video
* Create audio
* Create document
* Add to Map
* Add note
* Mark important
* Create question
* Link to another source
* Open original

ASK BRIDGE

Add a lightweight “Ask Bridge” interaction inside Workspace.

It should not dominate the UI like a chatbot.
It should appear as a compact floating panel or right-panel section.

User can ask:

* “Explain this document visually”
* “What is this video saying?”
* “How is this PDF connected to the meeting?”
* “Create an audio explanation of selected sources”
* “Make a single document from these sources”
* “What questions should I ask?”
* “What am I missing?”
* “Where did this point come from?”

Every AI answer must include source references.

Clicking a source reference should jump the canvas to the exact:

* document page
* paragraph
* slide
* video timestamp
* audio moment
* image area
* note
* generated output

This should feel like moving through a Figma file or Figma Slides presentation.

GENERATED OUTPUTS

In Workspace, users can select:

* one source
* multiple sources
* a group
* a note cluster
* the whole Bridge

Then generate:

* video explanation
* audio walkthrough
* single combined document
* visual summary
* question list
* working notes
* handoff brief

Generated outputs should appear on the Workspace canvas as new cards.

Example:
User selects 3 sources and clicks “Create audio”.
A new card appears:
“Audio Walkthrough — 4 min”
It includes:

* play button
* waveform
* source references
* regenerate option
* add to Map option

Another example:
User selects a PDF, a video, and 2 post-its and clicks “Create document”.
A new card appears:
“Combined Understanding Doc”
It includes:

* preview
* source list
* open button
* export button

POST-ITS AND NOTES

Post-its should be spatial, lightweight, and easy.

User can add a note anywhere.
A note can be:

* free-floating
* attached to a document page
* attached to video timestamp
* attached to audio timestamp
* attached to image area
* attached to Map insight
* attached to generated output

Each note should have:

* short text
* optional tag
* source link
* created by
* timestamp
* quick actions:

  * Add to Map
  * Make question
  * Mark private
  * Ask Bridge

Private notes should use a subtle lock icon.

Copy:
“Private unless shared.”

EMPTY STATE

When a new Bridge opens, show a blank canvas.

Main copy:
“Drop anything here.”

Subcopy:
“Files, links, notes, audio, video, images — Bridge will organize the context.”

Primary actions:

* Upload
* Paste link
* Post-it
* Record

No wizard.
No long form.
No mandatory setup.

HOME / FILE DASHBOARD

Create a commercial file-dashboard like Figma.

Show:

* Recent Bridges
* Shared with me
* Drafts
* Team space
* New Bridge card

Bridge file cards should include:

* title
* preview thumbnail
* source count
* last updated
* collaborators
* status chip

Example file names:

* Product Handoff — Cognitive Assessment Flow
* Client Brief — Brand Direction
* Research Notes — Tier 2 Restaurants
* Onboarding — New Designer Context
* Book Notes — Service Design

RECEIVED BRIDGE

When someone receives a Bridge:

* show Bridge title
* who shared it
* purpose
* source count
* estimated time
* choose view:

  * Map
  * Workspace

Default to Map.

Keep it extremely simple.

SHARE MODAL

Create a simple share modal:

* invite people
* permission: View / Comment / Edit
* hide private notes by default
* allow questions
* require approval before sharing AI inferences
* copy link

PRIVACY

Create a minimal privacy settings screen:

* What Bridge remembers
* What stays private
* What gets shared
* Require approval for AI inferences
* Delete understanding profile
* Confidential mode

Use trust copy:
“Private notes stay private unless you share them.”
“Bridge adapts the view, not the truth.”

COMMERCIAL APP SCREENS TO GENERATE

Generate these screens:

1. Landing page
2. Login / signup
3. Home / Bridge files dashboard
4. New Bridge empty canvas
5. Map mode with insights
6. Map mode with right context panel open
7. Workspace empty state
8. Workspace with multiple sources arranged spatially
9. Workspace with document, video, audio, image, link, and notes visible together
10. Workspace source selected with right panel open
11. Upload modal
12. Paste link popover
13. Post-it creation popover
14. Recording waveform panel
15. More menu
16. Ask Bridge panel
17. Generated audio output card
18. Generated video output card
19. Combined document output card
20. Activity / History panel
21. Share modal
22. Received Bridge screen
23. Privacy settings
24. Light mode workspace
25. Dark mode workspace
26. Component system board

MICRO-INTERACTIONS

Include:

* upload modal opening
* drag-and-drop file feedback
* paste link preview loading
* post-it creation and placement
* recording waveform animation
* source hover actions
* source selection highlight
* related source soft glow
* right panel slide-in
* click source reference → jump to exact source location
* generated audio/video/document card creation
* Map updated toast
* Activity item click → jump to related object
* bottom mode switch animation
* smooth zoom and pan in Workspace
* dark/light mode transition

DESIGN SYSTEM

Create reusable components:

* bottom input bar
* bottom mode switcher
* source rail item
* source card
* document frame
* slide frame
* video frame
* audio waveform card
* image frame
* link preview card
* post-it
* map insight card
* question card
* decision card
* source chip
* right context panel
* upload modal
* paste link popover
* record panel
* Ask Bridge panel
* generated output card
* activity item
* share modal
* privacy toggle

FINAL DIRECTION

Make Bridge radically simple.
The user should not have to understand the system before using it.
They should just drop things in, and Bridge should quietly organize the complexity.

The product has only two main modes:

1. Map — simple understanding
2. Workspace — deep spatial source exploration and creation

Timeline becomes Activity / History in the top bar.

Final output:
Generate a polished, high-fidelity desktop web app prototype for Bridge with light and dark mode. Focus on a minimal commercial UI where Map gives simple understanding, and Workspace gives a spatial Figma-style place to explore documents, videos, audio, images, links, notes, generated outputs, annotations, and source-grounded AI explanations.
