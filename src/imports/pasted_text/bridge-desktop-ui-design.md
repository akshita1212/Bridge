Design an updated high-fidelity desktop web app UI for a commercial AI product called “Bridge”.
Bridge is an AI-powered understanding workspace. It helps users drop documents, videos, audio, links, notes, images, and references into one place, then turns scattered context into simple, source-grounded understanding.
Bridge should feel like:
* Figma for understanding
* Figma Slides for arranging source material spatially
* Wispr Flow for effortless input
* Gamma for turning messy material into clear outputs
* NotebookLM-like deep interaction, but with a more visual and spatial workspace
The product should not feel like:
* a chatbot
* a dashboard
* a complex knowledge graph
* a multi-step wizard
* an overwhelming AI tool
* a generic SaaS template
It should feel:
* simple at first
* powerful underneath
* commercial
* calm
* minimal
* source-grounded
* visual-first
* easy to start
* easy to explore deeply only when needed
Core product principle: “Drop anything. Bridge organizes it. Go deeper only when you want.”
Use this palette:
* Warm off-white: #F6F7ED
* Lime accent: #DBE64C
* Deep navy: #001F3F
* Green: #00804C
* Soft green: #74C365
* Blue: #1E488F
* Charcoal / deep navy for dark mode
Create both light mode and dark mode.
Overall layout: Use a Figma-like workspace.
Top bar:
* Home / back
* Bridge file name
* small status chip, for example “Understanding ready” or “Updating…”
* Search
* Activity / History icon
* Share
* Theme toggle
* User avatar
Important change: Remove Timeline as a main workspace mode. Timeline should become “Activity” or “History” in the top bar, beside Search and Share. It should open as a small dropdown or side panel, not a full page.
Activity / History panel should show:
* source added
* map updated
* note added
* AI created an audio explanation
* user highlighted a source
* question resolved
* contradiction found
* shared with someone
* new version created
The activity panel should help users understand what changed, but it should not become a main mode.
Bottom workspace mode switcher: Use only two main modes:
1. Map
2. workspace
The switcher should be bottom-center, inspired by Figma’s bottom mode controls. It should feel lightweight and always accessible.
Bottom input bar: Keep this as a major product feature. Actions:
* Upload
* Paste link
* Post-it
* Record
* More
This bar should float at the bottom center. It should feel as easy as adding shapes or text in Figma.
Button interactions must work visually: When user clicks Upload:
* open an upload modal
* show drag-and-drop area
* show supported file types
* show upload progress state
* show success state
When user clicks Paste link:
* open a small popover
* input field for URL
* preview loading state
* add link button
* error state for invalid URL
When user clicks Post-it:
* create a small sticky-note popover
* user can type a note
* user can place it anywhere on the canvas
* note remembers where it was created
* note can be linked to source, map card, page, timestamp, or selection
When user clicks Record:
* open a small recording panel
* show waveform animation
* start / pause / stop controls
* transcript loading state
* option to add recording to the workspace
When user clicks More:
* open menu with:
    * import from cloud
    * add image
    * add transcript
    * add folder
    * create generated video
    * create audio walkthrough
    * create document summary
    * ask Bridge
MODE 1: MAP
Map is the simple understanding layer. It should be the default view after sources are added.
Map should combine:
* visual map
* quick brief
* key questions
* must-know insights
* decisions
* risks
* actions
Do not create messy dotted-line diagrams. Avoid unnecessary lines. Use clean grouping instead:
* clusters
* cards
* source chips
* hover highlights
* color-coded categories
* soft background regions
* compact visual hierarchy
Map should show:
* Main Idea
* Must Know
* Open Questions
* Key Decisions
* Risks
* Next Actions
* Key Sources
Insight cards should be short and visual. Use minimal text. Use icons, chips, thumbnails, and status tags.
Every card should have source chips:
* PDF
* Video
* Audio
* Note
* Link
* Inferred
* Needs confirmation
Interaction: When user clicks a card in Map:
* open the right context panel
* show the exact supporting source
* show page, timestamp, frame, transcript, or highlighted section
* show whether the insight is from source, user note, or AI inference
* show related source cards
* allow actions:
    * Open in workspace
    * Add note
    * Mark important
    * Ask Bridge
    * Resolve question
    * Create audio explanation
    * Create visual explanation
