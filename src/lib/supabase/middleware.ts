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
          const maxAgeSec = Number(process.env.SESSION_COOKIE_MAX_AGE_DAYS || 7) * 86400;
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, {
              ...options,
              path: "/",
              maxAge: maxAgeSec,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              httpOnly: true,
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

