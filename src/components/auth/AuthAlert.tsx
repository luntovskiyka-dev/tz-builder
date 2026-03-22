import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthAlertProps = {
  type: "error" | "success";
  message: string;
};

export function AuthAlert({ type, message }: AuthAlertProps) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg px-4 py-3 text-sm",
        isError ? "border border-red-200 bg-red-50 text-red-700" : "border border-green-200 bg-green-50 text-green-700",
      )}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      <span>{message}</span>
    </div>
  );
}
