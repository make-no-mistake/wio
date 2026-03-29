import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";

export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setNotFoundHandler({ preHandler: fastify.rateLimit() }, () => {
    throw fastify.httpErrors.notFound();
  });

  fastify.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      if (!request.headers.accept?.includes("text/html"))
        return reply.send(error);

      if (error.statusCode === 401) {
        return reply.redirect("/login");
      } else if (error.statusCode === 404) {
        return reply.code(404).viewAsync("errors/404.ejs");
      }
      return reply.send(error);
    },
  );
}
