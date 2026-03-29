import { afterEach, describe, expect, test } from "bun:test";
import { ask } from "../../../src/sdk/ai";

const originalFetch = globalThis.fetch;

function mockFetch(
  handler: (
    url: unknown,
    init: unknown,
  ) => Partial<Response> | Promise<Partial<Response>>,
) {
  globalThis.fetch = handler as unknown as typeof fetch;
}

function mockFetchResponse(response: Partial<Response>) {
  mockFetch(async () => response);
}

describe("ai sdk - ask()", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("ask calls fetch and returns the response", async () => {
    mockFetchResponse({
      ok: true,
      json: async () => ({ response: "AI says hello" }),
    });

    const result = await ask("Hello");
    expect(result).toBe("AI says hello");
  });

  test("ask throws on server error", async () => {
    mockFetchResponse({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal error" }),
    });

    await expect(ask("test")).rejects.toThrow("Internal error");
  });

  test("ask throws default message when JSON parse fails", async () => {
    mockFetchResponse({
      ok: false,
      status: 503,
      json: async () => {
        throw new Error("bad json");
      },
    });

    await expect(ask("test")).rejects.toThrow("LLM request failed (503)");
  });

  test("ask sends prompt to /llm/prompt endpoint", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    mockFetch(async (url, init) => {
      capturedUrl = url as string;
      capturedBody = (init as RequestInit).body as string;
      return {
        ok: true,
        json: async () => ({ response: "ok" }),
      };
    });

    await ask("What is 2+2?");
    expect(capturedUrl).toBe("/llm/prompt");
    expect(JSON.parse(capturedBody)).toEqual({ prompt: "What is 2+2?" });
  });
});
