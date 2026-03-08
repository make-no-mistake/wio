import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyError,
  FastifyReply,
} from "fastify";
import type { User } from "../repositories/user.repository";
import { findUserByTag } from "../repositories/user.repository";
import { SESSION_COOKIE_NAME } from "../config/auth";

async function authorization(fastify: FastifyInstance) {
  const secret = Bun.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  await fastify.register(jwt, {
    secret,
    decoratorName: "user_tag",
    cookie: { cookieName: SESSION_COOKIE_NAME },
  });

  fastify.decorateRequest("currentUser", null);
  fastify.decorate("authorize", authorize);
  fastify.decorate("issueUserToken", issueUserToken);

  fastify.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      if (
        error.statusCode === 401 &&
        request.headers.accept?.includes("text/html")
      ) {
        return reply.redirect("/login");
      }
      return reply.send(error);
    },
  );

  async function authorize(req: FastifyRequest) {
    const payload = await req.jwtVerify<{ tag: string }>();
    const user = await findUserByTag(payload.tag);
    if (!user) throw fastify.httpErrors.unauthorized();
    req.currentUser = user;
  }

  function issueUserToken(user: User) {
    return fastify.jwt.sign({ tag: user.tag });
  }
}

export default fp(authorization, { name: "auth" });
