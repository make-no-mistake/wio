import type { FastifyRequest, FastifyReply } from "fastify";

export function setSiteOrDie(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void,
) {
  const site = extractLowestLevelDomain(request.headers.host);

  if (!site) {
    reply.status(400).send({ error: "Invalid site in host header" });
    return;
  }

  request.headers.site = site;

  done();
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
