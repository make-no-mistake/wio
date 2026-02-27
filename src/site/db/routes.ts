import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { RelationRepositoryImpl } from "../../repositories/relation.repository";
import { findSiteByName } from "../../repositories/site.repository";

export async function dbRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.delete(
    "/:relation",
    {
      schema: {
        params: Type.Object({
          relation: Type.String(),
          site: Type.String(),
        }),
        querystring: Type.Object({
          ids: Type.String(),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            deleted_ids: Type.Array(Type.Number()),
          }),
          404: Type.Object({
            success: Type.Boolean(),
            error: Type.String(),
          }),
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const site = await findSiteByName(request.params.site);

      if (!site)
        return reply
          .status(404)
          .send({ success: false, error: "Site not found" });

      const ids = request.query.ids
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));

      const result = await new RelationRepositoryImpl().deleteRelations(
        request.params.relation,
        site.id,
        ids,
      );

      return reply.status(result.success ? 200 : 500).send({
        success: result.success,
        deleted_ids: result.deleted_ids,
        error: String(result.error),
      });
    },
  );
}
