"use server";

import { mapLoginErrorMessage, mapSignupErrorMessage } from "@/lib/auth-messages";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthFormState = { error?: string; success?: string } | null;

export async function signupAction(prevState: AuthFormState, formData: FormData) {
  const supabase = await createServerClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  if (password.length < 6) {
    return { error: "Пароль должен быть не менее 6 символов" };
  }

  if (password !== confirmPassword) {
    return { error: "Пароли не совпадают" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) return { error: mapSignupErrorMessage(error.message) };
  return { success: "Регистрация успешно завершена" };
}

export async function loginAction(prevState: AuthFormState, formData: FormData) {
  const supabase = await createServerClient();
  const email = formData.get("email") as string;
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

export async function logoutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

