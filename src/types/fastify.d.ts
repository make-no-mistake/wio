import { Server } from "socket.io";
import type { User } from "../repositories/user.repository";
import type { Site } from "../repositories/site.repository";

declare module "fastify" {
  interface FastifyInstance {
    io: Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >;
    authorize: (req: FastifyRequest) => Promise<void>;
    issueUserToken: (user: User) => string;
  }
  interface FastifyRequest {
    user: User | null;
    site: Site | null;
  }
}
