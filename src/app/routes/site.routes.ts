import type { FastifyInstance } from "fastify";
import { push, listSites } from "../../controllers/site.controller";

export async function siteApiRoutes(fastify: FastifyInstance) {
  fastify.post("/api/site", { preHandler: fastify.authorize }, push);
  fastify.get("/api/sites", { preHandler: fastify.authorize }, listSites);
}
