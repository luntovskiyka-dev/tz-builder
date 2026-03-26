# Code Review: ProtoSpec (tz-builder)

**Дата:** 10 марта 2026  
**Цель:** Улучшение качества, производительности и поддерживаемости кода.

---

## 1. Дублирование кода

### 1.1 Повторяющиеся паттерны в инспекторе блоков

**Файл:** `src/components/DashboardLayout.tsx`

Паттерн «чекбокс + Label + условный Input/Textarea» повторяется десятки раз для header, hero, text и других блоков. Рекомендуется вынести в переиспользуемый компонент:

```tsx
// Предложение: создать InspectableField
function InspectableField({
  checked,
  onCheckedChange,
  label,
  fieldKey,
  block,
  onChange,
  children,
  showAlignment = false,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  fieldKey?: string;
  block?: CanvasBlock;
  onChange?: (block: CanvasBlock) => void;
  children: React.ReactNode;
  showAlignment?: boolean;
}) { ... }
```

**Строки:** ~485–615 (header), ~618–786 (hero), ~788–1100+ (text) — один и тот же паттерн.

### 1.2 Дублирование SVG-иконки изображения

**Файл:** `src/components/blocks/BlockPreview.tsx`

SVG placeholder для изображения (rect + polyline + circle) повторяется в:
- HeaderPreview (строки 88–92)
- HeroBlockPreview (строки 239–244)
- TextBlockPreview text-image (строки 704–708)
- MediaBlockPreview image-single (строки 846–850)
- MediaBlockPreview image-gallery (строки 873–877)
- MediaBlockPreview image-slider (строки 893–897)
- MediaBlockPreview video (строки 925–928)

**Рекомендация:** Вынести в компонент `ImagePlaceholderIcon` в `src/components/blocks/icons.tsx` или аналогичный модуль.

### 1.3 Дублирование трёхколоночной сетки зон

**Файл:** `src/components/blocks/BlockPreview.tsx`

Структура `grid grid-cols-3` с zones (left, center, right) повторяется в:
- HeaderPreview (строки 135–149)
- HeroBlockPreview (строки 254–265)
- TextBlockPreview (множество вариантов)
- TestimonialsBlockPreview
- PricingTableBlockPreview
- FaqBlockPreview
- ContactsBlockPreview

**Рекомендация:** Вынести компонент `ZoneGrid` или хук `useZoneLayout`.

### 1.4 Дублирование `normalizeButton` и `HeaderButtonRow`

**Файл:** `src/components/DashboardLayout.tsx`

`HeaderButtonRow` используется и для header, и для hero — уже переиспользуется. `normalizeButton` вызывается в обоих случаях. Можно оставить как есть или вынести в `src/lib/block-utils.ts`.

### 1.5 Дублирование логики получения Supabase-клиента и пользователя

**Файл:** `src/lib/actions/projects.ts`

В каждой action повторяется:
```ts
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return { error: "..." };
```

**Рекомендация:** Создать хелпер `withAuth(async (user, supabase) => { ... })` в `src/lib/actions/utils.ts`.

---

## 2. Неиспользуемый код

### 2.1 Неиспользуемый файл `supabaseClient.js`

**Файл:** `src/lib/supabaseClient.js`

Файл не импортируется нигде. Проект использует `createServerClient` из `@/lib/supabase/server` для серверных операций.

**Действие:** Удалить файл `src/lib/supabaseClient.js`.

### 2.2 Неиспользуемый импорт `useMemo`

**Файл:** `src/components/DashboardLayout.tsx`, строка 3

```ts
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
```

`useMemo` нигде не вызывается.

**Действие:** Удалить `useMemo` из импорта.

### 2.3 Неиспользуемые функции в BlockPreview

**Файл:** `src/components/blocks/BlockPreview.tsx`

- `joinList` (строки 13–17) — не используется нигде в файле.
- `Row` (строки 38–47) — не используется.
- `FIELD_LABELS` (строки 29–35) — не используется.

