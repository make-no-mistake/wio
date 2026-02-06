import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import { retrieveSiteAsset } from "./assets";

export async function siteRoutes(fastify: FastifyInstance) {
  // Serve wio.js client library
  fastify.get("/wio.js", async (_, reply) => {
    const wioJs = await readFile(import.meta.dir + "/../static/wio.js");
    reply.header("Content-Type", "application/javascript").send(wioJs);
  });

  // Serve demo page for testing
  fastify.get("/demo", async (_, reply) => {
    const demo = await readFile(
      import.meta.dir + "/../static/wio-chat-demo.html",
    );
    reply.header("Content-Type", "text/html").send(demo);
  });

  fastify.get("/:asset", async (request, reply) => {
    const { site, asset } = request.params as { site: string; asset: string };

    const { bytes, mimetype } = await retrieveSiteAsset(site, asset);
    return reply.header("Content-Type", mimetype).send(bytes);
  });
}
