import type { FastifyInstance } from "fastify";
import {
  listSites,
  renderMarketplace,
} from "../../controllers/marketplace.controller";

export async function marketplaceRoutes(fastify: FastifyInstance) {
  fastify.get("/", renderMarketplace);
  fastify.get("/api", listSites);
}
