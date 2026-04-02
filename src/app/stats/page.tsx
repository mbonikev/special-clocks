"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { PageShell } from "@/components/page-shell";

export default function StatsPage() {
  const { stats, tasks, dailyPomodoros } = useAppStore();

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = stats.find((s) => s.date === dateStr);
    return {
      date: dateStr,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      focusSessions: entry?.focusSessions ?? 0,
      totalFocusMinutes: entry?.totalFocusMinutes ?? 0,
    };
  });

  const maxSessions = Math.max(...last7.map((d) => d.focusSessions), 1);
  const totalSessions = stats.reduce((a, d) => a + d.focusSessions, 0);
  const totalMinutes = stats.reduce((a, d) => a + d.totalFocusMinutes, 0);
  const completedTasks = tasks.filter((t) => t.done).length;
  const today = last7[6];

  const statCards = [
    { label: "Today's Sessions", value: today.focusSessions, unit: "focus" },
    { label: "Today's Focus", value: today.totalFocusMinutes, unit: "min" },
    { label: "Total Sessions", value: totalSessions, unit: "all-time" },
    { label: "Total Focus Time", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, unit: "all-time" },
    { label: "Tasks Done", value: completedTasks, unit: "total" },
    { label: "Pomodoros Today", value: dailyPomodoros, unit: "today" },
  ];

  return (
    <PageShell className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div
        className="px-6 py-4 border-b shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>Statistics</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>Your focus history</p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6 mx-auto w-full max-w-2xl">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: i * 0.04 }}
              className="border p-4"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>{card.label}</p>
              <p className="text-2xl font-semibold mt-1 font-mono" style={{ color: "var(--text)" }}>{card.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-subtle)" }}>{card.unit}</p>
            </motion.div>
          ))}
        </div>

        {/* Sessions bar chart */}
        <div className="border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-subtle)" }}>
            Focus Sessions — Last 7 Days
          </p>
          <div className="flex items-end gap-2 h-32">
            {last7.map((day, i) => {
              const heightPct = (day.focusSessions / maxSessions) * 100;
              const isToday = i === 6;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-subtle)" }}>
                    {day.focusSessions > 0 ? day.focusSessions : ""}
                  </span>
                  <div className="w-full flex items-end" style={{ height: 96 }}>
                    <motion.div
                      className="w-full"
                      style={{
                        background: isToday ? "var(--accent)" : "var(--bg-muted)",
                        border: `1px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPct, day.focusSessions > 0 ? 4 : 2)}%` }}
                      transition={{ duration: 0.4, delay: i * 0.04, ease: "easeOut" }}
                    />
                  </div>
                  <span
                    className="text-[10px]"
                    style={{
                      color: isToday ? "var(--accent)" : "var(--text-subtle)",
                      fontWeight: isToday ? 600 : 400,
                    }}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minutes bar chart */}
        <div className="border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-subtle)" }}>
            Focus Minutes — Last 7 Days
          </p>
          <div className="flex flex-col gap-2">
            {last7.some((d) => d.totalFocusMinutes > 0) ? (
              last7.map((day, i) => {
                const maxMins = Math.max(...last7.map((d) => d.totalFocusMinutes), 1);
                const widthPct = (day.totalFocusMinutes / maxMins) * 100;
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-[10px] w-7 text-right shrink-0" style={{ color: "var(--text-subtle)" }}>
                      {day.label}
                    </span>
                    <div className="flex-1 h-5 flex items-center" style={{ background: "var(--bg-muted)" }}>
                      <motion.div
                        className="h-full"
                        style={{ background: "var(--accent2)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] w-8 font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
                      {day.totalFocusMinutes}m
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs" style={{ color: "var(--text-subtle)" }}>No sessions recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
