import { afterEach, describe, expect, test } from "bun:test";
import { request } from "@/sdk/play-sound/request";

const originalFetch = globalThis.fetch;

function mockFetchWith(response: Partial<Response>) {
  globalThis.fetch = (async () => response) as typeof fetch;
}

function mockFetchAndCapture() {
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedBody = "";

  globalThis.fetch = (async (url: unknown, init: unknown) => {
    capturedUrl = url as string;
    capturedMethod = (init as RequestInit).method!;
    capturedBody = (init as RequestInit).body as string;
    return {
      ok: true,
      json: async () => ({}),
    } as Response;
  }) as typeof fetch;

  return {
    getCapturedUrl: () => capturedUrl,
    getCapturedMethod: () => capturedMethod,
    getCapturedBody: () => capturedBody,
  };
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

describe("play-sound request", () => {
  afterEach(() => {
    restoreFetch();
  });

  test("resolves without error on success", async () => {
    mockFetchWith({
      ok: true,
      json: async () => ({ sound: "pop" }),
    } as Response);

    await expect(request({ sound: "pop" })).resolves.toBeUndefined();
  });

  test("throws error message from server on failure", async () => {
    mockFetchWith({
      ok: false,
      status: 404,
      json: async () => ({ error: "Sound not found" }),
    } as Response);

    await expect(request({ sound: "nonexistent" })).rejects.toThrow(
      "Sound not found",
    );
  });

  test("throws default error when no error field in response", async () => {
    mockFetchWith({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(request({ sound: "broken" })).rejects.toThrow(
      "Play sound request failed (500)",
    );
  });

  test("sends POST to /playsound endpoint", async () => {
    const { getCapturedUrl, getCapturedMethod } = mockFetchAndCapture();

    await request({ sound: "chime" });
    expect(getCapturedUrl()).toBe("/playsound");
    expect(getCapturedMethod()).toBe("POST");
  });

  test("sends sound name in JSON body", async () => {
    const { getCapturedBody } = mockFetchAndCapture();

    await request({ sound: "notification" });
    expect(JSON.parse(getCapturedBody())).toEqual({ sound: "notification" });
  });
});
