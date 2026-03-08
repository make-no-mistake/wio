import type { FastifyInstance } from "fastify";
import { userRoutes } from "./routes/user.routes";
import { siteApiRoutes } from "./routes/site.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import authorization from "../plugins/authorization";

export async function appRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (_, reply) => {
    return reply.viewAsync("landing.ejs");
  });

  await fastify.register(authorization);
  await fastify.register(userRoutes);
  await fastify.register(siteApiRoutes);
  await fastify.register(dashboardRoutes);
}
