-- Adds generated technical specification (markdown) field to user's projects.
-- Run this in Supabase SQL Editor (or via your migration system).
--
-- Expected table: public.projects
-- Expected columns before this:
--   - id uuid (pk)
--   - user_id uuid (auth.users)
--   - name text
--   - blocks jsonb
--   - created_at timestamptz
--   - updated_at timestamptz

alter table public.projects
  add column if not exists spec text;

-- If you use strict RLS, ensure you have policies for UPDATE/SELECT on `projects`
-- like: user_id = auth.uid(). The existing policies for `projects` should already
-- allow updating the row the user owns, including all columns (including `spec`).

