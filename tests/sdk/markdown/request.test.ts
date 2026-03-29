import { afterEach, describe, expect, test } from "bun:test";
import { request } from "../../../src/sdk/markdown/request";

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

describe("markdown request", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns HTML on success", async () => {
    // NOTE: This should be transformed into an E2E test
    mockFetchWith({
      ok: true,
      json: async () => ({ html: "<h1>Hello</h1>" }),
    } as Response);

    const result = await request({ markdown: "# Hello" });
    expect(result).toBe("<h1>Hello</h1>");
  });

  test("throws error message from server on failure", async () => {
    mockFetchWith({
      ok: false,
      status: 400,
      json: async () => ({ html: "", error: "Invalid markdown" }),
    } as Response);

    await expect(request({ markdown: "" })).rejects.toThrow("Invalid markdown");
  });

  test("throws default error when no error field in response", async () => {
    mockFetchWith({
      ok: false,
      status: 502,
      json: async () => ({ html: "" }),
    } as Response);

    await expect(request({ markdown: "test" })).rejects.toThrow(
      "Markdown request failed (502)",
    );
  });

  test("sends POST to /markdown endpoint", async () => {
    let capturedUrl = "";
    let capturedMethod = "";

    mockFetch(async (url, init) => {
      capturedUrl = url as string;
      capturedMethod = (init as RequestInit).method!;
      return {
        ok: true,
        json: async () => ({ html: "<p>ok</p>" }),
      } as Response;
    });

    await request({ markdown: "ok" });
    expect(capturedUrl).toBe("/markdown");
    expect(capturedMethod).toBe("POST");
  });

  test("sends markdown in JSON body", async () => {
    let capturedBody = "";

    mockFetch(async (_url, init) => {
      capturedBody = (init as RequestInit).body as string;
      return {
        ok: true,
        json: async () => ({ html: "<p>test</p>" }),
      } as Response;
    });

    await request({ markdown: "## Test" });
    expect(JSON.parse(capturedBody)).toEqual({ markdown: "## Test" });
  });
});
