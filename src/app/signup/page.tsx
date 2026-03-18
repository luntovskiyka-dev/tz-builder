import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/60">
      <div className="px-4 py-8">
        <SignupForm />
      </div>
    </div>
  );
}

