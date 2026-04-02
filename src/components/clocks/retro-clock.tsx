"use client";

import { useClock, pad } from "./use-clock";
import { motion } from "framer-motion";

/** Terminal / phosphor-green retro clock */
export function RetroClock({ full }: { full?: boolean }) {
  const t = useClock();

  const timeSize = full ? "min(15vw, 16vh)" : "clamp(1.8rem, 5vw, 3.5rem)";
  const subSize = full ? "min(1.6vw, 1.8vh)" : "0.6rem";

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full font-mono select-none"
      style={{
        background: "#020c02",
        color: "#33ff33",
        gap: full ? "min(3vh, 2vw)" : "0.75rem",
      }}
    >
      {/* Scan line overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        {/* Top label */}
        <div
          style={{
            fontSize: subSize,
            color: "#1a8a1a",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: full ? "min(2vh, 1.5vw)" : "0.4rem",
          }}
        >
          ┌─── SYS.CLOCK ───┐
        </div>

        {/* Time */}
        <motion.div
          style={{ fontSize: timeSize, color: "#33ff33", fontWeight: 400, lineHeight: 1 }}
          animate={{ opacity: [1, 0.92, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
        </motion.div>

        {/* Bottom info */}
        <div
          style={{
            fontSize: subSize,
            color: "#1a8a1a",
            letterSpacing: "0.2em",
            marginTop: full ? "min(2vh, 1.5vw)" : "0.5rem",
          }}
        >
          └── {t.dayStr.toUpperCase()} · {t.dateStr.toUpperCase()} ──┘
        </div>

        {/* Cursor blink */}
        <motion.div
          style={{
            display: "inline-block",
            width: full ? "min(1.2vw, 1.4vh)" : "8px",
            height: full ? "min(2.2vw, 2.5vh)" : "18px",
            background: "#33ff33",
            marginTop: full ? "min(2vh, 1.5vw)" : "0.4rem",
          }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear", times: [0, 0.49, 0.5, 1] }}
        />
      </div>
    </div>
  );
}
