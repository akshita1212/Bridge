import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api, timeAgo, type ApiBridge } from "../lib/api";
import {
  Home as HomeIcon, Clock, Users, Folder, Library, FileText, Settings,
  Search, Plus, Sun, Moon, Bell, ChevronDown, Grid3X3, List,
  MoreHorizontal, GitBranch, Star, Trash2, Share2, Edit3, LogOut, X, Check
} from "lucide-react";
import type { Page, Theme } from "../App";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (page: Page, id?: string) => void;
}

type StatusChip = "Draft" | "Processing" | "Ready" | "Shared" | "Needs clarity" | "Understood";

interface BridgeFile {
  id: string;
  title: string;
  subtitle: string;
  lastEdited: string;
  collaborators: string[];
  sourceCount: number;
  status: StatusChip;
  color: string;
  starred?: boolean;
}

const STATUS_STYLES: Record<StatusChip, { bg: string; text: string }> = {
  Draft: { bg: "var(--status-neutral-soft)", text: "var(--status-neutral)" },
  Processing: { bg: "var(--status-info-soft)", text: "var(--status-info)" },
  Ready: { bg: "var(--status-positive-soft)", text: "var(--status-positive)" },
  Shared: { bg: "var(--status-warn-soft)", text: "var(--accent-strong)" },
  "Needs clarity": { bg: "var(--status-danger-soft)", text: "var(--status-danger)" },
  Understood: { bg: "var(--status-positive-soft)", text: "var(--status-positive)" },
};

const BRIDGES: BridgeFile[] = [
  {
    id: "product-handoff",
    title: "Product Handoff",
    subtitle: "Cognitive Assessment Flow",
    lastEdited: "2 hours ago",
    collaborators: ["JC", "AM", "RK"],
    sourceCount: 7,
    status: "Ready",
    color: "#1E488F",
    starred: true,
  },
  {
    id: "client-brief",
    title: "Client Brief",
    subtitle: "Brand Direction Q3",
    lastEdited: "Yesterday",
    collaborators: ["LP"],
    sourceCount: 4,
    status: "Shared",
    color: "#00804C",
  },
  {
    id: "research-notes",
    title: "Research Notes",
    subtitle: "Tier 2 Restaurant UX",
    lastEdited: "3 days ago",
    collaborators: ["JC", "NW"],
    sourceCount: 11,
    status: "Needs clarity",
    color: "#74C365",
  },
  {
    id: "onboarding-context",
    title: "Onboarding",
    subtitle: "New Designer Context Pack",
    lastEdited: "Last week",
    collaborators: ["AM"],
    sourceCount: 5,
    status: "Understood",
    color: "#DBE64C",
  },
  {
    id: "book-notes",
    title: "Book Notes",
    subtitle: "This Is Service Design",
    lastEdited: "2 weeks ago",
    collaborators: [],
    sourceCount: 3,
    status: "Draft",
    color: "#001F3F",
  },
  {
    id: "sprint-review",
    title: "Sprint Review",
    subtitle: "Q2 — Engineering Retrospective",
    lastEdited: "2 weeks ago",
    collaborators: ["JC", "AM", "RK", "NW"],
    sourceCount: 8,
    status: "Processing",
    color: "#1E488F",
  },
];

const NAV_ITEMS = [
  { id: "home", icon: HomeIcon, label: "Home" },
  { id: "recents", icon: Clock, label: "Recents" },
  { id: "shared", icon: Users, label: "Shared with me" },
  { id: "my", icon: Folder, label: "My Bridges" },
  { id: "sources", icon: Library, label: "Source Library" },
  { id: "templates", icon: FileText, label: "Templates" },
];

function Avatar({ initials, color = "#001F3F" }: { initials: string; color?: string }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2"
      style={{ background: color, borderColor: "var(--card)", fontSize: "0.6rem", fontWeight: 700, color: "#fff" }}
    >
      {initials}
    </div>
  );
}

const AVATAR_COLORS = ["#001F3F", "#1E488F", "#00804C", "#74C365"];

