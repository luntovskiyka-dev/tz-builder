-- Projects and feedback tables with RLS.
-- These tables are used in code but were missing from migrations.

-- =====================================================
-- 1. ТАБЛИЦА: projects
-- =====================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text,
  blocks jsonb not null default '[]'::jsonb,
  spec text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_updated_at_idx on public.projects (updated_at desc);

alter table public.projects enable row level security;

create policy "Users read own projects"
  on public.projects for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own projects"
  on public.projects for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own projects"
  on public.projects for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own projects"
  on public.projects for delete to authenticated
  using (auth.uid() = user_id);

-- =====================================================
-- 2. ТАБЛИЦА: feedback
-- =====================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;

-- Users can only insert their own feedback
create policy "Users insert own feedback"
  on public.feedback for insert to authenticated
  with check (auth.uid() = user_id);

-- Users can read their own feedback
create policy "Users read own feedback"
  on public.feedback for select to authenticated
  using (auth.uid() = user_id);
