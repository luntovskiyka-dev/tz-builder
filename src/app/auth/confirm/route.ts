import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!token_hash || !type) {
    const url = new URL(
      `/auth/error?error=${encodeURIComponent("Missing token or type")}`,
      request.url,
    );
    return NextResponse.redirect(url);
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
  });

  if (error) {
    const url = new URL(
      `/auth/error?error=${encodeURIComponent(error.message)}`,
      request.url,
    );
    return NextResponse.redirect(url);
  }

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}

