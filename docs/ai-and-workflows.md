# AI setup & how to use your subscriptions with Bridge

## The one thing Bridge needs from you: a free Gemini API key

Consumer subscriptions (ChatGPT Plus, Gemini Pro) **do not include API access** —
they only cover the chat apps. The good news: Google gives API keys away free.

1. Go to **https://aistudio.google.com/apikey** (sign in with your Google account).
2. Click **Create API key** — no billing setup required for the free tier.
3. In the Bridge folder, copy `.env.example` to `.env` and paste the key:
   ```
   GEMINI_API_KEY=AIza...your-key...
   ```
4. Restart Bridge. That's it — analysis, map building, and Ask Bridge now run on
   Gemini (default model `gemini-2.5-flash`, free-tier quota is plenty for
   personal use).

With the key set, Bridge can:
- **Read your documents properly** — PDFs (including scanned), images, audio, and
  video are sent to Gemini natively; you get a real summary, key insights,
  questions, risks, and next actions per source.
- **Build the Map** from those insights automatically after every upload.
- **Ask Bridge** — the chat button (bottom-right of any Bridge) answers questions
  grounded only in that Bridge's sources, with [Source N] citations. Use it for
  your book: "Where do chapters 2 and 5 overlap?", "Draft an outline from these
  notes."

Without the key, Bridge falls back to a basic built-in summarizer, and Ask Bridge
tells you the key is missing.

## What your current subscriptions are good for

| You have | API included? | Best use with Bridge |
| --- | --- | --- |
| **Gemini Pro (subscription)** | No — but the free API key above is separate and free | The key powers Bridge itself |
| **ChatGPT Plus** | No | **Images**: generate diagrams/illustrations in ChatGPT, download, drop them into Bridge — Gemini will analyze and index them like any source |
| **NotebookLM** (free with your Google account) | No API | **Audio/Video overviews**: create a notebook with the same documents, generate an Audio/Video Overview, download it, and drop the file into Bridge. It becomes a playable source and Gemini transcribes/indexes it |
| **Claude (this tool)** | — | Building and extending the app itself (what we're doing now) |

That's the honest division of labor: **Gemini API inside the app** (free),
**ChatGPT for images** (manual, drop results in), **NotebookLM for audio/video
explainers** (manual, drop results in), **Claude for code**.

## Using Bridge for your book

1. Open Bridge (double-click **Bridge.app**, or `npm run dev` in the folder).
2. Create one Bridge per book project (or per part/act if it gets big).
3. Drag your chapter drafts, research PDFs, reference links, and interview audio
   straight onto the window — everything is analyzed on upload.
4. **Map** = what the material says (themes, questions, risks, next actions).
   **Workspace** = your private canvas; drag cards around, add post-its.
   **Work** = tasks and open questions you create as you write.
5. Ask Bridge anything about your material as you write.

Your three process-description documents: just drop all three into one Bridge —
the Map will merge their insights and Ask Bridge can compare them
("Where do these three processes disagree?").

## Bridge.app (Mac)

`Bridge.app` in this folder is a real Mac app: double-click it and it starts the
local server (building the UI on first run) and opens Bridge in its own window.
You can drag it into `/Applications` or keep it in the Dock. It expects the
project to stay at `~/Downloads/Bridge` — if you move the folder, edit
`BRIDGE_DIR` in `Bridge.app/Contents/MacOS/bridge-launcher`.

Everything stays on your machine: database in `data/bridge.db`, files in
`data/uploads/`. The only thing that leaves your Mac is the content sent to the
Gemini API when a source is analyzed or you ask a question.

## About the Vercel deployment

The GitHub repo auto-deploys to Vercel, but that deployment is **UI-only demo**
(no database, no uploads — that's why things silently failed there). Use the
local app for real work. If you later want it online, we can port the local
server's routes to Vercel functions + Neon Postgres — the schema in
`db/schema.sql` is ready for that.
