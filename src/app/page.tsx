"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import { useAppStore } from "@/store/app-store";
import { formatTime } from "@/lib/utils";
import { PageShell } from "@/components/page-shell";

type TimerMode = "focus" | "short" | "long";

const modeLabels: Record<TimerMode, string> = {
  focus: "Focus",
  short: "Short Break",
  long: "Long Break",
};

export default function TimerPage() {
  const { mode, running, secondsLeft, sessionCount, switchMode, toggle, reset, getDuration } =
    useTimer();
  const { tasks, activeTaskId, setActiveTask, dailyPomodoros } = useAppStore();

  const total = getDuration(mode);
  const progress = (total - secondsLeft) / total;
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const circumference = 2 * Math.PI * 88;
  const dashOffset = circumference * (1 - progress);

  return (
    <PageShell className="h-full flex flex-col items-center justify-center gap-8 px-8 py-12">
      {/* Mode Tabs */}
      <div
        className="flex border text-xs font-medium tracking-wide"
        style={{ borderColor: "var(--border)" }}
      >
        {(["focus", "short", "long"] as TimerMode[]).map((m, i) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className="relative px-5 py-2 transition-colors duration-150"
            style={{
              background: mode === m ? "var(--accent)" : "var(--surface)",
              color: mode === m ? "var(--accent-fg)" : "var(--text-muted)",
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
            }}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        <svg
          width="220"
          height="220"
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="110"
            cy="110"
            r="88"
            fill="none"
            stroke="var(--bg-muted)"
            strokeWidth="2"
          />
          <motion.circle
            cx="110"
            cy="110"
            r="88"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="square"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>

        <div className="flex flex-col items-center gap-1 z-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={Math.floor(secondsLeft / 60)}
              className="font-mono text-5xl font-light tracking-tighter"
              style={{ color: "var(--text)" }}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {formatTime(secondsLeft)}
            </motion.span>
          </AnimatePresence>
          <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
            {modeLabels[mode]}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="w-10 h-10 flex items-center justify-center border transition-colors duration-150 hover:bg-[var(--bg-muted)]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          title="Reset"
        >
          <RotateCcw size={14} />
        </button>

        <motion.button
          onClick={toggle}
          className="w-16 h-16 flex items-center justify-center border-2 transition-colors duration-150"
          style={{
            borderColor: "var(--accent)",
            background: running ? "var(--accent)" : "transparent",
            color: running ? "var(--accent-fg)" : "var(--accent)",
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.08 }}
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
        </motion.button>
      </div>

      {/* Session dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => {
          const filled = i < (sessionCount % 4 === 0 && sessionCount > 0 ? 4 : sessionCount % 4);
          return (
            <motion.div
              key={i}
              className="w-2 h-2"
              animate={{ background: filled ? "var(--accent)" : "var(--bg-muted)" }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
        <span className="ml-2 text-xs" style={{ color: "var(--text-subtle)" }}>
          {dailyPomodoros} today
        </span>
      </div>

      {/* Active Task */}
      <div
        className="w-full max-w-sm border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="px-4 py-2 flex items-center justify-between border-b text-xs font-medium uppercase tracking-widest"
          style={{ borderColor: "var(--border)", color: "var(--text-subtle)" }}
        >
          <span>Active Task</span>
          {activeTask && (
            <button onClick={() => setActiveTask(null)} className="hover:text-[var(--text)]">
              ×
            </button>
          )}
        </div>
        {activeTask ? (
          <div className="px-4 py-3">
            <p className="text-sm truncate" style={{ color: "var(--text)" }}>
              {activeTask.text}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
              {activeTask.pomodorosDone}/{activeTask.pomodorosEstimate} pomodoros
            </p>
          </div>
        ) : (
          <div className="px-4 py-3">
            {tasks.filter((t) => !t.done).length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                No tasks — add some from the Tasks page
              </p>
            ) : (
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {tasks
                  .filter((t) => !t.done)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTask(t.id)}
                      className="flex items-center gap-2 text-xs py-1 text-left hover:text-[var(--text)] transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <ChevronRight size={10} className="shrink-0" />
                      <span className="truncate">{t.text}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
