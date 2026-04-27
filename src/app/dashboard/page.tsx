import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getDashboardProjectBootstrap } from "@/lib/projects/dashboardBootstrap";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [planResult, projectBootstrap] = await Promise.all([
    supabase.rpc("get_user_plan"),
    getDashboardProjectBootstrap(supabase, user.id),
  ]);
  const { data: userPlan } = planResult;

  const planData = userPlan as {
    plan_slug?: string;
    plan_name?: string;
    subscription_status?: string;
    trial_ends_at?: string;
    subscription_ends_at?: string;
  } | null;

  return (
    <DashboardLayout
      projectBootstrap={projectBootstrap}
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
