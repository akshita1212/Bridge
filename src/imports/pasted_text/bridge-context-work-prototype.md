Edit the current Bridge prototype.

Focus only on fixing the People & Work layer.

The current People & Work layer is not working properly.
It should not feel like a generic people strip.
It should not feel like a full project management dashboard.
It should feel like a context-aware work layer connected to Bridge’s understanding system.

Rename “People & Work” to:

“Context Work”

Context Work means:
work that comes from sources, insights, questions, decisions, comments, generated outputs, or gaps in understanding.

Bridge is still primarily an understanding product.
The work layer should support the understanding, not replace it.

CORE IDEA

Bridge analyzes context and gives knowledge.
Context Work helps people act on that knowledge.

Tasks should not exist randomly.
Every task should be linked to something:

* a source
* a Map insight
* an open question
* a decision
* a risk
* a Workspace note
* a comment
* a generated output
* a changed document
* a missing context gap

The user should always know:

1. What work exists
2. Who owns it
3. Why it exists
4. What source or insight it came from
5. Whether it affects the main Bridge context

INSPIRATION

Take inspiration from Jira:

* work items
* assignee
* status
* priority
* due date
* dependencies
* blocked state
* review state
* work item details
* linked evidence
* lightweight board/list behavior

Take inspiration from Obsidian:

* contextual relationships
* connected cards
* source-linked thinking
* graph-like relationship clarity
* right-click interactions
* backlinks/context links
* local/private notes connected to shared knowledge

But keep Bridge simpler and cleaner than both.

MAP MODE — CONTEXT WORK STRIP

In Map mode, place a thin “Context Work” strip below Connected Sources and above the Understanding cards.

The strip should be compact and easy to scan.

It should show small pills/chips:

* 4 Tasks
* 3 Open Questions
* 2 Blocked
* 1 Needs Review
* 2 File Changes
* Aditi reviewing
* Rohan assigned
* Decision pending

Each chip should have:

* icon
* number
* short label
* subtle status color
* hover preview

Do not show a full task table on the Map by default.

Clicking any chip opens the Context Work drawer.

CONTEXT WORK DRAWER

When the user clicks the Context Work strip, open a right-side drawer.

Drawer title:
“Context Work”

Subcopy:
“Work linked to this Bridge’s sources, questions, and decisions.”

Drawer tabs:

1. Tasks
2. Questions
3. People
4. Changes

Keep the drawer narrow, clean, and simple.

TAB 1: TASKS

Tasks should be shown as compact Jira-inspired work cards.

Each task card should show:

* task key, for example BRG-12
* short title
* assignee avatar/name
* status
* priority
* due date
* linked context
* visibility label

Task statuses:

* To do
* In progress
* Waiting
* Blocked
* Needs review
* Done

Priority:

* Low
* Medium
* High
* Critical

Visibility labels:

* Private
* Shared with person
* Added to main context

Each task should show linked context as a small source chip:

* From PDF p.14
* From Map decision
* From video 08:42
* From open question
* From changed Google Doc
* From generated audio

Task card example:
BRG-12
“Confirm final decision owner”
Assignee: Aditi
Status: Blocked
Linked to: Open Question + PDF p.14
Visibility: Shared with Aditi

Quick actions on task card:

* Open context
* Change status
* Reassign
* Comment
* Add to main context
* Mark done

Clicking “Open context” should jump to the exact Map card, source, Workspace node, document page, video timestamp, or note.

TAB 2: QUESTIONS

Questions are not tasks yet.
They are unresolved context gaps.

Question card fields:

* question title
* why it matters
* linked source/insight
* suggested owner
* confidence
* status

Question statuses:

* Open
* Assigned
* Answered
* Needs confirmation
* Resolved

Actions:

* Assign as task
* Ask Bridge
* Ask person
* Add note
* Resolve
* Add to Map

