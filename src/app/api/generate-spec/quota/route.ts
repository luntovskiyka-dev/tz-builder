import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { shouldBlockOnQuotaError } from "@/lib/quota";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        plan: 'none',
        used_today: 0,
        daily_limit: 0,
        remaining_today: 0,
        used_this_month: 0,
        monthly_limit: 0,
        remaining_this_month: 0,
      });
    }

    // Новая функция возвращает квоту с учетом тарифа пользователя.
    // Если billing-таблицы ещё не созданы, возвращаем Starter defaults.
    const { data, error } = await supabase.rpc("get_user_ai_quota");

    if (error) {
      const block = shouldBlockOnQuotaError(error);
      return NextResponse.json(
        { error: block.message },
        { status: block.status }
      );
    }

    const quota = data as {
      authenticated?: boolean;
      plan?: string;
      used_today?: number;
      daily_limit?: number;
      remaining_today?: number;
      used_this_month?: number;
      monthly_limit?: number;
      remaining_this_month?: number;
    };

    return NextResponse.json({
      authenticated: quota.authenticated ?? true,
      plan: quota.plan ?? 'starter',
      used_today: quota.used_today ?? 0,
      daily_limit: quota.daily_limit ?? 0,
      remaining_today: quota.remaining_today ?? 0,
      used_this_month: quota.used_this_month ?? 0,
      monthly_limit: quota.monthly_limit ?? 0,
      remaining_this_month: quota.remaining_this_month ?? 0,
    });
  } catch (e) {
    console.error("GET generate-spec quota:", e);
    return NextResponse.json(
      { error: "Не удалось получить лимит генераций" },
      { status: 500 }
    );
  }
}
