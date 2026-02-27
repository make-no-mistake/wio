import type { FastifyInstance } from "fastify";
import { convertToHtml } from "./markdown.controller";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";

const MarkdownBody = Type.Object({
  markdown: Type.String(),
});

export async function markdownRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();
  app.post(
    "/markdown",
    { schema: { body: MarkdownBody } },
    async (request, reply) => {
      const { markdown } = request.body;
      const html = await convertToHtml(markdown);
      return reply.send({ html });
    },
  );
}