Map should update when the user works in workspace. Show small toasts:
* “Map updated”
* “Question resolved”
* “New must-know added”
* “Source note linked”
MODE 2: workspace
Rename Source View / Deep Dive to “workspace”.
workspace is the deep source-analysis space. It is where users understand the real material directly.
workspace should feel like Figma Slides or a spatial work file. All sources should exist on a large zoomable canvas, not only one source per page.
Users should be able to:
* zoom in and out
* pan around
* open multiple documents at once
* place sources in different areas
* arrange related sources near each other
* group sources
* create notes and post-its around sources
* connect notes to specific source moments
* click a source and see options
* generate video, audio, or document outputs from one source or all sources
* chat with Bridge about the selected source or the whole workspace
* jump to exact source moments from AI answers
workspace should support these source types:
PDF / Document:
* show actual document pages
* allow scroll and zoom
* allow highlights
* allow post-its on exact page areas
* allow “Explain this section”
* allow “Add to Map”
* allow “Create audio explanation”
* allow “Create summary document”
Slides:
* show slide thumbnails or frames
* allow zooming into each slide
* allow comments and notes beside slides
* allow generated walkthrough
Video:
* show video player on canvas
* show timeline thumbnails
* show transcript at bottom or side
* allow timestamp notes
* allow clipping moments
* allow “Explain this moment”
* allow “Add clip to Map”
* allow “Generate short video from selected moments”
Audio:
* show waveform
* show transcript
* allow timestamp notes
* allow “Create visual explanation”
* allow “Create audio walkthrough”
Image:
* show image on canvas
* allow pin notes
* allow crop/selection
* allow “Explain this visual”
* allow “Add selected area to Map”
Links:
* show website preview card
* allow opening preview
* allow extracting key sections
* allow saving references
Notes:
* show as post-it cards
* allow linking to source
* allow converting note into question, insight, or task
workspace right context panel: When user clicks any source, note, highlight, timestamp, or selection, open a right-side panel.
The panel should show:
* selected source preview
* source metadata
* related Map cards
* AI explanation
* notes
* comments
* transcript if relevant
* page or timestamp details
* source connections
* actions
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
Bridge interactive guide: Add a lightweight “Ask Bridge” interaction inside workspace.
It should not dominate the UI like a chatbot. It should appear as a compact panel or floating assistant.
The user can ask:
* “Explain this document visually”
* “What is this video saying?”
* “How is this PDF connected to the meeting?”
* “Create an audio explanation of all selected sources”
* “Make a single document from these sources”
* “What questions should I ask?”
* “What am I missing?”
* “Show me where this point came from”
When Bridge answers, every answer should include source references. Clicking a reference should jump the canvas to that exact document, slide, video timestamp, audio moment, image area, or note.
This should feel like presenting through the source material, similar to how Figma lets users jump between frames or slides.
Generated outputs: In workspace, users can select:
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
* study/working notes
* handoff brief
Generated output cards should appear on the canvas like new source cards.
Example: User selects 3 sources and clicks “Create audio”. A new audio card appears: “Audio Walkthrough — 4 min” With play button, waveform, source references, and regenerate option.
Source connection behavior: Do not show too many lines by default. Connections should appear only on hover or selection.
When a source is selected:
* related sources softly highlight
* linked notes glow lightly
* related Map cards appear in the right panel
* source references become visible
This keeps the UI clean.
Post-it / note behavior: Post-its should be easy and spatial. User can add a note anywhere. A note can be:
* free-floating
* attached to a document page
* attached to video timestamp
* attached to audio timestamp
* attached to image area
* attached to map insight
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
Private notes: Private notes should be visually distinct but subtle. Use a small lock icon. Copy: “Private unless shared.”
Activity / History: Move timeline into top bar as Activity.
Activity panel design: Small right-side dropdown or side drawer. It should show updates like:
* 7:20 PM — Map updated from 2 new notes
* 7:18 PM — Video explanation created
* 7:14 PM — Question added from PDF page 4
* 7:10 PM — Source uploaded
* 7:05 PM — Audio transcript completed
Clicking an activity should jump to the relevant source, map card, note, or generated output.
This makes the timeline useful without making it a full workspace mode.
Left rail: Keep the left sources rail, but make it more useful.
Left rail should show:
* all sources
* source type icons
* read/new status
* processing state
* groups
* filters
* search within sources
Filters:
* All
* Docs
* Media
* Notes
* Generated
* Questions
The left rail should remain simple and narrow. It should not overwhelm the user.
Empty state: When a new Bridge opens, show a blank canvas.
Copy: “Drop anything here.” Subcopy: “Files, links, notes, audio, video, images — Bridge will organize the context.”
Primary actions:
* Upload
* Paste link
* Post-it
* Record
No wizard. No forms. No required setup.
Commercial app screens: Generate these screens:
1. Landing page
2. Login / signup
3. Home / Bridge files dashboard
4. New Bridge empty canvas
5. Map mode with insights
6. Map mode with right context panel open
7. workspace empty state
8. workspace with multiple sources arranged spatially
9. workspace with document, video, audio, image, and notes visible together
10. workspace source selected with right panel open
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
Share modal: Include:
* invite people
* permission: view / comment / edit
* hide private notes
* allow questions
* require approval before sharing AI inferences
* copy link
Received Bridge: When someone receives a Bridge:
* show Bridge title
* who shared it
* purpose
* source count
* estimated time
* choose view:
    * Map
    * workspace
Default to Map.
Privacy: Create a minimal privacy settings screen:
* What Bridge remembers
* What stays private
* What gets shared
* Require approval for AI inferences
* Delete understanding profile
* Confidential mode
Use trust copy: “Private notes stay private unless you share them.” “Bridge adapts the view, not the truth.”
Micro-interactions: Include:
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
* generated audio/video card creation
* Map updated toast
* Activity item click → jump to related object
* bottom mode switch animation
* smooth zoom and pan in workspace
* dark/light mode transition
Component system: Create:
* bottom input bar
* bottom mode switcher
* source rail item
* source card
* document frame
* video frame
* audio waveform card
* image frame
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
Final direction: Bridge should feel radically simple at the start. The user should not have to understand the system before using it. They should just drop things in, and Bridge should quietly organize the complexity.
The product has only two main modes:
1. Map — simple understanding
2. workspace — deep source analysis and creation
Timeline becomes Activity / History in the top bar.
Final output: Generate a polished, high-fidelity desktop web app prototype for Bridge with light and dark mode. Focus on making the workspace feel like a spatial Figma Slides-style source workspace where documents, videos, audio, images, links, and notes can live together, be explored, annotated, and transformed into audio, video, or document outputs. Keep the UI minimal, commercial, intuitive, and not overwhelming.
