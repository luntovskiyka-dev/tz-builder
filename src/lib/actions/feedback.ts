"use server";

/**
 * Required Supabase table "feedback":
 *   id:         uuid, primary key, default gen_random_uuid()
 *   user_id:    uuid, nullable, references auth.users(id) on delete set null
 *   message:    text, not null
 *   created_at: timestamptz, default now()
 *
 * RLS policy example (insert for authenticated users):
 *   CREATE POLICY "Users can submit feedback"
 *     ON feedback FOR INSERT TO authenticated
 *     WITH CHECK (auth.uid() = user_id);
 */

import { createServerClient } from "@/lib/supabase/server";

export type FeedbackResult = { success: true } | { error: string };

export async function submitFeedbackAction(
  message: string
): Promise<FeedbackResult> {
  if (!message.trim()) {
    return { error: "Сообщение не может быть пустым" };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Нужно войти в аккаунт, чтобы отправить обратную связь." };
  }

  const { error } = await supabase.from("feedback").insert({
    message: message.trim(),
    user_id: user.id,
  });

  if (error) {
    console.error("submitFeedbackAction error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    // Relation does not exist
    if (error.code === "42P01") {
      return { error: "Таблица feedback не создана в базе данных." };
    }
    // RLS / permission denied
    if (error.code === "42501") {
      return { error: "Нет прав на запись feedback (проверьте RLS policy)." };
    }
    return { error: "Не удалось отправить. Попробуйте позже." };
  }

  return { success: true };
}
