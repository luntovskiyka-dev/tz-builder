# Инструкция по применению миграции биллинговой системы

## 📋 Обзор миграции

Файл: `supabase/migrations/20260407000000_billing_system.sql`

Эта миграция добавляет полную инфраструктуру для биллинга:
- Тарифные планы (Starter, Project, Pro, Studio)
- Профили пользователей с привязкой к планам
- Подписки (с интеграцией ЮKassa)
- История платежей
- Лог веб-хуков ЮKassa
- Обновленные функции квот AI с учетом тарифов

## 🚀 Как применить миграцию

### Способ 1: Через Supabase Dashboard (рекомендуется для первого раза)

1. Зайдите в **Supabase Dashboard**: https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **SQL Editor** (левое меню)
4. Откройте файл `supabase/migrations/20260407000000_billing_system.sql`
5. Скопируйте всё содержимое
6. Вставьте в SQL Editor
7. Нажмите **Run** (или Ctrl/Cmd + Enter)
8. Дождитесь успешного выполнения

### Способ 2: Через Supabase CLI (для продакшена)

```bash
# Установите Supabase CLI если еще не установлен
npm install -g supabase

# Залогиньтесь
supabase login

# Свяжите проект
supabase link --project-ref YOUR_PROJECT_REF

# Примените миграцию
supabase db push
```

### Способ 3: Вручную через psql

```bash
psql -h db.YOUR_PROJECT.supabase.co -p 5432 -d postgres -U postgres -f supabase/migrations/20260407000000_billing_system.sql
```

## ✅ Что будет создано

### Таблицы:
1. **`plans`** - 4 тарифных плана (Starter, Project, Pro, Studio)
2. **`user_profiles`** - профили пользователей с текущим планом
3. **`subscriptions`** - история подписок
4. **`payments`** - история платежей
5. **`yookassa_events`** - лог веб-хуков ЮKassa

### Функции:
1. **`handle_new_user()`** - автоматическое создание профиля при регистрации
2. **`get_user_ai_quota()`** - получение квоты AI с учетом тарифа
3. **`try_consume_spec_generation()`** - проверка и списание слота AI
4. **`spec_generation_quota()`** - обертка для get_user_ai_quota
5. **`get_user_plan()`** - получение текущего плана пользователя

### Триггеры:
1. **`on_auth_user_created`** - создание профиля при регистрации
2. **`set_updated_at_*`** - автоматическое обновление `updated_at`

## ⚠️ Важные замечания

1. **Обратная совместимость**: 
   - Старая функция `try_consume_spec_generation(max_per_day integer)` будет заменена на `try_consume_spec_generation()` (без параметров)
   - Вам нужно обновить код, который вызывает эту функцию

2. **Существующие пользователи**: 
   - После применения миграции у существующих пользователей НЕ будет профилей в `user_profiles`
   - Запустите этот скрипт для создания профилей существующим пользователям:

```sql
-- Создать профили для пользователей без профиля
insert into public.user_profiles (id, plan_id, subscription_status)
select 
  au.id,
  (select id from public.plans where slug = 'starter' limit 1),
  'none'
from auth.users au
left join public.user_profiles up on up.id = au.id
where up.id is null
on conflict (id) do nothing;
```

3. **RLS политики**: 
   - Все таблицы защищены Row Level Security
   - Пользователи видят только свои данные
   - Веб-хуки ЮKassa требуют сервисную роль для записи

## 🔍 Проверка успешности

После применения миграции выполните:

```sql
-- Проверка таблиц
select table_name from information_schema.tables 
where table_schema = 'public' 
and table_name in ('plans', 'user_profiles', 'subscriptions', 'payments', 'yookassa_events');

-- Проверка тарифных планов
select slug, name, price_cents, billing_period from public.plans;

-- Проверка функций
select routine_name from information_schema.routines 
where routine_schema = 'public' 
and routine_name in ('try_consume_spec_generation', 'get_user_ai_quota', 'spec_generation_quota', 'get_user_plan');
```

## 🔄 Откат миграции (если нужно)

```sql
-- Удалить триггеры
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists set_updated_at_user_profiles on public.user_profiles;
drop trigger if exists set_updated_at_subscriptions on public.subscriptions;
drop trigger if exists set_updated_at_payments on public.payments;

-- Удалить таблицы
drop table if exists public.yookassa_events cascade;
drop table if exists public.payments cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.plans cascade;

-- Удалить функции
drop function if exists public.handle_new_user();
drop function if exists public.handle_updated_at();
drop function if exists public.try_consume_spec_generation();
drop function if exists public.get_user_ai_quota();
drop function if exists public.spec_generation_quota();
drop function if exists public.get_user_plan();
```

## 📝 Следующие шаги

После применения миграции:
1. Обновите код API `/api/generate-spec` для использования новой функции `try_consume_spec_generation()`
2. Создайте клиент ЮKassa
3. Реализуйте страницу `/pricing`
4. Настройте веб-хуки ЮKassa
