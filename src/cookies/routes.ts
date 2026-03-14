import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";

const cookieWriteBody = Type.Object({
  name: Type.String(),
  value: Type.String(),
});
const cookieReadBody = Type.Object({
  name: Type.String(),
});
const cookieDeleteBody = cookieReadBody;

function getSiteCookieName(siteName: string, cookieName: string) {
  return `${siteName}-${cookieName}`;
}

export async function cookieRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.post("/read", { schema: { body: cookieReadBody } }, async (request) => {
    const value =
      request.cookies[
        getSiteCookieName(request.site!.name, request.body.name)
      ] ?? null;
    return { value };
  });

  app.post(
    "/write",
    { schema: { body: cookieWriteBody } },
    async (request, reply) => {
      reply.setCookie(
        getSiteCookieName(request.site!.name, request.body.name),
        request.body.value,
        {
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          sameSite: "lax",
        },
      );

      return {};
    },
  );

  app.post(
    "/delete",
    { schema: { body: cookieDeleteBody } },
    async (request, reply) => {
      reply.clearCookie(
        getSiteCookieName(request.site!.name, request.body.name),
        {
          path: "/",
          sameSite: "lax",
        },
      );

      return {};
    },
  );
}
