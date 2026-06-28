import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, Sun, Moon, Share2, Upload, Link2, Edit3, Mic, Plus,
  FileText, Video, AudioLines, Image, Globe, StickyNote, X,
  Zap, GitBranch, ArrowUpRight, MessageCircle, Check, AlertTriangle,
  HelpCircle, Search, Map, Clock, BookOpen, Play, Pause,
  Highlighter, Pin, Scissors, Volume2, ChevronRight, MoreHorizontal,
  Flag, Lightbulb, Target, ArrowRight, Star, Bookmark, Bell, RefreshCw
} from "lucide-react";
import type { Page, Theme } from "../App";
import { WorkspaceCanvas } from "./WorkspaceCanvas";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (page: Page) => void;
  canvasId: string;
}

type WorkspaceMode = "understanding" | "canvas" | "actionhub";

interface Source {
  id: string;
  type: "pdf" | "video" | "audio" | "image" | "note" | "link";
  title: string;
  meta: string;
  status: "ready" | "updating";
  isNew?: boolean;
  color: string;
}

interface InsightCard {
  id: string;
  type: "main" | "must-know" | "question" | "decision" | "risk" | "action";
  title: string;
  body: string;
  sources: string[];
  confidence?: "confirmed" | "inferred" | "needs-info";
}

const SOURCES: Source[] = [
  { id: "pdf1", type: "pdf", title: "Assessment Framework v3.pdf", meta: "24 pages", status: "ready", color: "#1E488F" },
  { id: "vid1", type: "video", title: "UX Research Session.mp4", meta: "34:22", status: "ready", isNew: true, color: "#00804C" },
  { id: "aud1", type: "audio", title: "Stakeholder Interview — Dr. Chen.mp3", meta: "18:05", status: "ready", color: "#74C365" },
  { id: "img1", type: "image", title: "Flow Diagram — Final.png", meta: "PNG · 2.3 MB", status: "ready", color: "#DBE64C" },
  { id: "note1", type: "note", title: "Key findings from research", meta: "3 paragraphs", status: "ready", color: "#001F3F" },
  { id: "link1", type: "link", title: "NNG — Cognitive Load in UX", meta: "nngroup.com", status: "updating", color: "#5C6B5A" },
];

const SOURCE_ICONS = { pdf: FileText, video: Video, audio: AudioLines, image: Image, link: Globe, note: StickyNote };

interface ConnectedSource {
  id: string; title: string; provider: string; color: string;
  status: "synced" | "changed" | "needs-analysis" | "live"; lastUpdated: string; owner: string;
}
const CONNECTED_SOURCES: ConnectedSource[] = [
  { id: "pdf1",   title: "Assessment Framework v3.pdf", provider: "Upload",        color: "#1E488F", status: "synced",         lastUpdated: "4 days ago",  owner: "JC" },
  { id: "vid1",   title: "UX Research Session.mp4",     provider: "Upload",        color: "#00804C", status: "synced",         lastUpdated: "5 days ago",  owner: "JC" },
  { id: "gdoc1",  title: "Design Brief — Q1 2025",      provider: "Google Docs",   color: "#4285F4", status: "changed",        lastUpdated: "8 min ago",   owner: "AR" },
  { id: "fig1",   title: "Component Library v4",        provider: "Figma",         color: "#F24E1E", status: "needs-analysis", lastUpdated: "2 hours ago", owner: "RM" },
  { id: "aud1",   title: "Stakeholder Interview.mp3",   provider: "Upload",        color: "#74C365", status: "synced",         lastUpdated: "3 days ago",  owner: "JC" },
  { id: "sheet1", title: "Project Timeline — 2025",     provider: "Google Sheets", color: "#34A853", status: "live",           lastUpdated: "Live",        owner: "AR" },
];
const CW_CHIPS = [
  { icon: Target,       label: "4 Tasks",           color: "#5C6B5A" },
  { icon: HelpCircle,   label: "3 Questions",       color: "#1E488F" },
  { icon: AlertTriangle,label: "2 Blocked",         color: "#C0392B" },
  { icon: Star,         label: "1 Needs Review",    color: "#DBE64C" },
  { icon: Zap,          label: "2 File Changes",    color: "#00804C" },
];

const CW_TASKS = [
  { key: "BRG-12", title: "Confirm final decision owner",           assignee: "AR", status: "Blocked",     priority: "High",   due: "Mar 12", linked: "Open Question · PDF p.14",  visibility: "Shared with Aditi" },
  { key: "BRG-13", title: "Redesign decision gateway flow",         assignee: "RM", status: "In progress", priority: "High",   due: "Mar 15", linked: "Map Decision · PDF p.18",    visibility: "Main context" },
  { key: "BRG-14", title: "Update framework with D4 node",         assignee: "JC", status: "To do",       priority: "Medium", due: "Mar 18", linked: "Flow Diagram · Framework v3", visibility: "Private" },
  { key: "BRG-15", title: "Review NNG article alignment",          assignee: "AR", status: "Needs review", priority: "Low",    due: "Mar 20", linked: "Risk · NNG Link",             visibility: "Shared with Aditi" },
];

const CW_QUESTIONS = [
  { title: "Who owns sign-off on the gateway redesign?", linked: "Map question · Stakeholder Interview", owner: "Dr. Chen", status: "Open",     confidence: "Low" },
  { title: "Does D4 node contradict Framework v3?",     linked: "Flow Diagram · Framework v3",         owner: "Rohan",    status: "Assigned", confidence: "Medium" },
  { title: "Is March 15 deadline still confirmed?",     linked: "Stakeholder Interview 08:42",         owner: "Aditi",    status: "Open",     confidence: "High" },
];

const CW_PEOPLE = [
  { initials: "AR", name: "Aditi Sharma",  role: "Product Manager", tasks: 3, review: 1, access: "Shared context",     color: "#1E488F" },
  { initials: "RM", name: "Rohan Mehta",   role: "Engineer",        tasks: 2, blocked: 1, access: "Selected notes only", color: "#00804C" },
  { initials: "JC", name: "Jo Chen",       role: "Researcher",      tasks: 1, access: "Owner",                        color: "#74C365" },
];

const CW_CHANGES = [
  { file: "Design Brief — Q1 2025",     provider: "Google Docs", ago: "8 min ago",   by: "AR", status: "Needs analysis", affected: ["Decision Gateway insight","BRG-12"] },
  { file: "Component Library v4",       provider: "Figma",       ago: "2 hours ago", by: "RM", status: "Changed",        affected: ["Flow Diagram node"] },
];

const CW_TIMELINE = [
  { date: "Mar 8", label: "Source change detected", detail: "Design Brief changed and may affect sign-off ownership.", status: "Needs analysis", color: "#C0392B" },
  { date: "Mar 10", label: "Research synthesis checkpoint", detail: "Resolve 3 open questions before the handoff brief is shared.", status: "Upcoming", color: "#1E488F" },
  { date: "Mar 12", label: "Decision owner confirmation", detail: "BRG-12 is blocked until Aditi confirms final approval owner.", status: "Blocked", color: "#C0392B" },
  { date: "Mar 15", label: "Gateway redesign milestone", detail: "Rohan delivers staged disclosure update for review.", status: "On track", color: "#00804C" },
  { date: "Mar 20", label: "Alignment review", detail: "Compare NNG article with internal framework and add approved guidance to main context.", status: "Review", color: "#4A5200" },
];

const CW_TRACKING = [
  { label: "Project progress", value: "42%", helper: "2 of 5 milestones completed", color: "#00804C" },
  { label: "Blocked work", value: "2", helper: "Needs owner or source clarification", color: "#C0392B" },
  { label: "Context coverage", value: "71%", helper: "5 of 7 Map cards have source evidence", color: "#1E488F" },
  { label: "Review load", value: "1", helper: "Aditi has the next review handoff", color: "#4A5200" },
];
const MAP_TEMPLATES = ["Understanding Map","Project Timeline","Source Map","Decision Map","Work Map","Custom"];

const MAP_CARDS: InsightCard[] = [
  {
    id: "main",
    type: "main",
    title: "Decision gateway creates peak cognitive load",
    body: "The existing flow has 4–6 unnecessary load peaks, causing 34% drop-off at the decision point.",
    sources: ["pdf1", "vid1"],
    confidence: "confirmed",
  },
  {
    id: "must1",
    type: "must-know",
    title: "Timeline revised to March 15",
    body: "Dr. Chen confirmed a 2-week delay. The PDF still shows the old milestone date.",
    sources: ["aud1", "pdf1"],
    confidence: "confirmed",
  },
  {
    id: "must2",
    type: "must-know",
    title: "Decision Node D4 missing from framework",
    body: "The flow diagram shows a node that doesn't appear in the written framework — likely added after v3 was published.",
    sources: ["img1", "pdf1"],
    confidence: "inferred",
  },
  {
    id: "q1",
    type: "question",
    title: "Who owns sign-off on the gateway redesign?",
    body: "No source directly answers this. Needs stakeholder confirmation.",
    sources: [],
    confidence: "needs-info",
  },
  {
    id: "decision1",
    type: "decision",
    title: "Split into 3 sequential micro-decisions",
    body: "Chosen approach to reduce working memory load from 3± items to 1 per step.",
    sources: ["pdf1", "link1"],
    confidence: "confirmed",
  },
  {
    id: "risk1",
    type: "risk",
    title: "NNG article may post-date framework assumptions",
    body: "External reference was published after framework v3. Check alignment with internal standards.",
    sources: ["link1"],
    confidence: "inferred",
  },
  {
    id: "action1",
    type: "action",
    title: "Redesign decision gateway by March 15",
    body: "Replace simultaneous 3-criteria presentation with staged disclosure model.",
    sources: ["aud1"],
    confidence: "confirmed",
  },
];

const CARD_CONFIG = {
  main: { label: "Main Idea", color: "#001F3F", bg: "rgba(0,31,63,0.06)", icon: Lightbulb },
  "must-know": { label: "Must Know", color: "#00804C", bg: "rgba(0,128,76,0.07)", icon: Star },
  question: { label: "Open Question", color: "#1E488F", bg: "rgba(30,72,143,0.06)", icon: HelpCircle },
  decision: { label: "Decision", color: "#5C6B5A", bg: "rgba(92,107,90,0.07)", icon: Target },
  risk: { label: "Risk", color: "#C0392B", bg: "rgba(192,57,43,0.07)", icon: AlertTriangle },
  action: { label: "Next Action", color: "#DBE64C", bg: "rgba(219,230,76,0.2)", icon: ArrowRight, darkText: true },
};

const PROCESSING_MSGS = ["Updating…", "Map refreshed", "3 gaps found", "Reading new source…", "Timeline updated"];

const CANVAS_TITLES: Record<string, string> = {
  "product-handoff": "Product Handoff — Cognitive Assessment Flow",
  "client-brief": "Client Brief — Brand Direction",
  "research-notes": "Research Notes — Tier 2 Restaurants",
  new: "Untitled Bridge",
};

// ─── Source Rail Item ───────────────────────────────────────────────────────

function SourceRailItem({
  source,
  selected,
  onClick,
}: {
  source: Source;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = SOURCE_ICONS[source.type];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all hover:bg-sidebar-accent"
      style={{
        background: selected ? "var(--sidebar-accent)" : "transparent",
        borderLeft: selected ? `2px solid ${source.color}` : "2px solid transparent",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: source.color + "18" }}
      >
        <Icon size={13} style={{ color: source.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate" style={{ fontSize: "0.78rem", fontWeight: 500, lineHeight: 1.3 }}>
          {source.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {source.status === "updating" ? (
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1 h-1 rounded-full animate-bounce" style={{ background: source.color, animationDelay: `${i * 0.12}s` }} />
              ))}
            </span>
          ) : (
            <span style={{ fontSize: "0.67rem", color: source.isNew ? "#00804C" : "var(--muted-foreground)", fontWeight: source.isNew ? 600 : 400 }}>
              {source.isNew ? "New" : source.meta}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Source Chip ────────────────────────────────────────────────────────────

function SourceChip({ sourceId, onSelect }: { sourceId: string; onSelect: (id: string) => void }) {
  const src = SOURCES.find((s) => s.id === sourceId);
  if (!src) return null;
  const Icon = SOURCE_ICONS[src.type];
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(sourceId); }}
      className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-border hover:bg-secondary transition-colors"
      style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--muted-foreground)" }}
    >
      <Icon size={9} style={{ color: src.color }} />
      {src.type === "pdf" ? "PDF" : src.type.charAt(0).toUpperCase() + src.type.slice(1)}
    </button>
  );
}

// ─── Map Insight Card ────────────────────────────────────────────────────────

