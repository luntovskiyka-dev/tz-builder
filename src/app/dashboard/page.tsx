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
        plan: "Hobby Plan",
      }}
    />
  );
}
