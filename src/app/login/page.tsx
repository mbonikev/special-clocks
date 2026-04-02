"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email to confirm your account, then sign in.");
        setMode("login");
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-8 h-8 flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            F
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Focus
          </span>
        </div>

        {/* Mode tabs */}
        <div
          className="flex border mb-8 text-sm font-medium"
          style={{ borderColor: "var(--border)" }}
        >
          {(["login", "signup"] as Mode[]).map((m, i) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              className="flex-1 py-2.5 capitalize transition-colors duration-100"
              style={{
                background: mode === m ? "var(--accent)" : "var(--surface)",
                color: mode === m ? "var(--accent-fg)" : "var(--text-muted)",
                borderRight: i === 0 ? "1px solid var(--border)" : "none",
              }}
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 text-sm border bg-transparent outline-none transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
              Password
            </label>
            <input
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm border bg-transparent outline-none transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            {mode === "signup" && (
              <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                At least 6 characters
              </p>
            )}
          </div>

          {/* Error / Success */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs px-3 py-2 border"
                style={{
                  borderColor: "var(--red)",
                  color: "var(--red)",
                  background: "color-mix(in srgb, var(--red) 8%, transparent)",
                }}
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs px-3 py-2 border"
                style={{
                  borderColor: "var(--green)",
                  color: "var(--green)",
                  background: "color-mix(in srgb, var(--green) 8%, transparent)",
                }}
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              opacity: loading ? 0.7 : 1,
            }}
            whileTap={{ scale: 0.99 }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </motion.button>
        </form>

        <p className="mt-6 text-xs text-center" style={{ color: "var(--text-subtle)" }}>
          Your data is stored securely in Supabase.
        </p>
      </motion.div>
    </div>
  );
}
