# Интеграция ЮKassa — Фаза 2 завершена ✅

## 📦 Созданные файлы

### Клиент и типы
1. **`src/lib/yookassa/client.ts`** — клиент для API ЮKassa
2. **`src/lib/yookassa/types.ts`** — TypeScript типы для ЮKassa

### Серверные действия
3. **`src/lib/actions/payments.ts`** — server actions для платежей:
   - `createOneTimePaymentAction()` — разовый платеж (Project)
   - `createSubscriptionAction()` — создание подписки (Pro, Studio)
   - `cancelSubscriptionAction()` — отмена подписки
   - `getSubscriptionStatusAction()` — статус подписки
   - `getPaymentHistoryAction()` — история платежей

### API маршруты
4. **`src/app/api/yookassa/webhook/route.ts`** — обработка веб-хуков
5. **`src/app/api/yookassa/return/route.ts`** — возврат после оплаты

### Конфигурация
6. **`.env.local`** — ключи ЮKassa (не коммитить!)
7. **`.env.example`** — обновлен с примерами ключей ЮKassa

---

## 🔑 Настройка ключей

Скопируйте значения из личного кабинета ЮKassa в `.env.local`:

```
YOOKASSA_SHOP_ID=<your_shop_id>
YOOKASSA_SECRET_KEY=<your_secret_key>
YOOKASSA_RETURN_URL=https://app.protospec.ru/api/yookassa/return
```

---

## ⚙️ Что реализовано

### 1. Создание платежей

#### Разовый платеж (Project — 490₽):
```typescript
const result = await createOneTimePaymentAction("project");
// result.confirmation_url → редирект пользователя на ЮKassa
```

#### Подписка (Pro — 990₽/мес, Studio — 4990₽/мес):
```typescript
const result = await createSubscriptionAction("pro");
// Активирует 14-дневный триал
```

### 2. Обработка веб-хуков

ЮKassa будет отправлять уведомления на:
```
https://app.protospec.ru/api/yookassa/webhook
```

Обрабатываемые события:
- `payment.succeeded` — активация плана
- `payment.canceled` — отмена платежа
- `refund.succeeded` — возврат средств

### 3. Возврат пользователя

После оплаты пользователь редиректится на:
```
https://app.protospec.ru/api/yookassa/return?payment_id=xxx
→ /dashboard?payment_status=success&payment_message=Оплата+прошла+успешно!
```

---

## 📋 Следующий шаг: Настройка веб-хука в ЮKassa

### В личном кабинете ЮKassa:

1. Зайдите в **Интеграция** → **HTTP-уведомления**
2. Добавьте URL веб-хука:
   ```
   https://app.protospec.ru/api/yookassa/webhook
   ```
3. Выберите события:
   - ✅ `payment.succeeded`
   - ✅ `payment.waiting_for_capture`
   - ✅ `payment.canceled`
   - ✅ `refund.succeeded`
4. Сохраните

---

## 🎯 Следующая фаза: Страница тарифов

Теперь у нас есть:
- ✅ База данных с тарифами
- ✅ Клиент ЮKassa
- ✅ Серверные действия для платежей
- ✅ Обработка веб-хуков

**Следующий шаг:** Создать страницу `/pricing` с карточками тарифов и кнопками оплаты.

---

## 🧪 Тестирование

### 1. Проверьте, что сервер запущен:
```bash
npm run dev
```

### 2. Проверьте API создания платежа:

В DevTools Console выполните:

```javascript
// Тест создания платежа (разовый)
const response = await fetch('/api/test-payment', { method: 'POST' });
const data = await response.json();
console.log(data);
```

### 3. Проверьте веб-хук:

Используйте [ngrok](https://ngrok.com/) для тестирования локально:
```bash
ngrok http 3000
```

Затем в ЮKassa укажите временный URL:
```
https://xxxx.ngrok-free.app/api/yookassa/webhook
```

---

## ⚠️ Важно

1. **Не коммитьте `.env.local`!** — он уже в `.gitignore`
2. **Веб-хуки работают только на production** — URL должен быть доступен из интернета
3. **Тестовый режим** — если хотите протестировать, получите test ключи из ЮKassa

---

## 📚 Структура файлов

```
src/
├── lib/
│   ├── yookassa/
│   │   ├── client.ts       # API клиент ЮKassa
│   │   └── types.ts        # TypeScript типы
│   └── actions/
│       └── payments.ts     # Server actions
└── app/
    └── api/
        └── yookassa/
            ├── webhook/route.ts   # Обработка веб-хуков
            └── return/route.ts    # Возврат после оплаты
```
