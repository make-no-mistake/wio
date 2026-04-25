import { afterEach, describe, expect, test } from "bun:test";
import { playSound } from "@/sdk/play-sound";

const originalFetch = globalThis.fetch;

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

function mockFetchAndCapture() {
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedBody = "";
  const sounds: string[] = [];

  globalThis.fetch = (async (url: unknown, init: unknown) => {
    capturedUrl = url as string;
    capturedMethod = (init as RequestInit).method!;
    capturedBody = (init as RequestInit).body as string;
    if (capturedBody) {
      sounds.push(JSON.parse(capturedBody).sound);
    }
    return {
      ok: true,
      json: async () => ({}),
    };
  }) as unknown as typeof fetch;

  return {
    getCapturedUrl: () => capturedUrl,
    getCapturedMethod: () => capturedMethod,
    getCapturedBody: () => capturedBody,
    getSounds: () => sounds,
  };
}

describe("sdk play-sound - playSound()", () => {
  afterEach(() => {
    restoreFetch();
  });

  test("playSound is a function", () => {
    expect(typeof playSound).toBe("function");
  });

  test("playSound calls fetch with the sound name", async () => {
    const { getCapturedBody } = mockFetchAndCapture();

    await playSound("pop");
    expect(JSON.parse(getCapturedBody())).toEqual({ sound: "pop" });
  });

  test("playSound sends POST to /playsound", async () => {
    const { getCapturedUrl, getCapturedMethod } = mockFetchAndCapture();

    await playSound("notification");
    expect(getCapturedUrl()).toBe("/playsound");
    expect(getCapturedMethod()).toBe("POST");
  });

  test("playSound can be called with different sounds", async () => {
    const { getSounds } = mockFetchAndCapture();

    await playSound("click");
    await playSound("success");
    await playSound("error");

    expect(getSounds()).toEqual(["click", "success", "error"]);
  });
});
