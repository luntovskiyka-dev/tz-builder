// =====================================================
// YOOKASSA WEBHOOK HANDLER
// Обработка веб-хуков от ЮKassa
// URL: /api/yookassa/webhook
// =====================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  parseWebhookEvent,
  verifyWebhookSignature,
  getPayment,
} from "@/lib/yookassa/client";
import type { YooKassaWebhookEvent } from "@/lib/yookassa/types";

export async function POST(req: NextRequest) {
  try {
    // Получаем тело запроса как строку для проверки подписи
    const rawBody = await req.text();
    const signature = req.headers.get("X-Notification-Signature") ?? undefined;

    // Проверяем подпись (HMAC-SHA256)
    const isValidSignature = await verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Парсим JSON
    const body = JSON.parse(rawBody);

    // Парсим событие
    const event: YooKassaWebhookEvent = parseWebhookEvent(body);
    const eventId = event.event.id || crypto.randomUUID();

    const supabase = await createServerClient();

    // ИДЕМПОТЕНТНОСТЬ: Проверяем, не обрабатывали ли уже это событие
    const { data: existingEvent } = await supabase
      .from("yookassa_events")
      .select("id, processed")
      .eq("event_id", eventId)
      .single();

    if (existingEvent) {
      console.log(`⚠️ Duplicate event ${eventId}, skipping`);
      return NextResponse.json({ success: true, message: "Duplicate event" });
    }

    // Логируем событие
    await supabase.from("yookassa_events").insert({
      event_type: event.type,
      event_id: eventId,
      payment_id: event.event.id,
      object: event.event,
      processed: false,
    });

    // НЕЗАВИСИМАЯ ПРОВЕРКА: Для платежей проверяем статус через API ЮKassa
    if (event.type.startsWith("payment.")) {
      try {
        const yookassaPayment = await getPayment(event.event.id);
        console.log(
          `✅ Verified payment ${event.event.id} status: ${yookassaPayment.status}`
        );

        // Если статус в API отличается от вебхука, используем статус из API
        if (yookassaPayment.status !== event.event.status) {
          console.warn(
            `⚠️ Status mismatch: webhook=${event.event.status}, api=${yookassaPayment.status}`
          );
          // Обновляем статус в событии для корректной обработки
          event.event.status = yookassaPayment.status;
        }
      } catch (error) {
        console.error("Failed to verify payment via API:", error);
        // Продолжаем обработку — доверяем вебхуку
      }
    }

    // Обрабатываем событие по типу
    switch (event.type) {
      case "payment.succeeded":
        await handlePaymentSucceeded(event);
        break;

      case "payment.canceled":
        await handlePaymentCanceled(event);
        break;

      case "payment.waiting_for_capture":
        console.log(`ℹ️ Payment waiting for capture: ${event.event.id}`);
        break;

      case "payment.failed":
        await handlePaymentFailed(event);
        break;

      case "refund.succeeded":
        await handleRefundSucceeded(event);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// =====================================================
// Обработка: платеж успешен
// =====================================================
async function handlePaymentSucceeded(event: YooKassaWebhookEvent) {
  const paymentId = event.event.id;
  const metadata = event.event.metadata || {};
  const userId = metadata.user_id;
  const planId = metadata.plan_id;
  const planSlug = metadata.plan_slug;

  if (!userId || !planId) {
    console.error("❌ Missing metadata in payment.succeeded event", {
      paymentId,
      metadata,
    });
    return;
  }

  console.log(`💰 Payment succeeded: ${paymentId} by user ${userId} for ${planSlug}`);

  const supabase = await createServerClient();

  // Обновляем статус платежа
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: "succeeded",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("yookassa_payment_id", paymentId);

  if (updatePaymentError) {
    console.error("Failed to update payment status:", updatePaymentError);
  }

  // Определяем тип платежа и действуем соответственно
  const isOneTime = planSlug === "project";

  if (isOneTime) {
    // Разовый платеж (Project) — обновляем профиль
    console.log(`📦 Activating one-time plan: ${planSlug}`);
    
    const { error: updateProfileError } = await supabase
      .from("user_profiles")
      .update({
        plan_id: planId,
        subscription_status: "active",
        subscription_ends_at: null, // Бессрочно для разового платежа
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateProfileError) {
      console.error("Failed to update user profile:", updateProfileError);
    }

    // Записываем в историю подписок
    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_id: planId,
      status: "active",
      current_period_starts_at: new Date().toISOString(),
      metadata: {
        payment_type: "one_time",
        yookassa_payment_id: paymentId,
      },
    });

    if (subError) {
      console.error("Failed to insert subscription record:", subError);
    }
  } else {
    // Подписка (Pro, Studio) — активируем
    console.log(`🔄 Activating subscription: ${planSlug}`);
    
    const { data: planData } = await supabase
      .from("plans")
      .select("trial_days")
      .eq("id", planId)
      .single();

    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1); // +1 месяц

    const { error: updateProfileError } = await supabase
      .from("user_profiles")
      .update({
        plan_id: planId,
        subscription_status: "active",
        subscription_ends_at: subscriptionEndsAt.toISOString(),
        yookassa_payment_method_id: event.event.payment_method?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateProfileError) {
      console.error("Failed to update user profile:", updateProfileError);
    }

    // Обновляем запись подписки (переводим из триала в активную)
    const { error: updateSubError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_starts_at: new Date().toISOString(),
        current_period_ends_at: subscriptionEndsAt.toISOString(),
        yookassa_payment_method_id: event.event.payment_method?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .in("status", ["trialing", "pending", "past_due"]);

    if (updateSubError) {
      console.error("Failed to update subscription:", updateSubError);
    }
  }

  // Отмечаем событие как обработанное
  await supabase
    .from("yookassa_events")
    .update({ processed: true })
    .eq("event_id", event.event.id);
}

// =====================================================
// Обработка: платеж отменен
// =====================================================
async function handlePaymentCanceled(event: YooKassaWebhookEvent) {
  const paymentId = event.event.id;
  console.log(`💸 Payment canceled: ${paymentId}`);

  const supabase = await createServerClient();

  // Обновляем статус платежа
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("yookassa_payment_id", paymentId);

  if (updatePaymentError) {
    console.error("Failed to update payment status:", updatePaymentError);
  }

  // Отмечаем событие как обработанное
  await supabase
    .from("yookassa_events")
    .update({ processed: true })
    .eq("event_id", event.event.id);
}

// =====================================================
// Обработка: платеж не удался
// =====================================================
async function handlePaymentFailed(event: YooKassaWebhookEvent) {
  const paymentId = event.event.id;
  console.log(`❌ Payment failed: ${paymentId}`);

  const supabase = await createServerClient();

  // Обновляем статус платежа
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("yookassa_payment_id", paymentId);

  if (updatePaymentError) {
    console.error("Failed to update payment status:", updatePaymentError);
  }

  // Не обновляем профиль пользователя — платеж не прошел
  // Пользователь остается на старом тарифе

  // Отмечаем событие как обработанное
  await supabase
    .from("yookassa_events")
    .update({ processed: true })
    .eq("event_id", event.event.id);
}

// =====================================================
// Обработка: возврат успешен
// =====================================================
async function handleRefundSucceeded(event: YooKassaWebhookEvent) {
  const paymentId = event.object?.payment_id || event.event.id;
  console.log(`💸 Refund succeeded for payment: ${paymentId}`);

  const supabase = await createServerClient();

  // Обновляем статус платежа
  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("yookassa_payment_id", paymentId);

  if (updatePaymentError) {
    console.error("Failed to update payment status:", updatePaymentError);
  }

  // Отмечаем событие как обработанное
  await supabase
    .from("yookassa_events")
    .update({ processed: true })
    .eq("event_id", event.event.id);
}
