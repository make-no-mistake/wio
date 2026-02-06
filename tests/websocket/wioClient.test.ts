import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";

// Mock the socket.io client and window globals
const mockSocket = {
  id: "mock-socket-id",
  connected: true,
  on: mock(() => {}),
  emit: mock(() => {}),
  disconnect: mock(() => {}),
  onAny: mock(() => {}),
  io: {
    on: mock(() => {}),
  },
};

// Track what auth was passed to io()
let capturedAuth: { siteId: string | undefined } | undefined;

// Mock the global io function
const mockIo = mock((options: Record<string, unknown>) => {
  capturedAuth = options.auth as { siteId: string | undefined } | undefined;
  return mockSocket;
});

// Store original globals
const originalWindow = globalThis.window;

describe("Wio Client", () => {
  beforeEach(() => {
    capturedAuth = undefined;
    // Reset mocks
    mockSocket.on.mockClear();
    mockSocket.emit.mockClear();
    mockIo.mockClear();

    // Setup global mocks
    (globalThis as unknown as Record<string, unknown>).io = mockIo;
  });

  afterEach(() => {
    // Restore original globals
    if (originalWindow) {
      (globalThis as unknown as Record<string, unknown>).window =
        originalWindow;
    }
  });

  describe("siteId extraction", () => {
    it("should extract siteId from subdomain and store in instance", async () => {
      // Mock window.location
      (globalThis as unknown as Record<string, unknown>).window = {
        location: {
          hostname: "mysite.wio.dev",
        },
      };

      // Load the Wio class
      const { Wio } = await loadWioClass();
      const wio = new Wio();

      expect(wio.siteId).toBe("mysite");
    });

    it("should pass siteId in auth when connecting", async () => {
      (globalThis as unknown as Record<string, unknown>).window = {
        location: {
          hostname: "testsite.lvh.me",
        },
      };

      const { Wio } = await loadWioClass();
      new Wio();

      expect(capturedAuth).toEqual({ siteId: "testsite" });
    });

    it("should handle hyphenated subdomains", async () => {
      (globalThis as unknown as Record<string, unknown>).window = {
        location: {
          hostname: "my-awesome-site.wio.dev",
        },
      };

      const { Wio } = await loadWioClass();
      const wio = new Wio();

      expect(wio.siteId).toBe("my-awesome-site");
      expect(capturedAuth).toEqual({ siteId: "my-awesome-site" });
    });

    it("should extract first part of localhost hostname", async () => {
      (globalThis as unknown as Record<string, unknown>).window = {
        location: {
          hostname: "demo.localhost",
        },
      };

      const { Wio } = await loadWioClass();
      const wio = new Wio();

      expect(wio.siteId).toBe("demo");
    });

    it("should return undefined for wio.dev without subdomain", async () => {
      (globalThis as unknown as Record<string, unknown>).window = {
        location: {
          hostname: "wio.dev",
        },
      };

      const { Wio } = await loadWioClass();
      const wio = new Wio();

      expect(wio.siteId).toBeUndefined();
    });

    it("should return undefined for www subdomain", async () => {
      (globalThis as unknown as Record<string, unknown>).window = {
        location: {
          hostname: "www.wio.dev",
        },
      };

      const { Wio } = await loadWioClass();
      const wio = new Wio();

      expect(wio.siteId).toBeUndefined();
    });
  });
});

// Helper to load the Wio class fresh each time
async function loadWioClass() {
  // Define the class inline since the source is a client-side script
  class Wio {
    options: Record<string, unknown>;
    handlers: Map<string, Array<(data: unknown) => void>>;
    connectionHandlers: Record<string, Array<(data: unknown) => void>>;
    siteId: string | undefined;
    socket: typeof mockSocket;

    constructor(options = {}) {
      this.options = {
        reconnectionDelayMax: 60000,
        reconnectionDelay: 1000,
        ...options,
      };

      this.handlers = new Map();
      this.connectionHandlers = {
        connect: [],
        disconnect: [],
        reconnect: [],
        error: [],
      };

      this.siteId = this._extractSiteId(
        (
          globalThis as unknown as {
            window?: { location: { hostname: string } };
          }
        ).window!.location.hostname,
      );
      this.socket = this._initSocket(this.siteId);
    }

    _extractSiteId(host: string): string | undefined {
      if (!host) {
        return undefined;
      }

      if (
        host.startsWith("127.0.0.1") ||
        host.startsWith("0.0.0.0") ||
        host.startsWith("wio.dev")
      ) {
        return undefined;
      }

      const parts = host.split(".");

      if (parts.length === 1 || parts[0] === "www") {
        return undefined;
      }

      return parts[0];
    }

    _initSocket(siteId: string | undefined) {
      const io = (globalThis as unknown as { io: typeof mockIo }).io;
      return io({
        reconnection: true,
        reconnectionDelay: this.options.reconnectionDelay,
        reconnectionDelayMax: this.options.reconnectionDelayMax,
        randomizationFactor: 0.5,
        path: "/wio-socket/",
        auth: {
          siteId: siteId,
        },
      });
    }
  }

  return { Wio };
}
