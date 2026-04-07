// =====================================================
// YOOKASSA RETURN HANDLER
// Возврат пользователя после оплаты
// URL: /api/yookassa/return
// =====================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getPayment } from "@/lib/yookassa/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const paymentId = searchParams.get("payment_id") || searchParams.get("id");

    if (!paymentId) {
      // Нет ID платежа — редирект на дашборд
      return NextResponse.redirect(
        new URL("/dashboard?payment_status=unknown", req.url)
      );
    }

    const supabase = await createServerClient();

    // Проверяем авторизацию
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Пользователь не авторизован — редирект на логин
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Получаем статус платежа из ЮKassa
    const payment = await getPayment(paymentId);

    // Определяем статус для редиректа
    let status: string;
    let message: string;

    switch (payment.status) {
      case "succeeded":
        status = "success";
        message = "Оплата прошла успешно!";
        break;

      case "pending":
      case "waiting_for_capture":
        status = "pending";
        message = "Платеж обрабатывается...";
        break;

      case "canceled":
        status = "canceled";
        message = "Платеж отменен";
        break;

      default:
        status = "unknown";
        message = "Неизвестный статус платежа";
    }

    // Обновляем запись платежа в БД (если есть)
    const { data: paymentRecord } = await supabase
      .from("payments")
      .select("id, status")
      .eq("yookassa_payment_id", paymentId)
      .eq("user_id", user.id)
      .single();

    if (paymentRecord && paymentRecord.status !== payment.status) {
      await supabase
        .from("payments")
        .update({
          status: payment.status,
          paid_at: payment.paid ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("yookassa_payment_id", paymentId);
    }

    // Редирект на дашборд со статусом
    const returnUrl = new URL("/dashboard", req.url);
    returnUrl.searchParams.set("payment_status", status);
    returnUrl.searchParams.set("payment_message", message);

    return NextResponse.redirect(returnUrl);
  } catch (error) {
    console.error("YooKassa return handler error:", error);

    // В случае ошибки — редирект на дашборд
    return NextResponse.redirect(
      new URL("/dashboard?payment_status=error", req.url)
    );
  }
}
