/**
 * Bridge local API server — zero dependencies.
 * Uses Node 22's built-in node:sqlite and node:http.
 *
 * Run: npm run api   (or: node server/index.mjs)
 * Data lives in data/bridge.db; uploaded files in data/uploads/.
 */
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { randomUUID, createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

const PORT = Number(process.env.BRIDGE_API_PORT || 8787);
const db = new DatabaseSync(path.join(DATA_DIR, "bridge.db"));

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS bridges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Draft',
    starred INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT '#1E488F',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    bridge_id TEXT NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
    type TEXT NOT NULL,             -- pdf | doc | text | image | audio | video | link | note
    title TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'upload',
    url TEXT,                        -- external link, if any
    file_path TEXT,                  -- stored upload, if any
    mime TEXT,
    size_bytes INTEGER,
    text_content TEXT,               -- extracted text when available
    summary TEXT,
    status TEXT NOT NULL DEFAULT 'needs-analysis',  -- synced | changed | needs-analysis | live
    meta TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    bridge_id TEXT NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    color TEXT DEFAULT '#DBE64C',
    is_private INTEGER NOT NULL DEFAULT 1,
    x REAL, y REAL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,               -- BRG-#
    bridge_id TEXT NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assignee TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'To do',
    priority TEXT NOT NULL DEFAULT 'Medium',
    due TEXT DEFAULT '',
    linked TEXT DEFAULT '',
    visibility TEXT NOT NULL DEFAULT 'Private',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    bridge_id TEXT NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    linked TEXT DEFAULT '',
    owner TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    bridge_id TEXT NOT NULL REFERENCES bridges(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    event TEXT NOT NULL,
    detail TEXT DEFAULT '',
    source_id TEXT,
    created_at TEXT NOT NULL
  );
`);

const now = () => new Date().toISOString();

function logActivity(bridgeId, type, event, detail = "", sourceId = null) {
  db.prepare(
    "INSERT INTO activity (id, bridge_id, type, event, detail, source_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(randomUUID(), bridgeId, type, event, detail, sourceId, now());
  touchBridge(bridgeId);
}

function touchBridge(id) {
  db.prepare("UPDATE bridges SET updated_at = ? WHERE id = ?").run(now(), id);
}

function nextTaskKey(bridgeId) {
  const row = db.prepare("SELECT COUNT(*) AS c FROM tasks WHERE bridge_id = ?").get(bridgeId);
  return `BRG-${(row?.c ?? 0) + 1}`;
}

/* ── Text handling ─────────────────────────────────────────── */

const TEXT_MIMES = ["text/", "application/json", "application/xml", "application/csv"];
const TYPE_BY_EXT = {
  ".pdf": "pdf", ".doc": "doc", ".docx": "doc", ".txt": "text", ".md": "text",
  ".csv": "text", ".json": "text", ".png": "image", ".jpg": "image", ".jpeg": "image",
  ".gif": "image", ".webp": "image", ".svg": "image", ".mp3": "audio", ".wav": "audio",
  ".m4a": "audio", ".mp4": "video", ".mov": "video", ".webm": "video",
};

function detectType(filename, mime = "") {
  const ext = path.extname(filename || "").toLowerCase();
  if (TYPE_BY_EXT[ext]) return TYPE_BY_EXT[ext];
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  if (TEXT_MIMES.some((m) => mime.startsWith(m))) return "text";
  return "doc";
}

/** Very small extractive summary: first sentences + top keywords. */
function summarize(text, title = "") {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 24);
  const lead = sentences.slice(0, 3).join(" ").slice(0, 420);
  const words = clean.toLowerCase().match(/[a-z][a-z'-]{4,}/g) || [];
  const stop = new Set(["about", "which", "their", "there", "would", "could", "should", "these", "those", "where", "while", "being", "because", "after", "before", "between", "through"]);
  const freq = new Map();
  for (const w of words) if (!stop.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
  const keywords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
  return JSON.stringify({ lead: lead || `Document "${title}" added.`, keywords, words: words.length });
}

/** Extract text for PDFs by scanning for text-stream literals — rough but dependency-free. */
function extractPdfText(buffer) {
  try {
    const raw = buffer.toString("latin1");
    const matches = raw.match(/\(((?:[^()\\]|\\.){3,})\)\s*T[jJ]/g) || [];
    const text = matches
      .map((m) => m.replace(/\)\s*T[jJ]$/, "").slice(1))
      .map((s) => s.replace(/\\([()\\])/g, "$1").replace(/\\\d{3}/g, " "))
      .join(" ");
    return text.length > 40 ? text : null;
  } catch {
    return null;
  }
}

/* ── HTTP helpers ──────────────────────────────────────────── */

function send(res, status, data, headers = {}) {
  const body = typeof data === "string" || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  res.writeHead(status, {
    "content-type": Buffer.isBuffer(data) ? headers["content-type"] || "application/octet-stream" : "application/json; charset=utf-8",
    ...headers,
  });
  res.end(body);
}

function readBody(req, limit = 64 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) reject(new Error("Payload too large"));
      else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const readJson = async (req) => JSON.parse((await readBody(req)).toString("utf8") || "{}");

/* ── Route table ───────────────────────────────────────────── */

const routes = [];
const route = (method, pattern, handler) => routes.push({ method, pattern, handler });

/* Health */
route("GET", /^\/api\/health$/, (req, res) => {
  const bridges = db.prepare("SELECT COUNT(*) AS c FROM bridges").get();
  send(res, 200, { ok: true, database: "connected", bridges: bridges.c });
});

/* Bridges */
route("GET", /^\/api\/bridges$/, (req, res) => {
  const rows = db.prepare(`
    SELECT b.*,
      (SELECT COUNT(*) FROM sources s WHERE s.bridge_id = b.id) AS source_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.bridge_id = b.id AND t.status != 'Done') AS open_tasks,
      (SELECT COUNT(*) FROM questions q WHERE q.bridge_id = b.id AND q.status = 'Open') AS open_questions
    FROM bridges b ORDER BY b.updated_at DESC
  `).all();
  send(res, 200, { bridges: rows });
});

route("POST", /^\/api\/bridges$/, async (req, res) => {
  const body = await readJson(req);
  if (!body.title?.trim()) return send(res, 400, { error: "title is required" });
  const id = randomUUID();
  const colors = ["#1E488F", "#00804C", "#74C365", "#DBE64C", "#001F3F"];
  const color = body.color || colors[Math.floor(Math.random() * colors.length)];
  db.prepare(
    "INSERT INTO bridges (id, title, subtitle, status, color, created_at, updated_at) VALUES (?, ?, ?, 'Draft', ?, ?, ?)"
  ).run(id, body.title.trim(), body.subtitle || "", color, now(), now());
  logActivity(id, "update", "Bridge created");
  send(res, 201, { bridge: db.prepare("SELECT * FROM bridges WHERE id = ?").get(id) });
});

route("GET", /^\/api\/bridges\/([\w-]+)$/, (req, res, [id]) => {
  const bridge = db.prepare("SELECT * FROM bridges WHERE id = ?").get(id);
  if (!bridge) return send(res, 404, { error: "Bridge not found" });
  const sources = db.prepare("SELECT id, bridge_id, type, title, provider, url, mime, size_bytes, summary, status, meta, created_at, updated_at FROM sources WHERE bridge_id = ? ORDER BY created_at ASC").all(id);
  const notes = db.prepare("SELECT * FROM notes WHERE bridge_id = ? ORDER BY created_at ASC").all(id);
  const tasks = db.prepare("SELECT * FROM tasks WHERE bridge_id = ? ORDER BY created_at ASC").all(id);
  const questions = db.prepare("SELECT * FROM questions WHERE bridge_id = ? ORDER BY created_at ASC").all(id);
  const activity = db.prepare("SELECT * FROM activity WHERE bridge_id = ? ORDER BY created_at DESC LIMIT 60").all(id);
  send(res, 200, { bridge, sources, notes, tasks, questions, activity });
});

route("PATCH", /^\/api\/bridges\/([\w-]+)$/, async (req, res, [id]) => {
  const body = await readJson(req);
  const bridge = db.prepare("SELECT * FROM bridges WHERE id = ?").get(id);
  if (!bridge) return send(res, 404, { error: "Bridge not found" });
  db.prepare("UPDATE bridges SET title = ?, subtitle = ?, status = ?, starred = ?, updated_at = ? WHERE id = ?").run(
    body.title ?? bridge.title,
    body.subtitle ?? bridge.subtitle,
    body.status ?? bridge.status,
    body.starred != null ? Number(body.starred) : bridge.starred,
    now(),
    id
  );
  send(res, 200, { bridge: db.prepare("SELECT * FROM bridges WHERE id = ?").get(id) });
});

route("DELETE", /^\/api\/bridges\/([\w-]+)$/, (req, res, [id]) => {
  for (const s of db.prepare("SELECT file_path FROM sources WHERE bridge_id = ?").all(id)) {
    if (s.file_path && existsSync(s.file_path)) unlinkSync(s.file_path);
  }
  db.prepare("DELETE FROM bridges WHERE id = ?").run(id);
  send(res, 200, { ok: true });
});

/* Sources — upload raw file body (?filename=...) */
route("POST", /^\/api\/bridges\/([\w-]+)\/upload$/, async (req, res, [bridgeId], url) => {
  const bridge = db.prepare("SELECT id FROM bridges WHERE id = ?").get(bridgeId);
  if (!bridge) return send(res, 404, { error: "Bridge not found" });
  const filename = decodeURIComponent(url.searchParams.get("filename") || "untitled");
  const mime = req.headers["content-type"] || "application/octet-stream";
  const buffer = await readBody(req);
  if (!buffer.length) return send(res, 400, { error: "Empty file" });

  const id = randomUUID();
  const safeName = `${id}${path.extname(filename).toLowerCase()}`;
  const filePath = path.join(UPLOAD_DIR, safeName);
  writeFileSync(filePath, buffer);

  const type = detectType(filename, mime);
  let text = null;
  if (type === "text") text = buffer.toString("utf8").slice(0, 400_000);
  if (type === "pdf") text = extractPdfText(buffer);
  const summary = summarize(text, filename);
  const kb = (buffer.length / 1024).toFixed(0);
  const meta = type === "text" && text ? `${text.split(/\s+/).length} words` : `${kb} KB`;

  db.prepare(
    `INSERT INTO sources (id, bridge_id, type, title, provider, file_path, mime, size_bytes, text_content, summary, status, meta, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'upload', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, bridgeId, type, filename, filePath, mime, buffer.length, text, summary, text ? "synced" : "needs-analysis", meta, now(), now());
  logActivity(bridgeId, "upload", `Source added — ${filename}`, meta, id);
  send(res, 201, { source: db.prepare("SELECT id, type, title, provider, mime, size_bytes, summary, status, meta, created_at FROM sources WHERE id = ?").get(id) });
});

