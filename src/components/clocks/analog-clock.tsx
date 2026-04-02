"use client";

import { useClock } from "./use-clock";

export function AnalogClock({ full }: { full?: boolean }) {
  const t = useClock();

  const size = full ? "min(70vh, 70vw)" : "min(100%, 180px)";

  const secondDeg = t.seconds * 6;
  const minuteDeg = t.minutes * 6 + t.seconds * 0.1;
  const hourDeg = (t.hours % 12) * 30 + t.minutes * 0.5;

  const cx = 100;
  const cy = 100;
  const r = 90;

  const tickMarks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const inner = r - (isMajor ? 12 : 6);
    const outer = r - 2;
    return {
      x1: cx + inner * Math.cos(angle),
      y1: cy + inner * Math.sin(angle),
      x2: cx + outer * Math.cos(angle),
      y2: cy + outer * Math.sin(angle),
      isMajor,
    };
  });

  const hand = (deg: number, length: number) => {
    const angle = (deg - 90) * (Math.PI / 180);
    return {
      x: cx + length * Math.cos(angle),
      y: cy + length * Math.sin(angle),
    };
  };

  const hour = hand(hourDeg, 52);
  const minute = hand(minuteDeg, 68);
  const second = hand(secondDeg, 72);
  const secondBack = hand(secondDeg + 180, 18);

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full gap-4"
      style={{ background: "var(--bg)" }}
    >
      <svg
        viewBox="0 0 200 200"
        style={{ width: size, height: size, maxWidth: "100%", maxHeight: "100%" }}
      >
        {/* Face */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="1" />

        {/* Tick marks */}
        {tickMarks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isMajor ? "var(--text-muted)" : "var(--border)"}
            strokeWidth={t.isMajor ? 1.5 : 0.8}
          />
        ))}

        {/* Hour hand */}
        <line
          x1={cx} y1={cy} x2={hour.x} y2={hour.y}
          stroke="var(--text)" strokeWidth="2.5" strokeLinecap="square"
          style={{ transition: "all 0.5s cubic-bezier(0.4,2.1,0.5,1)" }}
        />

        {/* Minute hand */}
        <line
          x1={cx} y1={cy} x2={minute.x} y2={minute.y}
          stroke="var(--text)" strokeWidth="1.5" strokeLinecap="square"
          style={{ transition: "all 0.5s cubic-bezier(0.4,2.1,0.5,1)" }}
        />

        {/* Second hand */}
        <line
          x1={secondBack.x} y1={secondBack.y} x2={second.x} y2={second.y}
          stroke="var(--accent)" strokeWidth="1" strokeLinecap="square"
          style={{ transition: "all 0.2s ease" }}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="3" fill="var(--accent)" />
        <circle cx={cx} cy={cy} r="1.5" fill="var(--bg)" />
      </svg>

      {full && (
        <div
          className="font-mono uppercase tracking-widest"
          style={{ color: "var(--text-subtle)", fontSize: "min(1.4vw, 1.6vh)", letterSpacing: "0.25em" }}
        >
          {t.dayStr} · {t.dateStr}
        </div>
      )}
    </div>
  );
}
