 "use client";

import Link from "next/link";
import { useActionState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { loginAction } from "@/lib/actions/auth";

type LoginFormProps = {
  className?: string;
};

export function LoginForm({ className }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <Card
      className={cn(
        "w-full max-w-sm border-border/70 bg-card/75 shadow-sm backdrop-blur-sm rounded-2xl",
        className,
      )}
    >
      <div className="mb-8 text-center">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          ProtoSpec<span className="opacity-40">.</span>
        </span>
      </div>
      <CardHeader className="space-y-1 pt-0">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Вход в ProtoSpec
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Продолжите работу над вашими техническими заданиями.
        </p>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive" className="text-sm">
              <AlertDescription>{state.error}</AlertDescription>
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
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
              placeholder=""
              className="border-border focus-visible:ring-primary"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Входим..." : "Войти"}
          </Button>
          <p className="w-full text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

