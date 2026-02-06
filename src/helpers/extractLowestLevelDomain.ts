/**
 * Extracts the lowest level domain (subdomain) from a host string.
 * Used to identify which site a request belongs to.
 *
 * @param host - The host string (e.g., "mysite.wio.dev" or "mysite.lvh.me:3000")
 * @returns The subdomain (e.g., "mysite") or undefined if no valid subdomain exists
 */
export function extractLowestLevelDomain(
  host: string | undefined,
): string | undefined {
  if (!host) {
    return undefined;
  }

  if (
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0") ||
    host.startsWith("wio.dev")
  ) {
    return undefined;
  }

  const parts = host.split(".");

  if (parts.length === 1 || parts[0] === "www") {
    return undefined;
  }

  return parts[0];
}