function BridgeCard({ file, onOpen }: { file: BridgeFile; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const status = STATUS_STYLES[file.status];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      className="flex flex-col rounded-2xl border border-border overflow-hidden cursor-pointer group"
      style={{ background: "var(--card)", boxShadow: hovered ? "0 8px 24px rgba(0,31,63,0.08)" : "0 1px 4px rgba(0,31,63,0.04)" }}
    >
      {/* Thumbnail */}
      <div
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{ background: file.color + "18" }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: file.color + "30" }}
        >
          <GitBranch size={22} style={{ color: file.color }} />
        </div>
        {/* Hover actions */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center gap-2" style={{ background: "rgba(0,0,0,0.04)" }}>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              className="px-4 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{ background: "var(--ink)", color: "var(--ink-inverse)", fontSize: "0.8rem", fontWeight: 600 }}
            >
              Open
            </button>
          </div>
        )}
        {file.starred && (
          <div className="absolute top-2 right-2">
            <Star size={13} style={{ color: "#DBE64C", fill: "#DBE64C" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-2.5">
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.3 }}>{file.title}</p>
          <p style={{ fontSize: "0.775rem", color: "var(--muted-foreground)", marginTop: 1 }}>{file.subtitle}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {file.collaborators.slice(0, 3).map((c, i) => (
              <div key={c} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 10 - i }}>
                <Avatar initials={c} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
              </div>
            ))}
            {file.collaborators.length > 3 && (
              <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginLeft: 2 }}>
                +{file.collaborators.length - 3}
              </span>
            )}
          </div>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{ fontSize: "0.7rem", fontWeight: 600, background: status.bg, color: status.text }}
          >
            {file.status}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2.5">
          <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
            {file.sourceCount} sources · {file.lastEdited}
          </span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
            style={{ color: "var(--muted-foreground)" }}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function toBridgeFile(b: ApiBridge): BridgeFile {
  const status: StatusChip =
    (b.source_count ?? 0) === 0 ? "Draft"
    : (b.open_questions ?? 0) > 0 ? "Needs clarity"
    : (b.open_tasks ?? 0) > 0 ? "Processing"
    : "Ready";
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || `${b.source_count ?? 0} sources`,
    lastEdited: timeAgo(b.updated_at),
    collaborators: [],
    sourceCount: b.source_count ?? 0,
    status,
    color: b.color,
    starred: Boolean(b.starred),
  };
}

