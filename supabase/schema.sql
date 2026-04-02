-- ============================================================
-- Focus App — Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- User preferences
create table if not exists user_preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  light_theme_id text not null default 'light-default',
  dark_theme_id text not null default 'dark-default',
  font_id text not null default 'inter',
  focus_duration integer not null default 1500,
  short_break_duration integer not null default 300,
  long_break_duration integer not null default 900,
  long_break_interval integer not null default 4,
  auto_start_breaks boolean not null default false,
  auto_start_pomodoros boolean not null default false,
  ambient_sound text,
  sound_volume decimal not null default 0.5,
  updated_at timestamptz not null default now()
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  pomodoros_estimate integer not null default 1,
  pomodoros_done integer not null default 0
);

-- Notes
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled',
  content text not null default '',
  updated_at timestamptz not null default now()
);

-- Daily focus stats
create table if not exists focus_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  focus_sessions integer not null default 0,
  short_breaks integer not null default 0,
  long_breaks integer not null default 0,
  total_focus_minutes integer not null default 0,
  unique(user_id, date)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table user_preferences enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table focus_stats enable row level security;

create policy "own preferences" on user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tasks"       on tasks           for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notes"       on notes           for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own stats"       on focus_stats     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
