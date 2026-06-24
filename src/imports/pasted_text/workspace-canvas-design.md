Edit only the Workspace mode of the current Bridge app.

Do not redesign the whole app.
Do not change the Map mode.
Do not change the existing minimal visual style, color palette, top bar, left rail, or bottom controls unless needed to make Workspace work correctly.

The current problem:
Workspace is still behaving like a source reader. That is wrong.

Workspace should be a Context Canvas + Creation Studio.

Bridge Workspace is where users:

* place all source material together
* understand relationships between sources
* add notes and questions
* talk to Bridge through chat or voice
* create explainer audio
* create explainer video
* create a combined document
* create study/working notes
* create a source-grounded walkthrough
* generate outputs from all sources or selected sources
* jump from AI answers back to exact source moments

The Workspace should feel like:

* Figma canvas
* Figma Slides board
* NotebookLM-style source interaction
* a content creation studio
* a context-building room
* a place where messy information becomes useful output

The Workspace should NOT feel like:

* a single PDF reader
* a document page
* a source detail screen
* a chatbot page
* a dashboard
* a linear research viewer

Core Workspace idea:
“All sources and generated outputs live on one spatial canvas.”

The user should be able to zoom out and see the full context:
documents, videos, audio files, images, links, notes, questions, AI conversations, and generated outputs.

The user should be able to zoom in and work deeply on one part.

Keep the UI simple and calm.
Do not make it overwhelming.
Use progressive disclosure:

* simple canvas first
* creation options appear when user selects something
* deep tools appear only in the right panel or floating studio panel

WORKSPACE STRUCTURE

Keep the outer shell:

* Top bar
* Left source rail
* Bottom mode switcher: Map / Workspace
* Bottom input bar: Upload / Paste link / Post-it / Record / More

Replace the center area with a large zoomable context canvas.

Canvas background:

* warm off-white
* subtle dot grid
* pan and zoom behavior
* lots of whitespace
* minimal visual noise

The canvas should contain different object types:

1. Source Nodes
   These are original inputs:

* PDF
* document
* slide deck
* video
* audio
* image
* link
* transcript

2. Note Nodes
   These are user-created thoughts:

* post-its
* questions
* concerns
* assumptions
* anxiety notes
* private notes
* clarification notes

3. AI Conversation Nodes
   These are chat or voice sessions with Bridge:

* “Chat about all sources”
* “Voice deep dive”
* “Ask about selected sources”
* “Interactive explanation session”

4. Generated Output Nodes
   These are outputs created by Bridge:

* explainer video
* explainer audio
* combined document
* visual summary
* briefing packet
* study guide
* question list
* handoff brief

5. Collection / Context Frames
   These are Figma-like frames that group related things:

* “Decision Gateway Context”
* “User Research Evidence”
* “Approval Questions”
* “Content to Convert”
* “Final Explainer Package”

Each frame can contain sources, notes, questions, and generated outputs.

WORKSPACE CANVAS EXAMPLE

Show a populated Workspace canvas with:

A large frame titled “Decision Gateway Context”
Inside it:

* PDF node: Assessment Framework v3.pdf
* Video node: UX Research Session.mp4
* Audio node: Stakeholder Interview.mp3
* Image node: Flow Diagram — Final.png
* Link node: NNG Cognitive Load article
* 3 post-it notes
* 1 open question node
* 1 generated audio output
* 1 generated video output
* 1 combined document output

This should immediately communicate:
“This is not a file reader. This is a context canvas where sources become understanding and content.”

SOURCE NODE DESIGN

PDF / Document node:

* thumbnail preview of first page or selected page
* title
* page count
* small highlighted section preview
* chips: PDF, 24 pages, 3 highlights
* quick actions on hover:

  * Open
  * Ask
  * Explain
  * Create
  * Add note

Video node:

* video thumbnail
* duration
* mini timeline strip
* transcript indicator
* key timestamp markers
* quick actions:

  * Play
  * Ask
  * Explain moment
  * Create video
  * Add note

Audio node:

* waveform preview
* duration
* transcript indicator
* key moment markers
* quick actions:

  * Play
  * Ask
  * Create audio
  * Add note

Image node:

* image preview
* pin markers
* quick actions:

  * Explain visual
  * Select area
  * Add to Map
  * Create visual

Link node:

* domain preview
* extracted title
* key point chip
* quick actions:

  * Open
  * Extract
  * Ask
  * Add to Map

Post-it node:

* small sticky note
* can be moved anywhere
* can attach to source, timestamp, page, frame, or selected area
* can be private
* quick actions:

  * Make question
  * Add to Map
  * Ask Bridge
  * Mark private

GENERATED OUTPUT NODES

Add visible generated output nodes on the canvas.

1. Audio Explainer node
   Title: “Audio Explainer — Decision Gateway”
   Show:

* play button
* waveform
* 4 min duration
* source chips: PDF, Video, Audio
* status: Ready
  Actions:
* Play
* Edit prompt
* Regenerate
* Share
* Open sources

2. Video Explainer node
   Title: “Video Explainer — Cognitive Load Flow”
   Show:

