// =====================================================
// PAYMENTS SERVER ACTIONS
// Серверные действия для работы с платежами
// =====================================================

"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createPayment,
  centsToRubles,
} from "@/lib/yookassa/client";
import type {
  CreatePaymentRequest,
  PaymentMetadata,
  PaymentResult,
} from "@/lib/yookassa/types";

// =====================================================
// Получить квоту AI пользователя
// =====================================================
export async function getUserAIQuotaAction(): Promise<{
  success: boolean;
  quota?: {
    authenticated: boolean;
    plan: string;
    used_today: number;
    daily_limit: number;
    remaining_today: number;
    used_this_month: number;
    monthly_limit: number;
    remaining_this_month: number;
  };
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      return { success: false, error: "Не авторизован" };
    }

    const { data, error } = await supabase.rpc("get_user_ai_quota");

    if (error) {
      console.error("get_user_ai_quota error:", error);
      return { success: false, error: "Ошибка получения квоты" };
    }

    return { success: true, quota: data };
  } catch (error) {
    console.error("getUserAIQuotaAction error:", error);
    return { success: false, error: "Ошибка получения квоты" };
  }
}

// =====================================================
// Смена плана (upgrade/downgrade)
// =====================================================
export async function changePlanAction(newPlanSlug: string): Promise<{
  success: boolean;
  confirmation_url?: string;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Войдите в аккаунт" };
    }

    // Получаем текущий план
    const { data: currentPlan } = await supabase.rpc("get_user_plan");
    const currentPlanData = currentPlan as { plan_slug?: string; subscription_status?: string } | null;

    if (!currentPlanData?.plan_slug) {
      return { success: false, error: "Не удалось определить текущий план" };
    }

    // Получаем новый план
    const { data: newPlan, error: planError } = await supabase
      .from("plans")
      .select("id, slug, name, price_cents, trial_days")
      .eq("slug", newPlanSlug)
      .single();

    if (planError || !newPlan) {
      return { success: false, error: "Тариф не найден" };
    }

    // Если тот же план — ничего не делаем
    if (currentPlanData.plan_slug === newPlanSlug) {
      return { success: false, error: "Вы уже используете этот тариф" };
    }

    // Бесплатный план (Starter) — просто обновляем профиль
    // Admin client bypasses RLS — profile billing fields are protected from direct client updates
    if (newPlan.price_cents === 0) {
      const adminDb = createAdminClient();
      const { error: updateError } = await adminDb
        .from("user_profiles")
        .update({
          plan_id: newPlan.id,
          subscription_status: "none",
          subscription_ends_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to downgrade plan:", updateError);
        return { success: false, error: "Ошибка смены тарифа" };
      }

      return { success: true };
    }

    // Платный план — создаем платеж или активируем триал
    if (newPlan.trial_days > 0 && currentPlanData.subscription_status !== "active") {
      // Активируем триал
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + newPlan.trial_days);

      const adminDb = createAdminClient();
      const { error: updateError } = await adminDb
        .from("user_profiles")
        .update({
          plan_id: newPlan.id,
          subscription_status: "trialing",
          trial_ends_at: trialEndsAt.toISOString(),
          subscription_ends_at: trialEndsAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to activate trial:", updateError);
        return { success: false, error: "Ошибка активации триала" };
      }

      // Записываем в историю подписок
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_id: newPlan.id,
        status: "trialing",
        trial_starts_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        current_period_starts_at: new Date().toISOString(),
        current_period_ends_at: trialEndsAt.toISOString(),
        metadata: {
          activated_at: new Date().toISOString(),
          trial_days: newPlan.trial_days,
          previous_plan: currentPlanData.plan_slug,
        },
      });

      return { success: true };
    }

    // Создаем платеж для подписки
    const paymentMetadata: PaymentMetadata = {
      user_id: user.id,
      plan_id: newPlan.id,
      plan_slug: newPlan.slug,
    };

    const request: CreatePaymentRequest = {
      amount: {
        value: centsToRubles(newPlan.price_cents),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/yookassa/return`,
      },
      capture_payment: false,
      description: `Смена тарифа на ${newPlan.name}`,
      metadata: paymentMetadata,
      save_payment_method: true,
    };

    const payment = await createPayment(request);

    return {
      success: true,
      confirmation_url: payment.confirmation_url,
    };
  } catch (error: unknown) {
    console.error("changePlanAction error:", error);
    const message = error instanceof Error ? error.message : "Ошибка смены тарифа";
    return { success: false, error: message };
  }
}

// =====================================================
// Отмена подписки через ЮKassa API
// =====================================================
export async function cancelSubscriptionWithYooKassaAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Войдите в аккаунт" };
    }

    // Получаем ID подписки в ЮKassa
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_id, subscription_status")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Подписка не найдена" };
    }

    if (profile.subscription_status === "none" || profile.subscription_status === "canceled") {
      return { success: false, error: "У вас нет активной подписки" };
    }

    // TODO: Когда будет реализована работа с subscriptions в ЮKassa,
    // здесь нужно вызвать API отмены подписки
    // Пока просто обновляем статус в БД

    const adminDb = createAdminClient();
    const { error: updateError } = await adminDb
      .from("user_profiles")
      .update({
        subscription_status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to cancel subscription:", updateError);
      return { success: false, error: "Ошибка отмены подписки" };
    }

    // Записываем в историю подписок
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id: profile.subscription_id || null,
      status: "canceled",
      canceled_at: new Date().toISOString(),
      metadata: {
        canceled_by_user: true,
        previous_status: profile.subscription_status,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("cancelSubscriptionWithYooKassaAction error:", error);
    const message = error instanceof Error ? error.message : "Ошибка отмены подписки";
    return { success: false, error: message };
  }
}

// =====================================================
// Создание разового платежа (Project — 490₽)
// =====================================================
export async function createOneTimePaymentAction(
  planSlug: string,
  metadata?: { project_id?: string }
): Promise<PaymentResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Войдите в аккаунт" };
    }

    // Получаем информацию о плане
    const { data: planData, error: planError } = await supabase
      .from("plans")
      .select("id, slug, name, price_cents")
      .eq("slug", planSlug)
      .single();

    if (planError || !planData) {
      return { success: false, error: "Тариф не найден" };
    }

    if (planData.price_cents <= 0) {
      return { success: false, error: "Бесплатный план не требует оплаты" };
    }

    // Создаем метаданные платежа
    const paymentMetadata: PaymentMetadata = {
      user_id: user.id,
      plan_id: planData.id,
      plan_slug: planData.slug,
      project_id: metadata?.project_id,
    };

    // Формируем запрос к ЮKassa
    const request: CreatePaymentRequest = {
      amount: {
        value: centsToRubles(planData.price_cents),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/yookassa/return`,
      },
      capture_payment: true, // Разовый платеж — захватываем сразу
      description: `Оплата тарифа ${planData.name}`,
      metadata: paymentMetadata,
    };

    // Создаем платеж в ЮKassa
    const payment = await createPayment(request);

    // Сохраняем запись о платеже в БД
    const { error: dbError } = await supabase.from("payments").insert({
      user_id: user.id,
      plan_id: planData.id,
      amount_cents: planData.price_cents,
      currency: "RUB",
      status: "pending",
      payment_type: "one_time",
      yookassa_payment_id: payment.id,
      description: `Оплата тарифа ${planData.name}`,
      metadata: paymentMetadata,
    });

    if (dbError) {
      console.error("Failed to save payment to DB:", dbError);
      // Платеж создан в ЮKassa, но не сохранен в БД
      // Это не критично — веб-хук обновит статус
    }

    return {
      success: true,
      payment_id: payment.id,
      confirmation_url: payment.confirmation_url,
    };
  } catch (error: unknown) {
    console.error("createOneTimePaymentAction error:", error);
    const message =
      error instanceof Error ? error.message : "Ошибка создания платежа";
    return { success: false, error: message };
  }
}

