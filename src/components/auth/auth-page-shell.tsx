import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
};

/** Общая оболочка для /login и /signup: одна ширина колонки и отступы. */
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/60">
      <div className="w-full min-w-0 max-w-md px-4 py-8">{children}</div>
    </div>
  );
}
