import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Video, AudioLines, Image, Globe, StickyNote,
  Play, Pause, Mic, MessageCircle, GitBranch, Lightbulb,
  HelpCircle, Zap, ArrowUpRight, X, Lock, RefreshCw, Plus,
  Download, Share2, Film, BookOpen, Pin, ChevronRight,
} from "lucide-react";

type RightPanelState = "default" | "source" | "output" | "ask" | "create-audio" | "create-video" | "create-doc";

interface WorkspaceCanvasProps {
  onAnnotate: (msg: string) => void;
}

// ─── Default positions ────────────────────────────────────────────────────────

const DEFAULT_POS: Record<string, { x: number; y: number }> = {
  pdf:        { x: 56,   y: 80  },
  video:      { x: 312,  y: 80  },
  audio:      { x: 612,  y: 80  },
  image:      { x: 56,   y: 390 },
  link:       { x: 352,  y: 358 },
  "note-a":   { x: 600,  y: 308 },
  "note-b":   { x: 870,  y: 80  },
  "note-c":   { x: 1100, y: 250 },
  question:   { x: 862,  y: 222 },
  "audio-out":{ x: 592,  y: 462 },
  "video-out":{ x: 1076, y: 80  },
  "doc-out":  { x: 1376, y: 80  },
  session:    { x: 1372, y: 345 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function WaveformBars({
  count = 24,
  height = 32,
  color = "#00804C",
  progress = 0,
}: {
  count?: number;
  height?: number;
  color?: string;
  progress?: number;
}) {
  const hs = [0.4,0.7,0.5,0.9,0.6,1,0.7,0.8,0.5,0.4,0.6,0.9,0.5,0.7,0.8,0.4,0.6,0.8,0.5,0.9,0.6,0.7,0.4,0.8,0.5,0.6,0.3,0.8];
  return (
    <div className="flex items-center gap-px" style={{ height }}>
      {hs.slice(0, count).map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: `${h * 100}%`,
            borderRadius: 2,
            background: i / count < progress ? color : "var(--border)",
            opacity: 0.9,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function TypeChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: "0.62rem",
        fontWeight: 600,
        padding: "2px 7px",
        borderRadius: 99,
        background: color + "18",
        color,
        border: `1px solid ${color}28`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function HoverActions({ actions, onAction }: { actions: string[]; onAction?: (a: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {actions.map((a) => (
        <button
          key={a}
          onClick={(e) => { e.stopPropagation(); onAction?.(a); }}
          className="px-2 py-0.5 rounded-lg border border-border hover:bg-secondary transition-colors"
          style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--muted-foreground)", background: "var(--card)" }}
        >
          {a}
        </button>
      ))}
    </div>
  );
}

// ─── Node Cards ───────────────────────────────────────────────────────────────

interface NodeShellProps {
  pos: { x: number; y: number };
  width: number;
  selected: boolean;
  multiSelected: boolean;
  isDragging: boolean;
  borderColor: string;
  hovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
  overflow?: boolean;
}

function NodeShell({
  pos, width, selected, multiSelected, isDragging, borderColor, hovered,
  onMouseDown, onClick, onMouseEnter, onMouseLeave, children, overflow = true,
}: NodeShellProps) {
  const active = selected || multiSelected;
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width,
        background: "var(--card)",
        borderRadius: 16,
        overflow: overflow ? "hidden" : "visible",
        border: `1.5px solid ${active ? borderColor : hovered ? borderColor + "55" : "var(--border)"}`,
        boxShadow: isDragging
          ? "0 16px 48px rgba(0,31,63,0.22)"
          : active
          ? `0 0 0 3px ${borderColor}20, 0 4px 20px ${borderColor}14`
          : hovered
          ? "0 4px 16px rgba(0,31,63,0.1)"
          : "0 2px 8px rgba(0,31,63,0.05)",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        zIndex: isDragging ? 100 : active ? 10 : hovered ? 5 : 1,
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
    >
      {children}
    </div>
  );
}

function PDFNode({ pos, selected, multiSelected, isDragging, onClick, onAction, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; multiSelected: boolean; isDragging: boolean;
  onClick: () => void; onAction: (a: string) => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = "#1E488F";
  return (
    <NodeShell pos={pos} width={224} selected={selected} multiSelected={multiSelected} isDragging={isDragging} borderColor={color} hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ height: 4, background: color, opacity: 0.7 }} />
      <div className="flex items-start gap-2 p-3 pb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + "18" }}>
          <FileText size={13} style={{ color }} />
        </div>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.3 }}>Assessment Framework v3.pdf</p>
      </div>
      <div className="flex flex-wrap gap-1 px-3 pb-2">
        <TypeChip label="PDF" color={color} />
        <TypeChip label="24 pages" color="#5C6B5A" />
        <TypeChip label="3 highlights" color="#4A5200" />
      </div>
      <div className="mx-3 mb-2 rounded-xl overflow-hidden" style={{ background: "var(--secondary)", padding: "8px 10px" }}>
        <div style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", marginBottom: 6, fontWeight: 700 }}>Page 14</div>
        <div className="flex flex-col gap-1.5">
          {[90, 80, 70, 85, 60].map((w, i) => (
            <div key={i} style={{ height: 5, borderRadius: 2, width: `${w}%`, background: i === 1 || i === 2 ? "#DBE64C" : "var(--muted-foreground)", opacity: i === 1 || i === 2 ? 0.55 : 0.2 }} />
          ))}
        </div>
        <p style={{ fontSize: "0.64rem", color: "var(--muted-foreground)", marginTop: 7, lineHeight: 1.4, fontStyle: "italic" }}>
          "…cognitive load peak at decision gateway…"
        </p>
      </div>
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="px-3 pb-3" onClick={e => e.stopPropagation()}>
            <HoverActions actions={["Open", "Ask", "Explain", "Create"]} onAction={onAction} />
          </motion.div>
        )}
      </AnimatePresence>
    </NodeShell>
  );
}

