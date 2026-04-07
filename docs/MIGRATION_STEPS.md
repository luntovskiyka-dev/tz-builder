# Подробная инструкция: Применение миграции и обновление кода

## 📋 Обзор изменений

После применения миграции billing_system.sql, система лимитов AI меняется:

### ДО миграции:
- Все пользователи: **2 генерации/день** (фиксировано)
- Функция: `try_consume_spec_generation(max_per_day integer)`
- API возвращал: `{ used, limit, remaining }`

### ПОСЛЕ миграции:
- Лимиты зависят от тарифа пользователя
- Функция: `try_consume_spec_generation()` (без параметров)
- API возвращает: `{ plan, used_today, daily_limit, remaining_today, used_this_month, monthly_limit, remaining_this_month }`

---

## 🚀 ШАГ 1: Применение основной миграции

### 1.1. Откройте Supabase Dashboard
Перейдите по ссылке: https://supabase.com/dashboard/project/YOUR_PROJECT

### 1.2. Откройте SQL Editor
В левом меню нажмите **SQL Editor**

### 1.3. Выполните миграцию
1. Откройте файл `supabase/migrations/20260407000000_billing_system.sql`
2. Скопируйте **ВСЁ** содержимое (Ctrl/Cmd + A)
3. Вставьте в SQL Editor
4. Нажмите **Run** (или Ctrl/Cmd + Enter)
5. Дождитесь сообщения `Success. No rows returned`

### 1.4. Проверьте успешность
Выполните в SQL Editor:

```sql
-- Проверка таблиц
select table_name, 
       (xpath('/row/count/text()', query_to_xml('select count(*) from ' || table_schema || '.' || table_name, false, true, '')))[1]::text::int as row_count
from information_schema.tables
where table_schema = 'public' 
  and table_name in ('plans', 'user_profiles', 'subscriptions', 'payments', 'yookassa_events');
```

Ожидаемый результат:
| table_name | row_count |
|------------|-----------|
| plans | 4 |
| user_profiles | 0 (или больше) |
| subscriptions | 0 |
| payments | 0 |
| yookassa_events | 0 |

---

## 🚀 ШАГ 2: Создание профилей существующим пользователям

### 2.1. Выполните скрипт миграции пользователей

В **том же SQL Editor** выполните:

```sql
-- =====================================================
-- СОЗДАНИЕ ПРОФИЛЕЙ СУЩЕСТВУЮЩИМ ПОЛЬЗОВАТЕЛЯМ
-- =====================================================

insert into public.user_profiles (
  id,
  plan_id,
  subscription_status,
  created_at,
  updated_at
)
select 
  au.id,
  (select id from public.plans where slug = 'starter' limit 1),
  'none',
  now(),
  now()
from auth.users au
left join public.user_profiles up on up.id = au.id
where up.id is null
on conflict (id) do nothing;

-- Проверка результата
select 
  (select count(*) from auth.users) as total_users,
  (select count(*) from public.user_profiles) as users_with_profile,
  (select count(*) from auth.users au 
   left join public.user_profiles up on up.id = au.id 
   where up.id is null) as users_without_profile;
```

### 2.2. Ожидаемый результат

| total_users | users_with_profile | users_without_profile |
|-------------|-------------------|----------------------|
| 10 | 10 | 0 |

**Важно:** `users_without_profile` должен быть **0**!

### 2.3. Что делает этот скрипт

1. Берёт **всех пользователей** из `auth.users`
2. Находит тех, у кого **НЕТ** записи в `user_profiles`
3. Создаёт им профили с планом **Starter** (бесплатный)
4. Устанавливает `subscription_status = 'none'`
5. Все новые пользователи автоматически получат Starter план через триггер

---

## 🚀 ШАГ 3: Обновление кода API (уже сделано ✅)

### Обновлённые файлы:

