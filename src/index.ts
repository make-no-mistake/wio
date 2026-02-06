import Fastify from "fastify";
import { appAndSiteSpaceSwitch } from "./callbacks/appAndSiteSpaceSwitch";
import { initDatabase } from "./db/schema";
import { initStorage } from "./storage";
import { appRoutes } from "./app/routes";
import { siteRoutes } from "./site/routes";
import { initFastifySocket } from "./websocket";

const fastify = Fastify({
  logger: true,
  rewriteUrl: appAndSiteSpaceSwitch,
});

await initDatabase();
await initStorage();
await initFastifySocket(fastify);

await fastify.register(appRoutes);
await fastify.register(siteRoutes, { prefix: "/sites/:site" });

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
