# Bridge — running and deploying

## Local development (free, no accounts needed)

```bash
npm install        # once
npm run dev        # starts the local API (port 8787) + Vite UI (port 5173)
```

- `npm run dev` runs both servers via `scripts/dev.mjs`.
- `npm run dev:ui` runs only the UI; `npm run api` runs only the API.
- Open http://127.0.0.1:5173 — the Home screen lists real Bridges from the database.

### Where the data lives

- SQLite database: `data/bridge.db` (created automatically, uses Node 22's built-in `node:sqlite` — zero dependencies).
- Uploaded files: `data/uploads/`.
- Delete the `data/` folder to reset everything.

### The local API (`server/index.mjs`)

| Route | What it does |
| --- | --- |
| `GET /api/health` | DB connectivity check |
| `GET/POST /api/bridges` | List / create bridges |
| `GET/PATCH/DELETE /api/bridges/:id` | Full bridge state (sources, notes, tasks, questions, activity) |
| `POST /api/bridges/:id/upload?filename=…` | Upload a document (raw body). Text/PDF content is extracted and summarized |
| `POST /api/bridges/:id/sources` | Add a link or note source |
| `GET /api/sources/:id` · `/file` | Source detail / raw file (PDF, image, audio, video served inline) |
| `POST /api/sources/:id/analyze` | Re-run extraction + summary |
| `GET /api/bridges/:id/map` | Understanding-map cards assembled from real sources + open questions |
| `POST /api/bridges/:id/tasks` · `PATCH /api/tasks/:id` | Context tasks |
| `POST /api/bridges/:id/questions` · `PATCH /api/questions/:id` | Open questions |

The "analysis" today is a dependency-free extractive summarizer (lead sentences +
keyword frequency). To upgrade to real AI summaries, plug an LLM call into
`summarize()` in `server/index.mjs` — that requires an API key (Anthropic/OpenAI),
which is the only paid piece; everything else stays free.

## Deploying later (still free)

Two workable free paths when you want it online:

1. **Vercel + Neon Postgres** — the `api/` folder and `db/schema.sql` are an earlier
   scaffold for this path. You'd port the routes from `server/index.mjs` to `api/`
   functions and swap SQLite for Neon. Free tiers on both.
2. **A single small VM / Fly.io / Render free tier** — run `server/index.mjs` as-is
   (it already serves the API), add static file serving for `dist/`, keep SQLite on a
   persistent volume.

For a single-user MVP, local is simplest and costs nothing.
