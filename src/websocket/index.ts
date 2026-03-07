import fastifyIO from "fastify-socket.io";
import type { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { RoomManager } from "./rooms";
import { extractLowestLevelDomain } from "../helpers/extractLowestLevelDomain";
import { findSiteByName } from "../repositories/site.repository";

export async function initFastifySocket(fastify: FastifyInstance) {
  await fastify.register(fastifyIO, {
    cors: { origin: "*" },
    path: "/wio-socket/",
  });

  fastify.ready((err) => {
    if (err) throw err;
    const io = fastify.io;

    // Middleware to extract and validate siteId before connection
    io.use(async (socket, next) => {
      const host = socket.handshake.headers.host;
      const siteId = extractLowestLevelDomain(host);

      if (!siteId) {
        return next(new Error("Could not extract siteId from host"));
      }

      socket.data.siteId = siteId;

      try {
        const site = await findSiteByName(siteId);
        if (site) {
          socket.data.siteNumericId = site.id;
        }

        next();
      } catch (e) {
        next(e as Error);
      }
    });

    const roomManager = new RoomManager(io, fastify.log);

    io.on("connection", (socket: Socket) => {
      const siteId = socket.data.siteId as string;
      const siteNumericId = socket.data.siteNumericId as number | undefined;

      if (siteNumericId) {
        fastify.log.info({
          event: "ws_connect",
          socketId: socket.id,
          siteId: siteNumericId,
        });
      }

      roomManager.handleConnection(siteId, socket, siteNumericId);
    });
  });
}
