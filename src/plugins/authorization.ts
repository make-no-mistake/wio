import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyRequest } from "fastify";
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

  fastify.decorateRequest("user", null);
  fastify.decorate("authorize", authorize);
  fastify.decorate("issueUserToken", issueUserToken);

  async function authorize(req: FastifyRequest) {
    const payload = await req.jwtVerify<{ tag: string }>();
    const user = await findUserByTag(payload.tag);
    req.user = user;
  }

  function issueUserToken(user: User) {
    return fastify.jwt.sign({ tag: user.tag });
  }
}

export default fp(authorization, { name: "auth" });
