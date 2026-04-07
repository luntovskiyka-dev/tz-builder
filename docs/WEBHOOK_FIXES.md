# Исправления вебхука ЮKassa ✅

## Что было исправлено

### 1. ✅ HMAC-SHA256 проверка подписи
**Было:** `verifyWebhookSignature()` всегда возвращала `true` — любые запросы принимались  
**Стало:** Реальная проверка HMAC-SHA256 с использованием `YOOKASSA_SECRET_KEY`

```typescript
// Теперь проверяем сигнатуру через HMAC-SHA256
const hmac = crypto.createHmac("sha256", secretKey);
hmac.update(body);
const expectedSignature = hmac.digest("hex");

// Constant-time comparison для предотвращения timing attacks
crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
```

### 2. ✅ Идемпотентность (защита от дубликатов)
**Было:** Одно и то же событие могло обработаться дважды  
**Стало:** Проверяем `event_id` перед обработкой

```typescript
const existingEvent = await supabase
  .from("yookassa_events")
  .select("id, processed")
  .eq("event_id", eventId)
  .single();

if (existingEvent) {
  console.log(`⚠️ Duplicate event ${eventId}, skipping`);
  return NextResponse.json({ success: true, message: "Duplicate event" });
}
```

### 3. ✅ Независимая проверка через API ЮKassa
**Было:** Доверяли только вебхуку  
**Стало:** Для платежей дополнительно проверяем статус через `getPayment()` API

```typescript
if (event.type.startsWith("payment.")) {
  const yookassaPayment = await getPayment(event.event.id);
  
  // Если статус отличается — используем статус из API
  if (yookassaPayment.status !== event.event.status) {
    event.event.status = yookassaPayment.status;
  }
}
```

### 4. ✅ Обработка `payment.failed`
**Было:** Событие не обрабатывалось  
**Стало:** Записываем статус `failed` в БД, пользователь остается на старом тарифе

```typescript
case "payment.failed":
  await handlePaymentFailed(event);
  break;
```

### 5. ✅ Исправлена обработка refund
**Было:** Использовался `event.event.id` (ID возврата), а не `payment_id`  
**Стало:** Берем `payment_id` из `event.object.payment_id`

```typescript
async function handleRefundSucceeded(event: YooKassaWebhookEvent) {
  const paymentId = event.object?.payment_id || event.event.id;
  // Теперь корректно находим платеж для обновления
}
```

### 6. ✅ Улучшено логирование
- Добавлены эмодзи для быстрого поиска в логах: 💰 ✅ ❌ ⚠️ ℹ️ 💸 📦 🔄
- Логируют КЛЮЧЕВЫЕ события: ID платежа, пользователя, тариф
- Ошибки логируются с деталями для диагностики

### 7. ✅ Добавлены типы
- `payment.failed` в `YooKassaWebhookEventType`
- `YooKassaRefundEventObject` для refund событий
- `failed` в `YooKassaPaymentStatus`

---

## Как тестировать

### 1. Локально с ngrok
```bash
ngrok http 3000
```

В ЮKassa укажите временный URL:
```
https://xxxx.ngrok-free.app/api/yookassa/webhook
```

### 2. Отправить тестовый вебхук
```bash
curl -X POST http://localhost:3000/api/yookassa/webhook \
  -H "Content-Type: application/json" \
  -H "X-Notification-Signature: <hmac-sha256-signature>" \
  -d '{
    "type": "payment.succeeded",
    "event": {
      "id": "test-payment-id",
      "status": "succeeded",
      "metadata": {
        "user_id": "<user-uuid>",
        "plan_id": "<plan-uuid>",
        "plan_slug": "pro"
      }
    }
  }'
```

### 3. Проверить логи
```bash
# В консоли Next.js должно быть:
✅ Verified payment test-payment-id status: succeeded
💰 Payment succeeded: test-payment-id by user <uuid> for pro
🔄 Activating subscription: pro
```

### 4. Проверить БД
```sql
-- Событие записано и обработано
SELECT * FROM yookassa_events ORDER BY created_at DESC LIMIT 5;

-- Статус платежа обновлен
SELECT * FROM payments WHERE yookassa_payment_id = 'test-payment-id';

-- Профиль пользователя обновлен
SELECT * FROM user_profiles WHERE id = '<user-uuid>';
```

---

## Что еще можно улучшить (не критично)

1. **Фоновая обработка** — вынести обработку вебхуков в очередь (Bull/Redis)
2. **Уведомления** — отправлять email при неудачном платеже
3. **Retry логика** — повторная обработка при ошибке
4. **Метрики** — следить за количеством успешных/неудачных платежей
5. **Trial expiration** — обработка окончания триала и автоматическое переключение на Starter

---

## Безопасность

✅ HMAC-SHA256 подпись  
✅ Constant-time comparison (timing attack protection)  
✅ Независимая проверка через API  
✅ Идемпотентность  
✅ RLS политики в БД  

---

**Дата исправления:** 7 апреля 2026  
**Статус:** ✅ Готово к production
