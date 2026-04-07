"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Maximize2, Minimize2, Globe, Settings, Paintbrush } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useClockTime } from "@/hooks/useClockTime";
import { ClockMinimal } from "@/components/clocks/ClockMinimal";
import { LayoutDrawer } from "@/components/LayoutDrawer";
import { TimezoneModal } from "@/components/TimezoneModal";
import { SettingsModal } from "@/components/SettingsModal";
import type React from "react";

export default function Page() {
  const { settings, update, mounted } = useSettings();
  const clock = useClockTime(settings.timezone);
  const [showLayouts, setShowLayouts] = useState(false);
  const [showTimezone, setShowTimezone] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isApiFullscreen, setIsApiFullscreen] = useState(false);
  const [isF11Fullscreen, setIsF11Fullscreen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply data-theme and data-clock to <html> so CSS variables resolve correctly
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.clock = settings.clockLayout;
  }, [settings.theme, settings.clockLayout, mounted]);

  // Track fullscreen state — API fullscreen and F11 fullscreen separately
  useEffect(() => {
    let resizeDebounce: ReturnType<typeof setTimeout>;
    const onFullscreenChange = () => setIsApiFullscreen(!!document.fullscreenElement);
    const onResize = () => {
      // Debounce so intermediate resize events during F11 animation don't flicker the state
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        setIsF11Fullscreen(window.innerHeight >= screen.height);
      }, 150);
    };
    onFullscreenChange();
    setIsF11Fullscreen(window.innerHeight >= screen.height);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeDebounce);
    };
  }, []);

  // Ghost mode: directly manipulate the toolbar DOM node to avoid React re-renders
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    if (!settings.ghostMode || (!isApiFullscreen && !isF11Fullscreen)) {
      toolbar.style.opacity = "1";
      toolbar.style.pointerEvents = "auto";
      if (idleTimer.current) clearTimeout(idleTimer.current);
      return;
    }

    const hide = () => {
      toolbar.style.opacity = "0";
      toolbar.style.pointerEvents = "none";
    };

    const show = () => {
      toolbar.style.opacity = "1";
      toolbar.style.pointerEvents = "auto";
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(hide, 2000);
    };

    idleTimer.current = setTimeout(hide, 2000);
    window.addEventListener("mousemove", show);
    window.addEventListener("mousedown", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("mousedown", show);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [settings.ghostMode, isApiFullscreen, isF11Fullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Blank screen before hydration to avoid theme flash
  if (!mounted) {
    return <div style={{ width: "100vw", height: "100vh", background: "var(--ck-bg)" }} />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Clock */}
      <ClockMinimal clock={clock} showDate={settings.showDate} />

      {/* Floating toolbar — bottom-center */}
      <div
        ref={toolbarRef}
        style={{
          position: "fixed",
          bottom: "1.75rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "row",
          gap: "0.45rem",
          zIndex: 50,
          opacity: 1,
          transition: "opacity 0.4s ease",
        }}
      >
        <ToolButton
          title={settings.theme === "dark" ? "Light mode" : "Dark mode"}
          onClick={() => update({ theme: settings.theme === "dark" ? "light" : "dark" })}
        >
          {settings.theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
        </ToolButton>

        <ToolButton
          title={isApiFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
        >
          {isApiFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </ToolButton>

        <ToolButton title="Themes" onClick={() => setShowLayouts(true)}>
          <Paintbrush size={24} />
        </ToolButton>

        <ToolButton title="Change timezone" onClick={() => setShowTimezone(true)}>
          <Globe size={24} />
        </ToolButton>

        <ToolButton title="Settings" onClick={() => setShowSettings(true)}>
          <Settings size={24} />
        </ToolButton>
      </div>

      {/* Layout selection drawer */}
      <LayoutDrawer
        open={showLayouts}
        onClose={() => setShowLayouts(false)}
        current={settings.clockLayout}
        onSelect={(layout) => {
          update({ clockLayout: layout });
          setShowLayouts(false);
        }}
        clock={clock}
        theme={settings.theme}
      />

      {/* Timezone picker modal */}
      <TimezoneModal
        open={showTimezone}
        onClose={() => setShowTimezone(false)}
        current={settings.timezone}
        onSelect={(tz) => update({ timezone: tz })}
      />

      {/* Settings modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        update={update}
      />
    </div>
  );
}

/* ----------------------------------------------------------------
   Toolbar icon button
   ---------------------------------------------------------------- */
function ToolButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: "2.5rem",
        height: "2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ck-surface)",
        border: "1px solid var(--ck-border)",
        color: "var(--ck-icon)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ck-icon-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ck-icon)";
      }}
    >
      {children}
    </motion.button>
  );
}
