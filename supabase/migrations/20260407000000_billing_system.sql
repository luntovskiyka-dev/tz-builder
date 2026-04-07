-- =====================================================
-- BILLING SYSTEM MIGRATION
-- Добавляет тарифные планы, подписки, платежи и профили пользователей
-- Совместимо с ЮKassa интеграцией
-- =====================================================

-- =====================================================
-- 1. ТАБЛИЦА: plans (тарифные планы)
-- =====================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, -- 'starter', 'project', 'pro', 'studio'
  name text not null, -- 'Starter', 'Project', 'Pro', 'Studio'
  description text,
  price_cents integer not null default 0, -- цена в копейках (0 для бесплатных)
  currency text not null default 'RUB',
  billing_period text, -- 'one_time', 'monthly', 'yearly'
  trial_days integer not null default 0, -- дней пробного периода (0 если нет)
  ai_generations_per_month integer not null default 0, -- лимит AI генераций в месяц
  ai_generations_per_day integer not null default 2, -- лимит AI генераций в день (для Starter)
  max_active_projects integer, -- макс. активных проектов (null = безлимит)
  priority_ai boolean not null default false, -- приоритетный доступ к AI
  team_seats integer, -- количество мест в команде (для Studio)
  features jsonb, -- дополнительные фичи
  is_active boolean not null default true, -- доступен ли план для покупки
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Индексы для plans
create index if not exists plans_slug_idx on public.plans (slug);
create index if not exists plans_active_idx on public.plans (is_active);

-- RLS для plans
alter table public.plans enable row level security;

-- Все могут читать активные планы
create policy "Anyone can read active plans"
  on public.plans
  for select
  to authenticated
  using (is_active = true);

-- =====================================================
-- 2. ТАБЛИЦА: user_profiles (профили пользователей)
-- =====================================================
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan_id uuid not null, -- текущий план
  subscription_status text not null default 'none', -- 'none', 'trialing', 'active', 'past_due', 'canceled', 'expired'
  trial_ends_at timestamptz, -- когда заканчивается триал
  subscription_ends_at timestamptz, -- когда заканчивается подписка
  subscription_id text, -- ID подписки в ЮKassa (если есть)
  yookassa_customer_id text, -- ID клиента в ЮKassa
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Индексы для user_profiles
create index if not exists user_profiles_plan_id_idx on public.user_profiles (plan_id);
create index if not exists user_profiles_subscription_status_idx on public.user_profiles (subscription_status);
create index if not exists user_profiles_trial_ends_at_idx on public.user_profiles (trial_ends_at);

-- RLS для user_profiles
alter table public.user_profiles enable row level security;

-- Пользователь читает только свой профиль
create policy "Users read own profile"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Пользователь обновляет только свой профиль
create policy "Users update own profile"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- Пользователь может создавать только свой профиль
create policy "Users insert own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- =====================================================
-- 3. ТАБЛИЦА: subscriptions (история подписок)
-- =====================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status text not null, -- 'trialing', 'active', 'past_due', 'canceled', 'expired'
  yookassa_subscription_id text, -- ID подписки в ЮKassa
  yookassa_payment_method_id text, -- ID платежного метода в ЮKassa
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  current_period_starts_at timestamptz,
  current_period_ends_at timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  metadata jsonb, -- дополнительные данные
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Индексы для subscriptions
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
create index if not exists subscriptions_yookassa_id_idx on public.subscriptions (yookassa_subscription_id);

-- RLS для subscriptions
alter table public.subscriptions enable row level security;

-- Пользователь читает только свои подписки
create policy "Users read own subscriptions"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Пользователь может создавать только свои подписки
create policy "Users insert own subscriptions"
  on public.subscriptions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Пользователь может обновлять только свои подписки
