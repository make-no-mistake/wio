import type { Server, Socket } from "socket.io";

export class RoomManager {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  handleConnection(siteId: string, socket: Socket) {
    this.join(siteId, socket);

    socket.onAny((event: string, data: unknown) => {
      this.broadcast(siteId, socket, event, data);
    });

    socket.on("disconnecting", () => {
      this.leave(siteId, socket);
    });
  }

  private getRoomName(siteId: string): string {
    return `site:${siteId}`;
  }

  join(siteId: string, socket: Socket): void {
    const room = this.getRoomName(siteId);
    socket.join(room);

    socket.to(room).emit("user-joined", {
      connectedCount: this.getRoomSize(siteId),
      socketId: socket.id,
    });
  }

  leave(siteId: string, socket: Socket): void {
    const room = this.getRoomName(siteId);

    socket.leave(room);
    socket.to(room).emit("user-left", {
      connectedCount: this.getRoomSize(siteId),
      socketId: socket.id,
    });
  }

  broadcast(
    siteId: string,
    sender: Socket,
    event: string,
    data: unknown,
  ): void {
    const room = this.getRoomName(siteId);
    // Broadcast to room, excluding sender (no echo)
    sender.to(room).emit(event, data);
  }

  getRoomSize(siteId: string): number {
    const room = this.io.sockets.adapter.rooms.get(this.getRoomName(siteId));
    return room?.size ?? 0;
  }
}