* video thumbnail
* 3 min duration
* scene strip
* source chips: Diagram, PDF, Interview
* status: Ready
  Actions:
* Preview
* Edit scenes
* Regenerate
* Export
* Open sources

3. Combined Document node
   Title: “Combined Understanding Doc”
   Show:

* document preview
* source count
* sections: Main idea, Evidence, Questions, Actions
  Actions:
* Open
* Edit
* Export
* Share

4. Interactive Session node
   Title: “Interactive Deep Dive”
   Show:

* chat + voice icon
* source scope: All sources
* last question preview
  Actions:
* Continue
* Voice mode
* Text chat
* Review sources

CONTENT CREATION SHOULD BE CENTRAL

Add a clear but minimal “Create” interaction.

When user selects:

* one source
* multiple sources
* a frame
* all sources
* a note cluster

Show a floating creation menu near the selection.

Creation menu options:

* Audio explainer
* Video explainer
* Combined document
* Visual summary
* Question list
* Study guide
* Handoff brief
* Interactive deep dive

This creation menu should feel like a contextual Figma menu, not a big modal.

Example selected state:
User selects PDF + video + audio.
Show a small floating toolbar:
“3 items selected”
Buttons:

* Ask
* Create audio
* Create video
* Create doc
* Add to Map
* More

CREATE FROM ALL SOURCES

Also include a global “Create from all” button in the right panel or top of the canvas.

When clicked, show a lightweight creation panel:
Title: “Create from this Bridge”
Options:

* Explainer audio
* Explainer video
* Combined document
* Visual summary
* Interactive session
* Handoff brief

This means Bridge can create content from the full workspace, like NotebookLM creates overviews from the whole notebook.

CREATE FROM SELECTION

When a user selects specific nodes, the same options should apply only to that selection.

Show:
“Create from selection”
Subtext:
“3 sources, 2 notes”

Options:

* Explainer audio
* Explainer video
* Combined document
* Ask Bridge
* Add to Map

ASK BRIDGE

Ask Bridge should work at three levels:

1. Ask all
   Ask about the whole Bridge.

2. Ask selection
   Ask about selected sources, notes, or frames.

3. Ask object
   Ask about one specific source, page, timestamp, image area, or note.

Ask Bridge should support:

* text chat
* voice chat
* interactive audio conversation

The Ask Bridge panel should be compact and contextual.

It can appear in the right panel or as a small floating panel.

Ask Bridge should show suggested prompts:

* “Explain all of this in simple terms”
* “Create an audio walkthrough”
* “Create a video explainer”
* “What am I missing?”
* “What questions should I ask?”
* “How are these sources connected?”
* “Make one document from these”
* “Take me through this like a presentation”
* “Where does this point come from?”

Every answer must show source references.

Source references should be clickable.
Clicking a reference should jump the canvas to:

* exact PDF page
* exact highlighted section
* exact video timestamp
* exact audio moment
* exact transcript line
* exact image pin
* exact note
* exact generated output

INTERACTIVE AUDIO MODE

Add an interactive audio mode inspired by audio overviews.

It should not be a separate page.
It should be a floating session card or right-panel state.

Audio session UI:

* title: “Audio Deep Dive”
* source scope: All sources or selected frame
* waveform animation
* two AI host / guide indicators, optional
* user microphone button
* text transcript scrolling
* source references appearing as chips
* “Jump to source” button
* “Save as audio explainer” button

States:

* Generate audio explainer
* Play audio explainer
* Join conversation
* Ask by voice
* Save session as note
* Add answer to Map

This is important:
The user should be able to interact with Bridge through audio, not only read chat.

VIDEO EXPLAINER CREATION

Add a video explainer creation flow.

When user clicks “Create video”:
Open a compact right-panel creation state, not a full-screen wizard.

Show:

* Output type: Video Explainer
* Source scope: All sources / Selected sources / Current frame
* Length: 1 min / 3 min / 5 min
* Style: Visual walkthrough / Slide-style / Whiteboard-style / Presenter-style
* Audience: Beginner / Team / Client / Expert
* Tone: Calm / Direct / Story-like / Technical
* Create button

After creation, show a new video output node on the canvas.

Video output node should show:

* thumbnail
* title
* duration
* source chips
* scene strip
* edit prompt
* regenerate
* export
* share

AUDIO EXPLAINER CREATION

When user clicks “Create audio”:
Open a compact right-panel creation state.

Show:

* Output type: Audio Explainer
* Source scope: All sources / Selected sources / Current frame
* Length: 2 min / 5 min / 10 min
* Format: Narrated summary / Conversation / Guided walkthrough / Q&A
* Voice style: Calm / Energetic / Professional
* Create button

After creation, show a new audio output node on the canvas.

Audio output node should show:

* play button
* waveform
* duration
* source chips
* transcript
* regenerate
* share

COMBINED DOCUMENT CREATION

When user clicks “Create document”:
Open a compact creation panel.

Show:

* Output type: Combined Document
* Source scope
* Format:

  * Handoff brief
  * Study guide
  * Research synthesis
  * Meeting summary
  * Client explanation
  * Working notes
