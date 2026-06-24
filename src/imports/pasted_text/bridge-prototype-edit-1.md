Edit the current Bridge prototype.

Do not redesign the whole app.
Keep the existing UI surface, visual style, color system, Map direction, Workspace direction, bottom controls, and minimal commercial look.

The goal of this update is to make Bridge richer and more functional without making it more complex.

Bridge should now support:

* connected external online documents
* live source status
* on-demand analysis
* organizing and managing work
* assigning tasks and comments
* private personal workspace layers
* shared context layers
* adaptive Map templates based on the project need
* Obsidian-like relationship thinking, but in a simpler Bridge UI

Keep the product simple on the surface.
The power should appear only when the user asks, clicks, right-clicks, selects, or goes deeper.

CORE PRODUCT IDEA

Bridge is not only a document understanding tool.
Bridge is a live context system.

It connects:

* files
* people
* work
* tasks
* comments
* generated outputs
* personal notes
* shared understanding
* changing online documents
* project context

Every Bridge can be different.
A Bridge should adapt to the user, the project, the job, and the kind of work being done.

The product should still feel simple:
Map = simplest understanding layer.
Workspace = deeper private working layer.

MAP MODE

Map should remain the simplest section.

It should feel clean, generated, adaptive, and easy to use.
Do not make it visually heavy.

In Map mode, add a new top section above the main understanding cards.

This top area should include:

1. Connected Sources
2. Work / People / Tasks strip
3. Simple context status

CONNECTED SOURCES SECTION

Rename the current top resource area to “Connected Sources”.

This section should show all source types clearly:

* uploaded PDFs
* Google Docs
* Microsoft Word docs
* PowerPoint files
* Excel sheets
* Google Sheets
* Google Slides
* Figma files
* videos
* audio files
* images
* links
* generated outputs
* notes

Each connected source card should show:

* source type icon
* file name
* app/source provider
* owner or collaborator avatar
* last updated
* last analyzed
* current status

Source status chips:

* Live
* Synced
* Changed
* In progress
* Needs analysis
* Analyzing
* Added to context
* Not in context
* Private
* Shared

Important behavior:
If people are working on external files and those files are changing, Bridge should show a clear but subtle sign.

Examples:

* “Changed 8 min ago”
* “Editing in progress”
* “New version available”
* “Not analyzed yet”
* “Analyze changes”
* “Review before adding to context”

Bridge should not automatically add every document change into the main context.
When a connected file changes, show:
“Changes detected”
Button:
“Analyze changes”

After analysis, show:
“Add to main context”
or
“Keep as source only”

This keeps the user in control.

CONNECTED SOURCE INTERACTIONS

Clicking a connected source should open a small preview or right panel.

Right-clicking a connected source should open a context menu.

Right-click menu options:

* Analyze changes
* Open source
* Open in Workspace
* Add to Map
* Add to main context
* Keep as reference only
* Assign follow-up
* Add comment
* Mark private
* Share with person
* View version history
* Disconnect source

The right-click interaction should feel simple and powerful, like a natural desktop/productivity app interaction.

CONNECT EXTERNAL SOURCE FLOW

Add an “Add connected source” button in the Connected Sources section.

When clicked, open a clean connector modal.

Modal title:
“Connect a source”

Source options:

* Upload file
* Google Drive
* Google Docs
* Google Sheets
* Google Slides
* Microsoft OneDrive
* Microsoft Word
* Microsoft Excel
* Microsoft PowerPoint
* Figma file
* Link
* Video
* Audio
* Image

For connected cloud files, show:

* connect account
* select file
* permission preview
* sync status
* analysis setting

Analysis setting:

* Analyze now
* Only analyze when I ask
* Watch for changes
* Do not add to main context without approval

This modal should be minimal, not enterprise-heavy.

WORK / PEOPLE / TASKS STRIP

In Map mode, above the understanding cards and below Connected Sources, add a small organizing layer.

Name it:
“Work layer”
or
“People & Work”

This should be a thin, simple strip, not a dashboard.

It should show:

* people involved
* assigned tasks
* open questions
* pending reviews
* source changes
* comments needing response
* project timeline chip if relevant

Example chips:

* “3 open questions”
* “2 files changed”
* “Aditi reviewing”
* “Rohan assigned”
* “Timeline needed”
* “1 decision blocked”
* “4 tasks”

Clicking a chip opens a small panel, not a full page.

People & Work panel should include:

* assignees
* tasks
* comments
* open questions
* due dates
* status
* linked source
* linked Map card
* linked Workspace note

Task card fields:

* task title
* assigned person
* status
* due date
* linked source or insight
* private/shared indicator

Task statuses:

* To do
* In progress
* Waiting
* Needs review
* Done

This layer should help organize and manage work without making Bridge feel like a project management app.