function VideoNode({ pos, selected, multiSelected, isDragging, onClick, onAction, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; multiSelected: boolean; isDragging: boolean;
  onClick: () => void; onAction: (a: string) => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const color = "#00804C";
  return (
    <NodeShell pos={pos} width={266} selected={selected} multiSelected={multiSelected} isDragging={isDragging} borderColor={color} hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex items-center justify-center" style={{ height: 116, background: "linear-gradient(135deg,#0A1A10 0%,#1A3A28 100%)" }}>
        <button
          onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)" }}
        >
          {playing ? <Pause size={14} style={{ color: "#fff" }} /> : <Play size={14} style={{ color: "#fff", marginLeft: 2 }} />}
        </button>
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.55)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "#fff", fontWeight: 600 }}>34:22</div>
        <div className="absolute bottom-0 left-0 right-0 flex gap-px px-3 pb-2 pt-1">
          {[0.3,0.7,0.2,0.8,0.5,0.6,0.4,0.9,0.3,0.6,0.5,0.7].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: 14, background: color + (i === 3 || i === 8 ? "aa" : "44") }} />
          ))}
        </div>
      </div>
      <div className="p-3 pt-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: color + "18" }}>
            <Video size={11} style={{ color }} />
          </div>
          <p style={{ fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.3 }}>UX Research Session.mp4</p>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          <TypeChip label="Video" color={color} />
          <TypeChip label="34:22" color="#5C6B5A" />
          <TypeChip label="Transcript" color="#5C6B5A" />
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={e => e.stopPropagation()}>
              <HoverActions actions={["Play", "Ask", "Clip moment", "Create"]} onAction={onAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeShell>
  );
}

function AudioNode({ pos, selected, multiSelected, isDragging, onClick, onAction, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; multiSelected: boolean; isDragging: boolean;
  onClick: () => void; onAction: (a: string) => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const color = "#74C365";
  return (
    <NodeShell pos={pos} width={228} selected={selected} multiSelected={multiSelected} isDragging={isDragging} borderColor={color} hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ height: 3, background: color, opacity: 0.65 }} />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2.5">
          <button
            onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#001F3F" }}
          >
            {playing ? <Pause size={11} style={{ color: "#DBE64C" }} /> : <Play size={11} style={{ color: "#DBE64C", marginLeft: 1 }} />}
          </button>
          <div className="min-w-0">
            <p style={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.2 }}>Stakeholder Interview</p>
            <p style={{ fontSize: "0.64rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>Dr. Chen · 18:05</p>
          </div>
        </div>
        <div className="mb-2.5">
          <WaveformBars count={24} height={28} color={color} progress={playing ? 0.47 : 0} />
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          <TypeChip label="Audio" color={color} />
          <TypeChip label="Transcript" color="#5C6B5A" />
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={e => e.stopPropagation()}>
              <HoverActions actions={["Ask", "Create audio", "Add note"]} onAction={onAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeShell>
  );
}

function ImageNode({ pos, selected, multiSelected, isDragging, onClick, onAction, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; multiSelected: boolean; isDragging: boolean;
  onClick: () => void; onAction: (a: string) => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <NodeShell pos={pos} width={264} selected={selected} multiSelected={multiSelected} isDragging={isDragging} borderColor="#001F3F" hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className="relative" style={{ height: 148, background: "var(--secondary)", overflow: "hidden" }}>
        <svg width="264" height="148" viewBox="0 0 264 148" style={{ display: "block" }}>
          {[
            { x: 36, y: 74, label: "Start", color: "#74C365" },
            { x: 96, y: 44, label: "D1", color: "#1E488F" },
            { x: 96, y: 74, label: "D2", color: "#1E488F" },
            { x: 96, y: 104, label: "D3", color: "#1E488F" },
            { x: 164, y: 74, label: "Gateway", color: "#C0392B", bold: true },
            { x: 216, y: 50, label: "Path A", color: "#00804C" },
            { x: 216, y: 98, label: "Path B", color: "#001F3F" },
          ].map((n, i) => (
            <g key={i}>
              <rect x={n.x - 30} y={n.y - 12} width={60} height={24} rx={6} fill={n.color + "20"} stroke={n.color} strokeWidth={(n as any).bold ? 1.5 : 1} />
              <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill={n.color} fontWeight={(n as any).bold ? 700 : 500}>{n.label}</text>
            </g>
          ))}
          {[[36,74,66,44],[36,74,66,74],[36,74,66,104],[126,44,134,74],[126,74,134,74],[126,104,134,74],[194,74,201,50],[194,74,201,98]].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted-foreground)" strokeWidth={0.8} opacity={0.3} />
          ))}
          <rect x={146} y={100} width={48} height={18} rx={4} fill="rgba(219,230,76,0.35)" stroke="#DBE64C" strokeWidth={1} strokeDasharray="3 2" />
          <text x={170} y={109} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#4A5200" fontWeight={700}>D4: New</text>
        </svg>
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#DBE64C", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
          <Pin size={10} style={{ color: "#001F3F" }} />
        </div>
      </div>
      <div className="p-3 pt-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "#DBE64C28" }}>
            <Image size={11} style={{ color: "#4A5200" }} />
          </div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.3 }}>Flow Diagram — Final.png</p>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          <TypeChip label="Image" color="#4A5200" />
          <TypeChip label="1 pin note" color="#5C6B5A" />
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={e => e.stopPropagation()}>
              <HoverActions actions={["Explain visual", "Pin note", "Add to Map"]} onAction={onAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeShell>
  );
}

