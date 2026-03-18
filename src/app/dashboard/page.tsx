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

  return <DashboardLayout />;
}
