import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import ejs from "ejs";
import multipart from "@fastify/multipart";
import { appAndSiteSpaceSwitch } from "./callbacks/appAndSiteSpaceSwitch";
import type { TransportTargetOptions } from "pino";
import { initDatabase } from "./db/schema";
import { appRoutes } from "./app/routes";
import { siteRoutes } from "./site/routes";
import { initFastifySocket } from "./websocket";
import fastifyCookie from "@fastify/cookie";
import sensible from "@fastify/sensible";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { registerErrorHandler } from "./plugins/error-handler";
const transportTargets: TransportTargetOptions[] = [
  {
    target: "pino-pretty",
    options: {
      ignore: "pid,hostname",
      translateTime: "SYS:standard",
    },
    level: "info",
  },
];

if (process.env.NODE_ENV !== "test") {
  transportTargets.push({
    target: "./observability/pino-db-transport.ts",
    options: {},
    level: "info",
  });
}

const fastify = Fastify({
  logger: {
    level: "info",
    transport: {
      targets: transportTargets,
    },
  },
  disableRequestLogging: (req) => req.url.startsWith("/sites/"),
  rewriteUrl: appAndSiteSpaceSwitch,
}).withTypeProvider<TypeBoxTypeProvider>();

registerErrorHandler(fastify);

await fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

await initDatabase();

fastify.log.info({ event: "platform_restart" });

await initFastifySocket(fastify);
await fastify.register(fastifyCookie);

await fastify.register(fastifyStatic, {
  root: `${import.meta.dir}/static`,
  prefix: "/static/",
});

fastify.get("/docs", (req, reply) => {
  reply.redirect("/docs/");
});
await fastify.register(fastifyStatic, {
  root: `${import.meta.dir}/static/docs`,
  prefix: "/docs/",
  decorateReply: false,
  extensions: ["html"],
});
await fastify.register(fastifyView, {
  engine: { ejs },
  root: `${import.meta.dir}/views`,
  viewExt: "ejs",
});

fastify.register(sensible);
await fastify.register(appRoutes);
await fastify.register(siteRoutes, { prefix: "/sites/:site" });

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
