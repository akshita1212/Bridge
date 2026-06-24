import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, FileText, Video, Mic, Image, Link, ArrowRight, Play, Zap, Layers, GitBranch } from "lucide-react";
import type { Page, Theme } from "../App";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (page: Page) => void;
}

const THINKING_STATES = [
  "Reading sources…",
  "Finding links…",
  "Noticing gaps…",
  "Building your map…",
];

const CARDS = [
  { id: "pdf", icon: FileText, label: "Assessment Framework v3.pdf", color: "#1E488F", delay: 0.2 },
  { id: "video", icon: Video, label: "UX Research Session.mp4", color: "#00804C", delay: 0.5 },
  { id: "note", icon: FileText, label: "Key findings from research", color: "#DBE64C", dark: true, delay: 0.8 },
  { id: "image", icon: Image, label: "Flow Diagram — Final.png", color: "#74C365", delay: 1.1 },
];

const FEATURES = [
  {
    icon: Layers,
    title: "Drop anything.",
    desc: "PDFs, videos, audio, links, notes, images. Bridge handles every format without friction.",
  },
  {
    icon: Zap,
    title: "Understand faster.",
    desc: "Visual clusters, source cards, and key idea chips. No walls of text, no AI summaries to wade through.",
  },
  {
    icon: GitBranch,
    title: "Sources always attached.",
    desc: "Every insight traces back to the exact page, timestamp, or frame it came from.",
  },
];

export function Landing({ theme, onToggleTheme, onNavigate }: Props) {
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [chipVisible, setChipVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setCardsVisible(true), 600);
    const t2 = setTimeout(() => setChipVisible(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingIdx((i) => (i + 1) % THINKING_STATES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#DBE64C" }}>
            <GitBranch size={14} style={{ color: "#001F3F" }} strokeWidth={2.5} />
          </div>
          <span className="tracking-tight" style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "1rem" }}>Bridge</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("auth")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            Sign in
          </button>
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => onNavigate("auth")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: "#001F3F", color: "#F6F7ED", fontSize: "0.875rem", fontWeight: 500 }}
          >
            Start a Bridge
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border mb-8"
            style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)", background: "var(--secondary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00804C" }} />
            Now in early access
          </div>

          <h1 className="mb-5" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", color: "var(--foreground)" }}>
            Bridge makes scattered<br />
            <span style={{ color: "#00804C" }}>context simple.</span>
          </h1>

          <p className="mb-10 max-w-lg mx-auto" style={{ fontSize: "1.0625rem", lineHeight: 1.65, color: "var(--muted-foreground)", fontWeight: 400 }}>
            Drop files, links, notes, audio, or video. Bridge turns them into a clear, source-grounded understanding map.
          </p>

          <div className="flex items-center gap-3 justify-center flex-wrap">
            <button
              onClick={() => onNavigate("auth")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#001F3F", color: "#F6F7ED", fontWeight: 600, fontSize: "0.9375rem" }}
            >
              Start a Bridge
              <ArrowRight size={15} />
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors"
              style={{ fontWeight: 500, fontSize: "0.9375rem", color: "var(--foreground)" }}
            >
              <Play size={14} className="fill-current" />
              Watch quick demo
            </button>
          </div>
        </motion.div>

        {/* Animated canvas preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 w-full max-w-3xl"
        >
          <div
            className="relative rounded-2xl overflow-hidden border border-border"
            style={{
              background: isDark ? "#0A1622" : "#FAFBF5",
              boxShadow: isDark
                ? "0 24px 64px rgba(0,0,0,0.4)"
                : "0 24px 64px rgba(0,31,63,0.08), 0 2px 8px rgba(0,31,63,0.04)",
              minHeight: 320,
            }}
          >
            {/* Mini toolbar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
              </div>
              <div className="flex-1 text-center" style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                Product Handoff — Cognitive Assessment Flow
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={thinkingIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: isDark ? "#1A2E42" : "#E6E9DC", fontSize: "0.7rem", fontWeight: 500, color: "var(--muted-foreground)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00804C" }} />
                  {THINKING_STATES[thinkingIdx]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Canvas area */}
            <div className="p-8 flex flex-wrap gap-4 items-start justify-center" style={{ minHeight: 240 }}>
              {CARDS.map((card) => (
                <AnimatePresence key={card.id}>
                  {cardsVisible && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: card.delay, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col gap-2 p-3 rounded-xl border border-border cursor-default"
                      style={{
                        background: isDark ? "#132235" : "#FFFFFF",
                        width: 148,
                        boxShadow: "0 2px 8px rgba(0,31,63,0.06)",
                      }}
                    >
                      <div
                        className="w-full h-16 rounded-lg flex items-center justify-center"
                        style={{ background: card.color + (isDark ? "22" : "15") }}
                      >
                        <card.icon size={22} style={{ color: card.color }} />
                      </div>
                      <p style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.3 }}>
                        {card.label}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}

              {/* Understanding ready chip */}
              <AnimatePresence>
                {chipVisible && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ background: "#DBE64C", color: "#001F3F", fontSize: "0.8rem", fontWeight: 600 }}
                  >
                    <Zap size={13} className="fill-current" />
                    Understanding ready
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="mt-24 w-full max-w-3xl grid grid-cols-1 gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              className="flex flex-col gap-3"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--secondary)" }}
              >
                <f.icon size={17} style={{ color: "var(--foreground)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: 4 }}>{f.title}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer trust bar */}
        <div className="mt-20 text-center" style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>
          <p style={{ fontStyle: "italic" }}>"Bridge adapts the view, not the truth."</p>
        </div>
      </main>
    </div>
  );
}
