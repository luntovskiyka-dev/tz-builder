import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Получаем текущий план пользователя
  const { data: userPlan } = await supabase.rpc("get_user_plan");

  const planData = userPlan as {
    plan_slug?: string;
    plan_name?: string;
    subscription_status?: string;
    trial_ends_at?: string;
    subscription_ends_at?: string;
  } | null;

  return (
    <DashboardLayout
      user={{
        name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "Пользователь",
        email: user.email ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
        plan: planData?.plan_slug ?? "starter",
        planName: planData?.plan_name ?? "Starter",
        subscriptionStatus: planData?.subscription_status ?? "none",
        trialEndsAt: planData?.trial_ends_at ?? null,
        subscriptionEndsAt: planData?.subscription_ends_at ?? null,
      }}
    />
  );
}
