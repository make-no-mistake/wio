import { describe, expect, it, mock } from "bun:test";
import type { Socket } from "socket.io";

// Middleware logic extracted for testing
function validateSiteIdAuth(
  socket: Pick<Socket, "handshake" | "data">,
  next: (err?: Error) => void,
) {
  const siteId = socket.handshake.auth.siteId;

  if (!siteId) {
    return next(new Error("Invalid siteId"));
  }

  socket.data.siteId = siteId;
  next();
}

function createMockSocket(auth: Record<string, unknown> = {}) {
  return {
    handshake: {
      auth,
    },
    data: {},
  } as Pick<Socket, "handshake" | "data">;
}

describe("Socket.IO Auth Middleware", () => {
  describe("siteId validation", () => {
    it("should accept connection when siteId is provided", () => {
      const socket = createMockSocket({ siteId: "my-site" });
      const next = mock(() => {});

      validateSiteIdAuth(socket, next);

      expect(next).toHaveBeenCalledWith();
      expect(socket.data.siteId).toBe("my-site");
    });

    it("should reject connection when siteId is missing", () => {
      const socket = createMockSocket({});
      const next = mock(() => {});

      validateSiteIdAuth(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should reject connection when siteId is empty string", () => {
      const socket = createMockSocket({ siteId: "" });
      const next = mock(() => {});

      validateSiteIdAuth(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should reject connection when siteId is undefined", () => {
      const socket = createMockSocket({ siteId: undefined });
      const next = mock(() => {});

      validateSiteIdAuth(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should store siteId in socket.data for later use", () => {
      const socket = createMockSocket({ siteId: "test-site-123" });
      const next = mock(() => {});

      validateSiteIdAuth(socket, next);

      expect(socket.data.siteId).toBe("test-site-123");
    });

    it("should handle hyphenated site IDs", () => {
      const socket = createMockSocket({ siteId: "my-awesome-site" });
      const next = mock(() => {});

      validateSiteIdAuth(socket, next);

      expect(next).toHaveBeenCalledWith();
      expect(socket.data.siteId).toBe("my-awesome-site");
    });
  });
});
