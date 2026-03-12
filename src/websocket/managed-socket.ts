import type { Server } from "socket.io";
import type { FastifyBaseLogger } from "fastify";
import type { SiteSocket } from "./index";
import assert from "node:assert";

type RoomName = `site:${number}`;
type JoinLeaveAnnouncement = { connectedCount: number; socketId: string };

export class ManagedSocket {
  constructor(
    private socket: SiteSocket,
    private io: Server,
    private logger: FastifyBaseLogger,
  ) {}

  /**
   * Broadcasts a message to the entire room. Does not send the message to itself.
   */
  async broadcast(event: string, data: Record<string, unknown>): Promise<void> {
    await this.emit(event, data);
  }

  /**
   * Adds a socket to a room and broadcasts to the room that a socket has joined.
   */
  async joinAndAnnounce(): Promise<void> {
    await this.join();
    await this.emit("user-joined", this.getJoinLeaveAnnouncement());
  }

  /**
   * Removes a socket from a room and broadcasts to the room that a socket has left.
   */
  async leaveAndAnnounce(): Promise<void> {
    await this.leave();
    await this.emit("user-left", this.getJoinLeaveAnnouncement());
  }

  private getJoinLeaveAnnouncement(): JoinLeaveAnnouncement {
    return {
      connectedCount: this.getRoomSize(),
      socketId: this.socket.id,
    };
  }

  private getRoomName(): RoomName {
    return `site:${this.socket.data.site.id}`;
  }

  private getRoomSize(): number {
    const room = this.io.sockets.adapter.rooms.get(this.getRoomName());
    assert(room, `Room not found for site ${this.socket.data.site.id}`);

    return room.size;
  }

  private async join(): Promise<void> {
    await this.socket.join(this.getRoomName());
    this.log_ws_event("ws_join");
  }

  private async leave(): Promise<void> {
    await this.socket.leave(this.getRoomName());
    this.log_ws_event("ws_leave");
  }

  private async emit(
    event: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.socket.to(this.getRoomName()).emit(event, data);
    this.log_ws_event("ws_message", { wsEvent: event, data });
  }

  private log_ws_event(event: string, payload?: Record<string, unknown>): void {
    this.logger.info({
      event,
      socketId: this.socket.id,
      siteId: this.socket.data.site.id,
      ...payload,
    });
  }
}
