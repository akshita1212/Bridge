import { useState } from "react";
import { motion } from "motion/react";
import { GitBranch, Eye, EyeOff, ArrowLeft } from "lucide-react";
import type { Page, Theme } from "../App";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (page: Page) => void;
}

export function Auth({ onNavigate }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(mode === "signup" ? "onboarding" : "home");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" style={{ fontFamily: "var(--font-sans)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Back */}
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-1.5 mb-8 hover:text-foreground transition-colors"
          style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#DBE64C" }}>
            <GitBranch size={15} style={{ color: "#001F3F" }} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>Bridge</span>
        </div>

        <h2 className="mb-1" style={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mb-8" style={{ fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
          {mode === "signup"
            ? "Start understanding faster."
            : "Pick up where you left off."}
        </p>

        {/* Google */}
        <button
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border hover:bg-secondary transition-colors mb-5"
          style={{ fontSize: "0.9rem", fontWeight: 500 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Full name</label>
              <input
                type="text"
                placeholder="Jamie Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border outline-none focus:ring-2 transition-all"
                style={{
                  background: "var(--input-background)",
                  fontSize: "0.9rem",
                  color: "var(--foreground)",
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border outline-none focus:ring-2 transition-all"
              style={{
                background: "var(--input-background)",
                fontSize: "0.9rem",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-border outline-none focus:ring-2 transition-all"
                style={{
                  background: "var(--input-background)",
                  fontSize: "0.9rem",
                  color: "var(--foreground)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl mt-2 transition-all hover:opacity-90 active:scale-[0.99]"
            style={{ background: "#001F3F", color: "#F6F7ED", fontWeight: 600, fontSize: "0.9375rem" }}
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center" style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
          {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="hover:underline"
            style={{ color: "var(--foreground)", fontWeight: 500 }}
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </p>

        <p className="mt-4 text-center" style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
          By continuing, you agree to Bridge's{" "}
          <button className="underline">Terms</button> and{" "}
          <button className="underline">Privacy Policy</button>.
        </p>
      </motion.div>
    </div>
  );
}
