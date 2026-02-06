import { describe, expect, it, mock, beforeEach } from "bun:test";
import { RoomManager } from "../../src/websocket/rooms";
import type { Server, Socket } from "socket.io";

function createMockSocket(id: string) {
  return {
    id,
    data: {},
    join: mock(() => {}),
    leave: mock(() => {}),
    to: mock(() => ({ emit: mock(() => {}) })),
  } as unknown as Socket;
}

describe("RoomManager", () => {
  let roomManager: RoomManager;
  let mockIo: Server;

  beforeEach(() => {
    mockIo = {
      to: mock(() => ({ emit: mock(() => {}) })),
      sockets: {
        adapter: {
          rooms: new Map(),
        },
      },
    } as unknown as Server;
    roomManager = new RoomManager(mockIo);
  });

  describe("join", () => {
    it("should add socket to site room", () => {
      const mockSocket = createMockSocket("socket-123");

      roomManager.join("test-site", mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith("site:test-site");
    });

    it("should emit user-joined event to room", () => {
      const mockSocket = createMockSocket("socket-123");

      roomManager.join("test-site", mockSocket);

      expect(mockIo.to).toHaveBeenCalledWith("site:test-site");
    });
  });

  describe("leave", () => {
    it("should remove socket from room", () => {
      const mockSocket = createMockSocket("socket-123");

      roomManager.join("test-site", mockSocket);
      roomManager.leave("test-site", mockSocket);

      expect(mockSocket.leave).toHaveBeenCalledWith("site:test-site");
    });
  });

  describe("broadcast", () => {
    it("should broadcast event to room excluding sender", () => {
      const emitMock = mock(() => {});
      const mockSocket = {
        id: "socket-123",
        data: {},
        to: mock(() => ({ emit: emitMock })),
      } as unknown as Socket;

      roomManager.broadcast("test-site", mockSocket, "chat", { text: "hello" });

      expect(mockSocket.to).toHaveBeenCalledWith("site:test-site");
      expect(emitMock).toHaveBeenCalledWith("chat", { text: "hello" });
    });
  });

  describe("getRoomName", () => {
    it("should prefix room name with site:", () => {
      const roomName = roomManager["getRoomName"]("my-site");
      expect(roomName).toBe("site:my-site");
    });
  });

  describe("getRoomSize", () => {
    it("should return correct number of connected clients", () => {
      const siteId = "my-site";
      const roomName = "site:my-site";

      const roomsMap = mockIo.sockets.adapter.rooms;
      roomsMap.set(roomName, new Set(["socket-1", "socket-2"]));

      const size = roomManager.getRoomSize(siteId);
      expect(size).toBe(2);
    });

    it("should return 0 if room does not exist", () => {
      const size = roomManager.getRoomSize("non-existent-site");
      expect(size).toBe(0);
    });
  });
});
