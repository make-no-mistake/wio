import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { generateText } from "./gemma";

const PromptBody = Type.Object({
  prompt: Type.String(),
});

export async function llmRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.post(
    "/llm/prompt",
    { schema: { body: PromptBody } },
    async (request, reply) => {
      const { prompt } = request.body;

      const result = await generateText(prompt);

      if (!result.success) {
        return reply
          .status(result.statusCode || 500)
          .send({ error: result.error });
      }

      return reply.send({ response: result.response });
    },
  );
}
