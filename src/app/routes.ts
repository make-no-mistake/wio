import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";

export async function appRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (_, reply) => {
    const index_content = await readFile(
      import.meta.dir + "/../static/index.html",
    );
    reply.header("Content-Type", "text/html").send(index_content);
  });
}
