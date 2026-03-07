import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { transpileSDK } from "../sdk/transpiler";
import { SiteAssetRepositoryImpl } from "../repositories/site_asset.repository";
import { llmRoutes } from "../llm/routes";
import { markdownRoutes } from "../markdown/routes";
import { dbRoutes } from "./db/routes";
import { findSiteByName } from "../repositories/site.repository";

const SiteParams = Type.Object({
  site: Type.String(),
});

const SiteAssetParams = Type.Object({
  site: Type.String(),
  asset: Type.String(),
});

export async function siteRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // We want to associate a request with a Site instantce for all *site* requests.
  app.decorateRequest("site", null);

  /**
   * Before the handling of any site request, we ensure that the provided site
   * is valid and assign it to the request instance.
   **/
  await app.addHook("onRequest", async (request, reply) => {
    // TODO: The site lookup should be cashed to avoid a database read on every request.
    // @ts-expect-error: The presence of the site param is enforced by the type provider.
    const site = await findSiteByName(request.params.site);

    // This rejects any request to any site route for which a site is invalid.
    if (!site) reply.code(500).send({ message: "Site not found" });

    request.site = site;

    if (site) {
      const siteLogger = request.log.child({ siteId: site.id });

      // Fastify 5 sets an internal kDisableRequestLogging symbol on the parent
      // logger. Pino child loggers inherit symbol properties via the prototype
      // chain, so siteLogger inherits the "disabled" flag. We must explicitly
      // override it to false so Fastify's onResponseCallback still logs
      // "request completed" using our child logger.
      const disableLogSym = Object.getOwnPropertySymbols(request.log).find(
        (s) => s.description === "fastify.disableRequestLogging",
      );
      if (disableLogSym) {
        (siteLogger as unknown as Record<symbol, boolean>)[disableLogSym] =
          false;
      }

      request.log = siteLogger;
      reply.log = siteLogger;
    }

    // Fastify's auto 'incoming request' log is disabled for site routes
    // so we emit it here with siteId included via the child logger.
    request.log.info({ req: request }, "incoming request");
  });

  await fastify.register(llmRoutes, { prefix: "/llm" });
  await fastify.register(dbRoutes, { prefix: "/db" });
  await fastify.register(markdownRoutes, { prefix: "/markdown" });

  app.get("/wio.js", async (_, reply) => {
    const result = await transpileSDK();

    if (!result.success) {
      return reply.status(500).send(result.error);
    }

    reply.header("Content-Type", "application/javascript").send(result.body);
  });

  app.get("/", { schema: { params: SiteParams } }, async (request, reply) => {
    const { bytes, mimetype } =
      await new SiteAssetRepositoryImpl().retrieveAssetBySiteIdAndName(
        request.site!.id,
        "index.html",
      );

    return reply.header("Content-Type", mimetype).send(bytes);
  });

  app.get(
    "/:asset",
    { schema: { params: SiteAssetParams } },
    async (request, reply) => {
      const { asset } = request.params;

      const { bytes, mimetype } =
        await new SiteAssetRepositoryImpl().retrieveAssetBySiteIdAndName(
          request.site!.id,
          asset,
        );

      return reply.header("Content-Type", mimetype).send(bytes);
    },
  );
}
