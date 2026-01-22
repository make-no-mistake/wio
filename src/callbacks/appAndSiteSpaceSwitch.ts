import type { IncomingMessage } from "http";

// This hook serves as a switch between the app and site route space.
// All requests that arrive through a subdomain (e.g mysite.wio.dev/example)
// are rerouted to the /sites/:site/route path (e.g mysite.wio.dev/sites/mysite/example)
export function appAndSiteSpaceSwitch(req: IncomingMessage): string {
  const host = req.headers.host;
  const site = extractLowestLevelDomain(host);
  const url = req.url || "/";

  if (!site) return url;

  return `/sites/${site}${url}`;
}

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

  if (parts.length === 1) {
    return undefined;
  }

  return parts[0];
}
