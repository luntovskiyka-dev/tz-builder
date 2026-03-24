"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authFormCardClass } from "@/components/auth/auth-form-styles";
import { loginAction, signInWithGoogleAction } from "@/lib/actions/auth";

type LoginFormProps = {
  className?: string;
};

export function LoginForm({ className }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <Card className={authFormCardClass(className)}>
      <div className="mb-8 text-center">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          ProtoSpec<span className="opacity-40">.</span>
        </span>
      </div>
      <CardHeader className="space-y-1 pt-0 text-center">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Вход
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Продолжите работу над вашими техническими заданиями.
        </p>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <AuthAlert type="error" message={state?.error ?? ""} />

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
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Входим..." : "Войти"}
          </Button>
        </CardFooter>
      </form>
      <CardFooter className="flex flex-col gap-3 pt-0">
        <form action={signInWithGoogleAction} className="w-full">
          <GoogleLoginButton disabled={isPending} />
        </form>
        <p className="w-full text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function GoogleLoginButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" className="w-full" disabled={disabled || pending}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
        <path
          d="M22.501 12.233c0-.81-.067-1.402-.211-2.018H12.24v3.856h5.9c-.119.958-.762 2.399-2.191 3.368l-.02.129 3.091 2.348.214.021c1.965-1.779 3.267-4.393 3.267-7.704Z"
          fill="#4285F4"
        />
        <path
          d="M12.24 22.5c2.889 0 5.313-.931 7.084-2.563l-3.375-2.497c-.905.617-2.117 1.048-3.709 1.048-2.83 0-5.23-1.779-6.083-4.238l-.124.01-3.214 2.439-.043.116C4.536 20.231 8.116 22.5 12.24 22.5Z"
          fill="#34A853"
        />
        <path
          d="M6.157 14.25a6.242 6.242 0 0 1-.357-2.017c0-.702.132-1.378.344-2.017l-.006-.135-3.255-2.478-.107.05A10.107 10.107 0 0 0 1.5 12.233c0 1.628.396 3.168 1.276 4.58l3.381-2.563Z"
          fill="#FBBC05"
        />
        <path
          d="M12.24 5.977c2.008 0 3.363.85 4.136 1.559l3.019-2.884C17.54 2.964 15.129 1.5 12.24 1.5 8.116 1.5 4.536 3.769 2.775 7.653l3.368 2.563c.866-2.459 3.266-4.239 6.097-4.239Z"
          fill="#EB4335"
        />
      </svg>
      {pending ? "Перенаправляем..." : "Войти через Google"}
    </Button>
  );
}
