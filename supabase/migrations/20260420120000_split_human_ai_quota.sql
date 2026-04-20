-- Split quota by generation mode:
-- - Starter: only 1 human generation per day, AI mode is unavailable
-- - Paid plans: AI mode available with existing plan limits

alter table public.spec_generations
  add column if not exists generation_mode text not null default 'human';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'spec_generations_generation_mode_check'
      and conrelid = 'public.spec_generations'::regclass
  ) then
    alter table public.spec_generations
      add constraint spec_generations_generation_mode_check
      check (generation_mode in ('human', 'ai'));
  end if;
end $$;

create index if not exists spec_generations_user_mode_created_idx
  on public.spec_generations (user_id, generation_mode, created_at desc);

create or replace function public.get_user_ai_quota()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  user_plan_id uuid;
  plan_slug text;
  used_this_month int;
  used_today int;
  monthly_limit int;
  daily_limit int;
  month_start timestamptz;
  today_start timestamptz;
  ai_available boolean;
begin
  if uid is null then
    return jsonb_build_object(
      'authenticated', false,
      'plan', 'none',
      'used_today', 0,
      'daily_limit', 0,
      'remaining_today', 0,
      'used_this_month', 0,
      'monthly_limit', 0,
      'remaining_this_month', 0,
      'ai_available', false
    );
  end if;

  select up.plan_id, p.slug, p.ai_generations_per_month, p.ai_generations_per_day
  into user_plan_id, plan_slug, monthly_limit, daily_limit
  from public.user_profiles up
  join public.plans p on p.id = up.plan_id
  where up.id = uid;

  if plan_slug is null then
    select slug, ai_generations_per_month, ai_generations_per_day
    into plan_slug, monthly_limit, daily_limit
    from public.plans
    where slug = 'starter'
    limit 1;

    plan_slug := coalesce(plan_slug, 'starter');
    monthly_limit := coalesce(monthly_limit, 0);
    daily_limit := coalesce(daily_limit, 1);
  end if;

  ai_available := plan_slug <> 'starter';

  -- Starter has a dedicated free human quota: 1 generation/day.
  if plan_slug = 'starter' then
    daily_limit := 1;
    monthly_limit := 0;
  end if;

  month_start := (date_trunc('month', (now() at time zone 'utc')) at time zone 'utc');
  today_start := (date_trunc('day', (now() at time zone 'utc')) at time zone 'utc');

  select count(*)::int into used_this_month
  from public.spec_generations
  where user_id = uid
    and created_at >= month_start
    and (
      generation_mode = 'human'
      or generation_mode is null
    );

  select count(*)::int into used_today
  from public.spec_generations
  where user_id = uid
    and created_at >= today_start
    and (
      generation_mode = 'human'
      or generation_mode is null
    );

  return jsonb_build_object(
    'authenticated', true,
    'plan', plan_slug,
    'used_today', used_today,
    'daily_limit', daily_limit,
    'remaining_today', greatest(daily_limit - used_today, 0),
    'used_this_month', used_this_month,
    'monthly_limit', monthly_limit,
    'remaining_this_month', case
      when monthly_limit = 0 then 999999
      else greatest(monthly_limit - used_this_month, 0)
    end,
    'ai_available', ai_available
  );
end;
$$;

revoke all on function public.get_user_ai_quota() from public;
grant execute on function public.get_user_ai_quota() to authenticated;

create or replace function public.try_consume_spec_generation(p_mode text default 'human')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  user_plan_id uuid;
  plan_slug text;
  monthly_limit int;
  daily_limit int;
  used_this_month int;
  used_today int;
  month_start timestamptz;
  today_start timestamptz;
  mode_key text := lower(coalesce(p_mode, 'human'));
begin
  if uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'not_authenticated');
  end if;

  if mode_key not in ('human', 'ai') then
    mode_key := 'human';
  end if;

  perform pg_advisory_xact_lock(hashtext('spec_gen_' || uid::text || '_' || mode_key));

  select up.plan_id, p.slug, p.ai_generations_per_month, p.ai_generations_per_day
  into user_plan_id, plan_slug, monthly_limit, daily_limit
  from public.user_profiles up
  join public.plans p on p.id = up.plan_id
  where up.id = uid;

  if plan_slug is null then
    select slug, ai_generations_per_month, ai_generations_per_day
    into plan_slug, monthly_limit, daily_limit
    from public.plans
    where slug = 'starter'
    limit 1;

    plan_slug := coalesce(plan_slug, 'starter');
    monthly_limit := coalesce(monthly_limit, 0);
    daily_limit := coalesce(daily_limit, 1);
  end if;

  if plan_slug = 'starter' and mode_key = 'ai' then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'ai_not_available_for_plan',
      'plan', plan_slug
    );
  end if;

  if plan_slug = 'starter' then
    daily_limit := 1;
    monthly_limit := 0;
  end if;

  month_start := (date_trunc('month', (now() at time zone 'utc')) at time zone 'utc');
  today_start := (date_trunc('day', (now() at time zone 'utc')) at time zone 'utc');

  select count(*)::int into used_this_month
  from public.spec_generations
  where user_id = uid
    and created_at >= month_start
    and (
      generation_mode = mode_key
      or (mode_key = 'human' and generation_mode is null)
    );

  select count(*)::int into used_today
  from public.spec_generations
  where user_id = uid
    and created_at >= today_start
    and (
      generation_mode = mode_key
      or (mode_key = 'human' and generation_mode is null)
    );

  if used_today >= daily_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'daily_limit_exceeded',
      'plan', plan_slug,
      'mode', mode_key,
      'used_today', used_today,
      'daily_limit', daily_limit
    );
  end if;

  if monthly_limit > 0 and used_this_month >= monthly_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'monthly_limit_exceeded',
      'plan', plan_slug,
      'mode', mode_key,
      'used_this_month', used_this_month,
      'monthly_limit', monthly_limit
    );
  end if;

  insert into public.spec_generations (user_id, generation_mode) values (uid, mode_key);

  return jsonb_build_object(
    'allowed', true,
    'plan', plan_slug,
    'mode', mode_key,
    'used_today', used_today + 1,
    'daily_limit', daily_limit,
    'used_this_month', used_this_month + 1,
    'monthly_limit', case when monthly_limit = 0 then 999999 else monthly_limit end
  );
end;
$$;

revoke all on function public.try_consume_spec_generation() from public;
revoke all on function public.try_consume_spec_generation(text) from public;
grant execute on function public.try_consume_spec_generation() to authenticated;
grant execute on function public.try_consume_spec_generation(text) to authenticated;