function LinkNode({ pos, selected, multiSelected, isDragging, onClick, onAction, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; multiSelected: boolean; isDragging: boolean;
  onClick: () => void; onAction: (a: string) => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = "#5C6B5A";
  return (
    <NodeShell pos={pos} width={214} selected={selected} multiSelected={multiSelected} isDragging={isDragging} borderColor={color} hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Globe size={13} style={{ color }} />
          <span style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>nngroup.com</span>
        </div>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}>NNG — Cognitive Load in UX</p>
        <div className="flex flex-wrap gap-1 mb-2">
          <TypeChip label="Link" color={color} />
          <div style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", padding: "2px 6px", borderRadius: 6, background: "var(--secondary)", border: "1px solid var(--border)" }}>
            Staged disclosure −64% latency
          </div>
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={e => e.stopPropagation()}>
              <HoverActions actions={["Open", "Extract", "Ask"]} onAction={onAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeShell>
  );
}

function PostItNode({ id, pos, text, sourceLabel, isPrivate = false, selected, isDragging, onClick, onDragStart }: {
  id: string; pos: { x: number; y: number }; text: string; sourceLabel?: string; isPrivate?: boolean;
  selected: boolean; isDragging: boolean; onClick: () => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={onDragStart}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      whileHover={{ rotate: 0.4 }}
      style={{
        position: "absolute", left: pos.x, top: pos.y, width: 162,
        background: "#FEFCD0", borderRadius: 10,
        border: `1.5px solid ${selected ? "#4A5200" : hovered ? "#DBE64C" : "#E5E494"}`,
        boxShadow: isDragging
          ? "0 16px 48px rgba(0,0,0,0.18)"
          : selected
          ? "0 0 0 2px rgba(74,82,0,0.18), 0 4px 12px rgba(74,82,0,0.14)"
          : hovered
          ? "0 4px 12px rgba(74,82,0,0.12)"
          : "0 2px 6px rgba(0,0,0,0.07)",
        cursor: isDragging ? "grabbing" : "grab",
        padding: "10px 12px",
        userSelect: "none",
        zIndex: isDragging ? 100 : selected ? 10 : hovered ? 5 : 2,
      }}
    >
      {isPrivate && (
        <div className="flex items-center gap-1 mb-1">
          <Lock size={9} style={{ color: "#4A5200", opacity: 0.6 }} />
          <span style={{ fontSize: "0.58rem", color: "#4A5200", opacity: 0.65 }}>Private</span>
        </div>
      )}
      <p style={{ fontSize: "0.72rem", lineHeight: 1.45, color: "#2A3200", fontWeight: 500 }}>{text}</p>
      {sourceLabel && (
        <div className="mt-1.5">
          <span style={{ fontSize: "0.6rem", color: "#4A5200", opacity: 0.7, background: "rgba(74,82,0,0.1)", padding: "1px 5px", borderRadius: 4 }}>{sourceLabel}</span>
        </div>
      )}
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 flex gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
            {["Add to Map", "Ask Bridge"].map(a => (
              <button key={a} className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.58rem", fontWeight: 600, background: "rgba(74,82,0,0.12)", color: "#4A5200" }}>{a}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuestionNode({ pos, selected, isDragging, onClick, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; isDragging: boolean;
  onClick: () => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = "#1E488F";
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={onDragStart}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: "absolute", left: pos.x, top: pos.y, width: 214,
        background: "rgba(30,72,143,0.05)", borderRadius: 14,
        border: `1.5px solid ${selected ? color : hovered ? color + "55" : color + "28"}`,
        boxShadow: isDragging
          ? "0 16px 48px rgba(0,31,63,0.2)"
          : selected
          ? `0 0 0 2px ${color}18`
          : "none",
        cursor: isDragging ? "grabbing" : "grab",
        padding: "10px 12px",
        userSelect: "none",
        zIndex: isDragging ? 100 : selected ? 10 : hovered ? 5 : 2,
      }}
    >
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: color + "18" }}>
          <HelpCircle size={11} style={{ color }} />
        </div>
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color, marginBottom: 4 }}>Open question</p>
          <p style={{ fontSize: "0.775rem", lineHeight: 1.4, fontWeight: 500 }}>Who owns sign-off on the gateway redesign?</p>
          <div className="mt-2"><TypeChip label="Needs confirmation" color="#C0392B" /></div>
        </div>
      </div>
    </div>
  );
}

// ─── Generated Output Nodes ───────────────────────────────────────────────────

function AudioOutputNode({ pos, selected, isDragging, onClick, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; isDragging: boolean;
  onClick: () => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const color = "#00804C";
  return (
    <NodeShell pos={pos} width={272} selected={selected} multiSelected={false} isDragging={isDragging} borderColor={color} hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ height: 3, background: color }} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: color + "18" }}>
              <AudioLines size={11} style={{ color }} />
            </div>
            <span style={{ fontSize: "0.67rem", fontWeight: 700, color }}>Generated · Audio</span>
          </div>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: color + "18", color }}>Ready</span>
        </div>
        <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>Audio Explainer — Decision Gateway</p>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#001F3F" }}
          >
            {playing ? <Pause size={11} style={{ color: "#DBE64C" }} /> : <Play size={11} style={{ color: "#DBE64C", marginLeft: 1 }} />}
          </button>
          <div className="flex-1">
            <WaveformBars count={28} height={24} color={color} progress={playing ? 0.35 : 0} />
          </div>
          <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>4:00</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          <TypeChip label="PDF" color="#1E488F" />
          <TypeChip label="Video" color="#00804C" />
          <TypeChip label="Audio" color="#74C365" />
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={e => e.stopPropagation()}>
              <HoverActions actions={["Regenerate", "Share", "Add to Map"]} onAction={() => {}} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeShell>
  );
}

function VideoOutputNode({ pos, selected, isDragging, onClick, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; isDragging: boolean;
  onClick: () => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = "#001F3F";
  const accentColor = "#00804C";
  return (
    <NodeShell pos={pos} width={268} selected={selected} multiSelected={false} isDragging={isDragging} borderColor={color} hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex items-center justify-center" style={{ height: 80, background: "linear-gradient(135deg,#0A1220 0%,#1A2E42 100%)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
          <Film size={14} style={{ color: "#fff" }} />
        </div>
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.5)", fontSize: "0.62rem", color: "#fff", fontFamily: "var(--font-mono)" }}>3:00</div>
      </div>
      <div className="flex gap-px" style={{ background: "var(--secondary)", padding: "4px 12px" }}>
        {[color+"55","#1E488F55","#00804C55",color+"44","#DBE64C55","#1E488F44","#74C36555"].map((c, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: 18, background: c }} />
        ))}
      </div>
      <div className="p-3 pt-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: color + "12" }}>
            <Film size={11} style={{ color }} />
          </div>
          <span style={{ fontSize: "0.67rem", fontWeight: 700, color: accentColor }}>Generated · Video</span>
        </div>
        <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>Video Explainer — Cognitive Load Flow</p>
        <div className="flex flex-wrap gap-1 mb-2">
          <TypeChip label="Diagram" color="#4A5200" />
          <TypeChip label="PDF" color="#1E488F" />
          <TypeChip label="Interview" color="#74C365" />
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={e => e.stopPropagation()}>
              <HoverActions actions={["Preview", "Edit scenes", "Export", "Share"]} onAction={() => {}} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeShell>
  );
}