/* Sources — link or note via JSON */
route("POST", /^\/api\/bridges\/([\w-]+)\/sources$/, async (req, res, [bridgeId]) => {
  const bridge = db.prepare("SELECT id FROM bridges WHERE id = ?").get(bridgeId);
  if (!bridge) return send(res, 404, { error: "Bridge not found" });
  const body = await readJson(req);
  const type = body.type === "link" ? "link" : "note";
  const title = (body.title || body.url || body.content || "Untitled").slice(0, 160);
  if (type === "link" && !body.url) return send(res, 400, { error: "url is required for links" });

  const id = randomUUID();
  const text = type === "note" ? body.content || "" : null;
  db.prepare(
    `INSERT INTO sources (id, bridge_id, type, title, provider, url, text_content, summary, status, meta, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, bridgeId, type, title,
    type === "link" ? "link" : "note",
    body.url || null, text, summarize(text, title),
    type === "link" ? "live" : "synced",
    type === "link" ? new URL(body.url).hostname : `${(text || "").split(/\s+/).filter(Boolean).length} words`,
    now(), now()
  );
  logActivity(bridgeId, type === "link" ? "update" : "note", `${type === "link" ? "Link" : "Note"} added — ${title}`, "", id);
  send(res, 201, { source: db.prepare("SELECT id, type, title, provider, url, summary, status, meta, created_at FROM sources WHERE id = ?").get(id) });
});

route("GET", /^\/api\/sources\/([\w-]+)$/, (req, res, [id]) => {
  const source = db.prepare("SELECT * FROM sources WHERE id = ?").get(id);
  if (!source) return send(res, 404, { error: "Source not found" });
  const { file_path, ...rest } = source;
  send(res, 200, { source: { ...rest, has_file: Boolean(file_path) } });
});

route("GET", /^\/api\/sources\/([\w-]+)\/file$/, (req, res, [id]) => {
  const source = db.prepare("SELECT file_path, mime, title FROM sources WHERE id = ?").get(id);
  if (!source?.file_path || !existsSync(source.file_path)) return send(res, 404, { error: "File not found" });
  send(res, 200, readFileSync(source.file_path), {
    "content-type": source.mime || "application/octet-stream",
    "content-disposition": `inline; filename="${encodeURIComponent(source.title)}"`,
  });
});

route("DELETE", /^\/api\/sources\/([\w-]+)$/, (req, res, [id]) => {
  const source = db.prepare("SELECT * FROM sources WHERE id = ?").get(id);
  if (!source) return send(res, 404, { error: "Source not found" });
  if (source.file_path && existsSync(source.file_path)) unlinkSync(source.file_path);
  db.prepare("DELETE FROM sources WHERE id = ?").run(id);
  logActivity(source.bridge_id, "update", `Source removed — ${source.title}`);
  send(res, 200, { ok: true });
});

/* Re-analyze a source (stub analysis; plug an LLM here later) */
route("POST", /^\/api\/sources\/([\w-]+)\/analyze$/, (req, res, [id]) => {
  const source = db.prepare("SELECT * FROM sources WHERE id = ?").get(id);
  if (!source) return send(res, 404, { error: "Source not found" });
  let text = source.text_content;
  if (!text && source.file_path && existsSync(source.file_path) && source.type === "pdf") {
    text = extractPdfText(readFileSync(source.file_path));
  }
  const summary = summarize(text, source.title);
  db.prepare("UPDATE sources SET summary = ?, text_content = ?, status = 'synced', updated_at = ? WHERE id = ?")
    .run(summary, text, now(), id);
  logActivity(source.bridge_id, "update", `Analyzed — ${source.title}`, "", id);
  send(res, 200, { source: db.prepare("SELECT id, type, title, summary, status, meta FROM sources WHERE id = ?").get(id) });
});

/* Map understanding — assembled from real sources */
route("GET", /^\/api\/bridges\/([\w-]+)\/map$/, (req, res, [id]) => {
  const sources = db.prepare("SELECT id, title, type, summary FROM sources WHERE bridge_id = ?").all(id);
  const questions = db.prepare("SELECT * FROM questions WHERE bridge_id = ? AND status = 'Open'").all(id);
  const cards = [];
  for (const s of sources) {
    if (!s.summary) continue;
    try {
      const parsed = JSON.parse(s.summary);
      cards.push({
        id: `card-${s.id}`,
        type: cards.length === 0 ? "main" : "must-know",
        title: parsed.keywords?.length ? `Key topics: ${parsed.keywords.slice(0, 3).join(", ")}` : s.title,
        body: parsed.lead,
        sources: [s.id],
        confidence: "inferred",
      });
    } catch { /* legacy summary format */ }
  }
  for (const q of questions) {
    cards.push({ id: `q-${q.id}`, type: "question", title: q.title, body: q.linked || "Needs an answer.", sources: [], confidence: "needs-info" });
  }
  send(res, 200, { cards });
});

/* Notes */
route("POST", /^\/api\/bridges\/([\w-]+)\/notes$/, async (req, res, [bridgeId]) => {
  const body = await readJson(req);
  if (!body.content?.trim()) return send(res, 400, { error: "content is required" });
  const id = randomUUID();
  db.prepare("INSERT INTO notes (id, bridge_id, source_id, content, color, is_private, x, y, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, bridgeId, body.sourceId || null, body.content.trim(), body.color || "#DBE64C", body.isPrivate === false ? 0 : 1, body.x ?? null, body.y ?? null, now());
  logActivity(bridgeId, "note", `Note added — ${body.content.slice(0, 48)}`);
  send(res, 201, { note: db.prepare("SELECT * FROM notes WHERE id = ?").get(id) });
});

route("DELETE", /^\/api\/notes\/([\w-]+)$/, (req, res, [id]) => {
  db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  send(res, 200, { ok: true });
});

/* Tasks */
route("POST", /^\/api\/bridges\/([\w-]+)\/tasks$/, async (req, res, [bridgeId]) => {
  const body = await readJson(req);
  if (!body.title?.trim()) return send(res, 400, { error: "title is required" });
  const id = randomUUID();
  const key = nextTaskKey(bridgeId);
  db.prepare(
    "INSERT INTO tasks (id, key, bridge_id, title, description, assignee, status, priority, due, linked, visibility, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, key, bridgeId, body.title.trim(), body.description || "", body.assignee || "", body.status || "To do", body.priority || "Medium", body.due || "", body.linked || "", body.visibility || "Private", now(), now());
  logActivity(bridgeId, "update", `Task ${key} created — ${body.title.slice(0, 48)}`);
  send(res, 201, { task: db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) });
});

route("PATCH", /^\/api\/tasks\/([\w-]+)$/, async (req, res, [id]) => {
  const body = await readJson(req);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task) return send(res, 404, { error: "Task not found" });
  db.prepare("UPDATE tasks SET title = ?, status = ?, priority = ?, assignee = ?, due = ?, visibility = ?, updated_at = ? WHERE id = ?")
    .run(body.title ?? task.title, body.status ?? task.status, body.priority ?? task.priority, body.assignee ?? task.assignee, body.due ?? task.due, body.visibility ?? task.visibility, now(), id);
  send(res, 200, { task: db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) });
});

route("DELETE", /^\/api\/tasks\/([\w-]+)$/, (req, res, [id]) => {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  send(res, 200, { ok: true });
});

/* Questions */
route("POST", /^\/api\/bridges\/([\w-]+)\/questions$/, async (req, res, [bridgeId]) => {
  const body = await readJson(req);
  if (!body.title?.trim()) return send(res, 400, { error: "title is required" });
  const id = randomUUID();
  db.prepare("INSERT INTO questions (id, bridge_id, title, linked, owner, status, created_at) VALUES (?, ?, ?, ?, ?, 'Open', ?)")
    .run(id, bridgeId, body.title.trim(), body.linked || "", body.owner || "", now());
  logActivity(bridgeId, "update", `Question added — ${body.title.slice(0, 48)}`);
  send(res, 201, { question: db.prepare("SELECT * FROM questions WHERE id = ?").get(id) });
});

route("PATCH", /^\/api\/questions\/([\w-]+)$/, async (req, res, [id]) => {
  const body = await readJson(req);
  const q = db.prepare("SELECT * FROM questions WHERE id = ?").get(id);
  if (!q) return send(res, 404, { error: "Question not found" });
  db.prepare("UPDATE questions SET title = ?, status = ?, owner = ? WHERE id = ?")
    .run(body.title ?? q.title, body.status ?? q.status, body.owner ?? q.owner, id);
  send(res, 200, { question: db.prepare("SELECT * FROM questions WHERE id = ?").get(id) });
});

/* ── Server ────────────────────────────────────────────────── */

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    for (const r of routes) {
      if (req.method !== r.method) continue;
      const m = url.pathname.match(r.pattern);
      if (m) return await r.handler(req, res, m.slice(1), url);
    }
    send(res, 404, { error: `No route: ${req.method} ${url.pathname}` });
  } catch (err) {
    send(res, 500, { error: err instanceof Error ? err.message : "Server error" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Bridge API listening on http://127.0.0.1:${PORT}`);
});
