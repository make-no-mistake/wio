import { describe, expect, test } from "bun:test";
import { createTestApp } from "../helpers";

describe("Error Handler", () => {
  test("GET unknown JSON route returns a 404 payload", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/does-not-exist",
      headers: { accept: "application/json" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: "Not Found",
      message: "Not Found",
      statusCode: 404,
    });

    await fastify.close();
  });

  test("GET unknown HTML route renders the 404 page", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/does-not-exist",
      headers: { accept: "text/html" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.body).toContain("<title>404");
    expect(response.body).toContain("Page Not Found");

    await fastify.close();
  });
});
