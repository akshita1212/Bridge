Edit the current Bridge prototype. Keep the existing visual style and overall direction. Do not redesign the whole app.

The current design is mostly good. Make only these targeted UI and interaction improvements:

1. Improve Map structure
2. Improve Workspace source navigation
3. Make Workspace objects movable on the canvas
4. Add a sticky right-side Create / Ask drawer
5. Make bottom input actions open real modals and popovers
6. Keep the product minimal and not overwhelming

DO NOT change:

* product name
* color palette
* typography direction
* top bar style
* bottom Map / Workspace switcher
* bottom input bar
* overall minimal Figma-like look
* Map + Workspace as the only main modes

COLOR / STYLE
Keep the existing Bridge palette:

* warm off-white background
* lime active states
* deep navy text
* soft green cards
* subtle blue outlines
* rounded cards
* subtle dot grid
* calm commercial SaaS feel

Do not make the UI busier.
Do not add heavy lines.
Do not create a dashboard look.
Keep it simple and spatial.

CHANGE 1: MAP STRUCTURE

The current Map is good, but improve the source/resource layout.

In Map mode:

* Move “Key Resources” / source resources to the top of the main content area.
* Rename the section to “Sources”.
* Make it a horizontal source shelf near the top, below the top bar and above the understanding cards.
* The source shelf should show all important resources clearly.

Source shelf should include:

* PDF source card
* video source card
* audio source card
* image / diagram source card
* link source card
* note source card
* generated output source card if available

Each source card should show:

* source type icon
* title
* page count / duration / size
* read or new state
* small source chips
* hover action: Open in Workspace

Below the source shelf, show the Map understanding sections:

* Main Idea
* Key Findings
* Open Questions
* Decisions
* Risks
* Next Actions

Use section heading:
“Understanding”

Then subheading:
“Key findings”

The Map should feel like:
Top = what sources are in this Bridge
Middle = what Bridge understands from them
Right panel = proof, context, and actions when clicked

The left source rail can be reduced or hidden in Map if the top Sources shelf is clear enough. If keeping the left rail, make it secondary and collapsed.

CHANGE 2: WORKSPACE SOURCE NAVIGATION

In Workspace mode, add a top horizontal “Sources” shelf as well.

This shelf should sit at the top of the canvas area, under the top bar.

It should not take too much space.
It should be horizontally scrollable or collapsible.

Sections inside the source shelf:

* All
* Docs
* Media
* Notes
* Outputs
* Questions

Each source/resource should be represented as a compact chip/card:

* PDF
* Video
* Audio
* Image
* Link
* Post-it
* Generated Audio
* Generated Video
* Generated Doc
* Interactive Session

Clicking a source in this shelf should jump/zoom to that object on the Workspace canvas.

This replaces the need for a heavy left source panel in Workspace.
Workspace should feel like a Figma canvas with a top source navigator.

CHANGE 3: WORKSPACE OBJECTS MUST BE MOVABLE

The objects on the Workspace canvas must feel movable and editable.

Important:
Do not make the source nodes look like a static background image.
Each object should be an independent movable canvas item.

Canvas objects:

* PDF node
* video node
* audio node
* image node
* link node
* post-it node
* question node
* generated audio node
* generated video node
* generated document node
* interactive session node
* context frame / group

Each canvas object should show interaction states:

* default
* hover
* selected
* dragging
* grouped

When hovered:

* show a subtle grab cursor / drag handle
* show quick actions

When selected:

* show blue or lime outline
* show resize handles or corner handles
* show small floating toolbar

When dragging:

* object lifts slightly with shadow
* show alignment guides
* show subtle canvas grid snapping
* show drop position preview

Floating toolbar for selected object:

* Ask
* Create
* Add to Map
* Add note
* More

For multi-select:
When multiple objects are selected, show floating toolbar:
“3 items selected”
Actions:

* Ask
* Create audio
* Create video
* Create doc
* Add to Map
* Group

Add visible canvas controls:

* zoom percentage
* fit to screen
* hand / pan tool
* select tool
* mini canvas navigator

Workspace should feel like users can actually move, organize, and build their context.

CHANGE 4: STICKY RIGHT-SIDE CREATE / ASK DRAWER

The current “Create from all sources” is hidden or not visible enough.

Add a sticky right-side vertical tab attached to the right edge of the Workspace.

Collapsed state:
A slim vertical pill on the right edge:
“Create / Ask”

It should always be visible in Workspace.

When clicked:
A right-side drawer slides in.

Drawer name:
“Bridge Studio”

Bridge Studio is the place for:

* Ask Bridge
* Create from all
* Create from selection
* Recent outputs
* Open questions
* Source coverage

The drawer should feel like a studio panel, not a generic sidebar.

Default drawer state when nothing is selected:
Title: “Bridge Studio”
Sections:

1. Ask Bridge
   Input placeholder:
   “Ask about this whole Bridge…”

Suggested prompts:

* Explain all sources simply
* Create an audio walkthrough
* Create a video explainer
* Make one combined document
* What questions should I ask?
* What am I missing?

2. Create from all sources
   Buttons:

* Audio explainer
* Video explainer
* Combined document
* Visual summary
* Interactive session

3. Recent outputs
   Show small output cards:

* Audio Explainer — 4 min
* Video Explainer — 3 min
* Combined Understanding Doc

When one object is selected:
Drawer changes to:
“Create from this source”
Actions:

* Ask this source
* Explain this
* Create audio
* Create video
* Create document
* Add to Map
* Add note