**Действие:** Удалить `joinList`, `Row`, `FIELD_LABELS`.

### 2.4 Неиспользуемые UI-компоненты

**Файлы:**
- `src/components/ui/form.tsx` — Form, FormField, FormItem и т.д. не импортируются. Login и Signup используют нативные формы с `useActionState`.
- `src/components/ui/dropdown-menu.tsx` — не импортируется.

**Рекомендация:** Оставить (это стандартные shadcn-компоненты, могут понадобиться позже), но можно добавить в `.eslintrc` или документацию, что они не используются. Либо удалить, если не планируется использование.

### 2.5 Устаревшие блоки в RESIZABLE_BLOCK_TYPES

**Файл:** `src/components/DashboardLayout.tsx`, строки 198–199

```ts
"partners",
"stats",
"countdown",
```

Категория «Дополнительно» удалена из палитры. Блоки `partners`, `stats`, `countdown` больше не создаются в UI, но остаются в RESIZABLE_BLOCK_TYPES. Для обратной совместимости с существующими проектами их можно оставить — они не влияют на работу, если блоки уже есть на канвасе.

**Рекомендация:** Оставить для обратной совместимости или удалить, если миграция старых проектов не планируется.

---

## 3. Ошибки и потенциальные баги

### 3.1 Отсутствует страница `/auth/error`

**Файл:** `src/app/auth/confirm/route.ts`, строки 12–16, 26–31

При ошибке верификации OTP или отсутствии параметров происходит редирект на `/auth/error?error=...`, но страница `src/app/auth/error/page.tsx` не существует.

**Действие:** Создать `src/app/auth/error/page.tsx` с отображением ошибки из `searchParams.error`.

### 3.2 Невалидация пароля при регистрации

**Файл:** `src/lib/actions/auth.ts`, `signupAction`

Форма отправляет `confirmPassword`, но серверная action не проверяет совпадение пароля и подтверждения. Пользователь может зарегистрироваться с разными паролями в полях.

**Действие:** Добавить проверку:
```ts
const confirmPassword = formData.get("confirmPassword") as string;
if (password !== confirmPassword) {
  return { error: "Пароли не совпадают" };
}
```

### 3.3 Использование `any` в auth actions

**Файл:** `src/lib/actions/auth.ts`, строки 6, 31

```ts
export async function signupAction(prevState: any, formData: FormData)
export async function loginAction(prevState: any, formData: FormData)
```

**Рекомендация:** Заменить на `prevState: { error?: string; success?: string } | null`.

### 3.4 Использование `any` в auth/confirm

**Файл:** `src/app/auth/confirm/route.ts`, строка 23

```ts
type: type as any,
```

**Рекомендация:** Использовать `type as "email" | "sms" | "phone_change"` или типы из `@supabase/supabase-js`.

### 3.5 Использование `any` в Supabase cookie options

**Файл:** `src/lib/supabase/server.ts`, строки 15, 18  
**Файл:** `src/lib/supabase/middleware.ts`, строки 20, 36

```ts
set(name: string, value: string, options: any)
remove(name: string, options: any)
```

**Рекомендация:** Использовать `CookieOptions` из `@supabase/ssr` или `Record<string, unknown>`.

### 3.6 Отсутствие `key` для фрагментов в menu

**Файл:** `src/components/blocks/BlockPreview.tsx`, строки 106–114

```tsx
<>
  {visibleMenu.map((item, i) => (
    <span key={i} className="...">  // key={i} — индекс, лучше key={item} если уникален
```

**Примечание:** `key={i}` допустим для статичных списков, но `key={item}` может быть лучше, если пункты меню уникальны. При дубликатах — оставить `key={i}`.

### 3.7 Небезопасный `process.env` в supabaseClient.js

**Файл:** `src/lib/supabaseClient.js` (если оставить)

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

