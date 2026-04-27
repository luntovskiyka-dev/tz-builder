/** Primary key filter: DB may use bigint/serial; PostgREST matches reliably with a number. */
export function coerceProjectIdForFilter(projectId: string): string | number {
  if (/^\d+$/.test(projectId)) {
    const n = Number(projectId);
    if (Number.isSafeInteger(n)) return n;
  }
  return projectId;
}