* Create button

After creation, show a document output node on canvas.

Generated document should keep citations/source chips.

RIGHT PANEL

Right panel should be a Creation + Context panel, not only source detail.

The panel changes based on selection.

When nothing is selected:
Show:

* Create from all
* Ask Bridge about all sources
* Recent outputs
* Open questions
* Source coverage

When one source is selected:
Show:

* source preview
* Ask this source
* Create from this source
* Notes
* Highlights
* Related sources
* Related Map cards

When multiple sources are selected:
Show:

* selected source count
* Create from selection
* Ask selected sources
* Suggested output types
* Related notes/questions

When generated output is selected:
Show:

* output preview
* source references
* edit prompt
* regenerate
* export/share
* add to Map

When audio session is selected:
Show:

* transcript
* source moments
* save as note
* generate final audio
* add key answer to Map

LEFT RAIL

Keep the left rail simple.

It should include:

* Sources
* Notes
* Outputs
* Questions

Use collapsible groups:

* Original sources
* Generated outputs
* User notes
* Questions

The left rail should not become crowded.
It is only a navigator.

BOTTOM INPUT BAR

Keep:

* Upload
* Paste link
* Post-it
* Record
* More

Make each button visually functional.

Upload:

* open upload modal
* drag/drop
* progress
* success
* source appears on canvas

Paste link:

* open URL popover
* preview loading
* add to workspace

Post-it:

* create sticky note
* user places it on canvas
* note can attach to source or current view

Record:

* open waveform panel
* voice recording
* transcript
* save to canvas as audio source

More:

* import cloud
* create audio
* create video
* create document
* ask Bridge
* add frame
* organize canvas

MAP RELATION

Workspace should feed Map.

When the user:

* creates an audio explainer
* creates a video explainer
* creates a combined document
* adds a post-it
* resolves a question
* highlights a source
* confirms an AI answer

Show subtle toast:

* “Map updated”
* “New source insight added”
* “Question added to Map”
* “Output linked to Map”
* “Understanding updated”

Map remains the simplified view.
Workspace is where the user creates and explores deeply.

ACTIVITY

Timeline should not be a main mode.
Keep Activity/History as a top bar icon.

Activity tracks:

* sources added
* notes added
* audio created
* video created
* document created
* AI answer saved
* Map updated
* question resolved
* source linked

Clicking activity jumps to the relevant canvas object.

VISUAL STYLE

Keep the current clean Bridge UI style:

* warm off-white background
* deep navy text
* lime active states
* soft green accents
* subtle blue selection outlines
* rounded cards
* subtle shadows
* clean Figma-like interface
* minimal chrome
* no heavy gradients
* no visual clutter

Use less text and more visual structure:

* cards
* chips
* thumbnails
* waveforms
* video strips
* document previews
* source badges
* output cards
* spatial groups

WORKSPACE SCREEN STATES TO GENERATE

Create these Workspace-specific screens/states:

1. Empty Workspace canvas
   Shows “Drop anything here” with bottom input bar.

2. Populated Workspace canvas
   Shows multiple source nodes, notes, generated output nodes, and context frames.

3. Multi-source selection state
   Shows 3 selected sources with floating toolbar:
   Ask / Create audio / Create video / Create doc / Add to Map.

4. Right panel — nothing selected
   Shows Create from all, Ask Bridge, recent outputs, open questions.

5. Right panel — one source selected
   Shows Ask this source, Create from this source, notes, highlights, related sources.

6. Right panel — multiple sources selected
   Shows Create from selection and output options.

7. Ask Bridge text chat state
   Compact chat with source references and jump-to-source chips.

8. Ask Bridge voice/audio state
   Interactive audio conversation with waveform, mic button, transcript, source references.

9. Create audio panel
   Source scope, length, format, voice style, create button.

10. Generated audio output node
    Waveform, play button, source chips, regenerate/share.

11. Create video panel
    Source scope, length, style, audience, tone, create button.

12. Generated video output node
    Thumbnail, scene strip, duration, source chips, edit/regenerate/export.

13. Create combined document panel
    Format options, source scope, create button.

14. Generated document output node
    Preview, source chips, open/export/share.

15. Activity panel
    Shows updates and click-to-jump behavior.

16. Dark mode Workspace
    Same concept in dark mode.

IMPORTANT CORRECTION

Do not show Workspace as a single document reader.
Do not show only one source open at a time.
Do not make generated content a tiny option hidden in the right panel.
Do not make chat the main UI.
Do not make it complex.

Workspace must clearly show:

1. original sources
2. user notes/questions
3. AI conversation sessions
4. generated audio/video/document outputs
5. spatial context frames
6. creation from all or selection

Final output:
Update the Bridge prototype so Workspace becomes a spatial Context Canvas and Creation Studio. It should combine Figma-like spatial source arrangement with NotebookLM-like source-grounded chat/audio/video generation. Users should be able to create explainer videos, explainer audios, combined documents, and interactive AI sessions from all sources, selected sources, or individual sources. Keep the UI minimal, commercial, intuitive, and not overwhelming.
