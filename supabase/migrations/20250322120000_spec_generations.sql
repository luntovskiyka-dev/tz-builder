-- Лимит генераций ТЗ: учёт по UTC-календарным суткам, до 2 на пользователя.

create table if not exists public.spec_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists spec_generations_user_created_idx
  on public.spec_generations (user_id, created_at desc);

alter table public.spec_generations enable row level security;

create policy "Users read own spec generations"
  on public.spec_generations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own spec generations"
  on public.spec_generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Атомарная проверка лимита и запись (без гонок при параллельных запросах).
create or replace function public.try_consume_spec_generation(max_per_day integer default 2)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cnt int;
  day_start timestamptz;
begin
  if uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'not_authenticated');
  end if;

  if max_per_day is null or max_per_day < 1 then
    max_per_day := 2;
  end if;

  day_start := (date_trunc('day', (now() at time zone 'utc')) at time zone 'utc');

  select count(*)::int into cnt
  from public.spec_generations
  where user_id = uid
    and created_at >= day_start;

  if cnt >= max_per_day then
    return jsonb_build_object('allowed', false, 'used', cnt, 'limit', max_per_day);
  end if;

  insert into public.spec_generations (user_id) values (uid);

  return jsonb_build_object('allowed', true, 'used', cnt + 1, 'limit', max_per_day);
end;
$$;

revoke all on function public.try_consume_spec_generation(integer) from public;
grant execute on function public.try_consume_spec_generation(integer) to authenticated;

-- Сколько уже использовано за текущие UTC-сутки (без списания слота).
create or replace function public.spec_generation_quota(max_per_day integer default 2)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cnt int;
  day_start timestamptz;
  lim int;
begin
  if uid is null then
    return jsonb_build_object('authenticated', false, 'used', 0, 'limit', 2, 'remaining', 0);
  end if;

  lim := coalesce(nullif(max_per_day, 0), 2);
  if lim < 1 then
    lim := 2;
  end if;

  day_start := (date_trunc('day', (now() at time zone 'utc')) at time zone 'utc');

  select count(*)::int into cnt
  from public.spec_generations
  where user_id = uid
    and created_at >= day_start;

  return jsonb_build_object(
    'authenticated', true,
    'used', cnt,
    'limit', lim,
    'remaining', greatest(lim - cnt, 0)
  );
end;
$$;

revoke all on function public.spec_generation_quota(integer) from public;
grant execute on function public.spec_generation_quota(integer) to authenticated;
