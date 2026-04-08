const DEFAULT_PATH = "/dashboard";

/**
 * Validates a user-supplied redirect path to prevent open redirect attacks.
 * Only allows relative paths on the same origin — rejects protocol-relative
 * URLs (//evil.com), absolute URLs, and paths with encoded tricks.
 */
export function getSafeRedirectPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") return DEFAULT_PATH;

  const trimmed = next.trim();

  if (!trimmed.startsWith("/")) return DEFAULT_PATH;

  // Block protocol-relative URLs like //evil.com or ///evil.com
  if (trimmed.startsWith("//")) return DEFAULT_PATH;

  // Parse against a dummy origin — if hostname changes, it's an absolute URL
  try {
    const parsed = new URL(trimmed, "http://safe.localhost");
    if (parsed.hostname !== "safe.localhost") return DEFAULT_PATH;

    const path = parsed.pathname + parsed.search;

    // Block encoded slashes that could resolve to protocol-relative URLs
    const decoded = decodeURIComponent(path);
    if (decoded.startsWith("//") || decoded.includes("\\")) return DEFAULT_PATH;

    return path;
  } catch {
    return DEFAULT_PATH;
  }
}
