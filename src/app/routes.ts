import type { FastifyInstance } from "fastify";
import { userRoutes } from "./routes/user.routes";
import { siteApiRoutes } from "./routes/site.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import authorization from "../plugins/authorization";
import { marketplaceRoutes } from "./routes/marketplace.routes";

export async function appRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (_, reply) => {
    return reply.viewAsync("landing.ejs");
  });

  fastify.get("/contact", async (_, reply) => {
    return reply.viewAsync("contact.ejs");
  });

  await fastify.register(authorization);
  await fastify.register(userRoutes);
  await fastify.register(siteApiRoutes);
  await fastify.register(dashboardRoutes);
  await fastify.register(marketplaceRoutes, { prefix: "/marketplace" });
}
