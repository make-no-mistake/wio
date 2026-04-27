import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import migrate from "@/db/migrator";

async function migrations(fastify: FastifyInstance) {
  await migrate((entry) => fastify.log.info(entry));
}

export default fp(migrations, { name: "migrations" });
