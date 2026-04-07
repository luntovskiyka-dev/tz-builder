// =====================================================
// YOOKASSA CLIENT
// Клиент для работы с API ЮKassa
// Документация: https://yookassa.ru/developers/api
// =====================================================

import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentResult,
  YooKassaPayment,
  YooKassaWebhookEvent,
} from "./types";

const YOOKASSA_API_URL = "https://api.yookassa.ru/v3";

// Базовая авторизация (shopId:secretKey в base64)
function getAuthHeader(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error("YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY не настроены");
  }

  const credentials = `${shopId}:${secretKey}`;
  const base64 = Buffer.from(credentials).toString("base64");
  return `Basic ${base64}`;
}

// =====================================================
// Создание платежа
// =====================================================
export async function createPayment(
  request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": crypto.randomUUID(),
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("YooKassa createPayment error:", error);
    throw new Error(
      error.description || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data: YooKassaPayment = await response.json();

  return {
    id: data.id,
    status: data.status,
    confirmation_url: data.confirmation.confirmation_url || "",
  };
}

// =====================================================
// Получение информации о платеже
// =====================================================
export async function getPayment(paymentId: string): Promise<YooKassaPayment> {
  const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("YooKassa getPayment error:", error);
    throw new Error(
      error.description || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

// =====================================================
// Отмена платежа
// =====================================================
export async function cancelPayment(paymentId: string): Promise<YooKassaPayment> {
  const response = await fetch(
    `${YOOKASSA_API_URL}/payments/${paymentId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": crypto.randomUUID(),
        Authorization: getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("YooKassa cancelPayment error:", error);
    throw new Error(
      error.description || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

// =====================================================
// Возврат средств (Refund)
// =====================================================
export async function createRefund(
  paymentId: string,
  amount: { value: string; currency: string }
): Promise<{ id: string; status: string }> {
  const response = await fetch(`${YOOKASSA_API_URL}/refunds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": crypto.randomUUID(),
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      payment_id: paymentId,
      amount,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("YooKassa createRefund error:", error);
    throw new Error(
      error.description || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

// =====================================================
// Проверка подписи веб-хука (HMAC-SHA256)
// =====================================================
export async function verifyWebhookSignature(
  body: string,
  signature: string | undefined
): Promise<boolean> {
  if (!signature) return false;

  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!secretKey) return false;

  // ЮKassa отправляет подпись в заголовке X-Notification-Signature
  // Это HMAC-SHA256 от тела запроса с использованием secret key
  try {
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(body);
    const expectedSignature = hmac.digest("hex");

    // Сравниваем сигнатуры (constant-time comparison)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return false;
  }
}

// =====================================================
// Парсинг события веб-хука
// =====================================================
export function parseWebhookEvent(body: unknown): YooKassaWebhookEvent {
  const event = body as YooKassaWebhookEvent;

  if (!event.type || !event.event) {
    throw new Error("Invalid webhook event structure");
  }

  return event;
}

// =====================================================
// Вспомогательная функция: сумма из копеек в рубли
// =====================================================
export function centsToRubles(cents: number): string {
  return (cents / 100).toFixed(2);
}

// =====================================================
// Вспомогательная функция: рубли в копейки
// =====================================================
export function rublesToCents(rubles: string): number {
  return Math.round(parseFloat(rubles) * 100);
}
