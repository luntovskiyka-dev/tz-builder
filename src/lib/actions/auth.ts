"use server";

import { mapLoginErrorMessage, mapSignupErrorMessage } from "@/lib/auth-messages";
import { createServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_RATE_LIMIT = 5;           // max attempts
const AUTH_RATE_WINDOW_MS = 60_000;  // per 60 seconds

export type AuthFormState = { error?: string; success?: string } | null;

export async function signupAction(prevState: AuthFormState, formData: FormData) {
  const email = formData.get("email") as string;

  const rl = rateLimit(`signup:${email ?? "unknown"}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_MS);
  if (!rl.allowed) {
    return { error: "Слишком много попыток регистрации. Подождите минуту." };
  }

  const supabase = await createServerClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const agreement = formData.get("agreement") as string;

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  if (password.length < 6) {
    return { error: "Пароль должен быть не менее 6 символов" };
  }

  if (password !== confirmPassword) {
    return { error: "Пароли не совпадают" };
  }

  if (!agreement) {
    return { error: "Вы должны согласиться с Политикой конфиденциальности и Условиями использования" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) return { error: mapSignupErrorMessage(error.message) };
  return { success: "Письмо отправлено — проверьте почту" };
}

export async function loginAction(prevState: AuthFormState, formData: FormData) {
  const email = formData.get("email") as string;

  const rl = rateLimit(`login:${email ?? "unknown"}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_MS);
  if (!rl.allowed) {
    return { error: "Слишком много попыток входа. Подождите минуту." };
  }

  const supabase = await createServerClient();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: mapLoginErrorMessage(error.message) };
  redirect("/dashboard");
}

export async function signInWithGoogleAction() {
  const supabase = await createServerClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin ?? "";

  if (!siteUrl) {
    redirect("/auth/error?source=oauth&code=missing_site_url");
  }

  const callbackUrl = new URL("/auth/callback", siteUrl);
  callbackUrl.searchParams.set("next", "/dashboard");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    redirect("/auth/error?source=oauth&code=oauth_start_failed");
  }

  if (!data.url) {
    redirect("/auth/error?source=oauth&code=oauth_url_missing");
  }

  redirect(data.url);
}

export async function logoutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

