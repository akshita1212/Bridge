import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CornerDownRight, FileText, Video, AudioLines, Image, Globe, StickyNote } from "lucide-react";
import { api } from "../lib/api";

// ─── Ask the agent ───────────────────────────────────────────────────────────
// A corner button that opens a small chat with the project assistant. It
// answers from the whole Bridge: every source, Map card and note. Live
// bridges ask the API; demo bridges answer from the prototype's own content
// so the flow can be shown without a backend.

type SourceType = "pdf" | "doc" | "text" | "video" | "audio" | "image" | "link" | "note";

export interface AgentSource {
  id: string;
  title: string;
  type?: SourceType;
}

export interface AgentKnowledge {
  id: string;
  kind: string;
  title: string;
  body: string;
  confidence?: string;
  sources: AgentSource[];
}

type Message =
  | { role: "user"; text: string }
  | { role: "agent"; headline: string; body: string; sources: AgentSource[]; followUps?: string[] };

const SUGGESTED = ["What changed in the latest brief?", "Summarize this whole Bridge", "What's still unanswered?", "Make a 2-minute audio summary"];

const TYPE_CHIP: Record<SourceType, { label: string; icon: React.ElementType }> = {
  pdf: { label: "PDF", icon: FileText },
  doc: { label: "Doc", icon: FileText },
  text: { label: "Text", icon: FileText },
  video: { label: "Video", icon: Video },
  audio: { label: "Audio", icon: AudioLines },
  image: { label: "Image", icon: Image },
  link: { label: "Link", icon: Globe },
  note: { label: "Note", icon: StickyNote },
};

function Spark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5z" fill="currentColor" />
    </svg>
  );
}

const STOP = new Set(["the", "what", "whats", "what's", "this", "that", "about", "with", "there", "which", "does", "have", "from"]);
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

function uniqSources(items: AgentKnowledge[]) {
  const seen = new Set<string>();
  return items.flatMap((i) => i.sources).filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
}

