import type { FastifyInstance } from "fastify";
import { generateText } from "./gemini";

export async function llmRoutes(fastify: FastifyInstance) {
  fastify.post("/llm/prompt", async (request, reply) => {
    const body = request.body as { prompt?: unknown };

    const prompt =
      typeof body?.prompt === "string"
        ? body.prompt
        : body?.prompt == null
          ? ""
          : String(body.prompt);

    const result = await generateText(prompt);

    if (!result.success) {
      return reply
        .status(result.statusCode || 500)
        .send({ error: result.error });
    }

    return reply.send({ response: result.response });
  });
}
