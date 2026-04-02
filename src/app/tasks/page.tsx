"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, Circle, Target } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { PageShell } from "@/components/page-shell";

export default function TasksPage() {
  const { tasks, activeTaskId, addTask, toggleTask, deleteTask, setActiveTask, updateTask } =
    useAppStore();
  const [input, setInput] = useState("");
  const [estimate, setEstimate] = useState(1);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTask(text, estimate);
    setInput("");
    setEstimate(1);
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeTasks = tasks.filter((t) => !t.done).length;
  const doneTasks = tasks.filter((t) => t.done).length;

  return (
    <PageShell className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Tasks
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
            {activeTasks} active · {doneTasks} done
          </p>
        </div>

        {/* Filter */}
        <div className="flex border text-xs" style={{ borderColor: "var(--border)" }}>
          {(["all", "active", "done"] as const).map((f, i) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 capitalize transition-colors duration-100"
              style={{
                background: filter === f ? "var(--accent)" : "var(--surface)",
                color: filter === f ? "var(--accent-fg)" : "var(--text-muted)",
                borderRight: i < 2 ? "1px solid var(--border)" : "none",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task */}
      <div
        className="px-6 py-3 border-b flex gap-2 shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <input
          type="text"
          placeholder="Add a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)]"
          style={{ color: "var(--text)" }}
        />
        <div className="flex items-center gap-1">
          <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
            Est:
          </span>
          <select
            value={estimate}
            onChange={(e) => setEstimate(Number(e.target.value))}
            className="text-xs bg-transparent border px-1 py-0.5 outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n} style={{ background: "var(--surface)" }}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="w-8 h-8 flex items-center justify-center transition-colors duration-100"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-48 gap-2"
            >
              <Check size={24} style={{ color: "var(--border-strong)" }} />
              <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
                {filter === "done" ? "No completed tasks" : "No tasks — add one above"}
              </p>
            </motion.div>
          )}

          {filtered.map((task) => {
            const isActive = task.id === activeTaskId;
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div
                  className="flex items-center gap-3 px-6 py-3 border-b transition-colors duration-100 group"
                  style={{
                    borderColor: "var(--border)",
                    background: isActive ? "var(--bg-subtle)" : "transparent",
                  }}
                >
                  {/* Check */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0 transition-colors duration-150 hover:text-[var(--green)]"
                    style={{ color: task.done ? "var(--green)" : "var(--border-strong)" }}
                  >
                    {task.done ? <Check size={16} /> : <Circle size={16} />}
                  </button>

                  {/* Text */}
                  <span
                    className="flex-1 text-sm min-w-0 truncate"
                    style={{
                      color: task.done ? "var(--text-subtle)" : "var(--text)",
                      textDecoration: task.done ? "line-through" : "none",
                    }}
                  >
                    {task.text}
                  </span>

                  {/* Pomodoro counter */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                      {task.pomodorosDone}/{task.pomodorosEstimate}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: task.pomodorosEstimate }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5"
                          style={{
                            background:
                              i < task.pomodorosDone ? "var(--accent)" : "var(--bg-muted)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Set active */}
                  {!task.done && (
                    <button
                      onClick={() => setActiveTask(isActive ? null : task.id)}
                      title={isActive ? "Remove from timer" : "Set as active"}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                      style={{ color: isActive ? "var(--accent)" : "var(--text-subtle)" }}
                    >
                      <Target size={14} />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 hover:text-[var(--red)]"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      {tasks.length > 0 && (
        <div
          className="px-6 py-2 border-t flex items-center gap-4 shrink-0 text-xs"
          style={{ borderColor: "var(--border)", color: "var(--text-subtle)", background: "var(--surface)" }}
        >
          <span>{tasks.reduce((a, t) => a + t.pomodorosDone, 0)} pomodoros logged</span>
          <button
            onClick={() => tasks.filter((t) => t.done).forEach((t) => deleteTask(t.id))}
            className="ml-auto hover:text-[var(--red)] transition-colors"
          >
            Clear done
          </button>
        </div>
      )}
    </PageShell>
  );
}