MAP ADAPTIVE TEMPLATES

Map should be generated according to the project need.

Do not make every Map look the same.

Bridge should adapt the Map layout depending on what the user is trying to do.

Possible Map templates:

* Understanding Map
* Project Timeline
* Source Map
* Decision Map
* Research Synthesis
* Work Assignment Map
* Content Creation Map
* Handoff Map
* Learning Map
* Risk / Question Map

The user does not need to choose this upfront.
Bridge can suggest:
“This looks like a project handoff. Use Handoff Map?”
or
“This looks like research synthesis. Use Research Map?”

Keep this suggestion subtle.

In Map mode, show a small template chip near the title:
“View: Understanding Map”

Clicking it opens a small menu:

* Understanding Map
* Project Timeline
* Source Map
* Decision Map
* Work Map
* Custom

Map should remain simple and generated.
It should not become complex.
Right-click should provide deeper context when needed.

MAP INTERACTIONS

Map cards should support right-click context.

Right-click on any Map card opens:

* View evidence
* Open in Workspace
* Ask Bridge
* Assign to someone
* Add comment
* Add to task
* Create audio explainer
* Create video explainer
* Mark private
* Share with selected person
* Add to main context
* Remove from main context

Map should be the simplest layer where the user can quickly understand, coordinate, and act.

WORKSPACE MODE

Workspace is still the deeper section.

Workspace is the user’s personal working space.
It is where the user:

* explores files
* arranges sources
* adds notes
* creates post-its
* asks Bridge
* generates content
* makes audio/video/document outputs
* manages personal context
* decides what should or should not enter the main Bridge context

Very important:
A user’s Workspace is their own private workspace by default.

Other people should not see the user’s workspace unless the user shares specific items.

In Workspace, show a privacy indicator:
“Private workspace”

Small copy:
“Only shared items become visible to others.”

WORKSPACE PRIVACY MODEL

Workspace has layers:

1. Private layer
2. Shared-with-person layer
3. Main Bridge context layer

Private layer:

* personal notes
* thoughts
* anxiety notes
* rough questions
* drafts
* generated outputs not shared yet

Shared-with-person layer:

* a selected note
* a selected comment
* a selected source reference
* a selected generated output
* a selected question

Main Bridge context layer:

* confirmed insights
* confirmed source analysis
* shared tasks
* approved comments
* approved generated outputs
* approved decisions

When the user shares something, show options:

* Share only with person
* Share with group
* Add to main Bridge context
* Keep private

If the user comments for someone, it should be shared only with that person unless the user explicitly adds it to the main context.

Example:
User adds a comment on a document and tags Aditi.
The comment appears in Aditi’s context layer, not automatically in the main Bridge context.

Show this clearly with small labels:

* Private
* Shared with Aditi
* Added to main context

WORKSPACE CONNECTED FILES

In Workspace, connected external files should appear as movable canvas nodes.

Connected source nodes:

* Google Doc node
* Word document node
* PowerPoint node
* Excel sheet node
* Figma file node
* Google Sheet node
* Google Slides node

Each external source node should show:

* app icon
* file preview
* live sync badge
* owner/collaborators
* last updated
* last analyzed
* status

Statuses:

* Live
* Changed
* In progress
* Needs analysis
* Analyzing
* Added to context

If a connected file changes:

* show a small pulsing status dot
* show “Changed since last analysis”
* show button: “Analyze changes”

After analysis:

* show summary of change
* show what Bridge thinks changed
* ask user:

  * Add to main context
  * Keep as source only
  * Ask someone
  * Ignore

WORKSPACE CANVAS ORGANIZATION

Workspace should keep the Figma-like canvas behavior.

Users should be able to:

* move source nodes
* group nodes
* create context frames
* add post-its
* connect items
* right-click items
* zoom and pan
* arrange sources according to how they think

Add Obsidian-like structure, but simplified.

Context frames can include:

* connected files
* source files
* notes
* tasks
* people
* questions
* generated outputs

Example frames:

* “Research Context”
* “Design Direction”
* “Client Feedback”
* “Unclear Questions”
* “Content to Generate”
* “Tasks and Owners”
* “Main Context Candidates”

Frame actions:

* Ask Bridge about this frame
* Generate audio
* Generate video
* Generate document
* Add frame to Map
* Share frame
* Add to main context

WORKSPACE RIGHT-CLICK INTERACTIONS

Right-click on source node:

* Analyze
* Analyze changes
* Ask Bridge
* Create audio explainer
* Create video explainer
* Create document
* Add note
* Assign task
* Add comment
* Share with person
* Add to main context
* View change history
* Open original

Right-click on post-it:

* Make question
* Assign to person
* Add to Map
* Add to main context
* Share with person
* Mark private
* Ask Bridge

Right-click on frame:

