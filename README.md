# Bridge

AI-powered understanding workspace: drop in documents, links, and notes; Bridge
organizes them into a shared **Map**, a private **Workspace** canvas, and a
context-linked **Work** board.

Originally scaffolded from the Figma Make export
([Design Bridge UI](https://www.figma.com/design/yZxQbq8HkvtNpOAzHrbYFV/Design-Bridge-UI)),
now a working single-user MVP with a free local backend.

## Quick start

```bash
npm install
npm run dev     # local API (SQLite, port 8787) + UI (port 5173)
```

Open http://127.0.0.1:5173 — create a Bridge, upload documents (PDF/text/images/
audio/video), paste links, add notes and tasks. Everything persists in `data/bridge.db`.

Requires **Node 22+** (the backend uses the built-in `node:sqlite` — no native deps).

## Design system

Tokens live in [src/styles/theme.css](src/styles/theme.css):

- **Light**: warm off-white paper, deep navy ink, lime accent.
- **Dark**: warm charcoal-green with lime accents (per product spec).
- **Spaces**: each of the three spaces carries a signature accent —
  Map = lime, Workspace = blue, Work = green — via `.space-map` /
  `.space-workspace` / `.space-work` classes and `--space-*` variables.
- Status colors, elevation shadows, and the navy+lime "brand button" all flip
  correctly between modes via `--status-*`, `--shadow-*`, and `--btn-brand-*` tokens.

## Product demo video

[`demo-video/`](demo-video) holds a 1 min 52 s product demo of Bridge made from this app, with everything used to make
it: the frozen screens, the film script, tools, sound, a live player, the final video and a guide
([`demo-video/README.md`](demo-video/README.md), [`demo-video/SKILL.md`](demo-video/SKILL.md)).

## More

See [docs/deployment.md](docs/deployment.md) for the API reference, data layout,
and free deployment options.
