import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

// This hook serves as a switch between the app and site route space.
// All requests that arrive through a subdomain (e.g mysite.wio.dev/example)
// are rerouted to the /sites/:site/route path (e.g mysite.wio.dev/sites/mysite/example)
export async function appAndSiteSpaceSwitch(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const site = extractLowestLevelDomain(request.headers.host);

  // Request is made to app space, so we don't need to modify it.
  if (!site) return;

  // Request is made to site space. The route needs to be modified.
  const site_space_route = `/sites/${site}${request.url}`;

  // By injecting instead of redirecting we preserve the original route
  // from the perspective of the client.
  const response = await fastify.inject({
    url: site_space_route,
  });

  return reply.send(response.payload);
}

export function extractLowestLevelDomain(
  host: string | undefined,
): string | undefined {
  if (!host) {
    return undefined;
  }

  if (host.startsWith("127.0.0.1") || host.startsWith("0.0.0.0")) {
    return undefined;
  }

  const parts = host.split(".");

  if (parts.length === 1) {
    return undefined;
  }

  return parts[0];
}
