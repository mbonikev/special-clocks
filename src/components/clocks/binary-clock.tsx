"use client";

import { useClock } from "./use-clock";

function toBits(n: number, bits: number): number[] {
  return Array.from({ length: bits }, (_, i) => (n >> (bits - 1 - i)) & 1);
}

export function BinaryClock({ full }: { full?: boolean }) {
  const t = useClock();

  const dotSize = full ? "min(3.5vw, 4.5vh)" : 16;
  const gap = full ? "min(1vw, 1.4vh)" : 6;

  const columns = [
    { label: "H", bits: toBits(t.hours, 5) },
    { label: "M", bits: toBits(t.minutes, 6) },
    { label: "S", bits: toBits(t.seconds, 6) },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full"
      style={{ background: "var(--bg)", gap: full ? "min(4vh, 3vw)" : "1.5rem" }}
    >
      <div className="flex items-end" style={{ gap }}>
        {columns.map((col) => (
          <div key={col.label} className="flex flex-col items-center" style={{ gap }}>
            {col.bits.map((bit, i) => (
              <div
                key={i}
                style={{
                  width: dotSize,
                  height: dotSize,
                  background: bit
                    ? "var(--accent)"
                    : "var(--bg-muted)",
                  border: `1px solid ${bit ? "var(--accent)" : "var(--border)"}`,
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
              />
            ))}
            <span
              style={{
                fontSize: full ? "min(1.2vw, 1.4vh)" : "0.55rem",
                color: "var(--text-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginTop: full ? "min(1vh, 0.8vw)" : "4px",
              }}
            >
              {col.label}
            </span>
          </div>
        ))}
      </div>

      <div
        className="font-mono"
        style={{
          color: "var(--text-subtle)",
          fontSize: full ? "min(1.2vw, 1.4vh)" : "0.55rem",
          letterSpacing: "0.2em",
        }}
      >
        {String(t.hours).padStart(2, "0")}:{String(t.minutes).padStart(2, "0")}:{String(t.seconds).padStart(2, "0")}
      </div>
    </div>
  );
}
