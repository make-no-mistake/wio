import { describe, expect, test } from "bun:test";
import { createTestApp } from "../helpers";

describe("GET /marketplace", () => {
  test("returns 200 with HTML", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/html/);

    await fastify.close();
  });
  test("renders seeded sites in marketplace cards", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/html/);

    const seededSites = ["cat", "chat", "cli_simulator", "prompt_maker"];
    for (const siteName of seededSites) {
      expect(response.body).toContain(
        `<span class="marketplace-card-name">${siteName}</span>`,
      );
    }

    await fastify.close();
  });

  test("renders seeded site links in the generated HTML", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('href="http://cat.localhost:80"');
    expect(response.body).toContain('href="http://chat.localhost:80"');

    await fastify.close();
  });
});
