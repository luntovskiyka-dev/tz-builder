/**
 * Determines whether an RPC quota error should block the request (fail-closed)
 * or allow it (fail-open). Current policy: always block on error.
 */
export function shouldBlockOnQuotaError(rpcError: unknown): {
  blocked: true;
  status: number;
  message: string;
} {
  const errorDetail =
    rpcError && typeof rpcError === "object" && "message" in rpcError
      ? (rpcError as { message: string }).message
      : String(rpcError);

  console.error("Quota RPC failed:", errorDetail);

  return {
    blocked: true,
    status: 503,
    message: "Сервис проверки лимитов временно недоступен. Попробуйте позже.",
  };
}
