import { cn } from "@/lib/utils";

/** Общие стили карточки логина и регистрации: одна ширина, скругление, отступы. */
export const authFormCardClassName =
  "w-full max-w-md rounded-xl border border-border/80 bg-card/80 shadow-sm backdrop-blur-sm";

export function authFormCardClass(extra?: string) {
  return cn(authFormCardClassName, extra);
}
