import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import {
  upsertPreferences,
  insertTask,
  updateTask,
  deleteTask as dbDeleteTask,
  insertNote,
  updateNote as dbUpdateNote,
  deleteNote as dbDeleteNote,
  upsertStat,
} from "@/lib/db";

/** Debounce helper */
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Syncs preferences to Supabase whenever they change.
 * Call this once in the settings page (or wherever preferences are edited).
 */
export function usePreferencesSync() {
  const {
    userId,
    lightThemeId,
    darkThemeId,
    fontId,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    autoStartBreaks,
    autoStartPomodoros,
    ambientSound,
    soundVolume,
  } = useAppStore();

  const debouncedSync = useRef(
    debounce((uid: string, prefs: Record<string, unknown>) => {
      upsertPreferences(uid, prefs);
    }, 600)
  ).current;

  useEffect(() => {
    if (!userId) return;
    debouncedSync(userId, {
      light_theme_id: lightThemeId,
      dark_theme_id: darkThemeId,
      font_id: fontId,
      focus_duration: focusDuration,
      short_break_duration: shortBreakDuration,
      long_break_duration: longBreakDuration,
      long_break_interval: longBreakInterval,
      auto_start_breaks: autoStartBreaks,
      auto_start_pomodoros: autoStartPomodoros,
      ambient_sound: ambientSound,
      sound_volume: soundVolume,
    });
  }, [
    userId,
    lightThemeId,
    darkThemeId,
    fontId,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    autoStartBreaks,
    autoStartPomodoros,
    ambientSound,
    soundVolume,
    debouncedSync,
  ]);
}

/** Wraps addTask, toggleTask, deleteTask, updateTask with DB sync */
export function useTaskSync() {
  const store = useAppStore();

  const add = (text: string, estimate = 1) => {
    const id = store.addTask(text, estimate);
    if (store.userId) {
      insertTask(store.userId, {
        id,
        text,
        done: false,
        pomodoros_estimate: estimate,
        pomodoros_done: 0,
        created_at: new Date().toISOString(),
      });
    }
  };

  const toggle = (id: string) => {
    store.toggleTask(id);
    const task = store.tasks.find((t) => t.id === id);
    if (store.userId && task) {
      updateTask(id, { done: !task.done });
    }
  };

  const remove = (id: string) => {
    store.deleteTask(id);
    if (store.userId) dbDeleteTask(id);
  };

  const update = (id: string, patch: Parameters<typeof store.updateTask>[1]) => {
    store.updateTask(id, patch);
    if (store.userId) {
      const dbPatch: Record<string, unknown> = {};
      if ("text" in patch) dbPatch.text = patch.text;
      if ("done" in patch) dbPatch.done = patch.done;
      if ("pomodorosEstimate" in patch) dbPatch.pomodoros_estimate = patch.pomodorosEstimate;
      if ("pomodorosDone" in patch) dbPatch.pomodoros_done = patch.pomodorosDone;
      updateTask(id, dbPatch);
    }
  };

  const incrementPomodoro = (id: string) => {
    store.incrementTaskPomodoro(id);
    const task = store.tasks.find((t) => t.id === id);
    if (store.userId && task) {
      updateTask(id, { pomodoros_done: task.pomodorosDone + 1 });
    }
  };

  return { add, toggle, remove, update, incrementPomodoro };
}

/** Wraps note mutations with DB sync */
export function useNoteSync() {
  const store = useAppStore();

  const debouncedUpdate = useRef(
    debounce((id: string, patch: Record<string, unknown>) => {
      dbUpdateNote(id, patch);
    }, 500)
  ).current;

  const add = () => {
    const id = store.addNote();
    if (store.userId) {
      insertNote(store.userId, {
        id,
        title: "Untitled",
        content: "",
        updated_at: new Date().toISOString(),
      });
    }
    return id;
  };

  const update = (id: string, patch: Parameters<typeof store.updateNote>[1]) => {
    store.updateNote(id, patch);
    if (store.userId) {
      const dbPatch: Record<string, unknown> = {};
      if ("title" in patch) dbPatch.title = patch.title;
      if ("content" in patch) dbPatch.content = patch.content;
      debouncedUpdate(id, dbPatch);
    }
  };

  const remove = (id: string) => {
    store.deleteNote(id);
    if (store.userId) dbDeleteNote(id);
  };

  return { add, update, remove };
}

/** Wraps recordSession with DB sync */
export function useStatsSync() {
  const store = useAppStore();

  const record = (type: "focus" | "short" | "long", minutes: number) => {
    store.recordSession(type, minutes);
    if (!store.userId) return;

    const today = new Date().toISOString().split("T")[0];
    const existing = store.stats.find((s) => s.date === today);

    const stat = {
      date: today,
      focus_sessions: (existing?.focusSessions ?? 0) + (type === "focus" ? 1 : 0),
      short_breaks: (existing?.shortBreaks ?? 0) + (type === "short" ? 1 : 0),
      long_breaks: (existing?.longBreaks ?? 0) + (type === "long" ? 1 : 0),
      total_focus_minutes:
        (existing?.totalFocusMinutes ?? 0) + (type === "focus" ? minutes : 0),
    };

    upsertStat(store.userId, stat);
  };

  return { record };
}
