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

  const { error } = await supabase.from("feedback").insert({
    message: message.trim(),
    user_id: user?.id ?? null,
  });

  if (error) {
    return { error: "Не удалось отправить. Попробуйте позже." };
  }

  return { success: true };
}
