import { afterEach, describe, expect, test } from "bun:test";
import { request } from "../../../src/sdk/ai/request";
import type { PromptPayload } from "../../../src/sdk/ai/payload";

const originalFetch = globalThis.fetch;

function mockFetch(
  handler: (
    url: unknown,
    init: unknown,
  ) => Partial<Response> | Promise<Partial<Response>>,
) {
  globalThis.fetch = handler as typeof fetch;
}

function mockFetchWith(response: Partial<Response>) {
  mockFetch(async () => response);
}

describe("ai request", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns response text on success", async () => {
    mockFetchWith({
      ok: true,
      json: async () => ({ response: "Hello from AI" }),
    } as Response);

    const result = await request({ prompt: "test" });
    expect(result).toBe("Hello from AI");
  });

  test("throws error message from server on failure", async () => {
    mockFetchWith({
      ok: false,
      status: 400,
      json: async () => ({ error: "Bad prompt" }),
    } as Response);

    await expect(request({ prompt: "bad" })).rejects.toThrow("Bad prompt");
  });

  test("throws default error when JSON parsing fails", async () => {
    mockFetchWith({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("parse error");
      },
    } as Response);

    await expect(request({ prompt: "fail" })).rejects.toThrow(
      "LLM request failed (500)",
    );
  });

  test("sends correct payload shape", async () => {
    let capturedBody = "";

    mockFetch(async (_url, init) => {
      capturedBody = (init as RequestInit).body as string;
      return {
        ok: true,
        json: async () => ({ response: "ok" }),
      } as Response;
    });

    await request({ prompt: "What is 2+2?" });
    const parsed = JSON.parse(capturedBody) as PromptPayload;
    expect(parsed).toEqual({ prompt: "What is 2+2?" });
  });

  test("sends POST request to /llm/prompt", async () => {
    let capturedUrl = "";
    let capturedMethod = "";

    mockFetch(async (url, init) => {
      capturedUrl = url as string;
      capturedMethod = (init as RequestInit).method!;
      return {
        ok: true,
        json: async () => ({ response: "ok" }),
      } as Response;
    });

    await request({ prompt: "test" });
    expect(capturedUrl).toBe("/llm/prompt");
    expect(capturedMethod).toBe("POST");
  });
});
