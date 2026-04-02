"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FileText } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useNoteSync } from "@/hooks/use-db-sync";
import { PageShell } from "@/components/page-shell";

export default function NotesPage() {
  const { notes } = useAppStore();
  const { add, update, remove } = useNoteSync();
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeNote = notes.find((n) => n.id === activeId);

  const handleNew = () => {
    const id = add();
    setActiveId(id);
  };

  useEffect(() => {
    if (activeId) textareaRef.current?.focus();
  }, [activeId]);

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <PageShell className="h-full flex">
      {/* Note list sidebar */}
      <div
        className="w-52 shrink-0 border-r flex flex-col"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>Notes</span>
          <button
            onClick={handleNew}
            className="w-6 h-6 flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence initial={false}>
            {notes.length === 0 && (
              <div className="p-4 text-xs" style={{ color: "var(--text-subtle)" }}>No notes yet</div>
            )}
            {[...notes]
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((note) => (
                <motion.button
                  key={note.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setActiveId(note.id)}
                  className="w-full text-left px-4 py-3 border-b transition-colors duration-100"
                  style={{
                    borderColor: "var(--border)",
                    background: activeId === note.id ? "var(--bg-muted)" : "transparent",
                  }}
                >
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>
                    {note.title || "Untitled"}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-subtle)" }}>
                    {note.content.slice(0, 40) || "No content"}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-subtle)" }}>
                    {formatDate(note.updatedAt)}
                  </p>
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeNote ? (
          <>
            <div
              className="px-6 py-3 border-b flex items-center gap-3 shrink-0"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => update(activeNote.id, { title: e.target.value })}
                className="flex-1 text-sm font-semibold bg-transparent outline-none"
                style={{ color: "var(--text)" }}
                placeholder="Note title"
              />
              <button
                onClick={() => {
                  const idx = notes.findIndex((n) => n.id === activeId);
                  remove(activeNote.id);
                  const remaining = notes.filter((n) => n.id !== activeId);
                  setActiveId(remaining[Math.max(0, idx - 1)]?.id ?? null);
                }}
                className="hover:text-[var(--red)] transition-colors"
                style={{ color: "var(--text-subtle)" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={activeNote.content}
              onChange={(e) => update(activeNote.id, { content: e.target.value })}
              placeholder="Start writing..."
              className="flex-1 resize-none bg-transparent outline-none p-6 text-sm leading-relaxed"
              style={{ color: "var(--text)", caretColor: "var(--accent)" }}
            />
            <div
              className="px-6 py-2 border-t text-xs shrink-0"
              style={{ borderColor: "var(--border)", color: "var(--text-subtle)", background: "var(--surface)" }}
            >
              {activeNote.content.split(/\s+/).filter(Boolean).length} words · {activeNote.content.length} chars
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <FileText size={32} style={{ color: "var(--border-strong)" }} />
            <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Select a note or create a new one</p>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 border text-sm transition-colors hover:bg-[var(--bg-muted)]"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <Plus size={14} />
              New Note
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
