import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { RelationRepositoryImpl } from "../../repositories/relation.repository";

export async function dbRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get(
    "/:relation",
    {
      schema: {
        params: Type.Object({
          relation: Type.String(),
          site: Type.String(),
        }),
        querystring: Type.Object({
          payload: Type.String(),
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            records: Type.Array(Type.Record(Type.String(), Type.Unknown())),
          }),
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      let query;
      try {
        query = JSON.parse(request.query.payload);
      } catch {
        return reply
          .status(500)
          .send({ success: false, error: "Invalid payload JSON" });
      }

      const result = await new RelationRepositoryImpl().selectRelations(
        request.params.relation,
        request.site!.id,
        query,
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
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const ids = request.query.ids
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));

      const result = await new RelationRepositoryImpl().deleteRelations(
        request.params.relation,
        request.site!.id,
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
        body: Type.Union([
          Type.Record(Type.String(), Type.Unknown()),
          Type.Array(Type.Record(Type.String(), Type.Unknown())),
        ]),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            records: Type.Union([
              Type.Record(Type.String(), Type.Unknown()),
              Type.Array(Type.Record(Type.String(), Type.Unknown())),
            ]),
          }),
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const isArray = Array.isArray(request.body);
      const dataForDb = isArray ? request.body : [request.body];

      const result = await new RelationRepositoryImpl().insertRelations(
        request.params.relation,
        request.site!.id,
        dataForDb as Record<string, unknown>[],
      );

      if (!result.success)
        return reply
          .status(500)
          .send({ success: false, error: String(result.error) });

      return reply.status(200).send({
        success: true,
        records: isArray ? result.records! : result.records![0]!,
      });
    },
  );

  app.patch(
    "/:relation",
    {
      schema: {
        params: Type.Object({
          relation: Type.String(),
          site: Type.String(),
        }),
        body: Type.Union([
          Type.Object({
            id: Type.Number(),
            data: Type.Record(Type.String(), Type.Unknown()),
          }),
          Type.Array(
            Type.Object({
              id: Type.Number(),
              data: Type.Record(Type.String(), Type.Unknown()),
            }),
          ),
        ]),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            records: Type.Union([
              Type.Record(Type.String(), Type.Unknown()),
              Type.Array(Type.Record(Type.String(), Type.Unknown())),
            ]),
          }),
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const isArray = Array.isArray(request.body);
      const dataForDb = isArray ? request.body : [request.body];

      const result = await new RelationRepositoryImpl().updateRelations(
        request.params.relation,
        request.site!.id,
        dataForDb as { id: number; data: Record<string, unknown> }[],
      );

      if (!result.success)
        return reply
          .status(500)
          .send({ success: false, error: String(result.error) });

      return reply.status(200).send({
        success: true,
        records: isArray ? result.records! : result.records![0]!,
      });
    },
  );
}
