"use client";

import type { ClockData } from "@/hooks/useClockTime";

interface Props {
  clock: ClockData;
  preview?: boolean;
  showDate?: boolean;
}

export function ClockMinimal({ clock, preview, showDate = true }: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        containerType: "size",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ck-bg)",
        userSelect: "none",
      }}
    >
      {/* Time */}
      <div
        style={{
          fontFamily: "var(--font-sp-display, system-ui)",
          fontSize: "min(26cqw, 28cqh)",
          fontWeight:600,
          letterSpacing: "0em",
          lineHeight: 1,
          color: "var(--ck-text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {clock.hours}:{clock.minutes}
        <span style={{ color: "var(--ck-muted)", opacity: ".6" }}>:{clock.seconds}</span>
      </div>

      {/* Date + timezone — hidden in preview cards or when showDate is off */}
      {!preview && showDate && (
        <div
          style={{
            fontFamily: "var(--font-sp-display, system-ui)",
            fontSize: "clamp(14px, min(2.6cqw, 2.5cqh), 32px)",
            color: "var(--ck-text)",
            opacity: 0.55,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginTop: "min(3cqh, 2.5cqw)",
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          {clock.day} · {clock.month} {clock.date}, {clock.year}
          {/* {clock.timezoneLabel && (
            <>
              <br />
              {clock.timezoneLabel}
            </>
          )} */}
        </div>
      )}
    </div>
  );
}
