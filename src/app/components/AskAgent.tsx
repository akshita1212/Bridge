import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ArrowUp, HelpCircle, FileText, Map as MapIcon, StickyNote, AudioLines, CornerDownRight } from "lucide-react";
import { api } from "../lib/api";

// ─── Ask Bridge agent ────────────────────────────────────────────────────────
// One agent that answers from everything in this Bridge: every source, Map
// card and note. Live bridges ask the API; demo bridges answer from the
// prototype's own content so the flow can be shown without a backend.

export interface AgentKnowledge {
  id: string;
  kind: string;
  title: string;
  body: string;
  confidence?: string;
  sources: { id: string; title: string }[];
}

export interface AgentOpenQuestion {
  id: string;
  title: string;
  detail: string;
}

type Message = {
  role: "user" | "bridge";
  text: string;
  sources?: { id: string; title: string }[];
  followUps?: string[];
};

const SUGGESTED: { group: string; items: string[] }[] = [
  { group: "Understand", items: ["Summarize this whole Bridge", "What are the key decisions?"] },
  { group: "Find gaps", items: ["What's still unanswered?", "Where do sources disagree?"] },
  { group: "Make an output", items: ["Make a 2-minute audio summary", "Draft a handoff brief"] },
];

const STOP = new Set(["the", "a", "an", "is", "are", "what", "whats", "what's", "of", "in", "on", "to", "and", "or", "for", "do", "does", "this", "that", "me", "my", "we", "our", "about", "with", "it", "be", "can", "you", "how", "why", "which", "there", "any"]);
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

function uniqSources(items: AgentKnowledge[]) {
  const seen = new Set<string>();
  return items.flatMap((i) => i.sources).filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
}

