import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/60">
      <div className="px-4 py-8">
        <LoginForm />
      </div>
    </div>
  );
}

