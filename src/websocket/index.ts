import fastifyIO from "fastify-socket.io";
import type { FastifyInstance } from "fastify";
import { Socket, type DefaultEventsMap } from "socket.io";
import { ManagedSocket } from "./managed-socket";
import { extractLowestLevelDomain } from "../helpers/extractLowestLevelDomain";
import { findSiteByName } from "../repositories/site.repository";
import assert from "node:assert";
import type { Site } from "../repositories/site.repository";

export type SiteSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { site: Site }
> & { readonly __brand: unique symbol };

export function assertSiteSocket(socket: Socket): asserts socket is SiteSocket {
  assert(socket.data.site);
}

export async function initFastifySocket(fastify: FastifyInstance) {
  await fastify.register(fastifyIO, {
    cors: { origin: "*" },
    path: "/wio-socket/",
  });

  // Middleware to extract and validate site before connection
  fastify.io.use(async (socket, next) => {
    const host = socket.handshake.headers.host;
    assert(host);

    const siteId = extractLowestLevelDomain(host);
    assert(siteId);

    socket.data.site = await findSiteByName(siteId);

    next();
  });

  fastify.io.on("connection", (socket: Socket) => {
    assertSiteSocket(socket);

    const managedSocket = new ManagedSocket(socket, fastify.io, fastify.log);

    // Hook the managed socket up to the socket event pipeline.
    managedSocket.joinAndAnnounce();
    socket.onAny((event, data) => managedSocket.broadcast(event, data));
    socket.on("disconnecting", () => managedSocket.leaveAndAnnounce());
  });
}
