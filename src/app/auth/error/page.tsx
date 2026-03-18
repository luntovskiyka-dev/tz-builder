import Link from "next/link";

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error } = await searchParams;
  let message = "Произошла ошибка при подтверждении. Попробуйте ещё раз.";
  if (error) {
    try {
      message = decodeURIComponent(error);
    } catch {
      message = error;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50/50 p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-red-800">
          Ошибка подтверждения
        </h1>
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
