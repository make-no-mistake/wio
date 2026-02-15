/* global io */
/**
 * Wio WebSocket API
 * Handles real-time communication via Socket.IO
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WioWebSocket {
  constructor(siteId) {
    this.handlers = new Map();
    this.connectionHandlers = {
      connect: [],
      disconnect: [],
      reconnect: [],
      error: [],
    };

    this._initSocket(siteId);
  }

  _initSocket(siteId) {
    this.socket = io({
      randomizationFactor: 0.5,
      path: "/wio-socket/",
      auth: {
        siteId: siteId,
      },
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
    this.socket.onAny((event, data) => {
      this._triggerEvent(event, data);
    });
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {function} callback - Handler function
   * @returns {WioWebSocket} this for chaining
   */
  on(event, callback) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(callback);
    return this;
  }

  /**
   * Remove an event handler
   * @param {string} event - Event name
   * @param {function} callback - Handler function to remove
   * @returns {WioWebSocket} this for chaining
   */
  off(event, callback) {
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
  onConnect(callback) {
    this.connectionHandlers.connect.push(callback);
    return this;
  }

  /**
   * Called when disconnected
   */
  onDisconnect(callback) {
    this.connectionHandlers.disconnect.push(callback);
    return this;
  }

  /**
   * Called after successful reconnection
   */
  onReconnect(callback) {
    this.connectionHandlers.reconnect.push(callback);
    return this;
  }

  /**
   * Called on connection error
   */
  onError(callback) {
    this.connectionHandlers.error.push(callback);
    return this;
  }

  /**
   * Emit an event to others in the room
   * @param {string} event - Event name
   * @param {*} data - Data to send
   * @returns {WioWebSocket} this for chaining
   */
  emit(event, data) {
    this.socket.emit(event, data);
    return this;
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    this.socket.disconnect();
  }

  /**
   * Get the current socket ID
   */
  get id() {
    return this.socket.id;
  }

  /**
   * Check if connected
   */
  get connected() {
    return this.socket.connected;
  }

  // Internal: trigger event handlers
  _triggerEvent(event, data) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach((h) => h(data));
  }

  // Internal: trigger connection handlers
  _trigger(type, data) {
    this.connectionHandlers[type].forEach((h) => h(data));
  }
}