Example:
“Who owns final sign-off on the gateway redesign?”
Linked to: Map question + Stakeholder Interview
Suggested owner: Dr. Chen
Action: Assign as task

TAB 3: PEOPLE

People should not just be avatars.
People should show their relationship to the Bridge context.

Person card fields:

* name
* role
* involvement
* assigned work count
* comments needing response
* files owned
* last activity
* context access level

Examples:
Aditi Sharma
Role: Product Manager
Owns: 2 decisions, 1 source
Tasks: 3
Needs review: 1
Access: Shared context

Rohan Mehta
Role: Engineer
Owns: 1 implementation question
Tasks: 2
Blocked: 1
Access: Selected notes only

Person card actions:

* View related context
* Assign task
* Ask for clarification
* Share selected context
* Change access

Clicking a person should filter the drawer to show:

* their tasks
* their comments
* their assigned questions
* their linked sources
* their visible context

TAB 4: CHANGES

Changes should show connected-file changes that may affect work.

Change card fields:

* source file
* changed by
* changed time
* analysis status
* affected Map cards
* affected tasks/questions

Statuses:

* Changed
* Needs analysis
* Analyzing
* Reviewed
* Added to context
* Ignored

Actions:

* Analyze changes
* View diff
* Create task
* Ask owner
* Add to main context
* Ignore

Example:
“UX Research Session notes changed 8 min ago”
Affected:

* Decision Gateway insight
* BRG-12 Confirm owner
  Action:
  Analyze changes

TASK CREATION FLOW

Add a clean “Create task” modal.

This modal can open from:

* Map card right-click
* source right-click
* open question
* comment
* changed file
* Workspace note
* generated output
* Context Work drawer

Modal title:
“Create context task”

Fields:

* Task title
* Assign to
* Status
* Priority
* Due date
* Linked context
* Visibility
* Add to main context toggle

Linked context should be automatically prefilled based on where the task was created.

Example:
If the user creates a task from a Map question, the modal should already show:
Linked context: “Open Question — final sign-off”

Visibility options:

* Private
* Share with assignee
* Share with group
* Add to main Bridge context

Primary button:
“Create task”

After creating:
Show toast:
“Task BRG-12 created and linked to this question.”

WORK ITEM DETAIL PANEL

Clicking a task should open a detail panel, not a full page.

Panel title:
BRG-12 Confirm final decision owner

Sections:

* Status
* Assignee
* Priority
* Due date
* Linked context
* Evidence
* Comments
* Activity
* Visibility

Linked context section should show:

* Map card preview
* source chip
* page/timestamp if available
* button: “Jump to context”

Evidence section should show:

* exact source reference
* related notes
* related generated outputs

Comments section:

* add comment
* tag person
* choose visibility

Activity section:

* created
* assigned
* status changed
* source changed
* comment added
* added to main context

STATUS CHANGE INTERACTION

Task status should be editable inline.

Clicking status opens a small dropdown:

* To do
* In progress
* Waiting
* Blocked
* Needs review
* Done

When a task is blocked, ask:
“What is blocking this?”
Options:

* Missing source
* Waiting for person
* Contradicting information
* Needs decision
* Needs analysis
* Other

This makes Bridge more intelligent than normal task tools because blockers are connected to context.

RIGHT-CLICK INTERACTIONS

Update right-click menus to include Context Work actions.

Right-click on Map card:

* View evidence
* Ask Bridge
* Create context task
* Assign to person
* Add comment
* Mark as blocked
* Add to main context
* Open in Workspace

Right-click on source:

* Analyze source
* Analyze changes
* Create task from source
* Ask owner
* Add comment
* Open in Workspace
* Add to main context

Right-click on question:

* Assign question
* Create task
* Ask Bridge
* Ask person
* Resolve question
* Add to main context

Right-click on generated output:

* Assign review
* Create task
* Share with person
* Add comment
* Add to main context

MAP CARD WORK INDICATORS

