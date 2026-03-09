import Fastify from "fastify";
import fastifyView from "@fastify/view";
import fastifyCookie from "@fastify/cookie";
import ejs from "ejs";
import { fileURLToPath } from "node:url";
import { appRoutes } from "../src/app/routes";
import { registerErrorHandler } from "../src/plugins/error-handler";

const viewsRoot = fileURLToPath(new URL("../src/views", import.meta.url));

export async function createTestApp() {
  const fastify = Fastify();

  registerErrorHandler(fastify);
  await fastify.register(fastifyCookie);
  await fastify.register(fastifyView, {
    engine: { ejs },
    root: viewsRoot,
    viewExt: "ejs",
  });
  await fastify.register(appRoutes);

  return fastify;
}