* Ask about frame
* Create output from frame
* Share frame
* Add frame to Map
* Add to main context
* Assign work from frame

Right-click on generated output:

* Edit prompt
* Regenerate
* Share
* Assign review
* Add to Map
* Add to main context
* Export

BRIDGE STUDIO DRAWER

Keep the sticky right-side “Bridge Studio” drawer.

Enhance it slightly to include work and connected-source actions.

Default Bridge Studio sections:

1. Ask Bridge
2. Create from all
3. Analyze changes
4. People & Work
5. Recent outputs
6. Open questions

When connected files have changed, show:
“2 connected files changed”
Button:
“Analyze changes”

When tasks exist, show:
“3 tasks open”
Button:
“View work”

When user selects a connected source, Bridge Studio shows:

* Ask this source
* Analyze this source
* Analyze changes
* Create audio
* Create video
* Create document
* Add to Map
* Add to main context
* Assign task
* Add comment
* Share with person

When user selects multiple sources:

* Ask selected
* Analyze selected
* Create audio
* Create video
* Create document
* Create work summary
* Add to Map
* Add to main context

PEOPLE AND COMMENTS

Add lightweight collaboration without overwhelming the UI.

Comments should work at different levels:

* source comment
* map card comment
* workspace note comment
* task comment
* generated output comment

When adding a comment, allow:

* comment privately
* tag a person
* share only with tagged person
* add to main context

Comment card should show:

* person avatar
* comment
* visibility label
* linked source/context
* resolve button

ASSIGNING WORK

Add the ability to assign work from any context.

Assignment can come from:

* source
* Map card
* Workspace note
* generated output
* comment
* open question

Assignment modal:

* task title
* assign to
* due date
* linked item
* visibility
* add to main context toggle

Keep it small and simple.

Do not make Bridge into a project management dashboard.
This should feel like organizing work around context.

ACTIVITY / HISTORY

Activity remains in the top bar.

Activity should track:

* source connected
* source changed
* source analyzed
* context updated
* note created
* task assigned
* comment shared
* output generated
* item added to main context
* item shared with person
* Map template changed

Clicking activity should jump to the source, task, comment, Map card, or Workspace node.

BOTTOM INPUT BAR

Keep existing bottom input bar:

* Upload
* Paste link
* Post-it
* Record
* More

Update More menu to include:

* Connect Google Drive
* Connect Microsoft file
* Connect Figma file
* Add task
* Add comment
* Create context frame
* Import from cloud
* Analyze connected changes
* Create audio
* Create video
* Create document

Upload still handles local files.
Paste link handles direct URLs.
Connectors are for live online documents.

MICRO-INTERACTIONS

Add subtle interaction states:

* connected source changed pulse
* live edit indicator
* analyzing spinner
* added to context confirmation
* private/shared badge change
* right-click context menu
* task assigned toast
* comment shared toast
* source analyzed toast
* Map updated toast
* Activity item jump
* Bridge Studio drawer slide
* source card hover
* status chip hover explanation

SCREEN STATES TO CREATE

Create or update these screens/states:

1. Map mode with Connected Sources section at top
2. Map mode with People & Work strip
3. Map mode with adaptive template chip
4. Map card right-click context menu
5. Connected source card showing “Changed”
6. Connected source card showing “Needs analysis”
7. Connect external source modal
8. Google Drive / Microsoft / Figma connector options
9. Analyze changes panel
10. Add to main context confirmation
11. Workspace with connected online file nodes
12. Workspace showing private workspace indicator
13. Workspace with private/shared/main context labels
14. Workspace right-click menu on source node
15. Workspace right-click menu on post-it
16. Bridge Studio default state with Analyze changes and People & Work
17. Bridge Studio source-selected state
18. Task assignment modal
19. Comment visibility popover
20. Activity panel showing source changes, tasks, comments, and context updates
21. More menu with connector options
22. Dark mode version of the updated Workspace

IMPORTANT DESIGN RULES

Do not make the UI more complex.
Do not add heavy project management dashboards.
Do not make everything visible at once.
Do not automatically add all live file changes to the main context.
Do not make a user’s private workspace visible to everyone.
Do not change the existing UI surface too much.

Keep Bridge simple:

* Map is the clean generated understanding layer.
* Workspace is the deeper private working layer.
* Connected sources are live but controlled.
* Work management is lightweight and context-based.
* Sharing is intentional.
* Main context updates only when approved.

Final output:
Update the current Bridge UI to support live connected external files, source-change states, on-demand analysis, lightweight work organization, task assignment, comments, private workspace layers, shared-with-person layers, and approved main-context updates. Keep the existing minimal UI and make these features appear through small, clear additions: connected source cards, status chips, right-click menus, Bridge Studio states, People & Work strip, and connector modals.