1. ✅ `src/app/api/generate-spec/route.ts`
   - Удалена константа `SPEC_GEN_PER_DAY = 2`
   - Обновлён вызов RPC: `try_consume_spec_generation()` без параметров
   - Улучшены сообщения об ошибках с учетом тарифа

2. ✅ `src/app/api/generate-spec/quota/route.ts`
   - Удалена константа `DEFAULT_LIMIT = 2`
   - Используется новая функция `get_user_ai_quota()`
   - Возвращает расширенную информацию о квоте

3. ✅ `src/components/export/ExportModal.tsx`
   - Обновлён тип `quota` с новыми полями
   - Отображение лимитов с учетом тарифа

---

## 🚀 ШАГ 4: Тестирование

### 4.1. Запустите приложение

```bash
npm run dev
```

### 4.2. Проверьте авторизацию

1. Войдите в систему
2. Перейдите на `http://localhost:3000/dashboard`

### 4.3. Проверьте профиль пользователя

В DevTools Console (F12) выполните:

```javascript
// Получить информацию о текущем пользователе
const response = await fetch('/api/generate-spec/quota');
const data = await response.json();
console.log('Quota:', data);
```

Ожидаемый формат ответа:
```json
{
  "authenticated": true,
  "plan": "starter",
  "used_today": 0,
  "daily_limit": 2,
  "remaining_today": 2,
  "used_this_month": 0,
  "monthly_limit": 0,
  "remaining_this_month": 999999
}
```

### 4.4. Проверьте генерацию ТЗ

1. Создайте проект
2. Добавьте блоки
3. Нажмите "Сгенерировать ТЗ"
4. Проверьте, что лимит обновился

### 4.5. Проверьте ошибку лимита

После превышения лимита должно появиться сообщение:
```
Достигнут дневной лимит: 2 из 2 генераций сегодня. Попробуйте завтра.
```

---

## 🔍 Отладка

### Если пользователь НЕ имеет профиля

Выполните в SQL Editor:

```sql
-- Найти пользователей без профиля
select au.id, au.email, up.id as profile_id
from auth.users au
left join public.user_profiles up on up.id = au.id
where up.id is null;
```

Если есть результаты, выполните скрипт из ШАГА 2 ещё раз.

### Если функция try_consume_spec_generation не работает

```sql
-- Проверить существование функции
select routine_name, data_type 
from information_schema.routines 
where routine_schema = 'public' 
  and routine_name = 'try_consume_spec_generation';
```

Ожидаемый результат: одна запись с `data_type = jsonb`

### Если квота не обновляется

```sql
-- Проверить текущий план пользователя
select * from public.get_user_plan();
```

---

## 📊 Сводная таблица изменений

| Файл | Что изменилось | Статус |
|------|---------------|--------|
| `supabase/migrations/20260407000000_billing_system.sql` | Новая миграка | ✅ Создан |
| `src/app/api/generate-spec/route.ts` | Обновлена функция RPC | ✅ Обновлён |
| `src/app/api/generate-spec/quota/route.ts` | Обновлена функция RPC | ✅ Обновлён |
| `src/components/export/ExportModal.tsx` | Обновлен тип quota | ✅ Обновлён |
| `supabase/migrations/README_BILLING_MIGRATION.md` | Инструкция | ✅ Создан |

---

## ✅ Чеклист готовности

- [ ] Миграция применена в Supabase
- [ ] Профили созданы всем пользователям
- [ ] Код обновлен (файлы выше)
- [ ] TypeScript компилируется без ошибок (`npx tsc --noEmit`)
- [ ] Приложение запускается (`npm run dev`)
- [ ] Авторизация работает
- [ ] Квота отображается правильно
- [ ] Генерация ТЗ работает
- [ ] Лимиты учитываются по тарифу

---

## 🎯 Следующие шаги

После успешного применения миграции:

1. **Фаза 2**: Создание клиента ЮKassa
2. **Фаза 3**: Страница тарифов `/pricing`
3. **Фаза 4**: Обработка веб-хуков ЮKassa
4. **Фаза 5**: Интеграция с биллингом