create policy "Users update own subscriptions"
  on public.subscriptions
  for update
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================
-- 4. ТАБЛИЦА: payments (история платежей)
-- =====================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  amount_cents integer not null, -- сумма в копейках
  currency text not null default 'RUB',
  status text not null, -- 'pending', 'succeeded', 'canceled', 'refunded'
  payment_type text not null, -- 'one_time', 'subscription_payment', 'trial'
  yookassa_payment_id text not null, -- ID платежа в ЮKassa
  yookassa_payment_method_id text, -- ID платежного метода
  description text,
  metadata jsonb, -- дополнительные данные
  paid_at timestamptz, -- когда платеж успешно завершен
  refunded_at timestamptz, -- когда сделан возврат
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Индексы для payments
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_plan_id_idx on public.payments (plan_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_yookassa_id_idx on public.payments (yookassa_payment_id);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

-- RLS для payments
alter table public.payments enable row level security;

-- Пользователь читает только свои платежи
create policy "Users read own payments"
  on public.payments
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Пользователь может создавать только свои платежи
create policy "Users insert own payments"
  on public.payments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =====================================================
-- 5. ТАБЛИЦА: yookassa_events (лог веб-хуков для отладки)
-- =====================================================
create table if not exists public.yookassa_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- 'payment.succeeded', 'payment.canceled', 'refund.succeeded' и т.д.
  event_id text not null unique, -- ID события от ЮKassa
  payment_id text, -- ID платежа
  subscription_id text, -- ID подписки
  object jsonb not null, -- полный объект события от ЮKassa
  processed boolean not null default false, -- обработано ли событие
  error text, -- ошибка при обработке
  created_at timestamptz not null default now()
);

-- Индексы для yookassa_events
create index if not exists yookassa_events_type_idx on public.yookassa_events (event_type);
create index if not exists yookassa_events_payment_id_idx on public.yookassa_events (payment_id);
create index if not exists yookassa_events_processed_idx on public.yookassa_events (processed);

-- RLS для yookassa_events
alter table public.yookassa_events enable row level security;

-- Только сервисная роль может записывать (через веб-хуки)
-- Чтение только для администраторов (нет политики для authenticated)

-- =====================================================
-- 6. ФУНКЦИЯ: Создание профиля при регистрации пользователя
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starter_plan_id uuid;
begin
  -- Находим план Starter
  select id into starter_plan_id
  from public.plans
  where slug = 'starter'
  limit 1;

  -- Создаем профиль пользователя с планом Starter
  if starter_plan_id is not null then
    insert into public.user_profiles (id, plan_id, subscription_status)
    values (new.id, starter_plan_id, 'none');
  end if;

  return new;
end;
$$;

-- Триггер на создание нового пользователя
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =====================================================
-- 7. ФУНКЦИЯ: Получить квоту AI генераций с учетом тарифа
-- =====================================================
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
begin
  if uid is null then
    return jsonb_build_object('authenticated', false, 'plan', 'none', 'used_today', 0, 'daily_limit', 0, 'remaining_today', 0, 'used_this_month', 0, 'monthly_limit', 0, 'remaining_this_month', 0);
  end if;

  -- Получаем план пользователя
  select up.plan_id, p.slug, p.ai_generations_per_month, p.ai_generations_per_day
  into user_plan_id, plan_slug, monthly_limit, daily_limit
  from public.user_profiles up
  join public.plans p on p.id = up.plan_id
  where up.id = uid;

  -- Если профиль не найден, используем Starter
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

  -- Считаем использование
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

  return jsonb_build_object(
    'authenticated', true,
    'plan', plan_slug,
    'used_today', used_today,
    'daily_limit', daily_limit,
    'remaining_today', greatest(daily_limit - used_today, 0),
    'used_this_month', used_this_month,
    'monthly_limit', monthly_limit,
    'remaining_this_month', case 
      when monthly_limit = 0 then 999999 -- безлимит
      else greatest(monthly_limit - used_this_month, 0)
    end
  );
end;
$$;

revoke all on function public.get_user_ai_quota() from public;
grant execute on function public.get_user_ai_quota() to authenticated;

