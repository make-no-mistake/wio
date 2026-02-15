/* global window, WioWebSocket */
/**
 * Wio Client SDK
 */
class Wio {
  constructor() {
    this.siteId = this._extractSiteId(window.location.hostname);
    this.ws = new WioWebSocket(this.siteId);
  }

  /**
   * Duplicated helper because it can't be exported to wio.js
   */
  _extractSiteId(host) {
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
}

// Export for use
window.Wio = Wio;
