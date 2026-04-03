"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  CheckSquare,
  FileText,
  BarChart2,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTimerStore } from "@/hooks/use-timer";
import { WarningModal } from "@/components/warning-modal";

const navItems = [
  { href: "/", icon: Timer, label: "Timer" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/notes", icon: FileText, label: "Notes" },
  { href: "/clocks", icon: Clock, label: "Clocks" },
  { href: "/stats", icon: BarChart2, label: "Stats" },
];

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onNavigate?: (href: string, e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <Link
        href={href}
        onClick={onNavigate ? (e) => onNavigate(href, e) : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex items-center justify-center h-10 w-full transition-colors duration-150",
          active
            ? "text-[var(--text)]"
            : "text-[var(--text-subtle)] hover:text-[var(--text-muted)]"
        )}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0"
            style={{ background: "var(--bg-muted)" }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        )}
        <Icon
          size={16}
          className="relative z-10"
          strokeWidth={active ? 2.5 : 1.8}
        />
      </Link>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-[11px] font-medium whitespace-nowrap pointer-events-none z-50"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const timerRunning = useTimerStore((s) => s.running);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const handleNavigate = (href: string, e: React.MouseEvent) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    if (timerRunning && !isActive) {
      e.preventDefault();
      setPendingHref(href);
    }
  };

  return (
    <>
      <nav
        className="flex flex-col h-screen border-r shrink-0"
        style={{
          width: 56,
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="h-14 flex items-center justify-center border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="w-6 h-6 flex items-center justify-center text-[10px] font-bold tracking-widest"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            F
          </div>
        </div>

        {/* Nav links */}
        <div className="flex flex-col flex-1 py-2 gap-0.5 px-1.5">
          {navItems.map(({ href, icon, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <NavLink
                key={href}
                href={href}
                icon={icon}
                label={label}
                active={active}
                onNavigate={handleNavigate}
              />
            );
          })}
        </div>

        {/* Settings at bottom */}
        <div className="px-1.5 pb-2">
          <NavLink
            href="/settings"
            icon={Settings}
            label="Settings"
            active={pathname.startsWith("/settings")}
            onNavigate={handleNavigate}
          />
        </div>
      </nav>

      <WarningModal
        open={pendingHref !== null}
        title="Timer is running"
        message="You have an active timer. Switching tabs will not stop it, but you'll leave the timer page. Continue?"
        confirmLabel="Switch tab"
        cancelLabel="Cancel"
        onConfirm={() => {
          const href = pendingHref!;
          setPendingHref(null);
          router.push(href);
        }}
        onCancel={() => setPendingHref(null)}
      />
    </>
  );
}
