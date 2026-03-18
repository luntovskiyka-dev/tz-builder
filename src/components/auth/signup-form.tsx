"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { signupAction } from "@/lib/actions/auth";

type SignupFormProps = {
  className?: string;
};

export function SignupForm({ className }: SignupFormProps) {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <Card
      className={cn(
        "w-full max-w-md border border-border/80 bg-card/80 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Регистрация в ProtoSpec
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Создайте аккаунт, чтобы начинать и сохранять ТЗ-проекты.
        </p>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive" className="text-sm">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert className="text-sm">
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}

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
              <span className="text-[11px] text-muted-foreground">
                минимум 6 символов
              </span>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isPending}
          >
            {isPending ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
          <p className="w-full text-center text-xs text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
