import type { FastifyInstance } from "fastify";
import { create, renderRegister } from "../../controllers/user.controller";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/register", renderRegister);
  fastify.post("/register", create);
}
