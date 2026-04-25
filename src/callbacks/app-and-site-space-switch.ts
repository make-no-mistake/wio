import type { IncomingMessage } from "http";
import { extractLowestLevelDomain } from "@/helpers/extract-lowest-level-domain";

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

  // Force all tenant sites to use the Wio favicon
  if (
    url === "/favicon.ico" ||
    url === "/favicon-32x32.png" ||
    url === "/favicon-16x16.png" ||
    url === "/apple-touch-icon.png" ||
    url === "/site.webmanifest" ||
    url.startsWith("/android-chrome-")
  ) {
    return `/static/favicon${url}`;
  }

  if (url.startsWith("/favicon/")) return `/static${url}`;

  if (!site) return url;

  return `/sites/${site}${url}`;
}
