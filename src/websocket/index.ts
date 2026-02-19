import fastifyIO from "fastify-socket.io";
import type { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { RoomManager } from "./rooms";
import { extractLowestLevelDomain } from "../helpers/extractLowestLevelDomain";

export async function initFastifySocket(fastify: FastifyInstance) {
  await fastify.register(fastifyIO, {
    cors: { origin: "*" },
    path: "/wio-socket/",
  });

  fastify.ready((err) => {
    if (err) throw err;
    const io = fastify.io;

    // Middleware to extract and validate siteId before connection
    io.use((socket, next) => {
      const host = socket.handshake.headers.host;
      const siteId = extractLowestLevelDomain(host);

      if (!siteId) {
        return next(new Error("Could not extract siteId from host"));
      }

      socket.data.siteId = siteId;
      next();
    });

    io.on("connection", (socket: Socket) => {
      const siteId = socket.data.siteId as string;
      new RoomManager(io).handleConnection(siteId, socket);
    });
  });
}
