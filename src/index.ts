import Fastify from "fastify";
import { sql } from "bun";
import { appAndSiteSpaceSwitch } from "./hooks/appAndSiteSpaceSwitch";

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

fastify.addHook("onRequest", (request, reply) =>
  appAndSiteSpaceSwitch(fastify, request, reply),
);

fastify.get("/sites/:site/identity", async (request, reply) => {
  const { site } = request.params as { site: string };

  return reply.send(`You are on a site "${site}"`);
});

fastify.get("/identity", (_, reply) => {
  return reply.send("You are on the root URL");
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
