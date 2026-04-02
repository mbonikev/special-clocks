"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { MinimalClock } from "@/components/clocks/minimal-clock";
import { MacClock } from "@/components/clocks/mac-clock";
import { AnalogClock } from "@/components/clocks/analog-clock";
import { FlipClock } from "@/components/clocks/flip-clock";
import { BinaryClock } from "@/components/clocks/binary-clock";
import { RetroClock } from "@/components/clocks/retro-clock";

interface ClockDef {
  id: string;
  label: string;
  description: string;
  component: React.ComponentType<{ full?: boolean }>;
}

const CLOCKS: ClockDef[] = [
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean typographic time",
    component: MinimalClock,
  },
  {
    id: "mac",
    label: "macOS",
    description: "Ambient screensaver style",
    component: MacClock,
  },
  {
    id: "analog",
    label: "Analog",
    description: "Precision hand clock",
    component: AnalogClock,
  },
  {
    id: "flip",
    label: "Flip",
    description: "Mechanical flip digits",
    component: FlipClock,
  },
  {
    id: "binary",
    label: "Binary",
    description: "Time in binary bits",
    component: BinaryClock,
  },
  {
    id: "retro",
    label: "Terminal",
    description: "Phosphor green retro",
    component: RetroClock,
  },
];

export default function ClocksPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const expandedClock = CLOCKS.find((c) => c.id === expanded);

  /* Sync native fullscreen state */
  useEffect(() => {
    const handler = () => setIsNativeFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ESC closes overlay even without native fullscreen */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded && !document.fullscreenElement) {
        setExpanded(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  const handleExpand = useCallback((id: string) => {
    setExpanded(id);
  }, []);

  const handleClose = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    setExpanded(null);
  }, []);

  const handleNativeFullscreen = useCallback(async () => {
    if (!fullscreenRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await fullscreenRef.current.requestFullscreen();
    }
  }, []);

  return (
    <PageShell className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-6 py-4 border-b shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Clocks
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
            Click any clock to expand · F for fullscreen
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-4">
          {CLOCKS.map((clock, i) => {
            const ClockComp = clock.component;
            return (
              <motion.div
                key={clock.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: i * 0.05 }}
                className="group relative"
              >
                {/* Card */}
                <button
                  onClick={() => handleExpand(clock.id)}
                  className="w-full border transition-colors duration-150 overflow-hidden"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                    aspectRatio: "4/3",
                    display: "block",
                    position: "relative",
                  }}
                >
                  <div className="absolute inset-0">
                    <ClockComp />
                  </div>

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ background: "rgba(0,0,0,0.35)" }}
                  >
                    <Maximize2 size={20} color="white" />
                  </motion.div>
                </button>

                {/* Label */}
                <div className="flex items-center justify-between mt-2 px-0.5">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--text)" }}>
                      {clock.label}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
                      {clock.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExpand(clock.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-subtle)" }}
                    title="Expand"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {expanded && expandedClock && (
          <motion.div
            ref={fullscreenRef}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "var(--bg)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Controls (hide in native fullscreen after 2s) */}
            <FullscreenControls
              label={expandedClock.label}
              isNativeFullscreen={isNativeFullscreen}
              onClose={handleClose}
              onToggleNative={handleNativeFullscreen}
            />

            {/* The clock fills remaining space */}
            <div className="flex-1 relative overflow-hidden">
              <expandedClock.component full />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function FullscreenControls({
  label,
  isNativeFullscreen,
  onClose,
  onToggleNative,
}: {
  label: string;
  isNativeFullscreen: boolean;
  onClose: () => void;
  onToggleNative: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  useEffect(() => {
    show();
    return () => clearTimeout(timerRef.current);
  }, [show]);

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)" }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      onMouseMove={show}
    >
      <span className="text-xs font-medium text-white/70 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleNative}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/20 transition-colors"
          title={isNativeFullscreen ? "Exit fullscreen" : "Go fullscreen"}
        >
          {isNativeFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          {isNativeFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/20 transition-colors"
          title="Close (Esc)"
        >
          <X size={12} />
          Close
        </button>
      </div>
    </motion.div>
  );
}
