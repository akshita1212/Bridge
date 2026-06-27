# Bridge deployment and database setup

## Recommended free stack

Use **Vercel + Neon Postgres** for the MVP.

- Vercel is a good fit because this repo is a Vite app and Vercel can serve the frontend plus the `/api/*` serverless backend in the same project.
- Neon is a better fit than Supabase for this phase if you mainly need a free Postgres database, serverless branching, and a simple connection string without committing to Supabase auth/storage conventions.

## Create the database

1. Create a free Neon project.
2. Open the Neon SQL editor.
3. Run `db/schema.sql`.
4. Copy the pooled connection string.
5. In Vercel, add an environment variable named `POSTGRES_URL` with that pooled connection string.

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Framework preset: **Vite**.
3. Build command: `pnpm build`.
4. Output directory: `dist`.
5. Add `POSTGRES_URL` before the first production deploy.
6. After deployment, visit `/api/health`. It should return `{ "ok": true, "database": "connected" }`.

## Backend added in this repo

- `GET /api/health` checks database connectivity.
- `GET /api/bridges` lists recent Bridges with source/task counts.
- `POST /api/bridges` creates a Bridge.
- `GET /api/context-work?bridgeId=...` returns tasks, questions, changed sources, and people rollups for the Context Work drawer.
- `POST /api/context-work` creates a context-linked task and records an activity event.

## What to build next

1. Add auth provider and connect `users`/`workspaces` to real sessions.
2. Replace prototype arrays in `Canvas.tsx` with API calls.
3. Add upload storage. Vercel Blob or UploadThing is simpler than building file storage yourself.
4. Add background AI jobs for parsing, embeddings, map generation, source-grounded chat, and generated outputs.
