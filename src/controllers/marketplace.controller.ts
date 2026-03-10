import type { FastifyRequest, FastifyReply } from "fastify";
import { getAllSites, type Site } from "../repositories/site.repository";

export async function renderMarketplace(
  _: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.viewAsync("marketplace.ejs");
}

export async function listSites(_: FastifyRequest, reply: FastifyReply) {
  const sites = await getAllSites();
  return reply.code(200).send({
    sites: sites.map((s: Site) => ({
      name: s.name,
      url: `https://${s.name}.wio.onl`,
      deployed_at: s.created_at.toISOString(),
    })),
  });
}
