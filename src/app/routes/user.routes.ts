import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { create, renderRegister } from "../../controllers/user.controller";
import { findUserByTag } from "../../repositories/user.repository";

const LoginBody = Type.Object({
  tag: Type.String(),
});

export async function userRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get("/register", renderRegister);
  app.post("/register", create);
  app.post(
    "/login",
    { schema: { body: LoginBody } },
    async (request, reply) => {
      const { tag } = request.body;
      const user = await findUserByTag(tag);
      if (!user) return reply.code(401).send({ error: "Unauthorized" });
      const token = fastify.issueUserToken(user);
      return { token };
    },
  );

  app.get("/me", { preHandler: fastify.authorize }, async (request) => {
    return { user: request.user };
  });
}
