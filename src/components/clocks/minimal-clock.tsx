"use client";

import { useClock, pad } from "./use-clock";

export function MinimalClock({ full }: { full?: boolean }) {
  const t = useClock();

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full gap-3"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="font-mono tracking-tighter leading-none select-none"
        style={{
          fontSize: full ? "min(18vw, 18vh)" : "clamp(2rem, 6vw, 4rem)",
          color: "var(--text)",
          fontWeight: 200,
          letterSpacing: "-0.04em",
        }}
      >
        {pad(t.hours)}:{pad(t.minutes)}
        <span style={{ color: "var(--text-subtle)", fontWeight: 100 }}>:{pad(t.seconds)}</span>
      </div>
      <div
        className="uppercase tracking-widest text-center"
        style={{
          fontSize: full ? "min(1.6vw, 1.4vh)" : "0.6rem",
          color: "var(--text-subtle)",
          letterSpacing: "0.25em",
        }}
      >
        {t.dayStr} · {t.dateStr}
      </div>
    </div>
  );
}
