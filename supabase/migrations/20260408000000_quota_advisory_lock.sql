-- Fix TOCTOU race condition in try_consume_spec_generation().
-- Two concurrent calls could both pass the limit check and insert,
-- exceeding the daily/monthly cap. Adding pg_advisory_xact_lock
-- serializes calls per user within the transaction.

create or replace function public.try_consume_spec_generation()
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
begin
  if uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'not_authenticated');
  end if;

  -- Serialize concurrent calls for the same user to prevent TOCTOU
  perform pg_advisory_xact_lock(hashtext('spec_gen_' || uid::text));

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
    daily_limit := coalesce(daily_limit, 2);
  end if;

  month_start := (date_trunc('month', (now() at time zone 'utc')) at time zone 'utc');
  today_start := (date_trunc('day', (now() at time zone 'utc')) at time zone 'utc');

  select count(*)::int into used_this_month
  from public.spec_generations
  where user_id = uid
    and created_at >= month_start;

  select count(*)::int into used_today
  from public.spec_generations
  where user_id = uid
    and created_at >= today_start;

  if used_today >= daily_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'daily_limit_exceeded',
      'plan', plan_slug,
      'used_today', used_today,
      'daily_limit', daily_limit
    );
  end if;

  if monthly_limit > 0 and used_this_month >= monthly_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'monthly_limit_exceeded',
      'plan', plan_slug,
      'used_this_month', used_this_month,
      'monthly_limit', monthly_limit
    );
  end if;

  insert into public.spec_generations (user_id) values (uid);

  return jsonb_build_object(
    'allowed', true,
    'plan', plan_slug,
    'used_today', used_today + 1,
    'daily_limit', daily_limit,
    'used_this_month', used_this_month + 1,
    'monthly_limit', case when monthly_limit = 0 then 999999 else monthly_limit end
  );
end;
$$;

revoke all on function public.try_consume_spec_generation() from public;
grant execute on function public.try_consume_spec_generation() to authenticated;
