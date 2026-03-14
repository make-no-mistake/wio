export interface WioCookiePayload {
  name: string;
}

export interface WioCookieWritePayload {
  name: string;
  value: string;
}

export interface WioCookieReadResponse {
  value: string | null;
  error?: string;
}

export interface WioCookieResponse {
  error?: string;
}