When multiple objects are selected:
Drawer changes to:
“Create from selection”
Show:
“3 items selected”
Actions:

* Ask selected
* Create audio
* Create video
* Create document
* Create interactive session
* Add to Map

The drawer should slide in and out smoothly.
It should not cover the whole canvas.
It should be narrow, clean, and useful.

CHANGE 5: MAKE BOTTOM INPUT ACTIONS WORK VISUALLY

The bottom input bar is good, but interactions need to appear properly.
Do not show only a small corner feedback toast.
Each bottom action should open a proper modal, popover, or panel.

BOTTOM ACTION: UPLOAD

When clicking Upload:
Open a centered upload modal.

Modal title:
“Add sources”

Inside:

* drag and drop area
* file picker button
* supported formats: PDF, Docs, Slides, Images, Audio, Video, Links, Transcripts
* recent imports section
* upload progress state
* upload success state

After upload success:

* show new source card
* “Added to Workspace”
* source appears as a new movable object on the canvas

BOTTOM ACTION: PASTE LINK

When clicking Paste link:
Open a popover above the button.

Popover title:
“Paste a link”

Inside:

* URL input field
* paste button
* loading preview state
* preview card with title/domain
* Add to Workspace button
* invalid URL error state

After adding:

* link appears as a movable card on the Workspace canvas
* show small toast: “Link added”

BOTTOM ACTION: POST-IT

When clicking Post-it:
Open a small sticky-note popover above the button.

Popover title:
“New post-it”

Inside:

* text area
* small color/tag options
* privacy toggle: Private
* button: Place on canvas

After placing:

* post-it appears on the canvas near the current viewport
* user can drag it anywhere
* note remembers where it was placed
* note can be attached to a source, timestamp, page, or selected object

Post-it should have states:

* empty
* editing
* placed
* selected
* private

BOTTOM ACTION: RECORD

When clicking Record:
Open a compact recording panel above the bottom bar.

Panel title:
“Record context”

Inside:

* animated waveform
* start / pause / stop buttons
* timer
* live transcript preview
* save button
* cancel button

After saving:

* recording appears as an audio source node on the canvas
* transcript appears attached to it
* show option: “Create audio explainer from this”

BOTTOM ACTION: MORE

When clicking More:
Open a compact menu above the button.

Menu items:

* Import from cloud
* Add image
* Add transcript
* Add folder
* Create audio explainer
* Create video explainer
* Create document
* Add context frame
* Ask Bridge

Each item should have an icon and hover state.

CHANGE 6: WORKSPACE CANVAS CONTENT

Keep the current Workspace idea, but make it more obviously a content creation canvas.

Show these objects on the canvas:

* PDF source node
* video source node
* audio source node
* image / diagram node
* link node
* post-it notes
* question card
* generated audio explainer card
* generated video explainer card
* combined document card
* interactive session card
* context frame grouping related items

Add a context frame titled:
“Decision Gateway Context”

Inside the frame:

* assessment framework PDF
* UX research video
* stakeholder interview audio
* flow diagram
* note about approval owner
* generated audio explainer
* generated video explainer

This frame should show that Bridge is building context from many sources, not just reading one file.

CHANGE 7: GENERATED OUTPUT CARDS

Make generated outputs more visible and central.

Generated Audio card:

* play button
* waveform
* title
* duration
* source chips
* regenerate
* share

Generated Video card:

* video thumbnail
* scene strip
* duration
* source chips
* preview
* export

Combined Document card:

* document preview
* source count
* sections preview
* open
* export

Interactive Session card:

* chat + voice icon
* source scope
* continue button
* voice mode button

Generated output cards should be movable canvas objects.

CHANGE 8: MAP + WORKSPACE RELATION

When a user creates, moves, annotates, or links something in Workspace:
Show small feedback:

* “Map updated”
* “Source linked”
* “Output added”
* “Question added to Map”
* “Note attached”

These can be small toasts, but only after the main interaction happens.
Do not use toasts as the main UI response.

CHANGE 9: MICRO-INTERACTIONS

Show these states clearly:

* source shelf card hover
* source shelf click jumps to canvas object
* object hover
* object selected
* object dragging
* multi-select toolbar
* Bridge Studio drawer open/close
* upload modal open
* paste link popover open
* post-it creation popover
* record waveform panel
* more menu
* generated output creation
* Map updated toast

CHANGE 10: SCREEN STATES TO CREATE

Create or update these states:

1. Map mode with top Sources shelf
2. Map mode with Understanding and Key Findings below sources
3. Workspace mode with top Sources shelf
4. Workspace mode with movable source objects
5. Workspace object selected state
6. Workspace multi-select state
7. Workspace with Bridge Studio collapsed right tab
8. Workspace with Bridge Studio drawer open
9. Upload modal
10. Paste link popover
11. Post-it creation popover
12. Record waveform panel
13. More menu
14. Generated audio card selected
15. Generated video card selected
16. Combined document card selected
17. Dark mode version of Workspace

IMPORTANT

Do not redesign the product.
Do not make it more complex.
Do not add long explanations.
Do not hide creation tools.
Do not make the Workspace static.
Do not use corner feedback popups as the only interaction response.

The main correction:
Workspace must feel like a movable Figma-style canvas where sources, notes, questions, AI sessions, and generated outputs can be arranged, selected, moved, created, and connected.

Final output:
Update the existing Bridge UI so Map has a top Sources shelf, Workspace has a top source navigator, all Workspace objects are movable, Bridge Studio is a sticky right-side slide-out drawer, and Upload / Paste link / Post-it / Record / More each open proper modal or popover interactions.
