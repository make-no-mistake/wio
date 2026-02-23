import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import ejs from "ejs";
import multipart from "@fastify/multipart";
import { appAndSiteSpaceSwitch } from "./callbacks/appAndSiteSpaceSwitch";
import { initDatabase } from "./db/schema";
import { appRoutes } from "./app/routes";
import { siteRoutes } from "./site/routes";
import { initFastifySocket } from "./websocket";

const fastify = Fastify({
  logger: true,
  rewriteUrl: appAndSiteSpaceSwitch,
});

await fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

await initDatabase();
await initFastifySocket(fastify);

await fastify.register(fastifyStatic, {
  root: `${import.meta.dir}/static`,
  prefix: "/static/",
});
await fastify.register(fastifyView, {
  engine: { ejs },
  root: `${import.meta.dir}/views`,
  viewExt: "ejs",
});

await fastify.register(appRoutes);
await fastify.register(siteRoutes, { prefix: "/sites/:site" });

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
