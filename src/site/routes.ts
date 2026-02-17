import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import { retrieveSiteAsset } from "./assets";
import { transpileSDK } from "../sdk/transpiler";

export async function siteRoutes(fastify: FastifyInstance) {
  fastify.get("/wio.js", async (_, reply) => {
    const result = await transpileSDK();

    if (!result.success) {
      return reply.status(500).send(result.error);
    }

    reply.header("Content-Type", "application/javascript").send(result.body);
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
