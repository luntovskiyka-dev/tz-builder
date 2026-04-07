"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authFormCardClass } from "@/components/auth/auth-form-styles";
import { signupAction } from "@/lib/actions/auth";

type SignupFormProps = {
  className?: string;
};

export function SignupForm({ className }: SignupFormProps) {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <Card className={authFormCardClass(className)}>
      <div className="mb-8 text-center">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          ProtoSpec<span className="opacity-40">.</span>
        </span>
      </div>
      <CardHeader className="space-y-1 pt-0 text-center">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Регистрация
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Создайте аккаунт, чтобы начать работу с проектами.
        </p>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <AuthAlert type="error" message={state?.error ?? ""} />
          <AuthAlert type="success" message={state?.success ?? ""} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              disabled={isPending}
              className="border-border focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Пароль</Label>
              <span className="text-[11px] text-muted-foreground">минимум 6 символов</span>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={isPending}
              className="border-border focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              disabled={isPending}
              className="border-border focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-start gap-3 pt-2 w-full">
            <Checkbox
              id="agreement"
              name="agreement"
              required
              disabled={isPending}
              className="mt-1"
            />
            <label
              htmlFor="agreement"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer font-normal"
            >
              Я подтверждаю согласие с{" "}
              <Link
                href="https://protospec.ru/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold underline-offset-2 hover:underline"
              >
                Политикой конфиденциальности
              </Link>
              {" "}и{" "}
              <Link
                href="https://protospec.ru/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold underline-offset-2 hover:underline"
              >
                Условиями использования
              </Link>
              .
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
          <p className="w-full text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
