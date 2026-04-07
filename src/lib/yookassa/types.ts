// =====================================================
// YOOKASSA TYPES
// Типы для интеграции с ЮKassa API
// =====================================================

// =====================================================
// Платеж (Payment)
// =====================================================
export interface YooKassaPayment {
  id: string;
  status: YooKassaPaymentStatus;
  paid: boolean;
  amount: YooKassaAmount;
  confirmation: YooKassaConfirmation;
  created_at: string;
  description?: string;
  metadata?: Record<string, string>;
  payment_method?: YooKassaPaymentMethod;
  refundable: boolean;
  test: boolean;
}

export type YooKassaPaymentStatus =
  | "pending"
  | "waiting_for_capture"
  | "succeeded"
  | "canceled"
  | "failed";

export interface YooKassaAmount {
  value: string;
  currency: string;
}

export interface YooKassaConfirmation {
  type: "redirect" | "embedded" | "external" | "qr" | "mobile" | "code";
  confirmation_url?: string;
  return_url?: string;
  confirmation_data?: string;
}

export interface YooKassaPaymentMethod {
  id: string;
  type: "bank_card" | "yoo_money" | "cash" | "mobile_balance" | "crypto";
  title?: string;
}

// =====================================================
// Создание платежа (Request)
// =====================================================
export interface CreatePaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: "redirect";
    return_url: string;
  };
  capture_payment: boolean; // true для разовых платежей, false для подписок
  description?: string;
  metadata?: Record<string, unknown>; // Изменено: support complex metadata
  save_payment_method?: boolean;
}

// =====================================================
// Создание платежа (Response)
// =====================================================
export interface CreatePaymentResponse {
  id: string;
  status: string;
  confirmation_url: string;
}

// =====================================================
// Веб-хук (Webhook)
// =====================================================
export interface YooKassaWebhookEvent {
  type: YooKassaWebhookEventType;
  event: YooKassaWebhookEventObject;
  object?: YooKassaRefundEventObject; // Для refund событий
}

export type YooKassaWebhookEventType =
  | "payment.succeeded"
  | "payment.waiting_for_capture"
  | "payment.canceled"
  | "payment.failed"
  | "refund.succeeded";

export interface YooKassaWebhookEventObject {
  id: string;
  status: string;
  paid: boolean;
  amount: YooKassaAmount;
  metadata?: Record<string, string>;
  payment_method?: YooKassaPaymentMethod;
  created_at: string;
  description?: string;
  payment_id?: string; // Для refund событий — ID платежа, к которому относится возврат
}

// Для refund событий — полный объект с payment_id
export interface YooKassaRefundEventObject {
  id: string; // ID возврата
  payment_id: string; // ID платежа
  status: string;
  amount: YooKassaAmount;
  created_at: string;
}

// =====================================================
// План (для метаданных платежа)
// =====================================================
export interface PaymentMetadata {
  user_id: string;
  plan_id: string;
  plan_slug: string;
  project_id?: string; // для разовых платежей (Project)
  [key: string]: string | undefined; // Index signature для совместимости с Record<string, unknown>
}

// =====================================================
// Результат создания платежа
// =====================================================
export interface PaymentResult {
  success: boolean;
  payment_id?: string;
  confirmation_url?: string;
  error?: string;
}

// =====================================================
// Статус подписки
// =====================================================
export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

// =====================================================
// Информация о платеже для клиента
// =====================================================
export interface ClientPaymentInfo {
  id: string;
  amount_rub: number;
  status: string;
  description: string;
  created_at: string;
  plan_name: string;
}
