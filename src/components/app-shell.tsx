"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return (
      <OverlayScrollbarsComponent
        element="main"
        className="flex-1 bg-[var(--bg)]"
        options={{ scrollbars: { autoHide: "scroll", theme: "os-theme-dark" } }}
        defer
      >
        {children}
      </OverlayScrollbarsComponent>
    );
  }

  return (
    <>
      <Sidebar />
      <OverlayScrollbarsComponent
        element="main"
        className="flex-1 bg-[var(--bg)]"
        options={{ scrollbars: { autoHide: "scroll", theme: "os-theme-dark" } }}
        defer
      >
        {children}
      </OverlayScrollbarsComponent>
    </>
  );
}
