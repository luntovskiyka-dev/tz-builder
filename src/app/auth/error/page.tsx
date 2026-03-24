import Link from "next/link";

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string; source?: string; code?: string }>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error, source, code } = await searchParams;
  const isOauth = source === "oauth";
  const title = isOauth ? "Ошибка входа через Google" : "Ошибка подтверждения";

  let message = isOauth
    ? "Не удалось выполнить вход через Google. Попробуйте ещё раз."
    : "Произошла ошибка при подтверждении. Попробуйте ещё раз.";

  if (isOauth && code) {
    if (code === "missing_site_url") {
      message = "Вход через Google временно недоступен из-за настройки приложения.";
    } else if (code === "oauth_start_failed") {
      message = "Не удалось начать вход через Google. Попробуйте ещё раз.";
    } else if (code === "oauth_url_missing") {
      message = "Не удалось получить ссылку входа через Google. Повторите попытку.";
    } else if (code === "oauth_exchange_failed") {
      message = "Не удалось завершить вход через Google. Попробуйте ещё раз.";
    } else if (code === "oauth_code_missing") {
      message = "Ссылка входа через Google некорректна или устарела. Запустите вход заново.";
    }
  } else if (error) {
    try {
      message = decodeURIComponent(error);
    } catch {
      message = error;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50/50 p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-red-800">{title}</h1>
        <p className="mb-4 text-sm text-red-700">{message}</p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Вернуться к входу
        </Link>
      </div>
    </div>
  );
}
