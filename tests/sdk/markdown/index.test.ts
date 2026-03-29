import { afterEach, describe, expect, test } from "bun:test";
import { renderMarkdown } from "../../../src/sdk/markdown";

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

describe("sdk markdown - renderMarkdown()", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("renderMarkdown calls fetch and returns HTML", async () => {
    mockFetchResponse({
      ok: true,
      json: async () => ({ html: "<h1>Hello</h1>" }),
    });

    const result = await renderMarkdown("# Hello");
    expect(result).toBe("<h1>Hello</h1>");
  });

  test("renderMarkdown sends markdown in payload", async () => {
    let capturedBody = "";
    mockFetch(async (_url, init) => {
      capturedBody = (init as RequestInit).body as string;
      return {
        ok: true,
        json: async () => ({ html: "<p>ok</p>" }),
      };
    });

    await renderMarkdown("## Test");
    expect(JSON.parse(capturedBody)).toEqual({ markdown: "## Test" });
  });

  test("renderMarkdown throws on server error", async () => {
    mockFetchResponse({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    });

    await expect(renderMarkdown("test")).rejects.toThrow("Server error");
  });

  test("renderMarkdown sends POST to /markdown", async () => {
    let capturedUrl = "";
    let capturedMethod = "";

    mockFetch(async (url, init) => {
      capturedUrl = url as string;
      capturedMethod = (init as RequestInit).method!;
      return {
        ok: true,
        json: async () => ({ html: "<p>ok</p>" }),
      };
    });

    await renderMarkdown("test");
    expect(capturedUrl).toBe("/markdown");
    expect(capturedMethod).toBe("POST");
  });
});
