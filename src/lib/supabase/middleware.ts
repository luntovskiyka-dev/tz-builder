import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Устанавливаем куки с правильными настройками для сохранения сессии
            supabaseResponse.cookies.set(name, value, {
              ...options,
              path: "/",
              maxAge: 60 * 60 * 24 * 30, // 30 дней
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          });
        },
      },
    },
  );

  // Важно: вызываем getUser() чтобы обновить куки, даже если пользователь не авторизован
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Редирект на логин только для защищённых маршрутов
  if (
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

