import type { FastifyInstance } from "fastify";
import { create } from "../../controllers/user.controller";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/register", create);
}
