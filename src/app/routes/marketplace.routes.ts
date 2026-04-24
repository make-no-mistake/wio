import type { FastifyInstance } from "fastify";
import { getAllSites } from "../../repositories/site.repository";

export async function marketplaceRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    return reply.viewAsync("marketplace.ejs", {
      sites: await getAllSites(),
      protocol: request.protocol,
      host: request.headers.host,
    });
  });
}
