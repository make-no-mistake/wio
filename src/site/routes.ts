import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { transpileSDK } from "../sdk/transpiler";
import { SiteAssetRepositoryImpl } from "../repositories/site_asset.repository";
import { llmRoutes } from "../llm/routes";

const SiteParams = Type.Object({
  site: Type.String(),
});

const SiteAssetParams = Type.Object({
  site: Type.String(),
  asset: Type.String(),
});

export async function siteRoutes(fastify: FastifyInstance) {
  await fastify.register(llmRoutes);

  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get("/wio.js", async (_, reply) => {
    const result = await transpileSDK();

    if (!result.success) {
      return reply.status(500).send(result.error);
    }

    reply.header("Content-Type", "application/javascript").send(result.body);
  });

  app.get("/", { schema: { params: SiteParams } }, async (request, reply) => {
    const { site } = request.params;

    const { bytes, mimetype } =
      await new SiteAssetRepositoryImpl().retrieveAssetBySiteAndName(
        site,
        "index.html",
      );

    return reply.header("Content-Type", mimetype).send(bytes);
  });

  app.get(
    "/:asset",
    { schema: { params: SiteAssetParams } },
    async (request, reply) => {
      const { site, asset } = request.params;

      const { bytes, mimetype } =
        await new SiteAssetRepositoryImpl().retrieveAssetBySiteAndName(
          site,
          asset,
        );

      return reply.header("Content-Type", mimetype).send(bytes);
    },
  );
}
