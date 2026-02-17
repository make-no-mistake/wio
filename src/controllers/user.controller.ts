import crypto from "node:crypto";
import type { FastifyRequest, FastifyReply } from "fastify";
import { createUser } from "../repositories/user.repository";

export async function create(_: FastifyRequest, reply: FastifyReply) {
  let user;

  for (let i = 0; i < 4 && !user; i++) {
    user = await createUser(generateSixteenDigit());
  }

  if (!user) {
    return reply.code(422).send({ error: "Unable to create user" });
  }
  return reply.code(201).send({ unique_id: user.unique_id });
}

function generateSixteenDigit(): string {
  const range = 10n ** 16n;
  const offset = 10n ** 15n;

  const buf = crypto.randomBytes(8);
  const rand = buf.readBigUInt64BE();

  return ((rand % range) + offset).toString();
}
