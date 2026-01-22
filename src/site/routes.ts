import type { FastifyInstance } from "fastify";
import { retrieveSiteAsset } from "./assets";

export async function siteRoutes(fastify: FastifyInstance) {
  fastify.get("/:asset", async (request, reply) => {
    const { site, asset } = request.params as { site: string; asset: string };

    const { bytes, mimetype } = await retrieveSiteAsset(site, asset);
    return reply.header("Content-Type", mimetype).send(bytes);
  });
}
