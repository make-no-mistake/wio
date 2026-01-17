import Fastify from "fastify";
import { sql } from "bun";
import { setSiteOrDie } from "./hooks/setSiteOrDie";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

fastify.get("/time", async () => {
  const result = await sql`SELECT now() AS time`;
  return result[0];
});

fastify.get("/me", { preHandler: setSiteOrDie }, (request, reply) => {
  reply.send({ site: request.headers.site });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