-- =====================================================
-- 8. ФУНКЦИЯ: Обновленная try_consume_spec_generation
-- =====================================================
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

  -- Получаем план пользователя
  select up.plan_id, p.slug, p.ai_generations_per_month, p.ai_generations_per_day
  into user_plan_id, plan_slug, monthly_limit, daily_limit
  from public.user_profiles up
  join public.plans p on p.id = up.plan_id
  where up.id = uid;

  -- Если профиль не найден, используем Starter
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

  -- Проверяем лимиты
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

  -- Проверка дневного лимита
  if used_today >= daily_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'daily_limit_exceeded',
      'plan', plan_slug,
      'used_today', used_today,
      'daily_limit', daily_limit
    );
  end if;

  -- Проверка месячного лимита (0 = безлимит)
  if monthly_limit > 0 and used_this_month >= monthly_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'monthly_limit_exceeded',
      'plan', plan_slug,
      'used_this_month', used_this_month,
      'monthly_limit', monthly_limit
    );
  end if;

  -- Записываем генерацию
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

-- =====================================================
-- 9. ФУНКЦИЯ: spec_generation_quota (обновленная)
-- =====================================================
create or replace function public.spec_generation_quota()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.get_user_ai_quota();
end;
$$;

revoke all on function public.spec_generation_quota() from public;
grant execute on function public.spec_generation_quota() to authenticated;

-- =====================================================
-- 10. ФУНКЦИЯ: Получить текущий план пользователя
-- =====================================================
create or replace function public.get_user_plan()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result jsonb;
begin
  if uid is null then
    return jsonb_build_object('authenticated', false);
  end if;

  select jsonb_build_object(
    'authenticated', true,
    'user_id', up.id,
    'plan_id', p.id,
    'plan_slug', p.slug,
    'plan_name', p.name,
    'subscription_status', up.subscription_status,
    'trial_ends_at', up.trial_ends_at,
    'subscription_ends_at', up.subscription_ends_at,
    'ai_generations_per_month', p.ai_generations_per_month,
    'ai_generations_per_day', p.ai_generations_per_day,
    'max_active_projects', p.max_active_projects,
    'priority_ai', p.priority_ai,
    'team_seats', p.team_seats
  ) into result
  from public.user_profiles up
  join public.plans p on p.id = up.plan_id
  where up.id = uid;

  return result;
end;
$$;

revoke all on function public.get_user_plan() from public;
grant execute on function public.get_user_plan() to authenticated;

-- =====================================================
-- 11. Вставка тарифных планов
-- =====================================================
insert into public.plans (slug, name, description, price_cents, billing_period, trial_days, ai_generations_per_month, ai_generations_per_day, max_active_projects, priority_ai, team_seats, features) values
  ('starter', 'Starter', 'Бесплатный план для знакомства с платформой', 0, null, 0, 0, 2, 1, false, null, '["2 AI генерации/день", "1 активный проект", "12 базовых блоков", "Облачное хранение"]'::jsonb),
  ('project', 'Project', 'Разовое создание полного ТЗ', 49000, 'one_time', 0, 1, 1, null, false, null, '["1 полное ТЗ", "7 дней правок", "PDF экспорт", "Cursor prompt"]'::jsonb),
  ('pro', 'Pro', 'Для профессиональных разработчиков', 99000, 'monthly', 14, 30, 10, null, true, null, '["30 AI генераций/мес", "Безлимит проектов", "Приоритетный AI", "PDF/Word экспорт"]'::jsonb),
  ('studio', 'Studio', 'Для команд и студий', 499000, 'monthly', 14, 50, 20, null, true, 10, '["50 AI генераций/мес", "10 мест в команде", "Общие шаблоны", "Приоритетная поддержка", "Командная работа"]'::jsonb)
on conflict (slug) do nothing;

-- =====================================================
-- 12. Триггер для автоматического обновления updated_at
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_user_profiles
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_subscriptions
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_payments
  before update on public.payments
  for each row
  execute function public.handle_updated_at();

-- =====================================================
-- ГОТОВО!
-- =====================================================