/** Demo answerer: picks the Map cards and sources that best match the question. */
function answerFromContent(q: string, knowledge: AgentKnowledge[]): Message {
  const ql = q.toLowerCase();
  const byKind = (...k: string[]) => knowledge.filter((i) => k.includes(i.kind));
  const list = (items: AgentKnowledge[]) => items.map((i) => `• ${i.title}: ${i.body}`).join("\n");

  if (/summar|overview|whole|everything|tl;?dr/.test(ql)) {
    const picks = [...byKind("main"), ...byKind("must-know"), ...byKind("action")];
    return {
      role: "bridge",
      text: `Here's the whole Bridge in short:\n${list(picks)}`,
      sources: uniqSources(picks),
      followUps: ["What's still unanswered?", "Make a 2-minute audio summary"],
    };
  }
  if (/decid|decision|chose|chosen/.test(ql)) {
    const picks = byKind("decision");
    return { role: "bridge", text: `Decisions so far:\n${list(picks)}`, sources: uniqSources(picks), followUps: ["Who signs off on this?", "What are the risks?"] };
  }
  if (/unanswer|open|gap|missing|unknown|who/.test(ql)) {
    const picks = byKind("question");
    return {
      role: "bridge",
      text: picks.length
        ? `No source answers these yet:\n${list(picks)}\n\nI can add them to Open questions so the right person is asked.`
        : "Nothing is open right now. Every Map card has a source behind it.",
      sources: uniqSources(picks),
      followUps: ["Where do sources disagree?", "Summarize this whole Bridge"],
    };
  }
  if (/disagree|conflict|contradict|differ|risk/.test(ql)) {
    const picks = [...byKind("risk"), ...knowledge.filter((i) => i.confidence === "inferred" && i.kind !== "risk")];
    return { role: "bridge", text: `Places where sources don't line up:\n${list(picks)}`, sources: uniqSources(picks), followUps: ["What should we do next?", "What are the key decisions?"] };
  }
  if (/audio|podcast|video|explainer|slides|brief|output|handoff/.test(ql)) {
    const kind = /video/.test(ql) ? "video explainer" : /audio|podcast/.test(ql) ? "2-minute audio summary" : /slides/.test(ql) ? "slide outline" : "handoff brief";
    const picks = [...byKind("main"), ...byKind("must-know"), ...byKind("decision")];
    return {
      role: "bridge",
      text: `I'll make a ${kind} from ${uniqSources(picks).length} sources. It will cover:\n${picks.map((p) => `• ${p.title}`).join("\n")}\n\nIt opens in your Workspace when it's ready.`,
      sources: uniqSources(picks),
      followUps: ["Make it a video instead", "Draft a handoff brief"],
    };
  }
  if (/next|todo|action|should/.test(ql)) {
    const picks = byKind("action");
    return { role: "bridge", text: `Next up:\n${list(picks)}`, sources: uniqSources(picks), followUps: ["What's still unanswered?"] };
  }

  const qw = words(q);
  const scored = knowledge
    .map((i) => ({ i, score: words(`${i.title} ${i.body} ${i.sources.map((s) => s.title).join(" ")}`).filter((w) => qw.some((x) => w.startsWith(x.slice(0, 5)))).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.i);
  if (!scored.length) {
    return {
      role: "bridge",
      text: "I couldn't find that in this Bridge's sources. Add a file or note that covers it, or I can save it as an open question.",
      followUps: ["Summarize this whole Bridge", "What's still unanswered?"],
    };
  }
  return { role: "bridge", text: list(scored), sources: uniqSources(scored), followUps: ["Where do sources disagree?", "Summarize this whole Bridge"] };
}

// ─── Bottom bar input ────────────────────────────────────────────────────────

export function AskAgentBar({ onAsk, active }: { onAsk: (q: string) => void; active?: boolean }) {
  const [value, setValue] = useState("");
  const submit = () => {
    const q = value.trim();
    if (!q) return;
    onAsk(q);
    setValue("");
  };
  return (
    <div
      className="flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-2xl border border-border"
      style={{ background: "var(--card)", boxShadow: active ? "0 0 0 3px var(--accent), var(--shadow-lg)" : "0 4px 24px rgba(0,31,63,0.10), 0 1px 4px rgba(0,31,63,0.06)", borderColor: active ? "transparent" : undefined, width: 320, flexShrink: 0 }}
    >
      <Sparkles size={14} style={{ color: "var(--accent-strong)", flexShrink: 0 }} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={active ? "Ask a follow-up…" : "Ask Bridge about everything here…"}
        autoFocus={active}
        key={active ? "active" : "idle"}
        className="flex-1 min-w-0 bg-transparent outline-none"
        style={{ fontSize: "0.84rem" }}
      />
      <button
        onClick={submit}
        aria-label="Ask"
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90"
        style={{ background: "var(--btn-brand-bg)", color: "var(--btn-brand-fg)", flexShrink: 0 }}
      >
        <ArrowUp size={14} />
      </button>
    </div>
  );
}

// ─── Corner question button ──────────────────────────────────────────────────

export function AskAgentCorner({ openCount, onClick }: { openCount: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      title="Questions for Bridge"
      className="fixed bottom-5 right-6 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105"
      style={{ background: "var(--accent)", color: "var(--accent-foreground)", boxShadow: "var(--shadow-lg)" }}
    >
      <HelpCircle size={20} />
      {openCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full flex items-center justify-center"
          style={{ background: "var(--btn-brand-bg)", color: "var(--btn-brand-fg)", fontSize: "0.65rem", fontWeight: 800, border: "2px solid var(--background)" }}
        >
          {openCount}
        </span>
      )}
    </motion.button>
  );
}

// ─── Agent panel ─────────────────────────────────────────────────────────────

export function AskAgentPanel({
  bridgeId,
  isLive,
  knowledge,
  openQuestions,
  initialTab,
  question,
  onClose,
  onOpenSource,
  onAction,
}: {
  bridgeId: string;
  isLive: boolean;
  knowledge: AgentKnowledge[];
  openQuestions: AgentOpenQuestion[];
  initialTab: "ask" | "questions";
  question?: { n: number; text: string };
  onClose: () => void;
  onOpenSource: (id: string) => void;
  onAction: (label: string) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const asked = useRef<number | undefined>(undefined);
  const sourceCount = new Set(knowledge.flatMap((k) => k.sources.map((s) => s.id))).size;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setTab("ask");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      if (isLive) {
        const res = await api.ask(bridgeId, q);
        setMessages((m) => [...m, { role: "bridge", text: res.answer, sources: res.sources.map((s) => ({ id: s.id, title: s.title })) }]);
      } else {
        await new Promise((r) => setTimeout(r, 700));
        setMessages((m) => [...m, answerFromContent(q, knowledge)]);
      }
    } catch (err) {
      setMessages((m) => [...m, { role: "bridge", text: `⚠ ${err instanceof Error ? err.message : "Something went wrong."}` }]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (question && asked.current !== question.n) {
      asked.current = question.n;
      send(question.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.n]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-4 top-16 bottom-20 z-40 w-[400px] rounded-2xl border border-border overflow-hidden flex flex-col"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-xl)" }}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <Sparkles size={13} style={{ color: "var(--accent-foreground)" }} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: "0.9rem", lineHeight: 1.2 }}>Ask Bridge</p>
              <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>Answers from all {sourceCount} sources, the Map and notes</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="hover:bg-secondary rounded-lg p-1.5 transition-colors" style={{ color: "var(--muted-foreground)" }}><X size={14} /></button>
        </div>
        <div className="flex gap-1 mt-3 p-1 rounded-xl" style={{ background: "var(--secondary)" }}>
          {([["ask", "Ask"], ["questions", `Open questions${openQuestions.length ? ` · ${openQuestions.length}` : ""}`]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 py-1.5 rounded-lg transition-all"
              style={{ fontSize: "0.76rem", fontWeight: tab === id ? 700 : 500, background: tab === id ? "var(--card)" : "transparent", color: tab === id ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: tab === id ? "var(--shadow-sm)" : "none" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {tab === "questions" ? (
          <>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", lineHeight: 1.55 }}>
              Bridge couldn't answer these from the sources. Answer one, or ask Bridge to dig further.
            </p>
            {openQuestions.length === 0 && <p style={{ fontSize: "0.82rem", fontWeight: 600 }}>No open questions. Everything on the Map has a source.</p>}
            {openQuestions.map((oq) => (
              <div key={oq.id} className="rounded-xl border border-border p-3" style={{ background: "var(--background)" }}>
                <div className="flex items-start gap-2">
                  <HelpCircle size={14} style={{ color: "var(--status-info)", marginTop: 2, flexShrink: 0 }} />
                  <div className="flex-1">
                    <p style={{ fontSize: "0.84rem", fontWeight: 700, lineHeight: 1.35 }}>{oq.title}</p>
                    <p style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", lineHeight: 1.5, marginTop: 3 }}>{oq.detail}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2.5 pl-6">
                  <button onClick={() => send(oq.title)} className="px-2.5 py-1 rounded-lg" style={{ fontSize: "0.7rem", fontWeight: 700, background: "var(--btn-brand-bg)", color: "var(--btn-brand-fg)" }}>Ask Bridge</button>
                  <button onClick={() => onAction(`Answer added to the Map — ${oq.title.slice(0, 28)}…`)} className="px-2.5 py-1 rounded-lg border border-border hover:bg-secondary" style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted-foreground)" }}>I know this</button>
                </div>
              </div>
            ))}
          </>
        ) : messages.length === 0 ? (
          <div className="flex flex-col gap-4">
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.55 }}>
              Ask anything about this Bridge. Every answer links back to the source it came from.
            </p>
            {SUGGESTED.map((g) => (
              <div key={g.group} className="flex flex-col gap-1.5">
                <p style={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{g.group}</p>
                {g.items.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-left px-3 py-2 rounded-xl border border-border hover:bg-secondary transition-colors flex items-center gap-2" style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                    <CornerDownRight size={12} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                    {s}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "self-end" : "self-start"} style={{ maxWidth: m.role === "user" ? "85%" : "100%" }}>
              <div
                className="px-3.5 py-2.5 rounded-2xl"
                style={m.role === "user"
                  ? { background: "var(--btn-brand-bg)", color: "var(--btn-brand-fg)", fontSize: "0.84rem", lineHeight: 1.5, borderBottomRightRadius: 6 }
                  : { background: "var(--secondary)", color: "var(--foreground)", fontSize: "0.82rem", lineHeight: 1.6, whiteSpace: "pre-wrap", borderBottomLeftRadius: 6 }}
              >
                {m.text}
              </div>
              {m.role === "bridge" && m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.sources.map((s) => (
                    <button key={s.id} onClick={() => onOpenSource(s.id)} className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--status-info)" }}>
                      <FileText size={10} />
                      {s.title.length > 26 ? s.title.slice(0, 25) + "…" : s.title}
                    </button>
                  ))}
                </div>
              )}
              {m.role === "bridge" && i === messages.length - 1 && !busy && (
                <div className="flex flex-col gap-2 mt-2.5">
                  <div className="flex gap-1.5">
                    {[{ icon: MapIcon, label: "Add to Map" }, { icon: StickyNote, label: "Save as note" }, { icon: AudioLines, label: "Make audio" }].map((a) => (
                      <button key={a.label} onClick={() => onAction(`${a.label} — done`)} className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:bg-secondary transition-colors" style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--muted-foreground)" }}>
                        <a.icon size={11} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                  {m.followUps?.map((f) => (
                    <button key={f} onClick={() => send(f)} className="self-start flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ fontSize: "0.72rem", fontWeight: 600, background: "var(--space-accent-soft, var(--secondary))", color: "var(--foreground)" }}>
                      <CornerDownRight size={11} />
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {busy && (
          <div className="self-start flex items-center gap-2 px-3.5 py-2.5 rounded-2xl" style={{ background: "var(--secondary)" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--muted-foreground)" }}>Reading sources</span>
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce inline-block" style={{ background: "var(--muted-foreground)", animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* Typing happens in the bottom bar's Ask field, so the panel has no input of its own */}
      <div className="px-4 py-2.5 border-t border-border flex items-center gap-1.5 flex-shrink-0" style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
        <CornerDownRight size={11} style={{ transform: "rotate(90deg)" }} />
        Type your question in the Ask bar below
      </div>
    </motion.aside>
  );
}