function DocOutputNode({ pos, selected, isDragging, onClick, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; isDragging: boolean;
  onClick: () => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = "#1E488F";
  const accentColor = "#00804C";
  return (
    <NodeShell pos={pos} width={210} selected={selected} multiSelected={false} isDragging={isDragging} borderColor={color} hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ height: 3, background: color }} />
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: color + "18" }}>
            <FileText size={11} style={{ color }} />
          </div>
          <span style={{ fontSize: "0.67rem", fontWeight: 700, color: accentColor }}>Generated · Doc</span>
        </div>
        <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>Combined Understanding Doc</p>
        <div className="flex flex-col gap-1.5 mb-3 rounded-xl p-2.5" style={{ background: "var(--secondary)" }}>
          {[["Main idea", color],["Evidence","#00804C"],["Questions","#C0392B"],["Actions","#4A5200"]].map(([label, c]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
              <span style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          <TypeChip label="5 sources" color={color} />
          <TypeChip label="6 sections" color="#5C6B5A" />
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={e => e.stopPropagation()}>
              <HoverActions actions={["Open", "Export", "Share"]} onAction={() => {}} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeShell>
  );
}

function SessionNode({ pos, selected, isDragging, onClick, onDragStart }: {
  pos: { x: number; y: number }; selected: boolean; isDragging: boolean;
  onClick: () => void; onDragStart: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = "#5C6B5A";
  const accentColor = "#00804C";
  return (
    <NodeShell pos={pos} width={210} selected={selected} multiSelected={false} isDragging={isDragging} borderColor={color} hovered={hovered}
      onMouseDown={onDragStart} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#001F3F18" }}>
              <Mic size={10} style={{ color: "#001F3F" }} />
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center -ml-1.5" style={{ background: color + "18", border: "1.5px solid var(--card)" }}>
              <MessageCircle size={10} style={{ color }} />
            </div>
          </div>
          <span style={{ fontSize: "0.67rem", fontWeight: 700, color: accentColor }}>Generated · Session</span>
        </div>
        <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 5, lineHeight: 1.3 }}>Interactive Deep Dive</p>
        <p style={{ fontSize: "0.67rem", color: "var(--muted-foreground)", marginBottom: 8 }}>All sources · voice + text</p>
        <div className="rounded-xl p-2 mb-3" style={{ background: "var(--secondary)", fontSize: "0.67rem", color: "var(--muted-foreground)", lineHeight: 1.45, fontStyle: "italic" }}>
          "What is the biggest risk in the redesign?"
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} onClick={e => e.stopPropagation()}>
              <HoverActions actions={["Continue", "Voice mode", "Review"]} onAction={() => {}} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeShell>
  );
}

// ─── Floating Toolbar ─────────────────────────────────────────────────────────

