import type {
  WioCookiePayload,
  WioCookieWritePayload,
  WioCookieReadResponse,
  WioCookieResponse,
} from "./payload";

export interface WioCookies {
  read(payload: WioCookiePayload): Promise<WioCookieReadResponse>;
  write(payload: WioCookieWritePayload): Promise<WioCookieResponse>;
  delete(payload: WioCookiePayload): Promise<WioCookieResponse>;
}

const COOKIE_PATH = "/cookies";

export class WioCookieImpl implements WioCookies {
  async read(payload: WioCookiePayload): Promise<WioCookieReadResponse> {
    const res = await fetch(`${COOKIE_PATH}/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.json();
  }

  async write(payload: WioCookieWritePayload): Promise<WioCookieResponse> {
    const res = await fetch(`${COOKIE_PATH}/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.json();
  }

  async delete(payload: WioCookiePayload): Promise<WioCookieResponse> {
    const res = await fetch(`${COOKIE_PATH}/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }
}
