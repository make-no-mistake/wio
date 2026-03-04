import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { RelationRepositoryImpl } from "../../repositories/relation.repository";
import { findSiteOrReply404 } from "../../helpers/findSiteOrReply404";

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
      const site = await findSiteOrReply404(request.params.site, reply);
      if (!site) return;

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

  app.post(
    "/:relation",
    {
      schema: {
        params: Type.Object({
          relation: Type.String(),
          site: Type.String(),
        }),
        body: Type.Array(Type.Record(Type.String(), Type.Unknown())),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            records: Type.Array(
              Type.Object({
                id: Type.Number(),
                site_id: Type.Number(),
                relation_name: Type.String(),
                data: Type.Record(Type.String(), Type.Unknown()),
                created_at: Type.Any(),
              }),
            ),
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
      const site = await findSiteOrReply404(request.params.site, reply);
      if (!site) return;

      const result = await new RelationRepositoryImpl().insertRelations(
        request.params.relation,
        site.id,
        request.body,
      );

      if (!result.success)
        return reply
          .status(500)
          .send({ success: false, error: String(result.error) });

      return reply.status(200).send({
        success: true,
        records: result.records!,
      });
    },
  );
}
