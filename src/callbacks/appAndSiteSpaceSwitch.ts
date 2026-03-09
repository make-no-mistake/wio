import type { IncomingMessage } from "http";
import { extractLowestLevelDomain } from "../helpers/extractLowestLevelDomain";

// This hook serves as a switch between the app and site route space.
// All requests that arrive through a subdomain (e.g mysite.wio.dev/example)
// are rerouted to the /sites/:site/route path (e.g mysite.wio.dev/sites/mysite/example)
export function appAndSiteSpaceSwitch(req: IncomingMessage): string {
  const host = req.headers.host;
  const site = extractLowestLevelDomain(host);
  const url = req.url || "/";

  if (url.startsWith("/static/")) return url;
  if (url.startsWith("/dashboard") || url.startsWith("/api/metrics"))
    return url;

  if (!site) return url;

  return `/sites/${site}${url}`;
}