function InsightCardItem({
  card,
  onSelect,
  onSourceSelect,
}: {
  card: InsightCard;
  onSelect: (id: string) => void;
  onSourceSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = CARD_CONFIG[card.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(card.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col gap-2.5 p-4 rounded-2xl border cursor-pointer transition-all"
      style={{
        background: cfg.bg,
        borderColor: hovered ? cfg.color + "40" : cfg.color + "18",
        boxShadow: hovered ? `0 4px 16px ${cfg.color}14` : "none",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={12} style={{ color: cfg.color }} />
          <span
            style={{
              fontSize: "0.67rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>
        </div>
        {card.confidence === "inferred" && (
          <span style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>inferred</span>
        )}
        {card.confidence === "needs-info" && (
          <span style={{ fontSize: "0.62rem", color: "#C0392B" }}>needs info</span>
        )}
      </div>

      <p style={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.4 }}>{card.title}</p>
      <p style={{ fontSize: "0.8rem", lineHeight: 1.55, color: "var(--muted-foreground)" }}>{card.body}</p>

      {card.sources.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {card.sources.map((sid) => (
            <SourceChip key={sid} sourceId={sid} onSelect={onSourceSelect} />
          ))}
        </div>
      )}

      {hovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-1.5"
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:bg-card transition-colors"
            style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}
          >
            <MessageCircle size={10} />
            Add note
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:bg-card transition-colors"
            style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}
          >
            <ArrowUpRight size={10} />
            Open source
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Map Source Shelf ─────────────────────────────────────────────────────────

// ─── Connect Source Modal ─────────────────────────────────────────────────────

function ConnectSourceModal({ onClose }: { onClose: () => void }) {
  const services = [
    { label: "Upload file",        icon: Upload,    color: "#001F3F" },
    { label: "Google Drive",       icon: Globe,     color: "#4285F4" },
    { label: "Google Docs",        icon: FileText,  color: "#4285F4" },
    { label: "Google Sheets",      icon: FileText,  color: "#34A853" },
    { label: "Google Slides",      icon: FileText,  color: "#FBBC05" },
    { label: "Microsoft OneDrive", icon: Globe,     color: "#0078D4" },
    { label: "Microsoft Word",     icon: FileText,  color: "#2B579A" },
    { label: "Microsoft Excel",    icon: FileText,  color: "#217346" },
    { label: "PowerPoint",         icon: FileText,  color: "#D24726" },
    { label: "Figma file",         icon: Image,     color: "#F24E1E" },
    { label: "Link",               icon: Link2,     color: "#5C6B5A" },
    { label: "Video",              icon: Video,     color: "#00804C" },
    { label: "Audio",              icon: AudioLines,color: "#74C365" },
  ];
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 24px 64px rgba(0,31,63,0.18)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p style={{ fontWeight: 700, fontSize: "1rem" }}>Connect a source</p>
          <button onClick={onClose} className="hover:bg-secondary rounded-lg p-1.5 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={15} /></button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-1.5">
            {services.map(svc => (
              <button key={svc.label} onClick={onClose} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-left">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: svc.color + "18" }}>
                  <svc.icon size={13} style={{ color: svc.color }} />
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{svc.label}</span>
              </button>
            ))}
          </div>
          <div className="rounded-xl p-3 border border-border" style={{ background: "var(--secondary)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8 }}>Analysis setting</p>
            {["Analyze now","Only analyze when I ask","Watch for changes","Require approval before adding to context"].map((opt, i) => (
              <label key={opt} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: i === 0 ? "#001F3F" : "var(--border)" }}>
                  {i === 0 && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#001F3F" }} />}
                </div>
                <span style={{ fontSize: "0.78rem" }}>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Connected Sources Section ────────────────────────────────────────────────

function ConnectedSourcesSection({ onSourceSelect }: { onSourceSelect: (id: string) => void }) {
  const [ctxMenu, setCtxMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [showConnect, setShowConnect] = useState(false);

  function StatusChip({ status, id }: { status: ConnectedSource["status"]; id: string }) {
    if (analyzing === id) return (
      <span className="flex items-center gap-1" style={{ fontSize: "0.58rem", fontWeight: 600, color: "#1E488F", background: "rgba(30,72,143,0.1)", padding: "1px 6px", borderRadius: 99 }}>
        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" style={{ flexShrink: 0 }} />Analyzing
      </span>
    );
    if (status === "live") return (
      <span className="flex items-center gap-1" style={{ fontSize: "0.58rem", fontWeight: 700, color: "#00804C", background: "rgba(0,128,76,0.1)", padding: "1px 6px", borderRadius: 99 }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block flex-shrink-0" style={{ background: "#00804C" }} />Live
      </span>
    );
    if (status === "changed") return <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#C0392B", background: "rgba(192,57,43,0.1)", padding: "1px 6px", borderRadius: 99 }}>Changed</span>;
    if (status === "needs-analysis") return <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "var(--muted-foreground)", background: "var(--secondary)", padding: "1px 6px", borderRadius: 99, border: "1px solid var(--border)" }}>Needs analysis</span>;
    return <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "#5C6B5A", background: "var(--secondary)", padding: "1px 6px", borderRadius: 99 }}>Synced</span>;
  }

  const providerIcon = (p: string): React.ElementType =>
    p === "Google Sheets" || p === "Google Drive" ? Globe : p === "Figma" ? Image : FileText;

  return (
    <div className="flex-shrink-0 border-b border-border" style={{ background: "var(--card)" }}>
      <div className="flex items-center justify-between px-8 pt-2 pb-1">
        <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>Connected Sources</p>
        <button onClick={() => setShowConnect(true)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
          <Plus size={11} />Connect source
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-8 pb-2" style={{ scrollbarWidth: "thin", scrollSnapType: "x proximity" }}>
        {CONNECTED_SOURCES.map(src => {
          const Icon = providerIcon(src.provider);
          return (
            <div
              key={src.id}
              onClick={() => onSourceSelect(src.id)}
              onContextMenu={e => { e.preventDefault(); setCtxMenu({ id: src.id, x: e.clientX, y: e.clientY }); }}
              className="flex-shrink-0 flex flex-col gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-secondary hover:-translate-y-px transition-all cursor-pointer"
              style={{ background: "var(--background)", width: 250, minHeight: 72, scrollSnapAlign: "start" }}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: src.color + "18" }}>
                    <Icon size={11} style={{ color: src.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate" style={{ fontSize: "0.73rem", fontWeight: 600, lineHeight: 1.2, maxWidth: 150 }}>
                      {src.title.length > 28 ? src.title.slice(0, 27) + "…" : src.title}
                    </p>
                    <p style={{ fontSize: "0.6rem", color: "var(--muted-foreground)" }}>{src.provider}</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#001F3F", fontSize: "0.52rem", fontWeight: 700, color: "#fff" }}>{src.owner}</div>
              </div>
              <div className="flex items-center justify-between gap-1">
                <StatusChip status={src.status} id={src.id} />
                <span style={{ fontSize: "0.58rem", color: "var(--muted-foreground)" }}>{src.lastUpdated}</span>
              </div>
              {src.status === "changed" && analyzing !== src.id && (
                <button onClick={e => { e.stopPropagation(); setAnalyzing(src.id); setTimeout(() => setAnalyzing(null), 2400); }} className="w-full px-2 py-0.5 rounded-lg hover:opacity-90 transition-all" style={{ fontSize: "0.62rem", fontWeight: 700, background: "#001F3F", color: "#DBE64C", textAlign: "center" }}>
                  Analyze changes
                </button>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {ctxMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setCtxMenu(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.12 }} className="fixed z-50 rounded-xl border border-border overflow-hidden" style={{ left: ctxMenu.x, top: ctxMenu.y, background: "var(--card)", boxShadow: "0 8px 32px rgba(0,31,63,0.14)", minWidth: 200 }}>
              {[["Analyze changes","Open source","Open in Workspace","Add to Map","Add to main context","Keep as reference"],["Assign follow-up","Add comment","Mark private"],["View version history","Disconnect source"]].map((grp, gi) => (
                <div key={gi} className={gi > 0 ? "border-t border-border" : ""}>
                  {grp.map(item => (
                    <button key={item} onClick={() => setCtxMenu(null)} className="w-full flex items-center px-4 py-2 hover:bg-secondary transition-colors text-left" style={{ fontSize: "0.8rem", fontWeight: 500, color: item === "Disconnect source" ? "#C0392B" : "var(--foreground)" }}>{item}</button>
                  ))}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>{showConnect && <ConnectSourceModal onClose={() => setShowConnect(false)} />}</AnimatePresence>
    </div>
  );
}

// ─── Sources Sidebar (unified left panel) ─────────────────────────────────────

function SourcesSidebar({
  open,
  onToggle,
  onSourceSelect,
  onConnectSource,
}: {
  open: boolean;
  onToggle: () => void;
  onSourceSelect: (id: string) => void;
  onConnectSource: () => void;
}) {
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const providerIcon = (p: string): React.ElementType =>
    p === "Google Sheets" || p === "Google Drive" ? Globe : p === "Figma" ? Image : FileText;

  function StatusBadge({ status, id }: { status: ConnectedSource["status"]; id: string }) {
    if (analyzing === id) return (
      <span className="flex items-center gap-1" style={{ fontSize: "0.58rem", fontWeight: 600, color: "#1E488F", background: "rgba(30,72,143,0.1)", padding: "1px 6px", borderRadius: 99 }}>
        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" style={{ flexShrink: 0 }} />Analyzing
      </span>
    );
    if (status === "live") return (
      <span className="flex items-center gap-1" style={{ fontSize: "0.58rem", fontWeight: 700, color: "#00804C", background: "rgba(0,128,76,0.1)", padding: "1px 6px", borderRadius: 99 }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block flex-shrink-0" style={{ background: "#00804C" }} />Live
      </span>
    );
    if (status === "changed") return <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#C0392B", background: "rgba(192,57,43,0.1)", padding: "1px 6px", borderRadius: 99 }}>Changed</span>;
    if (status === "needs-analysis") return <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "var(--muted-foreground)", background: "var(--secondary)", padding: "1px 6px", borderRadius: 99, border: "1px solid var(--border)" }}>Needs analysis</span>;
    return <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "#5C6B5A", background: "var(--secondary)", padding: "1px 6px", borderRadius: 99 }}>Synced</span>;
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 230, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="border-r border-border flex flex-col flex-shrink-0 overflow-hidden"
          style={{ background: "var(--sidebar)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-sidebar-border flex-shrink-0" style={{ minWidth: 230 }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>Connected Sources</p>
            <button onClick={onToggle} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors" style={{ color: "var(--muted-foreground)" }}>
              <ChevronLeft size={12} />
            </button>
          </div>

          {/* Connect source button */}
          <div className="px-2.5 pt-2.5 pb-1" style={{ minWidth: 230 }}>
            <button onClick={onConnectSource} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed hover:bg-sidebar-accent transition-colors" style={{ borderColor: "var(--sidebar-border)", fontSize: "0.72rem", fontWeight: 600, color: "var(--muted-foreground)" }}>
              <Plus size={11} />Connect source
            </button>
          </div>

          {/* Source list */}
          <div className="flex-1 overflow-y-auto px-1.5 pb-3" style={{ minWidth: 230, scrollbarWidth: "thin" }}>
            {CONNECTED_SOURCES.map(src => {
              const Icon = providerIcon(src.provider);
              return (
                <button
                  key={src.id}
                  onClick={() => onSourceSelect(src.id)}
                  className="w-full flex flex-col gap-1.5 px-2.5 py-2.5 rounded-xl text-left transition-all hover:bg-sidebar-accent"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: src.color + "18" }}>
                      <Icon size={11} style={{ color: src.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{ fontSize: "0.73rem", fontWeight: 600, lineHeight: 1.2 }}>
                        {src.title.length > 22 ? src.title.slice(0, 21) + "…" : src.title}
                      </p>
                      <p style={{ fontSize: "0.6rem", color: "var(--muted-foreground)" }}>{src.provider}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#001F3F", fontSize: "0.48rem", fontWeight: 700, color: "#fff" }}>{src.owner}</div>
                  </div>
                  <div className="flex items-center justify-between gap-1 pl-8">
                    <StatusBadge status={src.status} id={src.id} />
                    <span style={{ fontSize: "0.55rem", color: "var(--muted-foreground)" }}>{src.lastUpdated}</span>
                  </div>
                  {src.status === "changed" && analyzing !== src.id && (
                    <button
                      onClick={e => { e.stopPropagation(); setAnalyzing(src.id); setTimeout(() => setAnalyzing(null), 2400); }}
                      className="ml-8 px-2 py-0.5 rounded-lg hover:opacity-90 transition-all"
                      style={{ fontSize: "0.6rem", fontWeight: 700, background: "#001F3F", color: "#DBE64C", textAlign: "center" }}
                    >
                      Analyze changes
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── Source Document Slide-In ──────────────────────────────────────────────────

function SourceDocumentSlideIn({
  sourceId,
  onClose,
  onAnnotate,
}: {
  sourceId: string;
  onClose: () => void;
  onAnnotate: (msg: string) => void;
}) {
  const source = CONNECTED_SOURCES.find(s => s.id === sourceId) || SOURCES.find(s => s.id === sourceId);
  if (!source) return null;

  const providerIcon = (p: string): React.ElementType =>
    p === "Google Sheets" || p === "Google Drive" ? Globe : p === "Figma" ? Image : FileText;

  // Determine source type from SOURCES data or infer from connected source
  const srcData = SOURCES.find(s => s.id === sourceId);
  const sourceType = srcData?.type || ("provider" in source ? "note" : "note");

  const SOURCE_ICONS: Record<string, React.ElementType> = {
    pdf: FileText, video: Video, audio: AudioLines, image: Image, note: StickyNote, link: Globe,
  };
  const iconColor = srcData?.color || ("color" in source ? (source as ConnectedSource).color : "#5C6B5A");
  const Icon = SOURCE_ICONS[sourceType] || FileText;

  return (
    <motion.aside
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="w-[420px] flex-shrink-0 border-l border-border flex flex-col"
      style={{ background: "var(--card)", boxShadow: "-4px 0 24px rgba(0,31,63,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconColor + "18" }}>
            <Icon size={14} style={{ color: iconColor }} />
          </div>
          <div className="min-w-0">
            <p className="truncate" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {"title" in source ? source.title : "Source"}
            </p>
            {"meta" in source && (
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{(source as any).meta}</p>
            )}
            {"provider" in source && (
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{(source as ConnectedSource).provider}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
            <ArrowUpRight size={11} />Open
          </button>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors" style={{ color: "var(--muted-foreground)" }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Source action bar */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border flex-shrink-0">
        {[
          { icon: Highlighter, label: "Highlight" },
          { icon: StickyNote, label: "Sticky note" },
          { icon: Lightbulb, label: "Explain" },
          { icon: GitBranch, label: "Add to Map" },
        ].map(a => (
          <button key={a.label} onClick={() => onAnnotate(a.label)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
            <a.icon size={12} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Document content (scrollable) */}
      <div className="flex-1 overflow-y-auto">
        {sourceType === "pdf" && (
          <div className="p-5 flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map(page => (
              <div key={page} className="rounded-xl border border-border p-5" style={{ background: "var(--background)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--muted-foreground)" }}>Page {page}</span>
                  {page === 14 && <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#4A5200", background: "rgba(219,230,76,0.3)", padding: "1px 6px", borderRadius: 99 }}>Highlighted</span>}
                </div>
                <div className="flex flex-col gap-2">
                  {[92, 85, 78, 90, 65, 80, 72].map((w, i) => (
                    <div key={i} style={{ height: 6, borderRadius: 3, width: `${w}%`, background: (page === 14 && (i === 2 || i === 3)) ? "rgba(219,230,76,0.55)" : "var(--muted-foreground)", opacity: (page === 14 && (i === 2 || i === 3)) ? 0.7 : 0.12 }} />
                  ))}
                </div>
                {page === 14 && (
                  <p style={{ fontSize: "0.78rem", lineHeight: 1.6, marginTop: 12, color: "var(--foreground)", fontStyle: "italic" }}>
                    "The primary cognitive load peak occurs at the decision gateway, where users must simultaneously process three competing criteria…"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {sourceType === "audio" && (
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <button className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#001F3F" }}>
                <Play size={14} style={{ color: "#DBE64C", marginLeft: 1 }} />
              </button>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: "35%", background: "#74C365" }} />
              </div>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>18:05</span>
            </div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginTop: 8 }}>Transcript</p>
            {[
              { time: "00:00", text: "Let's discuss the assessment framework updates. The design team has concerns about the decision gateway." },
              { time: "02:15", text: "The main issue is cognitive load — users are overwhelmed when all three criteria appear simultaneously." },
              { time: "08:42", text: "We've pushed to March 15th. The engineering team needs two more weeks for the gateway component specifically." },
              { time: "14:30", text: "Staged disclosure is the preferred approach. We show one criterion at a time with progressive reveal." },
            ].map(seg => (
              <div key={seg.time} className="flex gap-3 py-2 border-b border-border last:border-0">
                <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", flexShrink: 0, paddingTop: 2 }}>{seg.time}</span>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>{seg.text}</p>
              </div>
            ))}
          </div>
        )}

        {sourceType === "video" && (
          <div className="flex flex-col">
            <div className="relative flex items-center justify-center" style={{ height: 220, background: "linear-gradient(135deg,#0A1A10 0%,#1A3A28 100%)" }}>
              <button className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)" }}>
                <Play size={22} style={{ color: "#fff", marginLeft: 2 }} />
              </button>
              <div className="absolute bottom-3 left-4 right-4 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                <div className="h-full rounded-full" style={{ width: "25%", background: "#00804C" }} />
              </div>
            </div>
            <div className="p-5">
              <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 12 }}>Key moments</p>
              {[
                { time: "02:15", label: "Cognitive load discussion" },
                { time: "12:40", label: "Gateway component demo" },
                { time: "24:10", label: "Staged disclosure proposal" },
              ].map(m => (
                <button key={m.time} className="w-full flex items-center gap-3 py-2.5 border-b border-border last:border-0 hover:bg-secondary transition-colors text-left rounded-lg px-2">
                  <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "#00804C", fontWeight: 600 }}>{m.time}</span>
                  <span style={{ fontSize: "0.82rem" }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(sourceType === "image" || sourceType === "note" || sourceType === "link") && (
          <div className="p-5">
            <div className="rounded-xl border border-border p-5" style={{ background: "var(--background)" }}>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "var(--foreground)" }}>
                {sourceType === "image" && "Flow diagram showing the decision gateway process with nodes D1-D4. Node D4 appears in the diagram but is absent from Framework v3, suggesting a scope change that hasn't been documented."}
                {sourceType === "note" && "Key pattern from all sources: the decision gateway consistently produces the longest hesitation times. The simultaneity of criteria is the core problem — not individual criteria complexity."}
                {sourceType === "link" && "Nielsen Norman Group's research on cognitive load in UX directly supports the staged disclosure approach. Their studies show that presenting 1 option at a time reduces decision latency by 64% compared to simultaneous presentation of 3+ options."}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

function CreateTaskModal({ onClose, prefill }: { onClose: () => void; prefill?: string }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("AR");
  const [status, setStatus] = useState("To do");
  const [priority, setPriority] = useState("Medium");
  const [visibility, setVisibility] = useState("Share with assignee");

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 24px 64px rgba(0,31,63,0.18)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Create context task</p>
          <button onClick={onClose} className="hover:bg-secondary rounded-lg p-1.5 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={15} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Task title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Describe the work…" autoFocus className="w-full px-3 py-2 rounded-xl border border-border outline-none" style={{ fontSize: "0.875rem", background: "var(--input-background)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Assign to</label>
              <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border outline-none" style={{ fontSize: "0.875rem", background: "var(--input-background)" }}>
                {["AR — Aditi","RM — Rohan","JC — Jo"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border outline-none" style={{ fontSize: "0.875rem", background: "var(--input-background)" }}>
                {["Low","Medium","High","Critical"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          {prefill && (
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Linked context</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border" style={{ background: "var(--secondary)" }}>
                <GitBranch size={12} style={{ color: "#1E488F", flexShrink: 0 }} />
                <span style={{ fontSize: "0.8rem", color: "var(--foreground)" }}>{prefill}</span>
              </div>
            </div>
          )}
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Visibility</label>
            <div className="flex flex-col gap-1.5">
              {["Private","Share with assignee","Share with group","Add to main Bridge context"].map(opt => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: visibility === opt ? "#001F3F" : "var(--border)" }}>
                    {visibility === opt && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#001F3F" }} />}
                  </div>
                  <span style={{ fontSize: "0.8rem" }} onClick={() => setVisibility(opt)}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl transition-all hover:opacity-90" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.9rem", fontWeight: 700 }}>
            Create task
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Context Work Drawer ──────────────────────────────────────────────────────

function ContextWorkDrawer({ onClose, initialTab = "Tasks" }: { onClose: () => void; initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const [createTask, setCreateTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState<string | null>(null);

  const statusColor = (s: string) => {
    if (s === "Blocked") return { bg: "rgba(192,57,43,0.12)", color: "#C0392B" };
    if (s === "In progress") return { bg: "rgba(0,128,76,0.12)", color: "#00804C" };
    if (s === "Needs review") return { bg: "rgba(219,230,76,0.25)", color: "#4A5200" };
    if (s === "Done") return { bg: "rgba(92,107,90,0.12)", color: "#5C6B5A" };
    return { bg: "var(--secondary)", color: "var(--muted-foreground)" };
  };
  const priorityColor = (p: string) => p === "Critical" || p === "High" ? "#C0392B" : p === "Medium" ? "#DBE64C" : "#5C6B5A";

  const tabs = ["Tasks","Questions","People","Changes"];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30" onClick={onClose} />
      <motion.aside
        initial={{ x: 340, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 340, opacity: 0 }}
        transition={{ duration: 0.26, ease: [0.16,1,0.3,1] }}
        className="fixed right-0 top-0 bottom-0 z-40 flex flex-col border-l border-border"
        style={{ width: 340, background: "var(--card)", boxShadow: "-4px 0 24px rgba(0,31,63,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Context Work</p>
            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: 2, lineHeight: 1.4 }}>Work linked to this Bridge's sources, questions, and decisions.</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCreateTask("New task")} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
              <Plus size={11} />New task
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={14} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-border flex-shrink-0" style={{ paddingLeft: 20, paddingRight: 20 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className="py-2.5 px-1 mr-4 transition-colors" style={{ fontSize: "0.78rem", fontWeight: tab === t ? 700 : 400, color: tab === t ? "var(--foreground)" : "var(--muted-foreground)", borderBottom: tab === t ? "2px solid #001F3F" : "2px solid transparent" }}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">

          {/* ── TASKS ── */}
          {tab === "Tasks" && CW_TASKS.map(task => {
            const sc = statusColor(task.status);
            const isSelected = selectedTask === task.key;
            return (
              <div key={task.key} className="rounded-xl border border-border overflow-hidden" style={{ background: "var(--background)" }}>
                <div className="w-full text-left p-3 cursor-pointer" onClick={() => setSelectedTask(isSelected ? null : task.key)}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{task.key}</span>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: priorityColor(task.priority) }}>↑ {task.priority}</span>
                      <button onClick={e => { e.stopPropagation(); setStatusOpen(statusOpen === task.key ? null : task.key); }} className="relative">
                        <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: sc.bg, color: sc.color }}>{task.status}</span>
                        <AnimatePresence>
                          {statusOpen === task.key && (
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-5 z-10 rounded-xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 4px 16px rgba(0,31,63,0.12)", minWidth: 130 }}>
                              {["To do","In progress","Waiting","Blocked","Needs review","Done"].map(s => (
                                <button key={s} onClick={e => { e.stopPropagation(); setStatusOpen(null); }} className="w-full text-left px-3 py-1.5 hover:bg-secondary transition-colors" style={{ fontSize: "0.75rem" }}>{s}</button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.35, marginBottom: 8 }}>{task.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#001F3F", fontSize: "0.48rem", fontWeight: 700, color: "#fff" }}>{task.assignee}</div>
                    </div>
                    <span style={{ fontSize: "0.62rem", color: "var(--muted-foreground)" }}>Due {task.due}</span>
                    <span style={{ fontSize: "0.62rem", padding: "1px 6px", borderRadius: 4, background: "rgba(30,72,143,0.08)", color: "#1E488F", border: "1px solid rgba(30,72,143,0.18)" }}>
                      {task.linked.length > 28 ? task.linked.slice(0,27)+"…" : task.linked}
                    </span>
                  </div>
                </div>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                      <div className="p-3 flex flex-col gap-2">
                        <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginBottom: 2 }}>
                          Visibility: <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{task.visibility}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {["Open context","Change status","Reassign","Comment","Mark done"].map(a => (
                            <button key={a} className="px-2 py-0.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--muted-foreground)" }}>{a}</button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* ── QUESTIONS ── */}
          {tab === "Questions" && CW_QUESTIONS.map(q => (
            <div key={q.title} className="rounded-xl border border-border p-3" style={{ background: "var(--background)" }}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: q.status === "Open" ? "rgba(192,57,43,0.1)" : "rgba(0,128,76,0.1)", color: q.status === "Open" ? "#C0392B" : "#00804C" }}>{q.status}</span>
                <span style={{ fontSize: "0.62rem", color: "var(--muted-foreground)" }}>Confidence: {q.confidence}</span>
              </div>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.4, marginBottom: 6 }}>{q.title}</p>
              <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginBottom: 8 }}>{q.linked}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#001F3F", fontSize: "0.48rem", fontWeight: 700, color: "#fff" }}>{q.owner.slice(0,2).toUpperCase()}</div>
                  <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{q.owner}</span>
                </div>
                <div className="flex gap-1">
                  {["Ask Bridge","Assign as task","Resolve"].map(a => (
                    <button key={a} onClick={a === "Assign as task" ? () => setCreateTask(`Open Question — ${q.title.slice(0,30)}`) : undefined} className="px-2 py-0.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.62rem", fontWeight: 500, color: "var(--muted-foreground)" }}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* ── PEOPLE ── */}
          {tab === "People" && CW_PEOPLE.map(person => (
            <div key={person.name} className="rounded-xl border border-border p-3" style={{ background: "var(--background)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: person.color, fontSize: "0.65rem", fontWeight: 700, color: "#fff" }}>{person.initials}</div>
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600 }}>{person.name}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{person.role}</p>
                </div>
                <span style={{ marginLeft: "auto", fontSize: "0.6rem", fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>{person.access}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {person.tasks && <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#5C6B5A", background: "rgba(92,107,90,0.1)", padding: "1px 7px", borderRadius: 99 }}>{person.tasks} tasks</span>}
                {person.review && <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#4A5200", background: "rgba(219,230,76,0.2)", padding: "1px 7px", borderRadius: 99 }}>{person.review} review</span>}
                {person.blocked && <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#C0392B", background: "rgba(192,57,43,0.1)", padding: "1px 7px", borderRadius: 99 }}>{person.blocked} blocked</span>}
              </div>
              <div className="flex gap-1">
                {["View context","Assign task","Share context"].map(a => (
                  <button key={a} className="px-2 py-0.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.62rem", fontWeight: 500, color: "var(--muted-foreground)" }}>{a}</button>
                ))}
              </div>
            </div>
          ))}

          {/* ── CHANGES ── */}
          {tab === "Changes" && CW_CHANGES.map(ch => (
            <div key={ch.file} className="rounded-xl border border-border p-3" style={{ background: "var(--background)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.3 }}>{ch.file}</p>
                  <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>{ch.provider} · {ch.ago} · by {ch.by}</p>
                </div>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: ch.status === "Needs analysis" ? "rgba(192,57,43,0.1)" : "rgba(219,230,76,0.2)", color: ch.status === "Needs analysis" ? "#C0392B" : "#4A5200", flexShrink: 0 }}>{ch.status}</span>
              </div>
              <div className="flex flex-col gap-1 mb-3">
                {ch.affected.map(a => (
                  <div key={a} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--muted-foreground)" }} />
                    <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{a}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {["Analyze changes","Create task","Ignore"].map(a => (
                  <button key={a} onClick={a === "Create task" ? () => setCreateTask(`Change: ${ch.file}`) : undefined} className="px-2 py-1 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.65rem", fontWeight: a === "Analyze changes" ? 700 : 500, background: a === "Analyze changes" ? "#001F3F" : "transparent", color: a === "Analyze changes" ? "#DBE64C" : "var(--muted-foreground)", borderColor: a === "Analyze changes" ? "#001F3F" : "var(--border)" }}>{a}</button>
                ))}
              </div>
            </div>
          ))}

        </div>
      </motion.aside>

      <AnimatePresence>{createTask !== null && <CreateTaskModal onClose={() => setCreateTask(null)} prefill={createTask} />}</AnimatePresence>
    </>
  );
}

// ─── Context Work Strip ───────────────────────────────────────────────────────

function ContextWorkStrip() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("Tasks");

  return (
    <div className="flex-shrink-0 border-b border-border px-8 py-2.5" style={{ background: "var(--card)" }}>
      <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", flexShrink: 0 }}>Context Work</span>
        <div className="w-px h-3.5 bg-border flex-shrink-0" />
        {CW_CHIPS.map(chip => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.label}
              onClick={() => { setDrawerOpen(true); setDrawerTab(chip.label.includes("Task") ? "Tasks" : chip.label.includes("Question") ? "Questions" : chip.label.includes("Change") ? "Changes" : "Tasks"); }}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors hover:bg-secondary"
              style={{ fontSize: "0.72rem", fontWeight: 600, color: chip.color, background: chip.color + "0D", borderColor: chip.color + "28" }}
            >
              <Icon size={11} style={{ color: chip.color }} />
              {chip.label}
            </button>
          );
        })}
        <button onClick={() => setDrawerOpen(true)} className="ml-auto flex-shrink-0 px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
          View all
        </button>
      </div>

      <AnimatePresence>{drawerOpen && <ContextWorkDrawer onClose={() => setDrawerOpen(false)} initialTab={drawerTab} />}</AnimatePresence>
    </div>
  );
}

// ─── Map Mode ────────────────────────────────────────────────────────────────

function MapMode({
  onCardSelect,
  onSourceSelect,
}: {
  onCardSelect: (id: string) => void;
  onSourceSelect: (id: string) => void;
}) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("Understanding Map");
  const [cardCtx, setCardCtx] = useState<{ x: number; y: number } | null>(null);

  const groups = [
    { label: "Key findings", ids: ["main", "must1", "must2"] },
    { label: "Open questions & decisions", ids: ["q1", "decision1"] },
    { label: "Risks & next actions", ids: ["risk1", "action1"] },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>Understanding</p>
            <div className="relative">
              <button onClick={() => setTemplateOpen(o => !o)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                <Map size={11} />View: {activeTemplate}
                <ChevronRight size={10} style={{ transform: templateOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
              </button>
              <AnimatePresence>
                {templateOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setTemplateOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.97, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.12 }} className="absolute right-0 top-8 z-20 rounded-xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 8px 32px rgba(0,31,63,0.12)", minWidth: 188 }}>
                      {MAP_TEMPLATES.map(t => (
                        <button key={t} onClick={() => { setActiveTemplate(t); setTemplateOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary transition-colors text-left" style={{ fontSize: "0.8rem", fontWeight: activeTemplate === t ? 600 : 400 }}>
                          {t}{activeTemplate === t && <Check size={12} style={{ color: "#00804C" }} />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.label}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", marginBottom: 12 }}>{group.label}</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))` }}>
                {MAP_CARDS.filter((c) => group.ids.includes(c.id)).map((card) => (
                  <div key={card.id} onContextMenu={e => { e.preventDefault(); setCardCtx({ x: e.clientX, y: e.clientY }); }}>
                    <InsightCardItem card={card} onSelect={onCardSelect} onSourceSelect={onSourceSelect} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {cardCtx && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setCardCtx(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.12 }} className="fixed z-50 rounded-xl border border-border overflow-hidden" style={{ left: cardCtx.x, top: cardCtx.y, background: "var(--card)", boxShadow: "0 8px 32px rgba(0,31,63,0.14)", minWidth: 210 }}>
              {[["View evidence","Open in Workspace","Ask Bridge"],["Create context task","Assign to person","Add comment","Mark as blocked"],["Create audio explainer","Create video explainer"],["Add to main context","Remove from context"]].map((grp, gi) => (
                <div key={gi} className={gi > 0 ? "border-t border-border" : ""}>
                  {grp.map(item => (
                    <button key={item} onClick={() => setCardCtx(null)} className="w-full flex items-center px-4 py-2 hover:bg-secondary transition-colors text-left" style={{ fontSize: "0.8rem", fontWeight: 500, color: item === "Remove from context" ? "#C0392B" : "var(--foreground)" }}>{item}</button>
                  ))}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Timeline Mode ──────────────────────────────────────────────────────────

const TIMELINE_ITEMS = [
  { date: "Jan 14, 2025", event: "Assessment Framework v3 published", detail: "24-page document outlining the cognitive assessment methodology and decision gateway process.", source: "pdf1", type: "upload", color: "#1E488F" },
  { date: "Feb 3, 2025", event: "UX Research Session recorded", detail: "34 participants. Key finding: 8.3s average hesitation at decision gateway. 34% drop-off.", source: "vid1", type: "meeting", color: "#00804C" },
  { date: "Feb 10, 2025", event: "Stakeholder interview — timeline revised", detail: "Dr. Chen confirmed delivery date moved to March 15. Reason: resourcing delay on engineering side.", source: "aud1", type: "decision", color: "#74C365" },
  { date: "Feb 18, 2025", event: "Flow Diagram updated — Node D4 added", detail: "Diagram now includes Decision Node D4, which does not appear in Framework v3. Possible documentation gap.", source: "img1", type: "conflict", color: "#C0392B" },
  { date: "Feb 20, 2025", event: "Research note added", detail: "User added key findings summary based on all materials reviewed.", source: "note1", type: "note", color: "#001F3F" },
  { date: "Today", event: "Map last updated — 3 gaps found", detail: "Bridge identified 3 open questions. Decision gateway redesign plan confirmed. One conflict flagged.", source: null, type: "update", color: "#DBE64C" },
];

function TimelineMode({
  onItemSelect,
}: {
  onItemSelect: (sourceId: string | null, detail: string) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const TYPE_ICONS: Record<string, React.ElementType> = {
    upload: FileText,
    meeting: Video,
    decision: Target,
    conflict: AlertTriangle,
    note: StickyNote,
    update: Zap,
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: "var(--border)" }} />

          {TIMELINE_ITEMS.map((item, i) => {
            const Icon = TYPE_ICONS[item.type] || FileText;
            const isExpanded = expanded === i;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-5 mb-5 relative"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                  style={{
                    background: item.type === "update" ? "#DBE64C" : item.color + "18",
                    borderColor: "var(--background)",
                    zIndex: 1,
                  }}
                >
                  <Icon size={12} style={{ color: item.type === "update" ? "#001F3F" : item.color }} />
                </div>

                <div className="flex-1 pt-0.5">
                  <button
                    onClick={() => {
                      setExpanded(isExpanded ? null : i);
                      onItemSelect(item.source, item.detail);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3 group">
                      <div>
                        <p style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", marginBottom: 3 }}>
                          {item.date}
                        </p>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.4 }}>{item.event}</p>
                      </div>
                      <ChevronRight
                        size={14}
                        className="flex-shrink-0 mt-1 transition-transform"
                        style={{
                          color: "var(--muted-foreground)",
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 pb-1">
                          <p style={{ fontSize: "0.825rem", lineHeight: 1.65, color: "var(--muted-foreground)" }}>
                            {item.detail}
                          </p>
                          {item.source && (
                            <div className="mt-3 flex gap-2">
                              {(() => {
                                const src = SOURCES.find((s) => s.id === item.source);
                                if (!src) return null;
                                const SIcon = SOURCE_ICONS[src.type];
                                return (
                                  <button
                                    onClick={() => onItemSelect(item.source, item.detail)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition-colors"
                                    style={{ fontSize: "0.75rem", fontWeight: 500 }}
                                  >
                                    <SIcon size={11} style={{ color: src.color }} />
                                    {src.title.length > 30 ? src.title.slice(0, 29) + "…" : src.title}
                                  </button>
                                );
                              })()}
                              <button
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition-colors"
                                style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}
                              >
                                <MessageCircle size={11} />
                                Comment
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sources Mode ────────────────────────────────────────────────────────────

function PDFViewer({ onAnnotate }: { onAnnotate: (text: string) => void }) {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [stickyNotes, setStickyNotes] = useState<{ id: number; text: string; page: number }[]>([
    { id: 1, text: "Key claim — needs cross-reference with interview", page: 14 },
  ]);
  const paragraphs = [
    { page: 3, text: "The cognitive assessment process is designed to identify decision-making patterns across three distinct user archetypes: explorers, validators, and convergers." },
    { page: 14, text: "The primary cognitive load peak occurs at the decision gateway, where users must simultaneously process three competing criteria — urgency, confidence, and alignment. This co-occurrence creates measurable hesitation.", highlight: true },
    { page: 14, text: "Participants averaged 8.3 seconds at this node before making a selection, compared to 1.4 seconds at all other decision points in the assessment." },
    { page: 18, text: "Proposed mitigation: introduce a staged disclosure model where criteria are presented sequentially, reducing working memory load from 3±2 to 1 item at each step." },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4">
      {/* Action bar */}
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        {[
          { icon: Highlighter, label: "Highlight" },
          { icon: StickyNote, label: "Sticky note" },
          { icon: Lightbulb, label: "Explain this" },
          { icon: GitBranch, label: "Add to Map" },
          { icon: Bookmark, label: "Save quote" },
        ].map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{ fontSize: "0.775rem", fontWeight: 500, color: "var(--muted-foreground)" }}
            onClick={() => onAnnotate(action.label)}
          >
            <action.icon size={13} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Sticky notes */}
      {stickyNotes.map((note) => (
        <div
          key={note.id}
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl border-l-2"
          style={{ background: "rgba(219,230,76,0.15)", borderColor: "#DBE64C", fontSize: "0.8rem" }}
        >
          <StickyNote size={12} style={{ color: "#4A5200", marginTop: 2, flexShrink: 0 }} />
          <span>{note.text}</span>
          <span style={{ color: "var(--muted-foreground)", marginLeft: "auto", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
            p.{note.page}
          </span>
        </div>
      ))}

      {/* Pages */}
      <div
        className="rounded-2xl border border-border overflow-hidden"
        style={{ background: "var(--card)", boxShadow: "0 2px 12px rgba(0,31,63,0.06)" }}
      >
        {paragraphs.map((para, i) => (
          <div
            key={i}
            className="px-8 py-5 border-b border-border last:border-none"
          >
            <p style={{ fontSize: "0.67rem", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
              Page {para.page}
            </p>
            <p
              className="select-text"
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.75,
                background: para.highlight ? "rgba(219,230,76,0.28)" : "transparent",
                borderRadius: para.highlight ? 4 : 0,
                padding: para.highlight ? "2px 4px" : 0,
                margin: para.highlight ? "0 -4px" : 0,
              }}
            >
              {para.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoViewer({ onAnnotate }: { onAnnotate: (text: string) => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(38);

  const transcript = [
    { ts: "00:22:14", speaker: "Facilitator", text: "Let's look at the moment where participants made their decision. You can see the hesitation here — about 8 seconds on average." },
    { ts: "00:24:02", speaker: "Participant A", text: "I wasn't sure which of the three to pick first. They all felt equally important." },
    { ts: "00:25:40", speaker: "Facilitator", text: "That's exactly the pattern we're seeing across all groups. The simultaneity is the problem." },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
      {/* Action bar */}
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        {[
          { icon: Scissors, label: "Clip this" },
          { icon: Lightbulb, label: "Explain this moment" },
          { icon: GitBranch, label: "Add to Map" },
          { icon: StickyNote, label: "Timestamp note" },
        ].map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{ fontSize: "0.775rem", fontWeight: 500, color: "var(--muted-foreground)" }}
            onClick={() => onAnnotate(action.label)}
          >
            <action.icon size={13} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Video player simulation */}
      <div className="rounded-2xl overflow-hidden border border-border" style={{ background: "#0A1220" }}>
        <div
          className="relative flex items-center justify-center"
          style={{ height: 220, background: "linear-gradient(135deg, #0A1220 0%, #1A2E42 100%)" }}
        >
          <button
            onClick={() => setPlaying((p) => !p)}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
          >
            {playing ? <Pause size={22} style={{ color: "#fff" }} /> : <Play size={22} style={{ color: "#fff", marginLeft: 2 }} />}
          </button>
          {/* Timestamp label */}
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(0,0,0,0.5)", fontSize: "0.75rem", fontWeight: 600, color: "#fff", fontFamily: "var(--font-mono)" }}
          >
            22:14
          </div>
        </div>
        {/* Scrubber */}
        <div className="px-4 py-3 flex items-center gap-3">
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)" }}>22:14</span>
          <div
            className="flex-1 h-1.5 rounded-full relative cursor-pointer"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#DBE64C" }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background shadow" style={{ left: `${progress}%`, transform: "translate(-50%,-50%)", background: "#DBE64C" }} />
          </div>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)" }}>34:22</span>
          <Volume2 size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
        </div>
      </div>

      {/* Transcript */}
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 10 }}>
          Transcript
        </p>
        <div className="flex flex-col gap-3">
          {transcript.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted-foreground)", flexShrink: 0, paddingTop: 1 }}>
                {line.ts}
              </span>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 2 }}>{line.speaker}</p>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65 }}>{line.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudioViewer({ onAnnotate }: { onAnnotate: (text: string) => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(47);
  const bars = [0.3, 0.6, 0.4, 0.8, 0.5, 1, 0.7, 0.8, 0.5, 0.3, 0.6, 0.8, 0.4, 0.7, 0.9, 0.5, 0.3, 0.6, 0.4, 0.7, 0.8, 0.5, 0.9, 0.3, 0.6, 0.5, 0.8, 0.4, 0.7, 0.6];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        {[
          { icon: Lightbulb, label: "Explain this" },
          { icon: GitBranch, label: "Add to Map" },
          { icon: StickyNote, label: "Timestamp note" },
          { icon: Video, label: "Create visual" },
        ].map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{ fontSize: "0.775rem", fontWeight: 500, color: "var(--muted-foreground)" }}
            onClick={() => onAnnotate(action.label)}
          >
            <action.icon size={13} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Waveform player */}
      <div className="rounded-2xl border border-border p-5" style={{ background: "var(--card)" }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "#001F3F" }}
          >
            {playing ? <Pause size={16} style={{ color: "#DBE64C" }} /> : <Play size={16} style={{ color: "#DBE64C", marginLeft: 1 }} />}
          </button>
          <div className="flex-1">
            <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>Stakeholder Interview — Dr. Chen</p>
            <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>08:42 / 18:05</p>
          </div>
        </div>

        {/* Waveform bars */}
        <div className="flex items-center gap-0.5 h-12 px-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${h * 100}%`,
                background: i / bars.length < progress / 100 ? "#00804C" : "var(--border)",
                opacity: playing ? (0.6 + h * 0.4) : 0.7,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>00:00</span>
          <span style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>18:05</span>
        </div>
      </div>

      {/* Transcript */}
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 10 }}>
          Transcript
        </p>
        <div className="flex flex-col gap-3">
          {[
            { ts: "08:12", text: "So the delivery timeline that's in the framework document — that's the March 1st date — that's no longer accurate." },
            { ts: "08:42", text: "We've pushed to March 15th. The engineering team needs two more weeks for the gateway component specifically.", highlight: true },
            { ts: "09:15", text: "I'd treat the audio record of this conversation as the authoritative source for scheduling. The PDF hasn't been updated." },
          ].map((line, i) => (
            <div
              key={i}
              className="flex gap-3"
              style={{ background: line.highlight ? "rgba(219,230,76,0.15)" : "transparent", borderRadius: 8, padding: line.highlight ? "6px 8px" : 0, margin: line.highlight ? "0 -8px" : 0 }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted-foreground)", flexShrink: 0, paddingTop: 2 }}>{line.ts}</span>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65 }}>{line.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ onAnnotate }: { onAnnotate: (text: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        {[
          { icon: Pin, label: "Pin note" },
          { icon: Scissors, label: "Crop / Select" },
          { icon: Lightbulb, label: "Explain this visual" },
          { icon: GitBranch, label: "Connect to Map" },
        ].map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{ fontSize: "0.775rem", fontWeight: 500, color: "var(--muted-foreground)" }}
            onClick={() => onAnnotate(action.label)}
          >
            <action.icon size={13} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Image canvas simulation */}
      <div
        className="relative rounded-2xl border border-border overflow-hidden flex items-center justify-center"
        style={{ background: "var(--card)", minHeight: 320 }}
      >
        {/* Simulated flow diagram */}
        <svg width="480" height="280" viewBox="0 0 480 280" style={{ maxWidth: "100%" }}>
          {/* Background */}
          <rect width="480" height="280" fill="transparent" />
          {/* Nodes */}
          {[
            { x: 80, y: 140, label: "Start", color: "#74C365" },
            { x: 200, y: 80, label: "D1: Urgency", color: "#1E488F" },
            { x: 200, y: 140, label: "D2: Confidence", color: "#1E488F" },
            { x: 200, y: 200, label: "D3: Alignment", color: "#1E488F" },
            { x: 320, y: 140, label: "Gateway", color: "#C0392B", bold: true },
            { x: 420, y: 100, label: "Path A", color: "#00804C" },
            { x: 420, y: 180, label: "Path B", color: "#001F3F" },
          ].map((node, i) => (
            <g key={i}>
              <rect x={node.x - 44} y={node.y - 16} width={88} height={32} rx={8} fill={node.color + "18"} stroke={node.color} strokeWidth={node.bold ? 2 : 1} />
              <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={node.color} fontWeight={node.bold ? 700 : 500} fontFamily="var(--font-sans)">
                {node.label}
              </text>
            </g>
          ))}
          {/* Connections */}
          {[
            [80, 140, 156, 80], [80, 140, 156, 140], [80, 140, 156, 200],
            [244, 80, 276, 140], [244, 140, 276, 140], [244, 200, 276, 140],
            [364, 140, 376, 100], [364, 140, 376, 180],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted-foreground)" strokeWidth={1} opacity={0.4} />
          ))}
          {/* D4 label */}
          <rect x={292} y={200} width={80} height={28} rx={6} fill="rgba(219,230,76,0.3)" stroke="#DBE64C" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={332} y={214} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#4A5200" fontWeight={700} fontFamily="var(--font-sans)">D4: New node</text>
        </svg>

        {/* Pin note */}
        <div
          className="absolute top-4 right-4 px-3 py-2 rounded-xl border shadow-sm"
          style={{ background: "#FFFDE7", borderColor: "#DBE64C", fontSize: "0.75rem", maxWidth: 160, lineHeight: 1.5 }}
        >
          <p style={{ fontWeight: 700, fontSize: "0.67rem", color: "#4A5200", marginBottom: 3 }}>📌 Pinned note</p>
          D4 is missing from Framework v3. Check with team.
        </div>
      </div>
    </div>
  );
}

function SourcesMode({
  selectedSourceId,
  onSourceSelect,
  onAnnotate,
}: {
  selectedSourceId: string | null;
  onSourceSelect: (id: string) => void;
  onAnnotate: (text: string) => void;
}) {
  const active = SOURCES.find((s) => s.id === selectedSourceId) || SOURCES[0];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Source list (within sources mode) */}
      <div className="w-52 border-r border-border flex flex-col flex-shrink-0" style={{ background: "var(--sidebar)" }}>
        <div className="px-3.5 py-3 border-b border-sidebar-border">
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>
            Sources
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {SOURCES.map((src) => (
            <SourceRailItem
              key={src.id}
              source={src}
              selected={active?.id === src.id}
              onClick={() => onSourceSelect(src.id)}
            />
          ))}
        </div>
      </div>

      {/* Source viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Source header */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border flex-shrink-0" style={{ background: "var(--card)" }}>
          {active && (() => {
            const Icon = SOURCE_ICONS[active.type];
            return (
              <>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: active.color + "18" }}>
                  <Icon size={14} style={{ color: active.color }} />
                </div>
                <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{active.title}</p>
                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{active.meta}</span>
              </>
            );
          })()}
          <button className="ml-auto" style={{ color: "var(--muted-foreground)" }}>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Content */}
        {active?.type === "pdf" && <PDFViewer onAnnotate={onAnnotate} />}
        {active?.type === "video" && <VideoViewer onAnnotate={onAnnotate} />}
        {active?.type === "audio" && <AudioViewer onAnnotate={onAnnotate} />}
        {active?.type === "image" && <ImageViewer onAnnotate={onAnnotate} />}
        {(active?.type === "note" || active?.type === "link") && (
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
              {[{ icon: Highlighter, label: "Highlight" }, { icon: GitBranch, label: "Add to Map" }, { icon: Lightbulb, label: "Explain this" }].map((a) => (
                <button key={a.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.775rem", fontWeight: 500, color: "var(--muted-foreground)" }} onClick={() => onAnnotate(a.label)}>
                  <a.icon size={13} />
                  {a.label}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-border p-6" style={{ background: "var(--card)" }}>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.75 }}>
                {active.type === "note"
                  ? "Key pattern from all sources: the decision gateway consistently produces the longest hesitation times. The simultaneity of criteria is the core problem — not individual criteria complexity. Staged disclosure seems to be the most promising mitigation approach. Need to confirm sign-off ownership before implementation."
                  : "Nielsen Norman Group's research on cognitive load in UX directly supports the staged disclosure approach. Their studies show that presenting 1 option at a time reduces decision latency by 64% compared to simultaneous presentation of 3+ options."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Right Context Panel ─────────────────────────────────────────────────────

function RightPanel({
  cardId,
  sourceId,
  onClose,
  onSourceSelect,
}: {
  cardId: string | null;
  sourceId: string | null;
  onClose: () => void;
  onSourceSelect: (id: string) => void;
}) {
  const card = MAP_CARDS.find((c) => c.id === cardId);
  const source = SOURCES.find((s) => s.id === sourceId);
  const active = card || source;
  if (!active) return null;

  return (
    <motion.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="w-72 flex-shrink-0 border-l border-border flex flex-col"
      style={{ background: "var(--card)" }}
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>
          {card ? "Insight evidence" : "Source detail"}
        </p>
        <button onClick={onClose} className="hover:bg-secondary rounded-lg p-1 transition-colors" style={{ color: "var(--muted-foreground)" }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Title */}
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.4 }}>
            {"title" in active ? active.title : ""}
          </p>
          {"body" in active && (
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.6, marginTop: 4 }}>
              {active.body}
            </p>
          )}
          {"meta" in active && (
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: 3 }}>
              {active.meta}
            </p>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Source reference */}
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)", marginBottom: 8 }}>
            Source reference
          </p>
          <div className="p-3.5 rounded-xl border border-border" style={{ background: "var(--secondary)", fontSize: "0.825rem", lineHeight: 1.65, fontStyle: "italic" }}>
            {card && card.sources[0] === "pdf1" && '"The primary cognitive load peak occurs at the decision gateway, where users must simultaneously process three competing criteria…"'}
            {card && card.sources[0] === "aud1" && '"We\'ve pushed to March 15th. The engineering team needs two more weeks for the gateway component specifically."'}
            {card && card.sources[0] === "img1" && "Decision Node D4 appears in the flow diagram but is absent from Framework v3."}
            {(!card || card.sources.length === 0) && "No direct source quote — Bridge inferred this from patterns across multiple sources."}
            {source && `Source: ${source.title} · ${source.meta}`}
          </div>
          {card && card.sources[0] === "pdf1" && (
            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: 5, fontFamily: "var(--font-mono)" }}>
              Assessment Framework v3.pdf · Page 14
            </p>
          )}
          {card && card.sources[0] === "aud1" && (
            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: 5, fontFamily: "var(--font-mono)" }}>
              Stakeholder Interview · Timestamp 08:42
            </p>
          )}
        </div>

        {/* Confidence */}
        {card && (
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)", marginBottom: 6 }}>
              Confidence
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: card.confidence === "confirmed" ? "92%" : card.confidence === "inferred" ? "65%" : "30%",
                    background: card.confidence === "confirmed" ? "#00804C" : card.confidence === "inferred" ? "#DBE64C" : "#C0392B",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: card.confidence === "confirmed" ? "#00804C" : card.confidence === "inferred" ? "#4A5200" : "#C0392B" }}>
                {card.confidence === "confirmed" ? "High" : card.confidence === "inferred" ? "Medium" : "Low"}
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: 4 }}>
              {card.confidence === "confirmed" ? "Source-backed" : card.confidence === "inferred" ? "AI inferred" : "Needs confirmation"}
            </p>
          </div>
        )}

        {/* Related sources */}
        {card && card.sources.length > 0 && (
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)", marginBottom: 8 }}>
              Linked sources
            </p>
            {card.sources.map((sid) => {
              const src = SOURCES.find((s) => s.id === sid);
              if (!src) return null;
              const Icon = SOURCE_ICONS[src.type];
              return (
                <button
                  key={sid}
                  onClick={() => onSourceSelect(sid)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-secondary transition-colors mb-1.5 text-left"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: src.color + "18" }}>
                    <Icon size={13} style={{ color: src.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{src.title}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{src.meta}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-1.5 pt-1">
          {[
            { icon: MessageCircle, label: "Add note" },
            { icon: Flag, label: "Mark important" },
            { icon: GitBranch, label: "Add to Map" },
            { icon: Lightbulb, label: "Ask Bridge" },
            { icon: ArrowUpRight, label: "Open source" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-border hover:bg-secondary transition-colors"
              style={{ fontSize: "0.825rem", fontWeight: 500 }}
            >
              <action.icon size={13} style={{ color: "var(--muted-foreground)" }} />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

// ─── Context Work Mode ───────────────────────────────────────────────────────

function ContextWorkMode() {
  const [tab, setTab] = useState("Tracking");
  const [createTask, setCreateTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const statusColor = (s: string) => {
    if (s === "Blocked")      return { bg: "rgba(192,57,43,0.12)",  color: "#C0392B" };
    if (s === "In progress")  return { bg: "rgba(0,128,76,0.12)",   color: "#00804C" };
    if (s === "Needs review") return { bg: "rgba(219,230,76,0.25)", color: "#4A5200" };
    if (s === "Done")         return { bg: "rgba(92,107,90,0.12)",  color: "#5C6B5A" };
    return { bg: "var(--secondary)", color: "var(--muted-foreground)" };
  };
  const priorityColor = (p: string) => p === "Critical" || p === "High" ? "#C0392B" : p === "Medium" ? "#8A9300" : "#5C6B5A";
  const taskSwimlanes = [
    { title: "Needs decision", helper: "Blocked, unclear, or waiting on source context", tasks: CW_TASKS.filter(t => ["Blocked", "To do"].includes(t.status)) },
    { title: "Execution & review", helper: "Active delivery and final review work", tasks: CW_TASKS.filter(t => ["In progress", "Needs review", "Done"].includes(t.status)) },
  ];
  const tabs = [
    { id: "Tracking", count: "42%" },
    { id: "Tasks", count: String(CW_TASKS.length) },
    { id: "Questions", count: String(CW_QUESTIONS.length) },
    { id: "Timeline", count: String(CW_TIMELINE.length) },
    { id: "People", count: String(CW_PEOPLE.length) },
    { id: "Changes", count: String(CW_CHANGES.length) },
  ];

  const TaskCard = ({ task }: { task: typeof CW_TASKS[number] }) => {
    const sc = statusColor(task.status);
    const isSelected = selectedTask === task.key;
    return (
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <button className="w-full text-left p-3" onClick={() => setSelectedTask(isSelected ? null : task.key)}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{task.key}</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 800, color: priorityColor(task.priority) }}>↑ {task.priority}</span>
            </div>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, padding: "2px 7px", borderRadius: 7, background: sc.bg, color: sc.color, whiteSpace: "nowrap" }}>{task.status}</span>
          </div>
          <p style={{ fontSize: "0.86rem", fontWeight: 700, lineHeight: 1.35, marginBottom: 9 }}>{task.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#001F3F", fontSize: "0.52rem", fontWeight: 800, color: "#fff" }}>{task.assignee}</div>
            <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>Due {task.due}</span>
            <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 7, background: "rgba(30,72,143,0.08)", color: "#1E488F", border: "1px solid rgba(30,72,143,0.18)" }}>{task.linked}</span>
          </div>
        </button>
        <AnimatePresence>
          {isSelected && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
              <div className="p-3 flex flex-wrap gap-1.5">
                {["Open context","Reassign","Comment","Add to main context","Mark done"].map(a => (
                  <button key={a} className="px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted-foreground)" }}>{a}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-3 border-b border-border flex-shrink-0" style={{ background: "var(--card)" }}>
        <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all" style={{ background: tab === t.id ? "var(--background)" : "transparent", border: tab === t.id ? "1px solid var(--border)" : "1px solid transparent", boxShadow: tab === t.id ? "0 1px 4px rgba(0,31,63,0.06)" : "none", color: tab === t.id ? "#001F3F" : "var(--muted-foreground)", fontSize: "0.8rem", fontWeight: tab === t.id ? 800 : 600 }}>
              <span>{t.id}</span>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, padding: "1px 6px", borderRadius: 99, background: tab === t.id ? "#DBE64C" : "var(--secondary)", color: tab === t.id ? "#001F3F" : "var(--muted-foreground)" }}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-5 pb-24">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          {tab === "Tracking" && (
            <>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                {CW_TRACKING.map(item => (
                  <button key={item.label} onClick={() => setTab(item.label === "Blocked work" ? "Tasks" : item.label === "Review load" ? "People" : item.label === "Context coverage" ? "Questions" : "Timeline")} className="rounded-2xl border border-border p-4 text-left hover:-translate-y-px transition-all" style={{ background: "var(--card)", boxShadow: "0 1px 4px rgba(0,31,63,0.05)" }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 10 }}>{item.label}</p>
                    <div className="flex items-end gap-2 mb-3">
                      <span style={{ fontSize: "1.9rem", fontWeight: 850, lineHeight: 1, color: "#001F3F" }}>{item.value}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: 3 }}>{item.helper}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                      <div className="h-full rounded-full" style={{ width: item.value.includes("%") ? item.value : item.value === "2" ? "40%" : "20%", background: item.color }} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)" }}>
                <div className="rounded-2xl border border-border p-4" style={{ background: "var(--card)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>Next management focus</p>
                    <button onClick={() => setTab("Tasks")} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1E488F" }}>Open task board</button>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    {["Unblock BRG-12 by confirming decision owner", "Analyze changed sources before sharing the handoff", "Turn unresolved questions into assigned context tasks", "Move approved findings into main Bridge context"].map(focus => (
                      <div key={focus} className="flex items-start gap-2 rounded-xl border border-border p-3" style={{ background: "var(--background)" }}>
                        <Target size={13} style={{ color: "#001F3F", marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.78rem", lineHeight: 1.45 }}>{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border p-4" style={{ background: "var(--card)" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 12 }}>Context graph cues</p>
                  {["BRG-12 ↔ Open Question ↔ PDF p.14", "Design Brief change ↔ Decision Gateway", "D4 node ↔ Flow Diagram ↔ Framework v3"].map(link => (
                    <button key={link} onClick={() => setTab("Questions")} className="w-full flex items-center gap-2 text-left rounded-xl border border-border px-3 py-2.5 mb-2 hover:bg-secondary transition-colors" style={{ background: "var(--background)", fontSize: "0.76rem" }}>
                      <GitBranch size={13} style={{ color: "#1E488F", flexShrink: 0 }} />{link}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "Tasks" && (
            <div className="flex flex-col gap-4">
              {taskSwimlanes.map(lane => (
                <section key={lane.title} className="rounded-2xl border border-border overflow-hidden" style={{ background: "var(--background)" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: "var(--card)" }}>
                    <div>
                      <p style={{ fontSize: "0.86rem", fontWeight: 800 }}>{lane.title}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: 2 }}>{lane.helper}</p>
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: "var(--secondary)", color: "var(--muted-foreground)" }}>{lane.tasks.length} tasks</span>
                  </div>
                  <div className="grid gap-3 p-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                    {lane.tasks.map(task => <TaskCard key={task.key} task={task} />)}
                  </div>
                </section>
              ))}
            </div>
          )}

          {tab === "Questions" && CW_QUESTIONS.map(q => (
            <div key={q.title} className="rounded-2xl border border-border p-4" style={{ background: "var(--card)" }}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px", borderRadius: 7, background: q.status === "Open" ? "rgba(192,57,43,0.1)" : "rgba(0,128,76,0.1)", color: q.status === "Open" ? "#C0392B" : "#00804C" }}>{q.status}</span>
                <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>Confidence: {q.confidence}</span>
              </div>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.4, marginBottom: 6 }}>{q.title}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: 12 }}>{q.linked}</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#001F3F", fontSize: "0.52rem", fontWeight: 800, color: "#fff" }}>{q.owner.slice(0,2).toUpperCase()}</div><span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{q.owner}</span></div>
                <div className="flex gap-1.5">{["Ask Bridge","Assign as task","Resolve"].map(a => <button key={a} onClick={a === "Assign as task" ? () => setCreateTask(`Open Question — ${q.title.slice(0,30)}`) : undefined} className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted-foreground)" }}>{a}</button>)}</div>
              </div>
            </div>
          ))}

          {tab === "Timeline" && (
            <div className="rounded-2xl border border-border p-5" style={{ background: "var(--card)" }}>
              <div className="flex items-center justify-between mb-5"><p style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>Project timeline</p><span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Dates are driven by due dates, source changes, and decisions</span></div>
              <div className="relative pl-5">
                <div className="absolute left-1.5 top-1 bottom-1 w-px" style={{ background: "var(--border)" }} />
                {CW_TIMELINE.map(item => (
                  <div key={item.label} className="relative pb-6 last:pb-0">
                    <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full border-2" style={{ background: item.color, borderColor: "var(--card)" }} />
                    <div className="grid gap-3" style={{ gridTemplateColumns: "90px minmax(0, 1fr) auto" }}>
                      <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{item.date}</p>
                      <div><p style={{ fontSize: "0.92rem", fontWeight: 750 }}>{item.label}</p><p style={{ fontSize: "0.76rem", color: "var(--muted-foreground)", lineHeight: 1.55, marginTop: 3 }}>{item.detail}</p></div>
                      <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px", borderRadius: 99, color: item.color, background: item.color + "18", whiteSpace: "nowrap", alignSelf: "start" }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "People" && CW_PEOPLE.map(person => (
            <div key={person.name} className="rounded-2xl border border-border p-4" style={{ background: "var(--card)" }}>
              <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: person.color, fontSize: "0.7rem", fontWeight: 800, color: "#fff" }}>{person.initials}</div><div className="flex-1 min-w-0"><p style={{ fontSize: "0.9rem", fontWeight: 700 }}>{person.name}</p><p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{person.role}</p></div><span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>{person.access}</span></div>
              <div className="flex flex-wrap gap-2 mb-3">{person.tasks && <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#5C6B5A", background: "rgba(92,107,90,0.1)", padding: "2px 9px", borderRadius: 99 }}>{person.tasks} tasks</span>}{person.review && <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#4A5200", background: "rgba(219,230,76,0.2)", padding: "2px 9px", borderRadius: 99 }}>{person.review} review</span>}{person.blocked && <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#C0392B", background: "rgba(192,57,43,0.1)", padding: "2px 9px", borderRadius: 99 }}>{person.blocked} blocked</span>}</div>
              <div className="flex gap-2">{["View context","Assign task","Share context"].map(a => <button key={a} className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted-foreground)" }}>{a}</button>)}</div>
            </div>
          ))}

          {tab === "Changes" && CW_CHANGES.map(ch => (
            <div key={ch.file} className="rounded-2xl border border-border p-4" style={{ background: "var(--card)" }}>
              <div className="flex items-start justify-between gap-3 mb-3"><div><p style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3 }}>{ch.file}</p><p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: 2 }}>{ch.provider} · {ch.ago} · by {ch.by}</p></div><span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "3px 9px", borderRadius: 99, background: ch.status === "Needs analysis" ? "rgba(192,57,43,0.1)" : "rgba(219,230,76,0.2)", color: ch.status === "Needs analysis" ? "#C0392B" : "#4A5200", flexShrink: 0 }}>{ch.status}</span></div>
              <div className="flex flex-col gap-1 mb-4">{ch.affected.map(a => <div key={a} className="flex items-center gap-2"><GitBranch size={11} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} /><span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{a}</span></div>)}</div>
              <div className="flex gap-2 flex-wrap">{["Analyze changes","Create task","View diff","Ignore"].map(a => <button key={a} onClick={a === "Create task" ? () => setCreateTask(`Change: ${ch.file}`) : undefined} className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: a === "Analyze changes" ? 800 : 600, background: a === "Analyze changes" ? "#001F3F" : "transparent", color: a === "Analyze changes" ? "#DBE64C" : "var(--muted-foreground)", borderColor: a === "Analyze changes" ? "#001F3F" : "var(--border)" }}>{a}</button>)}</div>
            </div>
          ))}
        </div>
      </div>


      <AnimatePresence>{createTask !== null && <CreateTaskModal onClose={() => setCreateTask(null)} prefill={createTask} />}</AnimatePresence>
    </div>
  );
}

// ─── Bottom Command Bar ──────────────────────────────────────────────────────

const MODE_ITEMS = [
  { id: "understanding" as WorkspaceMode, icon: BookOpen, label: "Understanding" },
  { id: "canvas"        as WorkspaceMode, icon: Map,      label: "Canvas" },
  { id: "actionhub"     as WorkspaceMode, icon: Zap,      label: "Action Hub" },
];

const getInputActions = (mode: WorkspaceMode) => {
  switch (mode) {
    case "understanding":
      return [
        { id: "upload", icon: Upload, label: "Upload" },
        { id: "connect", icon: Globe, label: "Connect source" },
        { id: "ask", icon: MessageCircle, label: "Ask Bridge" },
        { id: "more", icon: Plus, label: "More" },
      ];
    case "canvas":
      return [
        { id: "upload", icon: Upload, label: "Upload" },
        { id: "link", icon: Link2, label: "Paste link" },
        { id: "note", icon: StickyNote, label: "Post-it" },
        { id: "record", icon: Mic, label: "Record" },
        { id: "create", icon: Zap, label: "Create" },
        { id: "more", icon: Plus, label: "More" },
      ];
    case "actionhub":
      return [
        { id: "new-task", icon: Target, label: "New task" },
        { id: "analyze", icon: RefreshCw, label: "Analyze changes" },
        { id: "ask", icon: MessageCircle, label: "Ask Bridge" },
        { id: "more", icon: Plus, label: "More" },
      ];
  }
};

function BottomCommandBar({
  mode,
  onModeChange,
  onAction,
}: {
  mode: WorkspaceMode;
  onModeChange: (m: WorkspaceMode) => void;
  onAction: (id: string) => void;
}) {
  const actions = getInputActions(mode);
  return (
    <div
      className="flex items-center gap-1 px-2 py-1.5 rounded-2xl border border-border"
      style={{
        background: "var(--card)",
        boxShadow: "0 4px 24px rgba(0,31,63,0.10), 0 1px 4px rgba(0,31,63,0.06)",
      }}
    >
      {/* Mode switcher */}
      <div className="flex items-center rounded-xl p-1 gap-0.5" style={{ background: "var(--secondary)" }}>
        {MODE_ITEMS.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all"
            style={{
              background: mode === m.id ? "var(--card)" : "transparent",
              color: mode === m.id ? "var(--foreground)" : "var(--muted-foreground)",
              fontWeight: mode === m.id ? 600 : 400,
              fontSize: "0.825rem",
              boxShadow: mode === m.id ? "0 1px 3px rgba(0,31,63,0.1)" : "none",
            }}
          >
            <m.icon size={13} />
            {m.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Mode-specific actions */}
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-secondary transition-colors group"
          style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--muted-foreground)" }}
        >
          <action.icon size={14} className="group-hover:text-foreground transition-colors" />
          <span className="group-hover:text-foreground transition-colors">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Bottom Action Modals ─────────────────────────────────────────────────────

function Backdrop({ onClick }: { onClick: () => void }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={onClick} />;
}

function UploadModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (l: string) => void }) {
  return (
    <>
      <Backdrop onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-2xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 24px 64px rgba(0,31,63,0.18)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p style={{ fontWeight: 700, fontSize: "1rem" }}>Add sources</p>
          <button onClick={onClose} className="hover:bg-secondary rounded-lg p-1.5 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={15} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 hover:bg-secondary transition-colors cursor-pointer" style={{ borderColor: "rgba(0,31,63,0.25)" }} onClick={() => onConfirm("File")}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)" }}>
              <Upload size={18} style={{ color: "var(--muted-foreground)" }} />
            </div>
            <div className="text-center">
              <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Drop files here</p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: 3 }}>or click to browse</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["PDF","Docs","Slides","Images","Audio","Video","Links","Transcripts"].map(f => (
                <span key={f} style={{ fontSize: "0.65rem", fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>{f}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Recent imports</p>
            {[{ label: "Q1 Research Report.pdf", meta: "2 days ago", icon: FileText }, { label: "Team Meeting Recording.mp3", meta: "Last week", icon: AudioLines }].map(item => (
              <button key={item.label} onClick={() => onConfirm(item.label)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left mb-1" style={{ border: "1px solid var(--border)" }}>
                <item.icon size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                <div><p style={{ fontSize: "0.825rem", fontWeight: 500 }}>{item.label}</p><p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{item.meta}</p></div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

function PasteLinkModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (l: string) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState(false);
  const handleAdd = () => {
    if (!url.trim()) { setError(true); return; }
    setError(false); setPreview(false); setLoading(true);
    setTimeout(() => { setLoading(false); setPreview(true); }, 1100);
  };
  return (
    <>
      <Backdrop onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18, ease: [0.16,1,0.3,1] }} className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-96 rounded-2xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 16px 48px rgba(0,31,63,0.16)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p style={{ fontWeight: 700, fontSize: "0.875rem" }}>Paste a link</p>
          <button onClick={onClose} className="hover:bg-secondary rounded-lg p-1 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={13} /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <input value={url} onChange={e => { setUrl(e.target.value); setError(false); setPreview(false); }} placeholder="https://…" className="flex-1 px-3 py-2 rounded-xl border outline-none" style={{ fontSize: "0.875rem", background: "var(--input-background)", borderColor: error ? "#C0392B" : "var(--border)" }} onKeyDown={e => e.key === "Enter" && handleAdd()} autoFocus />
            <button onClick={handleAdd} className="px-4 py-2 rounded-xl" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.875rem", fontWeight: 600 }}>Add</button>
          </div>
          {error && <p style={{ fontSize: "0.75rem", color: "#C0392B" }}>Enter a valid URL to continue.</p>}
          {loading && <div className="flex items-center gap-2 py-1"><div className="w-4 h-4 rounded-full border-2 border-border border-t-transparent animate-spin" /><p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Loading preview…</p></div>}
          <AnimatePresence>
            {preview && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border p-3" style={{ background: "var(--secondary)" }}>
                <p style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>{url}</p>
                <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 8 }}>Preview loaded — ready to add</p>
                <button onClick={() => onConfirm("Link")} className="w-full py-2 rounded-xl" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.85rem", fontWeight: 600 }}>Add to Workspace</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

function PostItModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (l: string) => void }) {
  const [text, setText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const colors = ["#FEFCD0","#D4F1C0","#D0E8FF","#FFD4D4"];
  const [color, setColor] = useState(colors[0]);
  return (
    <>
      <Backdrop onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18, ease: [0.16,1,0.3,1] }} className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-80 rounded-2xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 16px 48px rgba(0,31,63,0.16)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p style={{ fontWeight: 700, fontSize: "0.875rem" }}>New post-it</p>
          <button onClick={onClose} className="hover:bg-secondary rounded-lg p-1 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={13} /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type your note…" rows={4} className="w-full px-3 py-2.5 rounded-xl border border-border outline-none resize-none" style={{ fontSize: "0.875rem", background: color, lineHeight: 1.55 }} autoFocus />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">{colors.map(c => <button key={c} onClick={() => setColor(c)} className="w-5 h-5 rounded-full border-2 transition-all" style={{ background: c, borderColor: color === c ? "#001F3F" : "#00000020" }} />)}</div>
            <button className="flex items-center gap-2" onClick={() => setIsPrivate(p => !p)}>
              <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: isPrivate ? "#001F3F" : "var(--secondary)", border: isPrivate ? "none" : "1.5px solid var(--border)" }}>{isPrivate && <Check size={9} style={{ color: "#fff" }} />}</div>
              <span style={{ fontSize: "0.78rem" }}>Private</span>
            </button>
          </div>
          <button onClick={() => text.trim() && onConfirm("Post-it")} className="w-full py-2 rounded-xl transition-all" style={{ background: text.trim() ? "#001F3F" : "var(--secondary)", color: text.trim() ? "#DBE64C" : "var(--muted-foreground)", fontSize: "0.875rem", fontWeight: 600 }}>
            Place on canvas
          </button>
        </div>
      </motion.div>
    </>
  );
}

function RecordModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (l: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bars = [0.4,0.7,0.5,0.9,0.6,1,0.7,0.8,0.5,0.4,0.6,0.9,0.5,0.7,0.8,0.4,0.6,0.8,0.5,0.9,0.6,0.7,0.4,0.8,0.5,0.6,0.3,0.8,0.5,0.7];
  const startRecording = () => { setRecording(true); timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000); };
  const stopRecording = () => { setRecording(false); setStopped(true); if (timerRef.current) clearInterval(timerRef.current); };
  return (
    <>
      <Backdrop onClick={() => { if (!recording) onClose(); }} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }} className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-96 rounded-2xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 16px 48px rgba(0,31,63,0.16)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p style={{ fontWeight: 700, fontSize: "0.875rem" }}>Record context</p>
          <button onClick={onClose} className="hover:bg-secondary rounded-lg p-1 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={13} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-px h-12">
            {bars.map((h, i) => <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${(recording ? h : 0.15) * 100}%`, background: recording ? "#00804C" : "var(--border)", opacity: recording ? 0.7 + h * 0.3 : 0.5, transitionDuration: recording ? `${0.1 + (i % 5) * 0.04}s` : "0.3s" }} />)}
          </div>
          <div className="text-center">
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 700, color: recording ? "#00804C" : "var(--muted-foreground)" }}>
              {String(Math.floor(seconds / 60)).padStart(2,"0")}:{String(seconds % 60).padStart(2,"0")}
            </p>
            {recording && <p style={{ fontSize: "0.75rem", color: "#00804C", marginTop: 3 }}>Recording… speak clearly</p>}
            {stopped && <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: 3, fontStyle: "italic" }}>Transcript loading…</p>}
          </div>
          <div className="flex items-center justify-center gap-3">
            {!stopped ? (
              <button onClick={recording ? stopRecording : startRecording} className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 flex-shrink-0" style={{ background: recording ? "#C0392B" : "#001F3F" }}>
                {recording ? <div className="w-4 h-4 rounded-sm bg-white" /> : <Mic size={18} style={{ color: "#DBE64C" }} />}
              </button>
            ) : (
              <button onClick={() => onConfirm("Recording")} className="px-6 py-2.5 rounded-xl" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.875rem", fontWeight: 600 }}>Save to Workspace</button>
            )}
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function MoreMenu({ onClose, onSelect }: { onClose: () => void; onSelect: (l: string) => void }) {
  const groups = [
    [{ icon: Globe, label: "Connect Google Drive" }, { icon: FileText, label: "Connect Microsoft file" }, { icon: Image, label: "Connect Figma file" }],
    [{ icon: Plus, label: "Add task" }, { icon: MessageCircle, label: "Add comment" }, { icon: Map, label: "Create context frame" }],
    [{ icon: AudioLines, label: "Create audio" }, { icon: Video, label: "Create video" }, { icon: BookOpen, label: "Create document" }, { icon: Zap, label: "Analyze connected changes" }],
  ];
  return (
    <>
      <Backdrop onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15, ease: [0.16,1,0.3,1] }} className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-64 rounded-2xl border border-border overflow-hidden" style={{ background: "var(--card)", boxShadow: "0 16px 48px rgba(0,31,63,0.14)" }}>
        <div className="px-4 py-2.5 border-b border-border">
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>More options</p>
        </div>
        <div className="py-1">
          {groups.map((grp, gi) => (
            <div key={gi} className={gi > 0 ? "border-t border-border" : ""}>
              {grp.map(item => (
                <button key={item.label} onClick={() => { onSelect(item.label); onClose(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-secondary transition-colors text-left">
                  <item.icon size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.825rem", fontWeight: 500 }}>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Canvas ─────────────────────────────────────────────────────────────

export function Canvas({ theme, onToggleTheme, onNavigate, canvasId }: Props) {
  const [mode, setMode] = useState<WorkspaceMode>("understanding");
  const [sourceSidebarOpen, setSourceSidebarOpen] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [sourceDocId, setSourceDocId] = useState<string | null>(null);
  const [rightOpen, setRightOpen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(canvasId === "new");
  const [processingMsg, setProcessingMsg] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const toastCounter = useRef(0);

  const isDark = theme === "dark";
  const title = CANVAS_TITLES[canvasId] || "Untitled Bridge";

  const addToast = (msg: string) => {
    const id = ++toastCounter.current;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const handleCardSelect = (id: string) => {
    setSelectedCardId(id);
    setSelectedSourceId(null);
    setRightOpen(true);
  };

  const handleSourceSelect = (id: string) => {
    setSourceDocId(id);
    setSelectedCardId(null);
    setRightOpen(false);
  };

  const handlePanelClose = () => {
    setRightOpen(false);
    setSelectedCardId(null);
    setSelectedSourceId(null);
    setSourceDocId(null);
  };

  const handleAnnotate = (action: string) => {
    addToast(`${action} — Map updated`);
    setProcessingMsg("Map updated");
    setTimeout(() => setProcessingMsg(null), 3000);
  };

  const [activeAction, setActiveAction] = useState<"upload"|"paste-link"|"post-it"|"record"|"more"|null>(null);

  const closeAction = () => setActiveAction(null);
  const confirmSource = (label: string) => {
    closeAction();
    if (isEmpty) setIsEmpty(false);
    addToast(`${label} added — Bridge is reading…`);
    setProcessingMsg("Reading new source…");
    setTimeout(() => { setProcessingMsg("Map refreshed"); setTimeout(() => setProcessingMsg(null), 2000); }, 2200);
  };

  const handleInputAction = (id: string) => {
    if (id === "upload")    { setActiveAction("upload");    return; }
    if (id === "link")      { setActiveAction("paste-link"); return; }
    if (id === "note")      { setActiveAction("post-it");   return; }
    if (id === "record")    { setActiveAction("record");    return; }
    if (id === "more")      { setActiveAction("more");      return; }
    if (id === "connect")   { setShowConnectModal(true);    return; }
    if (id === "ask")       { addToast("Ask Bridge — opening…"); return; }
    if (id === "create")    { addToast("Create — choose output type…"); return; }
    if (id === "new-task")  { addToast("Creating new task…"); return; }
    if (id === "analyze")   { addToast("Analyzing source changes…"); setProcessingMsg("Analyzing…"); setTimeout(() => setProcessingMsg(null), 2500); return; }
  };

  const handleTimelineSelect = (sourceId: string | null, detail: string) => {
    if (sourceId) {
      setSelectedSourceId(sourceId);
      setSelectedCardId(null);
      setRightOpen(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Top bar ── */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border flex-shrink-0" style={{ background: "var(--card)", minHeight: 52 }}>
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
          style={{ color: "var(--muted-foreground)", fontSize: "0.8rem", fontWeight: 500 }}
        >
          <ChevronLeft size={14} />
          Home
        </button>

        <div className="w-px h-4 bg-border flex-shrink-0" />

        {/* Title + status */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#DBE64C" }}>
            <GitBranch size={10} style={{ color: "#001F3F" }} strokeWidth={2.5} />
          </div>
          <p className="truncate" style={{ fontWeight: 600, fontSize: "0.9rem" }}>{title}</p>

          <AnimatePresence mode="wait">
            {processingMsg && (
              <motion.div
                key={processingMsg}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: "var(--secondary)", fontSize: "0.72rem", fontWeight: 500, color: "var(--muted-foreground)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00804C" }} />
                {processingMsg}
              </motion.div>
            )}
            {!processingMsg && !isEmpty && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: "rgba(219,230,76,0.3)", fontSize: "0.72rem", fontWeight: 600, color: "#4A5200" }}
              >
                <Zap size={10} style={{ fill: "#4A5200" }} />
                Understanding ready
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors" style={{ color: "var(--muted-foreground)" }}>
            <Search size={14} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowActivityPanel((p) => !p)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              style={{ color: showActivityPanel ? "var(--foreground)" : "var(--muted-foreground)", background: showActivityPanel ? "var(--secondary)" : "transparent" }}
            >
              <Bell size={14} />
            </button>
            <AnimatePresence>
              {showActivityPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-border overflow-hidden"
                  style={{ background: "var(--card)", boxShadow: "0 16px 48px rgba(0,31,63,0.14)" }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p style={{ fontWeight: 700, fontSize: "0.875rem" }}>Activity</p>
                    <button onClick={() => setShowActivityPanel(false)} className="hover:bg-secondary rounded-lg p-1 transition-colors" style={{ color: "var(--muted-foreground)" }}>
                      <X size={13} />
                    </button>
                  </div>
                  <div className="flex flex-col divide-y divide-border max-h-80 overflow-y-auto">
                    {TIMELINE_ITEMS.map((item, i) => {
                      const TYPE_ICONS: Record<string, React.ElementType> = { upload: FileText, meeting: Video, decision: Target, conflict: AlertTriangle, note: StickyNote, update: Zap };
                      const Icon = TYPE_ICONS[item.type] || FileText;
                      return (
                        <button
                          key={i}
                          onClick={() => { setShowActivityPanel(false); if (item.source) handleSourceSelect(item.source); }}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: item.color + "18" }}>
                            <Icon size={11} style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: "0.8rem", fontWeight: 500, lineHeight: 1.4 }}>{item.event}</p>
                            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{item.date}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            <Share2 size={13} />
            Share
          </button>
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#001F3F", fontSize: "0.65rem", fontWeight: 700, color: "#fff" }}>
            JC
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Unified Sources Sidebar */}
        {!isEmpty && (
          <SourcesSidebar
            open={sourceSidebarOpen}
            onToggle={() => setSourceSidebarOpen(o => !o)}
            onSourceSelect={handleSourceSelect}
            onConnectSource={() => setShowConnectModal(true)}
          />
        )}

        {/* Center content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sidebar toggle (shown when sidebar is collapsed) */}
          {!sourceSidebarOpen && !isEmpty && (
            <button
              onClick={() => setSourceSidebarOpen(true)}
              className="flex items-center gap-1.5 self-start ml-3 mt-3 px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary transition-all"
              style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted-foreground)" }}
            >
              <ChevronRight size={11} />
              Sources
            </button>
          )}
          {isEmpty ? (
            /* Empty canvas */
            <div
              className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
                backgroundSize: "28px 28px",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--secondary)" }}>
                  <GitBranch size={26} style={{ color: "var(--muted-foreground)" }} />
                </div>
                <h2 style={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.025em", marginBottom: 6 }}>
                  Drop anything here.
                </h2>
                <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", maxWidth: 320, lineHeight: 1.65 }}>
                  Files, links, notes, audio, video, images — Bridge will organize the context.
                </p>
              </motion.div>
            </div>
          ) : (
            <>
              {mode === "understanding" && (
                <MapMode onCardSelect={handleCardSelect} onSourceSelect={handleSourceSelect} />
              )}
              {mode === "canvas" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <WorkspaceCanvas onAnnotate={handleAnnotate} />
                </div>
              )}
              {mode === "actionhub" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ContextWorkMode />
                </div>
              )}
            </>
          )}

          {/* Bottom command area */}
          <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-border flex-shrink-0" style={{ background: "var(--background)" }}>
            <BottomCommandBar
              mode={mode}
              onModeChange={(m) => {
                setMode(m);
                handlePanelClose();
              }}
              onAction={handleInputAction}
            />
          </div>
        </div>

        {/* Right: Insight panel (cards) or Source document viewer */}
        <AnimatePresence>
          {rightOpen && selectedCardId && (
            <RightPanel
              cardId={selectedCardId}
              sourceId={selectedSourceId}
              onClose={handlePanelClose}
              onSourceSelect={handleSourceSelect}
            />
          )}
          {sourceDocId && (
            <SourceDocumentSlideIn
              sourceId={sourceDocId}
              onClose={() => setSourceDocId(null)}
              onAnnotate={handleAnnotate}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-2 z-50 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border"
              style={{ background: "var(--card)", boxShadow: "0 4px 16px rgba(0,31,63,0.1)", fontSize: "0.825rem", fontWeight: 500 }}
            >
              <Check size={13} style={{ color: "#00804C" }} />
              {toast.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Bottom action modals ── */}
      <AnimatePresence>
        {activeAction === "upload"     && <UploadModal    onClose={closeAction} onConfirm={confirmSource} />}
        {activeAction === "paste-link" && <PasteLinkModal onClose={closeAction} onConfirm={confirmSource} />}
        {activeAction === "post-it"    && <PostItModal    onClose={closeAction} onConfirm={confirmSource} />}
        {activeAction === "record"     && <RecordModal    onClose={closeAction} onConfirm={confirmSource} />}
        {activeAction === "more"       && <MoreMenu       onClose={closeAction} onSelect={(l) => addToast(`${l} — opening…`)} />}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-border overflow-hidden"
              style={{ background: "var(--card)", boxShadow: "0 24px 64px rgba(0,31,63,0.16)" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <p style={{ fontWeight: 700, fontSize: "1rem" }}>Share Bridge</p>
                <button onClick={() => setShowShareModal(false)} className="hover:bg-secondary rounded-lg p-1 transition-colors" style={{ color: "var(--muted-foreground)" }}>
                  <X size={15} />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 8 }}>Invite people</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="name@company.com"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-border outline-none"
                      style={{ background: "var(--input-background)", fontSize: "0.875rem" }}
                    />
                    <select className="px-3 py-2 rounded-xl border border-border outline-none" style={{ background: "var(--input-background)", fontSize: "0.825rem" }}>
                      <option>View</option>
                      <option>Comment</option>
                      <option>Edit</option>
                    </select>
                    <button className="px-4 py-2 rounded-xl transition-all hover:opacity-90" style={{ background: "#001F3F", color: "#F6F7ED", fontSize: "0.875rem", fontWeight: 600 }}>
                      Invite
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-1 border-t border-border">
                  {[
                    { label: "Private notes hidden by default", on: true },
                    { label: "Allow receiver questions", on: true },
                    { label: "Require approval for AI inferences", on: false },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: opt.on ? "#001F3F" : "var(--secondary)", border: opt.on ? "none" : "1.5px solid var(--border)" }}>
                        {opt.on && <Check size={9} style={{ color: "#fff" }} />}
                      </div>
                      <span style={{ fontSize: "0.825rem" }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 px-3.5 py-2 rounded-xl border border-border truncate" style={{ background: "var(--input-background)", fontSize: "0.8rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                    bridge.app/shared/cog-assessment-jc…
                  </div>
                  <button className="px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.825rem", fontWeight: 500 }}>
                    Copy link
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
