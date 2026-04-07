import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              // Устанавливаем куки с правильными настройками для сохранения сессии
              cookieStore.set(name, value, {
                ...options,
                path: "/",
                maxAge: 60 * 60 * 24 * 30, // 30 дней
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              });
            }
          } catch {
            // no-op outside Server Action / Route Handler
          }
        },
      },
    },
  );
}

