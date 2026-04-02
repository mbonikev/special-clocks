"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { fonts } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeId, fontId, setSystemTheme } = useAppStore();

  /* Apply theme to <html> data-theme attribute */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
  }, [themeId]);

  /* Apply font CSS variable */
  useEffect(() => {
    const font = fonts.find((f) => f.id === fontId);
    if (font) {
      document.body.style.setProperty(
        "--app-font",
        `var(${font.variable})`
      );
    }
  }, [fontId]);

  /* Listen for system color scheme */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mq.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setSystemTheme]);

  return <>{children}</>;
}