Map cards should show small work indicators only when relevant.

Examples:

* assigned avatar
* task count
* blocked chip
* review chip
* comment count
* changed source chip

Do not clutter every card.
Only show indicators when work exists.

Example card indicators:

* “Aditi”
* “Blocked”
* “2 tasks”
* “Needs review”
* “1 comment”

Hovering on the indicator shows a small preview.

WORK LAYER SHOULD BE CONTEXTUAL

Context Work should answer:
“What needs to happen because of this understanding?”

It should not answer:
“What are all the tasks in the company?”

So keep it scoped to the current Bridge.

WORKSPACE INTEGRATION

In Workspace, Context Work appears when the user selects:

* source node
* frame
* post-it
* question
* generated output

Bridge Studio should show:

* Create context task
* Assign question
* Add comment
* View linked work
* Mark blocker
* Share with person

If a Workspace frame is selected, Bridge Studio should show:
“Work in this frame”

* 2 tasks
* 1 open question
* 1 blocker
* 1 file changed

Actions:

* Create task from frame
* Assign frame review
* Ask Bridge for work summary
* Add frame work to Map

BRIDGE STUDIO UPDATE

In Bridge Studio, replace generic People & Work section with “Context Work”.

Default Bridge Studio sections:

1. Ask Bridge
2. Create from all
3. Analyze changes
4. Context Work
5. Recent outputs
6. Open questions

Context Work mini-summary:

* 4 tasks
* 2 blocked
* 3 open questions
* 1 review pending

Buttons:

* View work
* Create task
* Ask Bridge to analyze work

“Ask Bridge to analyze work” should generate:

* what is blocked
* who needs to respond
* which source changes affect work
* what can be resolved
* what should be assigned next

AI WORK ANALYSIS

Add a small AI work analysis panel.

Title:
“Work analysis”

Show:

* Blocked by missing sign-off
* Aditi owns 2 pending reviews
* UX video changed after PDF was written
* BRG-12 depends on Dr. Chen response
* 1 question can be resolved from source evidence

Actions:

* Create tasks
* Notify owners
* Add to main context
* Ignore suggestions

This should be subtle and useful.
Do not make it a big AI dashboard.

VISUAL DESIGN

Keep the UI clean.

Use:

* compact chips
* small cards
* avatars
* status pills
* source chips
* right-side drawer
* hover previews
* contextual menus

Avoid:

* full Kanban board on the main Map
* huge people section
* dense Jira-style table
* too many columns
* too many colors
* making Bridge feel like project management software

SCREEN STATES TO CREATE

Create or update these states:

1. Map mode with Context Work strip
2. Context Work drawer open with Tasks tab
3. Context Work drawer open with Questions tab
4. Context Work drawer open with People tab
5. Context Work drawer open with Changes tab
6. Create context task modal
7. Task detail panel
8. Status dropdown
9. Blocked reason mini prompt
10. Map card with task/comment indicators
11. Right-click menu on Map card with Context Work actions
12. Workspace node selected with linked work visible in Bridge Studio
13. Bridge Studio showing Context Work summary
14. AI Work Analysis panel
15. Comment visibility popover
16. Dark mode version

IMPORTANT RULES

Do not make Bridge into Jira.
Do not make the main Map look like a project board.
Do not put a full Kanban board on the surface.
Do not show all work at once.
Do not disconnect tasks from sources or insights.
Do not make people just decorative avatars.

Bridge should feel like:

* understanding first
* work second
* context always connected
* tasks linked to evidence
* assignments linked to questions
* comments linked to source
* people linked to the context they own

Final output:
Update the People & Work layer into a proper Context Work system. It should be inspired by Jira’s task ownership/status/workflow model and Obsidian’s contextual relationship thinking, but simplified for Bridge. The Map should remain clean, while work details appear through chips, a right-side Context Work drawer, right-click actions, task detail panels, and Bridge Studio summaries.
