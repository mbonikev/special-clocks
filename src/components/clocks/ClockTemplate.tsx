"use client";

/**
 * CLOCK TEMPLATE — duplicate this file to create a new clock layout.
 *
 * Steps to wire it up:
 *  1. Rename the file and the exported function  (e.g. ClockNeon)
 *  2. Add a new entry to ClockLayout union in useSettings.ts:
 *       export type ClockLayout = "minimal" | "neon";
 *  3. Register it in LayoutDrawer.tsx — add to LAYOUTS and PREVIEW_VARS
 *  4. Add CSS variables for the new layout in globals.css:
 *       [data-theme="dark"][data-clock="neon"]  { ... }
 *       [data-theme="light"][data-clock="neon"] { ... }
 */

import type { ClockData } from "@/hooks/useClockTime";

interface Props {
  clock: ClockData;
  /** True when rendered as a small preview card in the layout drawer */
  preview?: boolean;
  /** Controlled by the "Show date" setting */
  showDate?: boolean;
}

export function ClockTemplate({ clock, preview, showDate = true }: Props) {
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
      {/* ── Time ─────────────────────────────────────────────── */}
      <div
        style={{
          fontFamily: "var(--font-sp-display, system-ui)",
          fontSize: "min(26cqw, 28cqh)",
          fontWeight: 600,
          letterSpacing: "0em",
          lineHeight: 1,
          color: "var(--ck-text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {clock.hours}:{clock.minutes}
        <span style={{ color: "var(--ck-muted)", opacity: 0.6 }}>
          :{clock.seconds}
        </span>
      </div>

      {/* ── Date — hidden in preview cards or when showDate is off ── */}
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
        </div>
      )}
    </div>
  );
}
