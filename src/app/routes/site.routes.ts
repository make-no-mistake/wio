import type { FastifyInstance } from "fastify";
import { push } from "../../controllers/site.controller";

export async function siteApiRoutes(fastify: FastifyInstance) {
  fastify.post("/api/site", push);
}
