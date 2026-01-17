import Fastify from "fastify";
import { sql } from "bun";
import { appAndSiteSpaceSwitch } from "./callbacks/appAndSiteSpaceSwitch";
import { retrieveSiteAsset } from "./site/assets";
import { initDatabase } from "./db/schema";
import { initStorage } from "./storage";
import { readFile } from "node:fs/promises";

const fastify = Fastify({
  logger: true,
  rewriteUrl: appAndSiteSpaceSwitch,
});

await initDatabase();
await initStorage();

fastify.get("/", async (request, reply) => {
  const index_content = await readFile(import.meta.dir + "/static/index.html");
  reply.header("Content-Type", "text/html").send(index_content);
});

fastify.get("/time", async () => {
  const result = await sql`SELECT now() AS time`;
  return result[0];
});

fastify.get("/all", async () => {
  const sites = await sql`SELECT * FROM site_assets`;
  return sites;
});

fastify.get("/sites/:site/identity", async (request, reply) => {
  const { site } = request.params as { site: string };

  return reply.send(`You are on a site "${site}"`);
});

fastify.get("/sites/:site/:asset", async (request, reply) => {
  const { site, asset } = request.params as { site: string; asset: string };

  const { bytes, mimetype } = await retrieveSiteAsset(site, asset);
  return reply.header("Content-Type", mimetype).send(bytes);
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