При `undefined` createClient может упасть. Но файл не используется — удалить.

---

## 4. Читаемость и стиль

### 4.1 Смешанные пути импорта

**Файл:** `src/components/DashboardLayout.tsx`, строка 27

```ts
} from "../utils/storage";
```

Остальные импорты используют `@/`. Рекомендуется: `from "@/utils/storage"`.

### 4.2 Лишний пробел в начале файла

**Файл:** `src/components/DashboardLayout.tsx`, строка 1

```ts
 "use client";
```

Пробел перед `"use client"` — убрать.

### 4.3 Файл storage.js на JavaScript

**Файл:** `src/utils/storage.js`

Рекомендуется переименовать в `storage.ts` и добавить типы для возвращаемых значений.

### 4.4 Размер DashboardLayout.tsx

**Файл:** `src/components/DashboardLayout.tsx` (~3400 строк)

**Рекомендация:** Разбить на модули:
- `PropertiesInspector.tsx` — инспектор свойств (все блоки)
- `GenericBlockFields.tsx` — универсальные поля
- `inspectors/HeaderInspector.tsx`, `HeroInspector.tsx`, `TextInspector.tsx` и т.д.
- `blocks/CanvasBlockItem.tsx`
- `blocks/CanvasArea.tsx`
- `blocks/PaletteItem.tsx`
- Константы `PROP_LABELS_RU`, `CATEGORY_ICONS` — в `src/lib/constants.ts`

### 4.5 Метаданные layout

**Файл:** `src/app/layout.tsx`, строки 15–18

```ts
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
```

Рекомендуется заменить на: `title: "ProtoSpec"`, `description: "Конструктор технических заданий"`.

---

## 5. Типизация TypeScript

### 5.1 Экспортируемые типы

**Файл:** `src/lib/blocks.ts`

Уже экспортируются: `CanvasBlock`, `BlockTypeId`. Рекомендуется добавить:
- `BlockProps` — базовый тип для блоков
- `HeaderBlockProps`, `HeroBlockProps` и т.д. — для типизации инспекторов

### 5.2 Тип для `block.props`

**Файл:** `src/components/DashboardLayout.tsx`

Множество мест с `block.props as { ... }` — можно вынести в общие типы в `src/types/blocks.ts`.

### 5.3 Проект

**Файл:** `src/lib/actions/projects.ts`

Типы `ProjectListItem`, `SaveProjectResult` и т.д. уже экспортируются. Можно добавить `Project` для полной сущности проекта.

---

## 6. Структура проекта

### 6.1 Соответствие App Router

Структура соответствует App Router:
- `app/page.tsx`, `app/login/`, `app/signup/`, `app/dashboard/`
- `app/auth/confirm/route.ts` — route handler

### 6.2 Рекомендуемые папки

- `src/types/` — общие типы (сейчас разбросаны по lib и components)
- `src/hooks/` — кастомные хуки (пока нет)
- `src/constants/` — константы (PROP_LABELS_RU, CATEGORY_ICONS)

### 6.3 Циклические зависимости

Проверка: не обнаружено. Импорты идут в основном: `app` → `components` → `lib`.

---

## 7. Производительность

### 7.1 BlockPreview

**Файл:** `src/components/blocks/BlockPreview.tsx`

Компонент рендерится для каждого блока на канвасе. При большом количестве блоков можно обернуть в `React.memo`:

```tsx
export const BlockPreview = React.memo(function BlockPreview({ block }: { block: CanvasBlock }) {
  ...
});
```

### 7.2 CanvasBlockItem

**Файл:** `src/components/DashboardLayout.tsx`

`CanvasBlockItem` получает `onSelect`, `onDelete`, `onResize` — они обёрнуты в `useCallback` в родителе. Можно обернуть в `React.memo` для оптимизации.

### 7.3 PropertiesInspector

**Файл:** `src/components/DashboardLayout.tsx`