export function Home({ theme, onToggleTheme, onNavigate }: Props) {
  const [activeNav, setActiveNav] = useState("home");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [bridges, setBridges] = useState<BridgeFile[] | null>(null);
  const [apiDown, setApiDown] = useState(false);
  const [creating, setCreating] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    api.listBridges()
      .then((rows) => { setBridges(rows.map(toBridgeFile)); setApiDown(false); })
      .catch(() => { setBridges(BRIDGES); setApiDown(true); });
  }, []);

  const [newOpen, setNewOpen] = useState(() => new URLSearchParams(window.location.search).has("create"));
  const createBridge = () => setNewOpen(true);
  const confirmCreate = async (name: string) => {
    if (creating) return;
    setCreating(true);
    try {
      const bridge = await api.createBridge(name || "Untitled Bridge");
      onNavigate("canvas", bridge.id);
    } catch {
      onNavigate("canvas", "new");
    } finally {
      setCreating(false);
    }
  };

  const list = bridges ?? [];
  const filtered = list.filter((b) =>
    `${b.title} ${b.subtitle}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-background overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex flex-col border-r border-border flex-shrink-0"
        style={{ background: "var(--sidebar)" }}
      >
        {/* Workspace switcher */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#DBE64C" }}>
            <GitBranch size={13} style={{ color: "#001F3F" }} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontWeight: 700, fontSize: "0.875rem" }}>Bridge</p>
            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>Jamie's workspace</p>
          </div>
          <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-all"
                style={{
                  background: isActive ? "var(--sidebar-accent)" : "transparent",
                  color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "0.875rem",
                }}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            );
          })}

          <div className="my-2 h-px bg-sidebar-border" />

          <button
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-all hover:bg-sidebar-accent"
            style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}
          >
            <Settings size={15} />
            Settings
          </button>
        </nav>

        {/* Profile */}
        <div className="px-3 py-3 border-t border-sidebar-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--ink)", fontSize: "0.65rem", fontWeight: 700, color: "var(--ink-inverse)" }}>
            AK
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>Akshat</p>
            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>Local workspace</p>
          </div>
          <button
            onClick={() => onNavigate("landing")}
            title="Sign out"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sidebar-accent transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3.5 border-b border-border flex-shrink-0" style={{ background: "var(--background)" }}>
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border" style={{ background: "var(--input-background)" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <input
                type="text"
                placeholder="Search bridges…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "0.875rem", color: "var(--foreground)" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              {viewMode === "grid" ? <List size={15} /> : <Grid3X3 size={15} />}
            </button>
            <button
              className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Bell size={15} />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#DBE64C" }}
              />
            </button>
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={createBridge}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.875rem", fontWeight: 600 }}
            >
              <Plus size={15} />
              New Bridge
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {apiDown && (
            <div className="mb-6 px-4 py-3 rounded-xl border flex items-center gap-2.5" style={{ background: "var(--status-warn-soft)", borderColor: "var(--border)", fontSize: "0.8rem", color: "var(--accent-strong)", fontWeight: 500 }}>
              <Bell size={13} />
              Local API not running — showing demo data. Start it with <code style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>npm run dev</code> (runs UI + API together).
            </div>
          )}
          {/* New Bridge card + section heading */}
          <section className="mb-8">
            <h3 className="mb-4" style={{ fontWeight: 700, fontSize: "1rem" }}>Start something new</h3>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={createBridge}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-border hover:border-foreground transition-all group"
              style={{ background: "var(--card)", width: "100%", maxWidth: 320 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:scale-110"
                style={{ background: "#DBE64C", transition: "all 0.2s" }}
              >
                <Plus size={20} style={{ color: "#001F3F" }} />
              </div>
              <div className="text-left">
                <p style={{ fontWeight: 600, fontSize: "0.9375rem" }}>New Bridge</p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Blank canvas, ready to fill</p>
              </div>
            </motion.button>
          </section>

          {/* Recent */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Recent</h3>
              <button style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>See all</button>
            </div>

            {bridges !== null && filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border-2 border-dashed border-border text-center">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                  <GitBranch size={18} style={{ color: "var(--muted-foreground)" }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{search ? "No bridges match your search" : "No bridges yet"}</p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", maxWidth: 300, lineHeight: 1.55 }}>
                  {search ? "Try a different search term." : "Create your first Bridge and drop in documents, links, and notes."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                {filtered.map((file, i) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <BridgeCard
                      file={file}
                      onOpen={() => onNavigate("canvas", file.id)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border rounded-2xl border border-border overflow-hidden" style={{ background: "var(--card)" }}>
                {filtered.map((file) => {
                  const status = STATUS_STYLES[file.status];
                  return (
                    <motion.div
                      key={file.id}
                      whileHover={{ backgroundColor: "var(--secondary)" }}
                      onClick={() => onNavigate("canvas", file.id)}
                      className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: file.color + "18" }}>
                        <GitBranch size={14} style={{ color: file.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{file.title} — {file.subtitle}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{file.sourceCount} sources · {file.lastEdited}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{ fontSize: "0.7rem", fontWeight: 600, background: status.bg, color: status.text }}
                        >
                          {file.status}
                        </span>
                        <div className="flex">
                          {file.collaborators.slice(0, 3).map((c, i) => (
                            <div key={c} style={{ marginLeft: i > 0 ? -5 : 0 }}>
                              <Avatar initials={c} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                            </div>
                          ))}
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
      <AnimatePresence>
        {newOpen && <NewBridgeModal onClose={() => setNewOpen(false)} onCreate={confirmCreate} busy={creating} />}
      </AnimatePresence>
    </div>
  );
}

// ─── New Bridge: name it and bring the team in ───────────────────────────────

// A person's role is their job on the project, and the hint is what they own.
const ROLES = ["Product Manager", "Designer", "Engineer", "Researcher", "Stakeholder"] as const;
type Role = (typeof ROLES)[number];
const ROLE_HINT: Record<Role, string> = {
  "Product Manager": "Owns scope, priorities and sign-off",
  Designer: "Owns the flows and the experience",
  Engineer: "Builds it and owns delivery",
  Researcher: "Brings the evidence from users",
  Stakeholder: "Reviews and approves decisions",
};

function NewBridgeModal({ onClose, onCreate, busy }: { onClose: () => void; onCreate: (name: string) => void; busy: boolean }) {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [people, setPeople] = useState<{ name: string; role: Role; you?: boolean }[]>([{ name: "Akshat", role: "Designer", you: true }]);
  const [invite, setInvite] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Engineer");

  const add = () => {
    const n = invite.trim();
    if (!n) return;
    setPeople((p) => [...p, { name: n, role: inviteRole }]);
    setInvite("");
  };
  const initials = (n: string) => n.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const label = { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 6, display: "block" };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" style={{ background: "rgba(0,31,63,0.18)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-2xl border border-border overflow-hidden"
        style={{ background: "var(--card)", boxShadow: "var(--shadow-xl)" }}
        data-testid="new-bridge"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#DBE64C" }}><GitBranch size={15} style={{ color: "#001F3F" }} /></div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>New Bridge</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Name the project and bring your team in</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="hover:bg-secondary rounded-lg p-1.5 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={15} /></button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <label style={label} htmlFor="nb-name">Project name</label>
            <input id="nb-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Product Handoff" autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-border outline-none" style={{ background: "var(--input-background)", fontSize: "0.9rem", fontWeight: 600 }} />
          </div>
          <div>
            <label style={label} htmlFor="nb-about">What is it about?</label>
            <input id="nb-about" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="One line, so everyone starts on the same page"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border outline-none" style={{ background: "var(--input-background)", fontSize: "0.85rem" }} />
          </div>

          <div>
            <span style={label}>People and their roles</span>
            <div className="flex flex-col gap-1.5" data-testid="people">
              {people.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border" style={{ background: "var(--background)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], color: "#fff", fontSize: "0.62rem", fontWeight: 800 }}>{initials(p.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ fontSize: "0.84rem", fontWeight: 600 }}>{p.name}{p.you && <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}> · you</span>}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{ROLE_HINT[p.role]}</p>
                  </div>
                  <select value={p.role} onChange={(e) => setPeople((all) => all.map((x, j) => (j === i ? { ...x, role: e.target.value as Role } : x)))}
                    className="px-2.5 py-1 rounded-lg border border-border outline-none" style={{ background: p.you ? "#DBE64C" : "var(--card)", color: p.you ? "#001F3F" : "var(--foreground)", fontSize: "0.74rem", fontWeight: 700 }}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input value={invite} onChange={(e) => setInvite(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Name or email"
                className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-border outline-none" style={{ background: "var(--input-background)", fontSize: "0.84rem" }} data-testid="invite" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)} className="px-2.5 rounded-xl border border-border outline-none" style={{ background: "var(--card)", fontSize: "0.8rem", fontWeight: 600 }} data-testid="invite-role">
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <button onClick={add} className="px-3.5 rounded-xl border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.8rem", fontWeight: 700 }}>Add</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border" style={{ background: "var(--background)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{people.length} {people.length === 1 ? "person" : "people"} · everyone sees the same context</p>
          <button onClick={() => onCreate(name.trim())} disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--btn-brand-bg)", color: "var(--btn-brand-fg)", fontSize: "0.85rem", fontWeight: 700 }} data-testid="create-bridge">
            <Check size={14} />Create Bridge
          </button>
        </div>
      </motion.div>
    </>
  );
}
