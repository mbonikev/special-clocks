import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeId, FontId } from "@/lib/themes";

interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  pomodorosEstimate: number;
  pomodorosDone: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface PomodoroStats {
  date: string;
  focusSessions: number;
  shortBreaks: number;
  longBreaks: number;
  totalFocusMinutes: number;
}

interface AppState {
  /* Theme */
  themeId: ThemeId;
  fontId: FontId;
  systemTheme: "light" | "dark";
  setThemeId: (id: ThemeId) => void;
  setFontId: (id: FontId) => void;
  setSystemTheme: (mode: "light" | "dark") => void;

  /* Timer settings */
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  setTimerSettings: (s: Partial<Pick<AppState, "focusDuration" | "shortBreakDuration" | "longBreakDuration" | "longBreakInterval" | "autoStartBreaks" | "autoStartPomodoros">>) => void;

  /* Tasks */
  tasks: Task[];
  activeTaskId: string | null;
  addTask: (text: string, estimate?: number) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setActiveTask: (id: string | null) => void;
  incrementTaskPomodoro: (id: string) => void;

  /* Notes */
  notes: Note[];
  addNote: () => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  /* Stats */
  stats: PomodoroStats[];
  recordSession: (type: "focus" | "short" | "long", minutes: number) => void;

  /* Sound */
  ambientSound: string | null;
  soundVolume: number;
  setAmbientSound: (id: string | null) => void;
  setSoundVolume: (v: number) => void;

  /* Completed pomodoro count today */
  dailyPomodoros: number;
  incrementDailyPomodoros: () => void;
  resetDailyPomodoros: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      /* Theme */
      themeId: "dark-default",
      fontId: "inter",
      systemTheme: "dark",
      setThemeId: (id) => set({ themeId: id }),
      setFontId: (id) => set({ fontId: id }),
      setSystemTheme: (mode) => set({ systemTheme: mode }),

      /* Timer */
      focusDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      setTimerSettings: (s) => set(s),

      /* Tasks */
      tasks: [],
      activeTaskId: null,
      addTask: (text, estimate = 1) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: crypto.randomUUID(),
              text,
              done: false,
              createdAt: Date.now(),
              pomodorosEstimate: estimate,
              pomodorosDone: 0,
            },
          ],
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      setActiveTask: (id) => set({ activeTaskId: id }),
      incrementTaskPomodoro: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, pomodorosDone: t.pomodorosDone + 1 } : t
          ),
        })),

      /* Notes */
      notes: [],
      addNote: () => {
        const id = crypto.randomUUID();
        set((s) => ({
          notes: [
            ...s.notes,
            { id, title: "Untitled", content: "", updatedAt: Date.now() },
          ],
        }));
        return id;
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      /* Stats */
      stats: [],
      recordSession: (type, minutes) => {
        const today = new Date().toISOString().split("T")[0];
        set((s) => {
          const existing = s.stats.find((d) => d.date === today);
          if (existing) {
            return {
              stats: s.stats.map((d) =>
                d.date === today
                  ? {
                      ...d,
                      focusSessions:
                        d.focusSessions + (type === "focus" ? 1 : 0),
                      shortBreaks:
                        d.shortBreaks + (type === "short" ? 1 : 0),
                      longBreaks:
                        d.longBreaks + (type === "long" ? 1 : 0),
                      totalFocusMinutes:
                        d.totalFocusMinutes +
                        (type === "focus" ? minutes : 0),
                    }
                  : d
              ),
            };
          }
          return {
            stats: [
              ...s.stats,
              {
                date: today,
                focusSessions: type === "focus" ? 1 : 0,
                shortBreaks: type === "short" ? 1 : 0,
                longBreaks: type === "long" ? 1 : 0,
                totalFocusMinutes: type === "focus" ? minutes : 0,
              },
            ],
          };
        });
      },

      /* Sound */
      ambientSound: null,
      soundVolume: 0.5,
      setAmbientSound: (id) => set({ ambientSound: id }),
      setSoundVolume: (v) => set({ soundVolume: v }),

      /* Daily pomodoros */
      dailyPomodoros: 0,
      incrementDailyPomodoros: () =>
        set((s) => ({ dailyPomodoros: s.dailyPomodoros + 1 })),
      resetDailyPomodoros: () => set({ dailyPomodoros: 0 }),
    }),
    { name: "focus-app" }
  )
);
