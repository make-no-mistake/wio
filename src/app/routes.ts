import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import { userRoutes } from "./routes/user.routes";

export async function appRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (_, reply) => {
    const index_content = await readFile(
      import.meta.dir + "/../static/index.html",
    );
    reply.header("Content-Type", "text/html").send(index_content);
  });

  await fastify.register(userRoutes);
}