// =====================================================
// Создание подписки (Pro, Studio — с триалом)
// =====================================================
export async function createSubscriptionAction(
  planSlug: string
): Promise<PaymentResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Войдите в аккаунт" };
    }

    // Проверяем, нет ли уже активной подписки
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_status, trial_ends_at")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_status === "active") {
      return { success: false, error: "У вас уже есть активная подписка" };
    }

    // Получаем информацию о плане
    const { data: planData, error: planError } = await supabase
      .from("plans")
      .select("id, slug, name, price_cents, trial_days")
      .eq("slug", planSlug)
      .single();

    if (planError || !planData) {
      return { success: false, error: "Тариф не найден" };
    }

    // Активируем триал (если есть trial_days)
    if (planData.trial_days > 0) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + planData.trial_days);

      const adminDb = createAdminClient();
      const { error: updateError } = await adminDb
        .from("user_profiles")
        .update({
          plan_id: planData.id,
          subscription_status: "trialing",
          trial_ends_at: trialEndsAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to activate trial:", updateError);
        return { success: false, error: "Ошибка активации триала" };
      }

      // Записываем в историю подписок
      const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_id: planData.id,
        status: "trialing",
        trial_starts_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        current_period_starts_at: new Date().toISOString(),
        current_period_ends_at: trialEndsAt.toISOString(),
        metadata: {
          activated_at: new Date().toISOString(),
          trial_days: planData.trial_days,
        },
      });

      if (subError) {
        console.error("Failed to save subscription:", subError);
        // Триал активирован, но запись не сохранена — не критично
      }

      return {
        success: true,
        error: "Триал активирован!",
      };
    }

    // Если нет триала — создаем платеж для подписки
    const paymentMetadata: PaymentMetadata = {
      user_id: user.id,
      plan_id: planData.id,
      plan_slug: planData.slug,
    };

    const request: CreatePaymentRequest = {
      amount: {
        value: centsToRubles(planData.price_cents),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/yookassa/return`,
      },
      capture_payment: false, // Не захватываем — это для подписки
      description: `Подписка на тариф ${planData.name}`,
      metadata: paymentMetadata,
      save_payment_method: true, // Сохраняем метод оплаты для будущих списаний
    };

    const payment = await createPayment(request);

    return {
      success: true,
      payment_id: payment.id,
      confirmation_url: payment.confirmation_url,
    };
  } catch (error: unknown) {
    console.error("createSubscriptionAction error:", error);
    const message =
      error instanceof Error ? error.message : "Ошибка создания подписки";
    return { success: false, error: message };
  }
}

// =====================================================
// Отмена подписки
// =====================================================
export async function cancelSubscriptionAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Войдите в аккаунт" };
    }

    const adminDb = createAdminClient();
    const { error: updateError } = await adminDb
      .from("user_profiles")
      .update({
        subscription_status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to cancel subscription:", updateError);
      return { success: false, error: "Ошибка отмены подписки" };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("cancelSubscriptionAction error:", error);
    const message =
      error instanceof Error ? error.message : "Ошибка отмены подписки";
    return { success: false, error: message };
  }
}

// =====================================================
// Получение статуса подписки
// =====================================================
export async function getSubscriptionStatusAction(): Promise<{
  success: boolean;
  plan_slug?: string;
  plan_name?: string;
  subscription_status?: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Не авторизован" };
    }

    const { data, error } = await supabase.rpc("get_user_plan");

    if (error) {
      console.error("get_user_plan error:", error);
      return { success: false, error: "Ошибка получения статуса" };
    }

    const plan = data as {
      plan_slug?: string;
      plan_name?: string;
      subscription_status?: string;
      trial_ends_at?: string;
      subscription_ends_at?: string;
    };

    return {
      success: true,
      plan_slug: plan.plan_slug,
      plan_name: plan.plan_name,
      subscription_status: plan.subscription_status,
      trial_ends_at: plan.trial_ends_at,
      subscription_ends_at: plan.subscription_ends_at,
    };
  } catch (error: unknown) {
    console.error("getSubscriptionStatusAction error:", error);
    const message =
      error instanceof Error ? error.message : "Ошибка получения статуса";
    return { success: false, error: message };
  }
}

// =====================================================
// Получение истории платежей
// =====================================================
export async function getPaymentHistoryAction(): Promise<{
  success: boolean;
  payments?: Array<{
    id: string;
    amount_cents: number;
    currency: string;
    status: string;
    description: string;
    created_at: string;
    plan_name?: string;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Не авторизован" };
    }

    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        id,
        amount_cents,
        currency,
        status,
        description,
        created_at,
        plans!inner(name)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("getPaymentHistory error:", error);
      return { success: false, error: "Ошибка получения истории" };
    }

    const payments = (data || []).map((p: any) => ({
      id: p.id,
      amount_cents: p.amount_cents,
      currency: p.currency,
      status: p.status,
      description: p.description,
      created_at: p.created_at,
      plan_name: p.plans?.name,
    }));

    return { success: true, payments };
  } catch (error: unknown) {
    console.error("getPaymentHistoryAction error:", error);
    const message =
      error instanceof Error ? error.message : "Ошибка получения истории";
    return { success: false, error: message };
  }
}
