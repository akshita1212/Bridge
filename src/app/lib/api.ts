/** Client for the local Bridge API (server/index.mjs, proxied at /api). */

export interface ApiBridge {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  starred: number;
  color: string;
  created_at: string;
  updated_at: string;
  source_count?: number;
  open_tasks?: number;
  open_questions?: number;
}

export interface ApiSource {
  id: string;
  bridge_id?: string;
  type: "pdf" | "doc" | "text" | "image" | "audio" | "video" | "link" | "note";
  title: string;
  provider: string;
  url?: string | null;
  mime?: string | null;
  size_bytes?: number | null;
  text_content?: string | null;
  summary?: string | null;
  status: "synced" | "changed" | "needs-analysis" | "live";
  meta: string;
  created_at: string;
  has_file?: boolean;
}

export interface ApiTask {
  id: string;
  key: string;
  title: string;
  description: string;
  assignee: string;
  status: string;
  priority: string;
  due: string;
  linked: string;
  visibility: string;
  created_at: string;
}

export interface ApiQuestion {
  id: string;
  title: string;
  linked: string;
  owner: string;
  status: string;
  created_at: string;
}

export interface ApiActivity {
  id: string;
  type: string;
  event: string;
  detail: string;
  source_id: string | null;
  created_at: string;
}

export interface ApiNote {
  id: string;
  content: string;
  color: string;
  is_private: number;
  created_at: string;
}

export interface BridgeState {
  bridge: ApiBridge;
  sources: ApiSource[];
  notes: ApiNote[];
  tasks: ApiTask[];
  questions: ApiQuestion[];
  activity: ApiActivity[];
}

export interface MapCard {
  id: string;
  type: "main" | "must-know" | "question" | "decision" | "risk" | "action";
  title: string;
  body: string;
  sources: string[];
  confidence?: "confirmed" | "inferred" | "needs-info";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: init?.body && typeof init.body === "string" ? { "content-type": "application/json" } : undefined,
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `${res.status} ${res.statusText}`);
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean }>("/api/health"),

  listBridges: () => request<{ bridges: ApiBridge[] }>("/api/bridges").then((r) => r.bridges),
  createBridge: (title: string, subtitle = "") =>
    request<{ bridge: ApiBridge }>("/api/bridges", { method: "POST", body: JSON.stringify({ title, subtitle }) }).then((r) => r.bridge),
  getBridge: (id: string) => request<BridgeState>(`/api/bridges/${id}`),
  updateBridge: (id: string, patch: Partial<ApiBridge>) =>
    request<{ bridge: ApiBridge }>(`/api/bridges/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).then((r) => r.bridge),
  deleteBridge: (id: string) => request<{ ok: boolean }>(`/api/bridges/${id}`, { method: "DELETE" }),

  getMap: (bridgeId: string) => request<{ cards: MapCard[] }>(`/api/bridges/${bridgeId}/map`).then((r) => r.cards),

  uploadFile: (bridgeId: string, file: File) =>
    request<{ source: ApiSource }>(`/api/bridges/${bridgeId}/upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      headers: { "content-type": file.type || "application/octet-stream" },
      body: file,
    }).then((r) => r.source),
  addLink: (bridgeId: string, url: string, title?: string) =>
    request<{ source: ApiSource }>(`/api/bridges/${bridgeId}/sources`, {
      method: "POST",
      body: JSON.stringify({ type: "link", url, title }),
    }).then((r) => r.source),
  addNoteSource: (bridgeId: string, content: string, title?: string) =>
    request<{ source: ApiSource }>(`/api/bridges/${bridgeId}/sources`, {
      method: "POST",
      body: JSON.stringify({ type: "note", content, title }),
    }).then((r) => r.source),
  getSource: (id: string) => request<{ source: ApiSource }>(`/api/sources/${id}`).then((r) => r.source),
  analyzeSource: (id: string) => request<{ source: ApiSource }>(`/api/sources/${id}/analyze`, { method: "POST" }).then((r) => r.source),
  deleteSource: (id: string) => request<{ ok: boolean }>(`/api/sources/${id}`, { method: "DELETE" }),
  sourceFileUrl: (id: string) => `/api/sources/${id}/file`,

  createTask: (bridgeId: string, task: Partial<ApiTask>) =>
    request<{ task: ApiTask }>(`/api/bridges/${bridgeId}/tasks`, { method: "POST", body: JSON.stringify(task) }).then((r) => r.task),
  updateTask: (id: string, patch: Partial<ApiTask>) =>
    request<{ task: ApiTask }>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).then((r) => r.task),
  deleteTask: (id: string) => request<{ ok: boolean }>(`/api/tasks/${id}`, { method: "DELETE" }),

  createQuestion: (bridgeId: string, q: Partial<ApiQuestion>) =>
    request<{ question: ApiQuestion }>(`/api/bridges/${bridgeId}/questions`, { method: "POST", body: JSON.stringify(q) }).then((r) => r.question),
  updateQuestion: (id: string, patch: Partial<ApiQuestion>) =>
    request<{ question: ApiQuestion }>(`/api/questions/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).then((r) => r.question),
};

/** "2 hours ago" style formatting for ISO timestamps. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  const w = Math.floor(d / 7);
  return w < 5 ? `${w} week${w > 1 ? "s" : ""} ago` : new Date(iso).toLocaleDateString();
}

/** Parse the server's JSON summary field. */
export function parseSummary(summary?: string | null): { lead: string; keywords: string[]; words?: number } | null {
  if (!summary) return null;
  try {
    return JSON.parse(summary);
  } catch {
    return { lead: summary, keywords: [] };
  }
}
