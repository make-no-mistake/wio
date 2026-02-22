import type { FastifyInstance } from "fastify";
import { transpileSDK } from "../sdk/transpiler";
import { SiteAssetRepositoryImpl } from "../repositories/site_asset.repository";
import { llmRoutes } from "../llm/routes";

export async function siteRoutes(fastify: FastifyInstance) {
  await fastify.register(llmRoutes);

  fastify.get("/wio.js", async (_, reply) => {
    const result = await transpileSDK();

    if (!result.success) {
      return reply.status(500).send(result.error);
    }

    reply.header("Content-Type", "application/javascript").send(result.body);
  });

  fastify.get("/", async (request, reply) => {
    const { site } = request.params as { site: string };

    const { bytes, mimetype } =
      await new SiteAssetRepositoryImpl().retrieveAssetBySiteAndName(
        site,
        "index.html",
      );

    return reply.header("Content-Type", mimetype).send(bytes);
  });

  fastify.get("/:asset", async (request, reply) => {
    const { site, asset } = request.params as { site: string; asset: string };

    const { bytes, mimetype } =
      await new SiteAssetRepositoryImpl().retrieveAssetBySiteAndName(
        site,
        asset,
      );

    return reply.header("Content-Type", mimetype).send(bytes);
  });
}
