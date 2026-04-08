-- Allow anonymous users to read active plans (pricing page).
create policy "Anon can read active plans"
  on public.plans
  for select
  to anon
  using (is_active = true);