function FloatingToolbar({ count, onAction }: { count: number; onAction: (a: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18 }}
      style={{ position: "absolute", left: "50%", top: 32, transform: "translateX(-50%)", zIndex: 30 }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-2xl border border-border"
        style={{ background: "var(--card)", boxShadow: "0 4px 20px rgba(0,31,63,0.14)", whiteSpace: "nowrap" }}
      >
        <span style={{ fontSize: "0.78rem", fontWeight: 600, padding: "0 8px", color: "var(--muted-foreground)" }}>{count} sources selected</span>
        <div className="w-px h-4 bg-border" />
        {[
          { label: "Ask", icon: Lightbulb },
          { label: "Audio", icon: AudioLines },
          { label: "Video", icon: Film },
          { label: "Doc", icon: FileText },
          { label: "Add to Map", icon: GitBranch },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => onAction(item.label)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-secondary transition-colors"
            style={{ fontSize: "0.775rem", fontWeight: 500, color: "var(--muted-foreground)" }}
          >
            <item.icon size={13} />
            {item.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Bridge Studio ────────────────────────────────────────────────────────────

const SOURCE_META: Record<string, { color: string; title: string; icon: React.ElementType; chips: string[] }> = {
  pdf:   { color: "#1E488F", title: "Assessment Framework v3.pdf", icon: FileText, chips: ["PDF","24 pages","3 highlights"] },
  video: { color: "#00804C", title: "UX Research Session.mp4",    icon: Video,    chips: ["Video","34:22","Transcript"] },
  audio: { color: "#74C365", title: "Stakeholder Interview.mp3",  icon: AudioLines,chips: ["Audio","18:05","Transcript"] },
  image: { color: "#4A5200", title: "Flow Diagram — Final.png",   icon: Image,    chips: ["Image","1 pin note"] },
  link:  { color: "#5C6B5A", title: "NNG — Cognitive Load in UX", icon: Globe,    chips: ["Link","nngroup.com"] },
};

function BridgeStudio({
  open,
  onToggle,
  selectedId,
  panelState,
  onPanelState,
  onClose,
  onAnnotate,
}: {
  open: boolean;
  onToggle: () => void;
  selectedId: string | null;
  panelState: RightPanelState;
  onPanelState: (s: RightPanelState) => void;
  onClose: () => void;
  onAnnotate: (msg: string) => void;
}) {
  const [askInput, setAskInput] = useState("");
  const [asked, setAsked] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const isSource = selectedId ? Object.keys(SOURCE_META).includes(selectedId) : false;
  const isOutput = selectedId ? ["audio-out","video-out","doc-out","session"].includes(selectedId) : false;

  const triggerCreate = () => {
    setCreating(true);
    setTimeout(() => { setCreating(false); setCreated(true); onAnnotate("New output created — Map updated"); }, 1800);
  };

  const panelTitle = () => {
    if (panelState === "ask") return "Ask Bridge";
    if (panelState === "create-audio") return "Create Audio";
    if (panelState === "create-video") return "Create Video";
    if (panelState === "create-doc") return "Create Document";
    if (isSource) return "Source";
    if (isOutput) return "Output";
    return "Bridge Studio";
  };

  const showBack = panelState !== "default" || isSource || isOutput;

  return (
    <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-full flex-shrink-0 border-l border-border flex flex-col"
            style={{
              width: 320,
              background: "var(--card)",
              boxShadow: "-4px 0 24px rgba(0,31,63,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <p style={{ fontWeight: 700, fontSize: "0.875rem" }}>{panelTitle()}</p>
              <div className="flex items-center gap-1">
                {showBack && (
                  <button
                    onClick={() => {
                      if (panelState !== "default") onPanelState("default");
                      else onClose();
                    }}
                    className="px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
                    style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}
                  >
                    Back
                  </button>
                )}
                <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors" style={{ color: "var(--muted-foreground)" }}>
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

              {/* ── DEFAULT ── */}
              {panelState === "default" && !selectedId && (
                <>
                  {/* Analyze changes alert */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 animate-pulse" style={{ background: "#C0392B" }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.3 }}>2 connected files changed</p>
                      <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: 2 }}>Design Brief updated 8 min ago</p>
                    </div>
                    <button onClick={() => onAnnotate("Analyzing changes…")} className="flex-shrink-0 px-2.5 py-1 rounded-lg hover:opacity-90 transition-all" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.68rem", fontWeight: 700 }}>Analyze</button>
                  </div>

                  {/* Context Work */}
                  <div className="rounded-xl border border-border overflow-hidden" style={{ background: "var(--secondary)" }}>
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                      <p style={{ fontSize: "0.72rem", fontWeight: 700 }}>Context Work</p>
                      <button className="px-2 py-0.5 rounded-lg border border-border hover:bg-card transition-colors" style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--muted-foreground)" }}>View work</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-3">
                      {[{label:"4 tasks",color:"#5C6B5A"},{label:"2 blocked",color:"#C0392B"},{label:"3 questions",color:"#1E488F"},{label:"1 review",color:"#4A5200"}].map(c => (
                        <span key={c.label} style={{ fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: c.color+"12", color: c.color, border: `1px solid ${c.color}28` }}>{c.label}</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 px-3 pb-3">
                      <button onClick={() => onAnnotate("Creating task…")} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-card transition-colors" style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                        <Plus size={11} />Create task
                      </button>
                      <button onClick={() => onAnnotate("Bridge analyzing work…")} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-card transition-colors" style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                        <Zap size={11} />Analyze work
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 10 }}>Create from this Bridge</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { label: "Audio explainer", icon: AudioLines, state: "create-audio" },
                        { label: "Video explainer", icon: Film,       state: "create-video" },
                        { label: "Combined doc",    icon: FileText,   state: "create-doc"   },
                        { label: "Visual summary",  icon: Zap,        state: "create-doc"   },
                        { label: "Interactive session", icon: Mic,    state: "ask"          },
                        { label: "Handoff brief",   icon: BookOpen,   state: "create-doc"   },
                      ] as { label: string; icon: React.ElementType; state: RightPanelState }[]).map((item) => (
                        <button
                          key={item.label}
                          onClick={() => onPanelState(item.state)}
                          className="flex flex-col items-start gap-1.5 p-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-left"
                          style={{ background: "var(--background)" }}
                        >
                          <item.icon size={13} style={{ color: "var(--muted-foreground)" }} />
                          <span style={{ fontSize: "0.72rem", fontWeight: 500, lineHeight: 1.3 }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <button
                    onClick={() => onPanelState("ask")}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors"
                  >
                    <Lightbulb size={14} style={{ color: "#DBE64C" }} />
                    <span style={{ fontSize: "0.825rem", fontWeight: 500 }}>Ask Bridge about all sources</span>
                    <ChevronRight size={12} className="ml-auto" style={{ color: "var(--muted-foreground)" }} />
                  </button>

                  <div className="h-px bg-border" />

                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Recent outputs</p>
                    {[
                      { label: "Audio Explainer — Decision Gateway", meta: "4 min",      color: "#00804C", icon: AudioLines },
                      { label: "Video Explainer — Cognitive Load",   meta: "3 min",      color: "#001F3F", icon: Film       },
                      { label: "Combined Understanding Doc",          meta: "6 sections", color: "#1E488F", icon: FileText  },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 py-2 border-b border-border last:border-none">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: item.color + "18" }}>
                          <item.icon size={11} style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate" style={{ fontSize: "0.775rem", fontWeight: 500, lineHeight: 1.3 }}>{item.label}</p>
                          <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>{item.meta}</p>
                        </div>
                        <ArrowUpRight size={11} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Open questions</p>
                    <div className="p-3 rounded-xl" style={{ background: "rgba(30,72,143,0.05)", border: "1px solid rgba(30,72,143,0.15)" }}>
                      <div className="flex items-start gap-2">
                        <HelpCircle size={12} style={{ color: "#1E488F", marginTop: 2, flexShrink: 0 }} />
                        <p style={{ fontSize: "0.775rem", lineHeight: 1.45 }}>Who owns sign-off on the gateway redesign?</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── SOURCE SELECTED ── */}
              {isSource && panelState === "default" && selectedId && (() => {
                const src = SOURCE_META[selectedId];
                const Icon = src.icon;
                return (
                  <>
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: src.color + "18" }}>
                        <Icon size={16} style={{ color: src.color }} />
                      </div>
                      <div className="min-w-0">
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.3 }}>{src.title}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">{src.chips.map(c => <TypeChip key={c} label={c} color={src.color} />)}</div>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex flex-col gap-1.5">
                      {([
                        { label: "Ask this source",          icon: Lightbulb,  action: () => onPanelState("ask")          },
                        { label: "Create audio from this",    icon: AudioLines, action: () => onPanelState("create-audio") },
                        { label: "Create video from this",    icon: Film,       action: () => onPanelState("create-video") },
                        { label: "Create document from this", icon: FileText,   action: () => onPanelState("create-doc")   },
                        { label: "Add to Map",                icon: GitBranch,  action: () => onAnnotate("Map updated")    },
                        { label: "Add note",                  icon: StickyNote, action: () => {}                           },
                      ] as { label: string; icon: React.ElementType; action: () => void }[]).map(item => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-border hover:bg-secondary transition-colors"
                          style={{ fontSize: "0.825rem", fontWeight: 500 }}
                        >
                          <item.icon size={13} style={{ color: "var(--muted-foreground)" }} />
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-px bg-border" />

                    <div>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Related Map cards</p>
                      {["Decision gateway creates peak load", "Timeline revised to March 15"].map(t => (
                        <div key={t} className="px-3 py-2 rounded-xl border border-border mb-1.5" style={{ background: "var(--background)", fontSize: "0.775rem", lineHeight: 1.4 }}>{t}</div>
                      ))}
                    </div>
                  </>
                );
              })()}

              {/* ── OUTPUT SELECTED ── */}
              {isOutput && panelState === "default" && selectedId && (
                <>
                  <div className="p-3 rounded-xl border border-border" style={{ background: "var(--secondary)", fontSize: "0.8rem", lineHeight: 1.6, color: "var(--muted-foreground)", fontStyle: "italic" }}>
                    {selectedId === "audio-out" ? "Audio Explainer — Decision Gateway · 4 min · Ready" :
                     selectedId === "video-out" ? "Video Explainer — Cognitive Load Flow · 3 min · Ready" :
                     selectedId === "doc-out"   ? "Combined Understanding Doc · 6 sections · Ready" :
                     "Interactive Deep Dive · All sources · Active"}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Source references</p>
                    <div className="flex flex-wrap gap-1">
                      {["PDF","Video","Audio","Image"].map(s => <TypeChip key={s} label={s} color="#1E488F" />)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { label: "Edit prompt",  icon: Lightbulb  },
                      { label: "Regenerate",   icon: RefreshCw  },
                      { label: "Export",       icon: Download   },
                      { label: "Share",        icon: Share2     },
                      { label: "Add to Map",   icon: GitBranch  },
                    ] as { label: string; icon: React.ElementType }[]).map(item => (
                      <button
                        key={item.label}
                        onClick={() => { if (item.label === "Add to Map") onAnnotate("Output linked to Map"); }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-border hover:bg-secondary transition-colors"
                        style={{ fontSize: "0.825rem", fontWeight: 500 }}
                      >
                        <item.icon size={13} style={{ color: "var(--muted-foreground)" }} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── ASK BRIDGE ── */}
              {panelState === "ask" && (
                <>
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 10 }}>Suggested</p>
                    <div className="flex flex-col gap-1.5">
                      {[
                        "Explain all of this in simple terms",
                        "What am I missing?",
                        "How are these sources connected?",
                        "What questions should I ask?",
                        "Create an audio walkthrough",
                        "Take me through this like a presentation",
                      ].map(q => (
                        <button
                          key={q}
                          onClick={() => { setAsked(true); onAnnotate("Bridge answered — source references ready"); }}
                          className="w-full text-left px-3 py-2 rounded-xl border border-border hover:bg-secondary transition-colors"
                          style={{ fontSize: "0.78rem", lineHeight: 1.4 }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {asked && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                        <div className="h-px bg-border" />
                        <div className="p-3 rounded-xl" style={{ background: "rgba(219,230,76,0.12)", border: "1px solid rgba(219,230,76,0.3)" }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Zap size={11} style={{ color: "#4A5200" }} />
                            <span style={{ fontSize: "0.67rem", fontWeight: 700, color: "#4A5200" }}>Bridge</span>
                          </div>
                          <p style={{ fontSize: "0.8rem", lineHeight: 1.65 }}>
                            The core issue is the simultaneous presentation of three criteria at the decision gateway, creating peak cognitive load. Dr. Chen confirmed the March 15 timeline shift. The flow diagram shows an undocumented node (D4) absent from Framework v3.
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {["PDF p.14", "Audio 08:42", "Diagram"].map(ref => (
                              <button key={ref} className="px-2 py-0.5 rounded-full border hover:bg-secondary transition-colors" style={{ fontSize: "0.65rem", fontWeight: 600, color: "#1E488F", background: "#1E488F10", borderColor: "#1E488F28" }}>
                                → {ref}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="h-px bg-border" />
                  <div className="flex gap-2">
                    <input
                      value={askInput}
                      onChange={e => setAskInput(e.target.value)}
                      placeholder="Ask about all sources…"
                      className="flex-1 px-3 py-2 rounded-xl border border-border outline-none"
                      style={{ fontSize: "0.825rem", background: "var(--input-background)" }}
                      onKeyDown={e => { if (e.key === "Enter" && askInput.trim()) { setAsked(true); setAskInput(""); onAnnotate("Bridge answered"); } }}
                    />
                    <button className="px-3 py-2 rounded-xl" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.825rem", fontWeight: 600 }}>Ask</button>
                  </div>
                  <button className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.78rem" }}>
                    <Mic size={13} style={{ color: "var(--muted-foreground)" }} />
                    Voice mode
                  </button>
                </>
              )}

              {/* ── CREATE AUDIO ── */}
              {panelState === "create-audio" && (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(0,128,76,0.07)", border: "1.5px solid rgba(0,128,76,0.2)" }}>
                    <AudioLines size={14} style={{ color: "#00804C" }} />
                    <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#00804C" }}>Audio Explainer</span>
                  </div>
                  {[
                    { label: "Source scope", opts: ["All sources","Selected sources","Current frame"] },
                    { label: "Length",       opts: ["2 min","5 min","10 min"]                       },
                    { label: "Format",       opts: ["Narrated summary","Conversation","Guided walkthrough"] },
                    { label: "Voice style",  opts: ["Calm","Energetic","Professional"]              },
                  ].map(({ label, opts }) => (
                    <div key={label}>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>{label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {opts.map((o, i) => (
                          <button key={o} className="px-3 py-1.5 rounded-xl border transition-colors" style={{ fontSize: "0.78rem", fontWeight: i === 0 ? 600 : 400, background: i === 0 ? "#001F3F" : "var(--secondary)", color: i === 0 ? "#F6F7ED" : "var(--foreground)", borderColor: i === 0 ? "#001F3F" : "var(--border)" }}>{o}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={triggerCreate} className="w-full py-2.5 rounded-xl transition-all" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.9rem", fontWeight: 700 }}>
                    {creating ? "Creating…" : created ? "✓ Audio created" : "Create audio"}
                  </button>
                </>
              )}

              {/* ── CREATE VIDEO ── */}
              {panelState === "create-video" && (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(0,31,63,0.06)", border: "1.5px solid rgba(0,31,63,0.2)" }}>
                    <Film size={14} style={{ color: "#001F3F" }} />
                    <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#001F3F" }}>Video Explainer</span>
                  </div>
                  {[
                    { label: "Source scope", opts: ["All sources","Selected sources","Current frame"] },
                    { label: "Length",       opts: ["1 min","3 min","5 min"]                         },
                    { label: "Style",        opts: ["Visual walkthrough","Slide-style","Whiteboard"]  },
                    { label: "Audience",     opts: ["Team","Client","Expert"]                         },
                    { label: "Tone",         opts: ["Calm","Direct","Story-like"]                     },
                  ].map(({ label, opts }) => (
                    <div key={label}>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>{label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {opts.map((o, i) => (
                          <button key={o} className="px-3 py-1.5 rounded-xl border transition-colors" style={{ fontSize: "0.78rem", fontWeight: i === 0 ? 600 : 400, background: i === 0 ? "#001F3F" : "var(--secondary)", color: i === 0 ? "#F6F7ED" : "var(--foreground)", borderColor: i === 0 ? "#001F3F" : "var(--border)" }}>{o}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={triggerCreate} className="w-full py-2.5 rounded-xl transition-all" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.9rem", fontWeight: 700 }}>
                    {creating ? "Creating…" : created ? "✓ Video created" : "Create video"}
                  </button>
                </>
              )}

              {/* ── CREATE DOCUMENT ── */}
              {panelState === "create-doc" && (
                <>
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(30,72,143,0.06)", border: "1.5px solid rgba(30,72,143,0.2)" }}>
                    <FileText size={14} style={{ color: "#1E488F" }} />
                    <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#1E488F" }}>Combined Document</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Source scope</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["All sources","Selected sources"].map((o, i) => (
                        <button key={o} className="px-3 py-1.5 rounded-xl border transition-colors" style={{ fontSize: "0.78rem", fontWeight: i === 0 ? 600 : 400, background: i === 0 ? "#001F3F" : "var(--secondary)", color: i === 0 ? "#F6F7ED" : "var(--foreground)", borderColor: i === 0 ? "#001F3F" : "var(--border)" }}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 8 }}>Format</p>
                    <div className="flex flex-col gap-1.5">
                      {["Handoff brief","Study guide","Research synthesis","Meeting summary","Client explanation","Working notes"].map((o, i) => (
                        <button key={o} className="w-full text-left px-3 py-2 rounded-xl border transition-colors" style={{ fontSize: "0.8rem", fontWeight: i === 0 ? 600 : 400, background: i === 0 ? "#001F3F" : "var(--secondary)", color: i === 0 ? "#F6F7ED" : "var(--foreground)", borderColor: i === 0 ? "#001F3F" : "var(--border)" }}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={triggerCreate} className="w-full py-2.5 rounded-xl transition-all" style={{ background: "#001F3F", color: "#DBE64C", fontSize: "0.9rem", fontWeight: 700 }}>
                    {creating ? "Creating…" : created ? "✓ Document created" : "Create document"}
                  </button>
                </>
              )}

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function WorkspaceCanvas({ onAnnotate }: WorkspaceCanvasProps) {
  const [positions, setPositions] = useState({ ...DEFAULT_POS });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [multiSelect, setMultiSelect] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [panelState, setPanelState] = useState<RightPanelState>("default");
  const [zoom, setZoom] = useState(100);
  const [ctxMenu, setCtxMenu] = useState<{ kind: "source"|"postit"|"output"; x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: string; startMX: number; startMY: number; startX: number; startY: number } | null>(null);

  const startDrag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { id, startMX: e.clientX, startMY: e.clientY, startX: positions[id].x, startY: positions[id].y };
    setDraggingId(id);
    setSelectedId(id);
    setStudioOpen(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const { id, startMX, startMY, startX, startY } = dragRef.current;
    setPositions(prev => ({ ...prev, [id]: { x: startX + e.clientX - startMX, y: startY + e.clientY - startMY } }));
  };

  const stopDrag = () => {
    dragRef.current = null;
    setDraggingId(null);
  };

  const select = (id: string) => {
    setSelectedId(id);
    setMultiSelect(false);
    setPanelState("default");
    setStudioOpen(true);
  };

  const handleMultiAction = (action: string) => {
    if (action === "Add to Map") { onAnnotate("Sources added to Map"); return; }
    if (action === "Audio") { setPanelState("create-audio"); setStudioOpen(true); return; }
    if (action === "Video") { setPanelState("create-video"); setStudioOpen(true); return; }
    if (action === "Doc")   { setPanelState("create-doc");   setStudioOpen(true); return; }
    if (action === "Ask")   { setPanelState("ask");          setStudioOpen(true); return; }
  };

  const handleCanvasClick = () => {
    setSelectedId(null);
    setMultiSelect(false);
    setStudioOpen(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden" style={{ position: "relative" }}>
      <div className="flex-1 overflow-hidden relative" style={{ minWidth: 0 }}>
        {/* Scrollable canvas */}
        <div
          className="absolute inset-0 overflow-auto"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
          onClick={handleCanvasClick}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          <div style={{ position: "relative", width: 1640, height: 780, minWidth: "100%" }}>

            {/* Context Frame label */}
            <div style={{ position: "absolute", left: 24, top: 24, width: 1592, height: 712, border: "1.5px dashed var(--border)", borderRadius: 24, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: -11, left: 20, background: "var(--background)", padding: "2px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                Decision Gateway Context
              </div>
            </div>

            {/* Floating toolbar on multi-select */}
            <AnimatePresence>
              {multiSelect && <FloatingToolbar count={5} onAction={handleMultiAction} />}
            </AnimatePresence>

            {/* Canvas-level studio actions */}
            <div className="flex items-center gap-2" style={{ position: "absolute", top: 40, right: 48, zIndex: 10 }}>
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={(e) => { e.stopPropagation(); setStudioOpen(true); setPanelState("default"); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-secondary transition-colors"
                style={{ fontSize: "0.775rem", fontWeight: 600, color: studioOpen ? "#001F3F" : "var(--muted-foreground)", background: studioOpen ? "#DBE64C" : "var(--card)" }}
              >
                <Lightbulb size={12} />
                Studio
              </motion.button>
              {!multiSelect && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={(e) => { e.stopPropagation(); setMultiSelect(true); setSelectedId(null); setPanelState("default"); setStudioOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-secondary transition-colors"
                  style={{ fontSize: "0.775rem", fontWeight: 500, color: "var(--muted-foreground)", background: "var(--card)" }}
                >
                  <Zap size={12} style={{ color: "#DBE64C" }} />
                  Create from all sources
                </motion.button>
              )}
            </div>

            {/* Source nodes */}
            <div onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ kind: "source", x: e.clientX, y: e.clientY }); }}>
              <PDFNode   pos={positions["pdf"]}   selected={selectedId === "pdf"}   multiSelected={multiSelect} isDragging={draggingId === "pdf"}
                onClick={() => select("pdf")}   onAction={a => onAnnotate(`${a} — working…`)} onDragStart={e => startDrag("pdf", e)} />
              <VideoNode pos={positions["video"]} selected={selectedId === "video"} multiSelected={multiSelect} isDragging={draggingId === "video"}
                onClick={() => select("video")} onAction={a => onAnnotate(`${a} — working…`)} onDragStart={e => startDrag("video", e)} />
              <AudioNode pos={positions["audio"]} selected={selectedId === "audio"} multiSelected={multiSelect} isDragging={draggingId === "audio"}
                onClick={() => select("audio")} onAction={a => onAnnotate(`${a} — working…`)} onDragStart={e => startDrag("audio", e)} />
              <ImageNode pos={positions["image"]} selected={selectedId === "image"} multiSelected={multiSelect} isDragging={draggingId === "image"}
                onClick={() => select("image")} onAction={a => onAnnotate(`${a} — working…`)} onDragStart={e => startDrag("image", e)} />
              <LinkNode  pos={positions["link"]}  selected={selectedId === "link"}  multiSelected={multiSelect} isDragging={draggingId === "link"}
                onClick={() => select("link")}  onAction={a => onAnnotate(`${a} — working…`)} onDragStart={e => startDrag("link", e)} />
            </div>

            {/* Notes */}
            <div onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ kind: "postit", x: e.clientX, y: e.clientY }); }}>
              <PostItNode id="note-a" pos={positions["note-a"]} text="D4 node missing from Framework v3 — check with team" sourceLabel="↳ Flow Diagram"
                selected={selectedId === "note-a"} isDragging={draggingId === "note-a"} onClick={() => select("note-a")} onDragStart={e => startDrag("note-a", e)} />
              <PostItNode id="note-b" pos={positions["note-b"]} text="March 15 confirmed by Dr. Chen" sourceLabel="↳ Audio 08:42"
                selected={selectedId === "note-b"} isDragging={draggingId === "note-b"} onClick={() => select("note-b")} onDragStart={e => startDrag("note-b", e)} />
              <PostItNode id="note-c" pos={positions["note-c"]} text="Staged disclosure = key insight" isPrivate
                selected={selectedId === "note-c"} isDragging={draggingId === "note-c"} onClick={() => select("note-c")} onDragStart={e => startDrag("note-c", e)} />
            </div>

            {/* Question */}
            <QuestionNode pos={positions["question"]} selected={selectedId === "question"} isDragging={draggingId === "question"}
              onClick={() => select("question")} onDragStart={e => startDrag("question", e)} />

            {/* Generated outputs */}
            <div onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ kind: "output", x: e.clientX, y: e.clientY }); }}>
              <AudioOutputNode pos={positions["audio-out"]} selected={selectedId === "audio-out"} isDragging={draggingId === "audio-out"}
                onClick={() => select("audio-out")} onDragStart={e => startDrag("audio-out", e)} />
              <VideoOutputNode pos={positions["video-out"]} selected={selectedId === "video-out"} isDragging={draggingId === "video-out"}
                onClick={() => select("video-out")} onDragStart={e => startDrag("video-out", e)} />
              <DocOutputNode   pos={positions["doc-out"]}   selected={selectedId === "doc-out"}   isDragging={draggingId === "doc-out"}
                onClick={() => select("doc-out")} onDragStart={e => startDrag("doc-out", e)} />
              <SessionNode     pos={positions["session"]}   selected={selectedId === "session"}   isDragging={draggingId === "session"}
                onClick={() => select("session")} onDragStart={e => startDrag("session", e)} />
            </div>
          </div>
        </div>

        {/* Privacy indicator */}
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 15, pointerEvents: "none" }}>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border" style={{ background: "var(--card)", opacity: 0.88, boxShadow: "0 1px 6px rgba(0,31,63,0.06)" }}>
            <Lock size={10} style={{ color: "var(--muted-foreground)" }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--muted-foreground)" }}>Private canvas</span>
          </div>
        </div>

        {/* Right-click context menu */}
        <AnimatePresence>
          {ctxMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCtxMenu(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.97, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.12 }} className="fixed z-50 rounded-xl border border-border overflow-hidden" style={{ left: ctxMenu.x, top: ctxMenu.y, background: "var(--card)", boxShadow: "0 8px 32px rgba(0,31,63,0.14)", minWidth: 210 }}>
                {(ctxMenu.kind === "source" ? [
                  ["Analyze source","Analyze changes","Ask Bridge"],
                  ["Create context task","Create audio explainer","Create video explainer","Create document"],
                  ["Add note","Add comment","Ask owner","Open in Canvas"],
                  ["Add to main context","Open original"],
                ] : ctxMenu.kind === "postit" ? [
                  ["Make question","Assign question","Create context task","Add to Map"],
                  ["Ask Bridge","Share with person","Mark private"],
                ] : [
                  ["Edit prompt","Regenerate","Assign review","Create task"],
                  ["Share","Add to Map","Add to main context","Export"],
                ]).map((grp, gi) => (
                  <div key={gi} className={gi > 0 ? "border-t border-border" : ""}>
                    {grp.map(item => (
                      <button key={item} onClick={() => setCtxMenu(null)} className="w-full flex items-center px-4 py-2 hover:bg-secondary transition-colors text-left" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>{item}</button>
                    ))}
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Canvas controls overlay */}
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-2xl border border-border"
            style={{ background: "var(--card)", boxShadow: "0 4px 16px rgba(0,31,63,0.1)" }}
          >
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--muted-foreground)", lineHeight: 1 }}>−</button>
            <button onClick={() => setZoom(100)} className="px-2 py-0.5 rounded-md hover:bg-secondary transition-colors" style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted-foreground)", minWidth: 40, textAlign: "center" }}>{zoom}%</button>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--muted-foreground)", lineHeight: 1 }}>+</button>
          </div>
        </div>

      </div>
      <BridgeStudio
        open={studioOpen}
        onToggle={() => setStudioOpen(o => !o)}
        selectedId={selectedId}
        panelState={panelState}
        onPanelState={setPanelState}
        onClose={() => { setStudioOpen(false); setSelectedId(null); setMultiSelect(false); }}
        onAnnotate={onAnnotate}
      />
    </div>
  );
}
