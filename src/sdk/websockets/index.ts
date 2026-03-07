import { io, type Socket } from "socket.io-client";

type EventHandler = (data: unknown) => void;
type ConnectionType = "connect" | "disconnect" | "reconnect" | "error";

/**
 * Wio WebSocket API
 * Handles real-time communication via Socket.IO
 */
export class WioWebSocket {
  private handlers: Map<string, EventHandler[]>;
  private connectionHandlers: Record<ConnectionType, EventHandler[]>;
  private socket: Socket;

  constructor() {
    this.handlers = new Map();
    this.connectionHandlers = {
      connect: [],
      disconnect: [],
      reconnect: [],
      error: [],
    };

    this.socket = io({
      randomizationFactor: 0.5,
      path: "/wio-socket/",
    });

    this.socket.on("connect", () => {
      this._trigger("connect", { socketId: this.socket.id });
    });

    this.socket.on("disconnect", (reason) => {
      this._trigger("disconnect", { reason });
    });

    this.socket.io.on("reconnect", (attempt) => {
      this._trigger("reconnect", { attempt });
    });

    this.socket.on("connect_error", (error) => {
      this._trigger("error", { message: error.message });
    });

    // Forward all events to registered handlers
    this.socket.onAny((event: string, data: unknown) => {
      this._triggerEvent(event, data);
    });

    this.on("play-sound", (path) => {
      const audio = new Audio(path as string);
      void audio.play();
    });
  }

  /**
   * Register an event handler
   * @param event - Event name
   * @param callback - Handler function
   * @returns this for chaining
   */
  on(event: string, callback: EventHandler): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(callback);
    return this;
  }

  /**
   * Remove an event handler
   * @param event - Event name
   * @param callback - Handler function to remove
   * @returns this for chaining
   */
  off(event: string, callback: EventHandler): this {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) handlers.splice(index, 1);
    }
    return this;
  }

  /**
   * Called when connection is established
   */
  onConnect(callback: EventHandler): this {
    this.connectionHandlers.connect.push(callback);
    return this;
  }

  /**
   * Called when disconnected
   */
  onDisconnect(callback: EventHandler): this {
    this.connectionHandlers.disconnect.push(callback);
    return this;
  }

  /**
   * Called after successful reconnection
   */
  onReconnect(callback: EventHandler): this {
    this.connectionHandlers.reconnect.push(callback);
    return this;
  }

  /**
   * Called on connection error
   */
  onError(callback: EventHandler): this {
    this.connectionHandlers.error.push(callback);
    return this;
  }

  /**
   * Emit an event to others in the room
   * @param event - Event name
   * @param data - Data to send
   * @returns this for chaining
   */
  emit(event: string, data: unknown): this {
    this.socket.emit(event, data);
    return this;
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    this.socket.disconnect();
  }

  /**
   * Get the current socket ID
   */
  get id(): string | undefined {
    return this.socket.id;
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.socket.connected;
  }

  // Internal: trigger event handlers
  private _triggerEvent(event: string, data: unknown): void {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach((h) => h(data));
  }

  // Internal: trigger connection handlers
  private _trigger(type: ConnectionType, data: unknown): void {
    this.connectionHandlers[type].forEach((h) => h(data));
  }
}
