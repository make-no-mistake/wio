import { describe, expect, test, afterEach } from "bun:test";
import { WioCookieImpl } from "../../../src/sdk/cookies";

const originalFetch = globalThis.fetch;

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

function mockFetch(jsonResponse: unknown = {}) {
  const requestInfo = {
    url: "",
    body: "",
    headers: {} as Record<string, string>,
    method: "",
  };

  globalThis.fetch = (async (url: unknown, init: unknown) => {
    const requestInit = init as RequestInit | undefined;
    requestInfo.url = url as string;
    if (requestInit) {
      requestInfo.body = (requestInit.body as string) || "";
      requestInfo.headers =
        (requestInit.headers as Record<string, string>) || {};
      requestInfo.method = requestInit.method || "GET";
    }
    return {
      ok: true,
      json: async () => jsonResponse,
    };
  }) as unknown as typeof fetch;

  return requestInfo;
}

describe("cookies sdk - WioCookieImpl", () => {
  afterEach(() => {
    restoreFetch();
  });

  test("can be instantiated", () => {
    const cookies = new WioCookieImpl();
    expect(cookies).toBeDefined();
  });

  test("read() sends POST to /cookies/read and returns value", async () => {
    const requestInfo = mockFetch({ value: "session-abc" });
    const cookies = new WioCookieImpl();
    const result = await cookies.read({ name: "session" });

    expect(requestInfo.url).toBe("/cookies/read");
    expect(JSON.parse(requestInfo.body)).toEqual({ name: "session" });
    expect(result).toEqual({ value: "session-abc" });
  });

  test("read() returns null value for missing cookie", async () => {
    mockFetch({ value: null });
    const cookies = new WioCookieImpl();
    const result = await cookies.read({ name: "missing" });
    expect(result.value).toBeNull();
  });

  test("write() sends POST to /cookies/write", async () => {
    const requestInfo = mockFetch({});
    const cookies = new WioCookieImpl();
    const result = await cookies.write({ name: "token", value: "xyz" });

    expect(requestInfo.url).toBe("/cookies/write");
    expect(JSON.parse(requestInfo.body)).toEqual({
      name: "token",
      value: "xyz",
    });
    expect(result).toEqual({});
  });

  test("delete() sends POST to /cookies/delete", async () => {
    const requestInfo = mockFetch({});
    const cookies = new WioCookieImpl();
    const result = await cookies.delete({ name: "session" });

    expect(requestInfo.url).toBe("/cookies/delete");
    expect(JSON.parse(requestInfo.body)).toEqual({ name: "session" });
    expect(result).toEqual({});
  });

  test("read() sends Content-Type: application/json", async () => {
    const requestInfo = mockFetch({});
    const cookies = new WioCookieImpl();
    await cookies.read({ name: "x" });
    expect(requestInfo.headers["Content-Type"]).toBe("application/json");
  });

  test("write() sends Content-Type: application/json", async () => {
    const requestInfo = mockFetch({});
    const cookies = new WioCookieImpl();
    await cookies.write({ name: "x", value: "y" });
    expect(requestInfo.headers["Content-Type"]).toBe("application/json");
  });

  test("delete() sends Content-Type: application/json", async () => {
    const requestInfo = mockFetch({});
    const cookies = new WioCookieImpl();
    await cookies.delete({ name: "x" });
    expect(requestInfo.headers["Content-Type"]).toBe("application/json");
  });

  test("read() uses POST method", async () => {
    const requestInfo = mockFetch({});
    const cookies = new WioCookieImpl();
    await cookies.read({ name: "x" });
    expect(requestInfo.method).toBe("POST");
  });

  test("write() uses POST method", async () => {
    const requestInfo = mockFetch({});
    const cookies = new WioCookieImpl();
    await cookies.write({ name: "x", value: "y" });
    expect(requestInfo.method).toBe("POST");
  });

  test("delete() uses POST method", async () => {
    const requestInfo = mockFetch({});
    const cookies = new WioCookieImpl();
    await cookies.delete({ name: "x" });
    expect(requestInfo.method).toBe("POST");
  });
});
