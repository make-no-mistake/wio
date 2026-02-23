import type { FastifyInstance } from "fastify";
import { userRoutes } from "./routes/user.routes";

export async function appRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (_, reply) => {
    return reply.viewAsync("landing.ejs");
  });

  await fastify.register(userRoutes);
}