/** Demo answerer: picks the Map cards that best match the question. */
function answerFromContent(q: string, knowledge: AgentKnowledge[]): Message {
  const ql = q.toLowerCase();
  const byKind = (...k: string[]) => knowledge.filter((i) => k.includes(i.kind));
  const reply = (headline: string, body: string, picks: AgentKnowledge[], followUps: string[]): Message => ({ role: "agent", headline, body, sources: uniqSources(picks), followUps });

  if (/summar|overview|whole|everything|tl;?dr/.test(ql)) {
    const main = byKind("main")[0];
    const picks = [...byKind("main"), ...byKind("must-know")];
    return reply(`${main?.title ?? "Here's the short version"}.`, `${main?.body ?? ""} Also: ${byKind("must-know").map((p) => p.title.toLowerCase()).join("; ")}.`, picks, ["What's still unanswered?", "Make a 2-minute audio summary"]);
  }
  if (/audio|podcast|video|explainer|slides|output/.test(ql)) {
    const kind = /video/.test(ql) ? "video explainer" : /slides/.test(ql) ? "slide outline" : "2-minute audio summary";
    const picks = [...byKind("main"), ...byKind("must-know"), ...byKind("decision")];
    return reply(`Making a ${kind}.`, `It covers ${picks.length} findings from ${uniqSources(picks).length} sources and opens in your Workspace when it's ready.`, picks, ["Make it a video instead"]);
  }
  if (/chang|latest|brief|update/.test(ql)) {
    const picks = byKind("must-know").slice(0, 1);
    return reply(`${picks[0]?.title ?? "Nothing has changed"}.`, "The latest brief still references the old milestone date, so the PDF and the framework should be aligned before handoff.", picks, ["Who owns sign-off?", "What should we do next?"]);
  }
  if (/unanswer|open|gap|missing|unknown|who|owner|sign/.test(ql)) {
    const picks = byKind("question");
    return reply(picks.length ? "No source answers this yet." : "Nothing is open right now.", picks.length ? `${picks.map((p) => p.title).join(" ")} I've added it to Open questions so the right person is asked.` : "", picks, ["Where do sources disagree?"]);
  }
  if (/decid|decision|chose|chosen/.test(ql)) {
    const picks = byKind("decision");
    return reply(`${picks[0]?.title ?? "No decisions yet"}.`, picks[0]?.body ?? "", picks, ["What are the risks?"]);
  }
  if (/disagree|conflict|contradict|differ|risk/.test(ql)) {
    const picks = byKind("risk");
    return reply(`${picks[0]?.title ?? "Sources line up"}.`, picks[0]?.body ?? "", picks, ["What should we do next?"]);
  }
  if (/next|todo|action|should/.test(ql)) {
    const picks = byKind("action");
    return reply(`${picks[0]?.title ?? "Nothing planned yet"}.`, picks[0]?.body ?? "", picks, ["Who owns sign-off?"]);
  }

  const qw = words(q);
  const best = knowledge
    .map((i) => ({ i, score: words(`${i.title} ${i.body}`).filter((w) => qw.some((x) => w.startsWith(x.slice(0, 5)))).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.i;
  if (!best) return reply("I couldn't find that in this Bridge.", "Add a file or note that covers it, and I'll pick it up.", [], ["Summarize this whole Bridge"]);
  return reply(`${best.title}.`, best.body, [best], ["Summarize this whole Bridge"]);
}

// ─── Corner button ───────────────────────────────────────────────────────────

export function AskAgentButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      onClick={onClick}
      title="Ask the agent"
      aria-label="Ask the agent"
      className="fixed bottom-24 right-5 z-30 w-[70px] h-[70px] rounded-full flex items-center justify-center transition-transform hover:scale-105"
      style={{ background: "#DBE64C", color: "#001F3F", boxShadow: "0 10px 30px rgba(0,31,63,0.18)" }}
    >
      <Spark size={30} />
    </motion.button>
  );
}

// ─── Chat card ───────────────────────────────────────────────────────────────

export function AskAgentPanel({
  bridgeId,
  isLive,
  knowledge,
  onClose,
  onOpenSource,
}: {
  bridgeId: string;
  isLive: boolean;
  knowledge: AgentKnowledge[];
  onClose: () => void;
  onOpenSource: (id: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      if (isLive) {
        const res = await api.ask(bridgeId, q);
        const [headline, ...rest] = res.answer.split(/(?<=[.!?])\s+/);
        setMessages((m) => [...m, { role: "agent", headline, body: rest.join(" "), sources: res.sources.map((s) => ({ id: s.id, title: s.title })) }]);
      } else {
        await new Promise((r) => setTimeout(r, 700));
        setMessages((m) => [...m, answerFromContent(q, knowledge)]);
      }
    } catch (err) {
      setMessages((m) => [...m, { role: "agent", headline: "Something went wrong.", body: err instanceof Error ? err.message : "", sources: [] }]);
    } finally {
      setBusy(false);
    }
  };

  const last = messages[messages.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-8 bottom-24 z-40 w-[360px] rounded-2xl border border-border overflow-hidden flex flex-col"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-xl)", height: "min(420px, calc(100vh - 140px))", transformOrigin: "bottom right" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#DBE64C", color: "#001F3F" }}><Spark size={13} /></div>
        <div className="flex-1">
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Ask the agent</p>
          <p style={{ fontSize: "0.66rem", color: "var(--muted-foreground)" }}>Your project assistant</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="hover:bg-secondary rounded-lg p-1.5 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={14} /></button>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col gap-1.5">
            <p style={{ fontSize: "0.76rem", color: "var(--muted-foreground)", lineHeight: 1.5, marginBottom: 4 }}>
              Ask anything about this project. Answers come from all its sources, the Map and notes.
            </p>
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-left px-3 py-2 rounded-xl border border-border hover:bg-secondary transition-colors flex items-center gap-2" style={{ fontSize: "0.78rem", fontWeight: 500 }}>
                <CornerDownRight size={12} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="self-start px-3.5 py-2.5 rounded-xl" style={{ background: "var(--status-warn-soft)", border: "1px solid rgba(138,147,0,0.25)", fontSize: "0.8rem", fontWeight: 700, maxWidth: "88%" }}>
              {m.text}
            </div>
          ) : (
            <div key={i} className="rounded-xl border border-border p-3" style={{ background: "var(--secondary)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#DBE64C", color: "#001F3F" }}><Spark size={11} /></div>
                <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", flex: 1 }}>Agent</span>
                {m.sources[0] && (
                  <button onClick={() => onOpenSource(m.sources[0].id)} style={{ fontSize: "0.66rem", fontWeight: 600, color: "var(--muted-foreground)" }} className="hover:underline">Preview</button>
                )}
              </div>
              <p style={{ fontSize: "0.86rem", fontWeight: 700, lineHeight: 1.35 }}>{m.headline}</p>
              {m.body && <p style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", lineHeight: 1.5, marginTop: 4 }}>{m.body}</p>}
              {m.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {m.sources.map((s) => {
                    const chip = s.type ? TYPE_CHIP[s.type] : null;
                    const Icon = chip?.icon ?? FileText;
                    return (
                      <button key={s.id} onClick={() => onOpenSource(s.id)} title={s.title} className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-border hover:bg-card transition-colors" style={{ fontSize: "0.66rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                        <Icon size={10} />
                        {chip?.label ?? (s.title.length > 18 ? s.title.slice(0, 17) + "…" : s.title)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ),
        )}

        {last?.role === "agent" && !busy && last.followUps?.map((f) => (
          <button key={f} onClick={() => send(f)} className="self-start flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
            <CornerDownRight size={11} />
            {f}
          </button>
        ))}

        <AnimatePresence>
          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="self-start flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: "var(--secondary)" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce inline-block" style={{ background: "var(--muted-foreground)", animationDelay: `${i * 0.15}s` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-3.5 py-3 border-t border-border flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          autoFocus
          className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-border outline-none"
          style={{ fontSize: "0.8rem", background: "var(--input-background)" }}
        />
        <button
          onClick={() => send()}
          disabled={busy || !input.trim()}
          className="px-4 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "#DBE64C", color: "#001F3F", fontSize: "0.8rem", fontWeight: 700 }}
        >
          Send
        </button>
      </div>
    </motion.div>
  );
}
