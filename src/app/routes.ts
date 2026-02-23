import type { FastifyInstance } from "fastify";
import { userRoutes } from "./routes/user.routes";
import { siteApiRoutes } from "./routes/site.routes";

export async function appRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (_, reply) => {
    return reply.viewAsync("landing.ejs");
  });

  await fastify.register(userRoutes);
  await fastify.register(siteApiRoutes);
}