При смене выбранного блока пересчитывается весь `blockSpecificContent` через IIFE. Это ожидаемо. `useMemo` для `blockSpecificContent` не нужен, т.к. он зависит от `block` и `onChange` и пересчитывается при каждом изменении.

### 7.4 Динамический импорт

Крупные библиотеки (@dnd-kit, lucide-react) — стандартные. Динамический импорт для `DashboardLayout` возможен, но при текущем размере приложения не критичен.

---

## 8. Безопасность

### 8.1 Секреты

- `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` — публичные, преднамеренно для клиента.
- Секретные ключи (service role) не должны использоваться в клиенте — в коде не обнаружены.

### 8.2 RLS

В отчёте не проверялись политики Supabase. Рекомендуется убедиться, что:
- `projects`: `user_id = auth.uid()` для SELECT, INSERT, UPDATE, DELETE.

### 8.3 Экранирование ввода

React по умолчанию экранирует вставку в JSX. `dangerouslySetInnerHTML` в коде не используется.

### 8.4 Валидация blocks в saveProjectAction

**Файл:** `src/lib/actions/projects.ts`

`blocks` парсятся из JSON без проверки структуры. При некорректных данных они сохранятся в БД. Рекомендуется базовая валидация (массив, элементы с `id`, `type`, `props`).

---

## 9. Зависимости

### 9.1 Устаревшие пакеты (npm outdated)

| Пакет | Текущая | Последняя |
|-------|---------|-----------|
| @supabase/supabase-js | 2.98.0 | 2.99.2 |
| @types/node | 20.19.34 | 25.5.0 |
| eslint | 9.39.3 | 10.0.3 |
| lucide-react | 0.575.0 | 0.577.0 |
| react | 19.2.3 | 19.2.4 |
| react-dom | 19.2.3 | 19.2.4 |
| shadcn | 3.8.5 | 4.0.8 |

**Рекомендация:** Обновить `@supabase/supabase-js`, `lucide-react`, `react`, `react-dom` — минорные обновления. `eslint` 10 и `shadcn` 4 — мажорные, обновлять с осторожностью.

### 9.2 Скрипт lint

**Файл:** `package.json`

```json
"lint": "eslint"
```

Скрипт неполный — нет аргументов. Рекомендуется: `"lint": "next lint"` или `"eslint . --ext .ts,.tsx"`.

---

## 10. Автоматические исправления

### Краткий список изменений

1. **Удалить** `src/lib/supabaseClient.js`
2. **Удалить** `useMemo` из импорта в `DashboardLayout.tsx`
3. **Удалить** `joinList`, `Row`, `FIELD_LABELS` из `BlockPreview.tsx`
4. **Исправить** импорт: `"../utils/storage"` → `"@/utils/storage"`
5. **Убрать** пробел в `"use client"` в `DashboardLayout.tsx`
6. **Добавить** проверку `confirmPassword` в `signupAction`
7. **Создать** `src/app/auth/error/page.tsx`
8. **Заменить** `any` на конкретные типы в auth actions и `auth/confirm`
9. **Обновить** `metadata` в `layout.tsx`
10. **Исправить** скрипт `lint` в `package.json`

---

## 11. Приоритеты

| Приоритет | Задача |
|-----------|--------|
| Высокий | Создать `/auth/error` |
| Высокий | Валидация `confirmPassword` в signup |
| Средний | Удалить неиспользуемый код (supabaseClient.js, joinList, Row, FIELD_LABELS, useMemo) |
| Средний | Улучшить типизацию (убрать `any`) |
| Низкий | Рефакторинг DashboardLayout (разбиение на модули) |
| Низкий | Вынести общие компоненты (ImagePlaceholderIcon, ZoneGrid, InspectableField) |

---

*Отчёт подготовлен с учётом Next.js App Router, Supabase, Tailwind CSS, shadcn/ui.*
