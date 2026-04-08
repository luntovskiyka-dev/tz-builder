import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const ALLOWED_OTP_TYPES = ["signup", "invite", "magiclink", "recovery", "email_change", "email"] as const;
  type OtpType = (typeof ALLOWED_OTP_TYPES)[number];

  if (!token_hash || !type || !ALLOWED_OTP_TYPES.includes(type as OtpType)) {
    const url = new URL(
      `/auth/error?error=${encodeURIComponent("Неверная ссылка подтверждения")}`,
      request.url,
    );
    return NextResponse.redirect(url);
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as OtpType,
  });

  if (error) {
    console.error("OTP verification failed:", error.message);
    const url = new URL(
      `/auth/error?error=${encodeURIComponent("Ошибка подтверждения. Попробуйте ещё раз.")}`,
      request.url,
    );
    return NextResponse.redirect(url);
  }

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}

