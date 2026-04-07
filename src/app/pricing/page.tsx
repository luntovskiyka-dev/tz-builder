import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PricingPage } from "@/components/billing/PricingPage";

export default async function PricingPageRoute() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Получаем текущий план пользователя
  const { data: userPlan, error: planError } = await supabase.rpc("get_user_plan");

  const plan = userPlan as {
    plan_slug?: string;
    plan_name?: string;
    subscription_status?: string;
    trial_ends_at?: string;
  } | null;

  return (
    <PricingPage
      user={{
        email: user.email ?? "",
        currentPlan: plan?.plan_slug ?? "starter",
        subscriptionStatus: plan?.subscription_status ?? "none",
      }}
    />
  );
}
