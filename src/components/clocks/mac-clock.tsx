"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useClock, pad } from "./use-clock";

/** macOS-screensaver style clock — large, glowing, dark ambient */
export function MacClock({ full }: { full?: boolean }) {
  const t = useClock();

  const digitSize = full ? "min(22vw, 30vh)" : "clamp(2.5rem, 7vw, 5rem)";
  const colonSize = full ? "min(14vw, 18vh)" : "clamp(1.5rem, 4vw, 3rem)";

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full select-none"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #1a1a2e 0%, #0d0d12 60%, #080810 100%)",
      }}
    >
      {/* Main time */}
      <div
        className="flex items-center font-mono leading-none"
        style={{ gap: full ? "0.02em" : "0.01em" }}
      >
        {[pad(t.hours12), ":", pad(t.minutes)].map((segment, idx) => (
          <AnimatePresence key={idx} mode="popLayout">
            <motion.span
              key={segment}
              initial={idx !== 1 ? { opacity: 0, y: -6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                fontSize: idx === 1 ? colonSize : digitSize,
                color: idx === 1 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.92)",
                fontWeight: 100,
                letterSpacing: "-0.06em",
                textShadow: idx !== 1
                  ? "0 0 80px rgba(140,120,255,0.4), 0 0 200px rgba(100,80,220,0.15)"
                  : "none",
                lineHeight: 1,
              }}
            >
              {segment}
            </motion.span>
          </AnimatePresence>
        ))}
        <span
          style={{
            fontSize: full ? "min(3vw, 3.5vh)" : "0.75rem",
            color: "rgba(255,255,255,0.35)",
            fontWeight: 300,
            marginLeft: full ? "0.6em" : "0.4em",
            letterSpacing: "0.12em",
            alignSelf: "flex-end",
            paddingBottom: full ? "2.5vh" : "0.4em",
          }}
        >
          {t.ampm}
        </span>
      </div>

      {/* Date */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          color: "rgba(255,255,255,0.28)",
          fontSize: full ? "min(1.4vw, 1.8vh)" : "0.6rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginTop: full ? "3vh" : "0.75rem",
          fontWeight: 300,
        }}
      >
        {t.dayStr} · {t.dateStr}
      </motion.div>

      {/* Subtle ambient glow orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        style={{ zIndex: 0 }}
      >
        <div
          style={{
            position: "absolute",
            width: "60%",
            height: "60%",
            top: "20%",
            left: "20%",
            background: "radial-gradient(circle, rgba(100,80,220,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>
    </div>
  );
}
