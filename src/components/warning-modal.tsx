"use client";

import { AnimatePresence, motion } from "framer-motion";

interface WarningModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WarningModal({
  open,
  title,
  message,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: WarningModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={onCancel}
          />

          {/* Panel */}
          <motion.div
            className="relative border px-6 py-5 flex flex-col gap-4 w-80"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {message}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                className="text-xs px-3 py-1.5 border transition-colors hover:bg-[var(--bg-muted)]"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="text-xs px-3 py-1.5 border transition-colors"
                style={{
                  borderColor: "var(--accent)",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
