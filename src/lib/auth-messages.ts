/** Перевод сообщений Supabase для отображения (server + client). */

export function mapLoginErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid email or password") ||
    m.includes("invalid credentials")
  ) {
    return "Неверный email или пароль";
  }
  if (m.includes("user not found")) return "Пользователь не найден";
  if (m.includes("too many requests") || m.includes("rate limit") || m.includes("over_request_rate_limit")) {
    return "Слишком много попыток. Попробуйте позже";
  }
  if (m.includes("email not confirmed")) {
    return "Подтвердите email по ссылке из письма";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Ошибка сети. Проверьте подключение и попробуйте снова";
  }
  if (raw.trim() && !/[а-яё]/i.test(raw)) {
    return "Не удалось войти. Попробуйте ещё раз";
  }
  return raw.trim() || "Не удалось войти. Попробуйте ещё раз";
}

export function mapSignupErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("user already registered") || m.includes("already registered") || m.includes("already exists")) {
    return "Пользователь с таким email уже существует";
  }
  if (m.includes("password") && (m.includes("at least") || m.includes("6"))) {
    return "Пароль должен быть не менее 6 символов";
  }
  if (m.includes("too many requests") || m.includes("rate limit") || m.includes("over_request_rate_limit")) {
    return "Слишком много попыток. Попробуйте позже";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Ошибка сети. Проверьте подключение и попробуйте снова";
  }
  if (raw.trim() && !/[а-яё]/i.test(raw)) {
    return "Не удалось зарегистрироваться. Попробуйте ещё раз";
  }
  return raw.trim() || "Не удалось зарегистрироваться. Попробуйте ещё раз";
}
