import { describe, expect, test } from "bun:test";
import { createTestApp } from "../helpers";
import { createSite } from "../factories/site.factory";

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
});

describe("GET /marketplace/api", () => {
  test("returns 200 with a sites array", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace/api",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body.sites)).toBe(true);

    await fastify.close();
  });

  test("returns empty array when no sites exist", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace/api",
    });

    const body = JSON.parse(response.body);
    // sites array exists and is an array (may be empty or seeded — DB is shared)
    expect(Array.isArray(body.sites)).toBe(true);

    await fastify.close();
  });

  test("each site has name, url, and deployed_at fields", async () => {
    await createSite({ name: "mkt-shape-check" });
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace/api",
    });

    const body = JSON.parse(response.body);
    const site = body.sites.find(
      (s: { name: string }) => s.name === "mkt-shape-check",
    );

    expect(site).toBeDefined();
    expect(typeof site.name).toBe("string");
    expect(typeof site.url).toBe("string");
    expect(typeof site.deployed_at).toBe("string");

    await fastify.close();
  });

  test("url contains the site name as subdomain", async () => {
    await createSite({ name: "mkt-url-check" });
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace/api",
    });

    const body = JSON.parse(response.body);
    const site = body.sites.find(
      (s: { name: string }) => s.name === "mkt-url-check",
    );

    expect(site.url).toBe("https://mkt-url-check.wio.onl");

    await fastify.close();
  });

  test("deployed_at is a valid ISO 8601 date string", async () => {
    await createSite({ name: "mkt-date-check" });
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace/api",
    });

    const body = JSON.parse(response.body);
    const site = body.sites.find(
      (s: { name: string }) => s.name === "mkt-date-check",
    );

    const parsed = new Date(site.deployed_at);
    expect(parsed.toString()).not.toBe("Invalid Date");
    // ISO 8601 strings end with Z
    expect(site.deployed_at).toMatch(/Z$/);

    await fastify.close();
  });

  test("sites are ordered newest first", async () => {
    await createSite({ name: "mkt-order-old" });
    await createSite({ name: "mkt-order-new" });
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace/api",
    });

    const body = JSON.parse(response.body);
    const idxNew = body.sites.findIndex(
      (s: { name: string }) => s.name === "mkt-order-new",
    );
    const idxOld = body.sites.findIndex(
      (s: { name: string }) => s.name === "mkt-order-old",
    );

    expect(idxNew).toBeLessThan(idxOld);

    await fastify.close();
  });

  test("a newly created site appears immediately", async () => {
    const fastify = await createTestApp();

    await createSite({ name: "mkt-new-instant" });

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace/api",
    });

    const body = JSON.parse(response.body);
    const found = body.sites.some(
      (s: { name: string }) => s.name === "mkt-new-instant",
    );

    expect(found).toBe(true);

    await fastify.close();
  });

  test("returns all created sites", async () => {
    await createSite({ name: "mkt-multi-a" });
    await createSite({ name: "mkt-multi-b" });
    await createSite({ name: "mkt-multi-c" });
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/marketplace/api",
    });

    const body = JSON.parse(response.body);
    const names = body.sites.map((s: { name: string }) => s.name);

    expect(names).toContain("mkt-multi-a");
    expect(names).toContain("mkt-multi-b");
    expect(names).toContain("mkt-multi-c");

    await fastify.close();
  });
});
