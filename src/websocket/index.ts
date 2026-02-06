import fastifyIO from "fastify-socket.io";
import type { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { RoomManager } from "./rooms";

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
      const siteId = socket.handshake.auth.siteId;

      if (!siteId) {
        return next(new Error("Invalid siteId"));
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
