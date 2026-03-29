import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import {
  create,
  renderLogin,
  renderRegister,
} from "../../controllers/user.controller";
import { findUserByTag } from "../../repositories/user.repository";
import { SESSION_COOKIE_NAME } from "../../config/auth";

const LoginBody = Type.Object({
  tag: Type.String(),
});

export async function userRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get("/register", renderRegister);
  app.get("/login", renderLogin);
  app.post("/register", create);
  app.post(
    "/login",
    { schema: { body: LoginBody }, preHandler: fastify.rateLimit() },
    async (request, reply) => {
      const { tag } = request.body;
      const user = await findUserByTag(tag);
      if (!user) return reply.code(401).send({ error: "Unauthorized" });
      const token = fastify.issueUserToken(user);
      reply.setCookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7,
      });
      return { token };
    },
  );

  app.get("/me", { preHandler: fastify.authorize }, async (request) => {
    return { user: request.currentUser };
  });
}
