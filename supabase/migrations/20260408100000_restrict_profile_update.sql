-- Restrict user_profiles UPDATE policy to prevent plan_id / subscription
-- changes via direct PostgREST calls. Billing fields may only be changed
-- by SECURITY DEFINER functions (webhook handler, plan change RPCs).

-- Drop the overly permissive policy
drop policy if exists "Users update own profile" on public.user_profiles;

-- New policy: users can only update non-billing columns on their own row.
-- The WITH CHECK ensures billing columns stay unchanged.
create policy "Users update own profile (restricted)"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and plan_id = (select plan_id from public.user_profiles where id = auth.uid())
    and subscription_status = (select subscription_status from public.user_profiles where id = auth.uid())
    and subscription_ends_at is not distinct from (select subscription_ends_at from public.user_profiles where id = auth.uid())
  );
