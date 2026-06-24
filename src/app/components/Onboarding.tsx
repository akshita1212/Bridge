import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, AlignLeft, BookOpen, Mic, CheckSquare, Search, Upload, Link, FileText, ArrowRight, GitBranch } from "lucide-react";
import type { Page, Theme } from "../App";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (page: Page) => void;
}

const PREFERENCES = [
  { id: "visual", icon: Eye, label: "Visuals and references", desc: "Maps, diagrams, image cards" },
  { id: "brief", icon: AlignLeft, label: "Short summaries", desc: "Quick brief, key points only" },
  { id: "source", icon: BookOpen, label: "Source-first reading", desc: "Read the originals first" },
  { id: "audio", icon: Mic, label: "Audio walkthroughs", desc: "Listen through the context" },
  { id: "checklist", icon: CheckSquare, label: "Step-by-step checklists", desc: "Action-oriented breakdowns" },
  { id: "deep", icon: Search, label: "Deep research mode", desc: "Full analysis, all evidence" },
];

const CREATE_OPTIONS = [
  { id: "blank", icon: GitBranch, label: "Blank Bridge", desc: "Start from scratch" },
  { id: "upload", icon: Upload, label: "Upload files", desc: "PDFs, docs, slides, images" },
  { id: "link", icon: Link, label: "Paste a link", desc: "Any URL, article, or video" },
  { id: "audio", icon: Mic, label: "Record or drop audio", desc: "Voice notes, interviews, calls" },
  { id: "template", icon: FileText, label: "Start from a template", desc: "Research, handoff, briefing" },
];

export function Onboarding({ onNavigate }: Props) {
  const [step, setStep] = useState<"pref" | "create">("pref");
  const [selected, setSelected] = useState<string | null>(null);

  const handlePrefNext = () => setStep("create");
  const handleCreate = (id: string) => {
    onNavigate("home");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="w-full max-w-xl">
        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#DBE64C" }}>
            <GitBranch size={15} style={{ color: "#001F3F" }} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.0625rem" }}>Bridge</span>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 justify-center mb-10">
          {(["pref", "create"] as const).map((s) => (
            <div
              key={s}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: step === s ? 24 : 8,
                background: step === s ? "#001F3F" : "var(--border)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "pref" && (
            <motion.div
              key="pref"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2
                className="text-center mb-2"
                style={{ fontWeight: 700, fontSize: "1.625rem", letterSpacing: "-0.025em" }}
              >
                How do you usually understand things best?
              </h2>
              <p className="text-center mb-8" style={{ fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
                Bridge will default to this — you can always change it.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {PREFERENCES.map((pref) => {
                  const isSelected = selected === pref.id;
                  return (
                    <motion.button
                      key={pref.id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelected(pref.id)}
                      className="flex items-start gap-3 p-4 rounded-xl border text-left transition-all"
                      style={{
                        border: isSelected ? "1.5px solid #001F3F" : "1.5px solid var(--border)",
                        background: isSelected ? "var(--secondary)" : "var(--card)",
                        boxShadow: isSelected ? "0 0 0 3px rgba(219,230,76,0.3)" : "none",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: isSelected ? "#DBE64C" : "var(--muted)",
                          color: isSelected ? "#001F3F" : "var(--muted-foreground)",
                        }}
                      >
                        <pref.icon size={15} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: 2 }}>{pref.label}</p>
                        <p style={{ fontSize: "0.775rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>{pref.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={handlePrefNext}
                disabled={!selected}
                className="w-full py-2.5 rounded-xl mb-3 transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "#001F3F", color: "#F6F7ED", fontWeight: 600, fontSize: "0.9375rem" }}
              >
                Continue
                <ArrowRight size={14} className="inline ml-2" />
              </button>
              <button
                onClick={handlePrefNext}
                className="w-full py-2 text-center"
                style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}
              >
                Skip — Bridge will adapt as I use it
              </button>
            </motion.div>
          )}

          {step === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2
                className="text-center mb-2"
                style={{ fontWeight: 700, fontSize: "1.625rem", letterSpacing: "-0.025em" }}
              >
                Create your first Bridge
              </h2>
              <p className="text-center mb-8" style={{ fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
                Drop anything. Bridge will organize the context.
              </p>

              <div className="flex flex-col gap-2.5">
                {CREATE_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleCreate(opt.id)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary transition-all text-left"
                    style={{ background: "var(--card)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--secondary)" }}
                    >
                      <opt.icon size={18} style={{ color: "var(--foreground)" }} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{opt.label}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{opt.desc}</p>
                    </div>
                    <ArrowRight size={15} style={{ color: "var(--muted-foreground)" }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
