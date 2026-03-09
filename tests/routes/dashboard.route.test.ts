import { describe, expect, test } from "bun:test";
import { createTestApp } from "../helpers";
import { createUser } from "../factories/user.factory";
import { createSite } from "../factories/site.factory";
import { createLog } from "../factories/log.factory";

Bun.env.JWT_SECRET ??= "test-secret";

async function authenticatedRequest(
  fastify: ReturnType<typeof import("fastify").default>,
  method: "GET" | "POST",
  url: string,
) {
  const user = await createUser();
  const site = await createSite({ owner_id: user.id });
  await createLog({ siteId: site.id, msg: "incoming request" });

  const loginResponse = await fastify.inject({
    method: "POST",
    url: "/login",
    payload: { tag: user.tag },
  });
  const { token } = loginResponse.json() as { token: string };

  const response = await fastify.inject({
    method,
    url,
    headers: { authorization: `Bearer ${token}` },
  });

  return { response, user, site };
}

describe("Dashboard Routes", () => {
  test("GET /dashboard redirects to /login without auth", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/dashboard",
      headers: { accept: "text/html" },
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/login?returnTo=/dashboard");

    await fastify.close();
  });

  test("GET /dashboard renders for authenticated user", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const { response } = await authenticatedRequest(
      fastify,
      "GET",
      "/dashboard",
    );

    expect(response.statusCode).toBe(200);

    await fastify.close();
  });

  test("GET /api/metrics/overview returns metrics", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const { response } = await authenticatedRequest(
      fastify,
      "GET",
      "/api/metrics/overview",
    );

    expect(response.statusCode).toBe(200);
    const body = response.json() as { totalEvents: number };
    expect(body.totalEvents).toBeGreaterThanOrEqual(0);

    await fastify.close();
  });

  test("GET /api/metrics/overview returns zeros for user with no sites", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    const { token } = loginResponse.json() as { token: string };

    const response = await fastify.inject({
      method: "GET",
      url: "/api/metrics/overview",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { totalEvents: number };
    expect(body.totalEvents).toBe(0);

    await fastify.close();
  });

  test("GET /api/metrics/:siteId returns metrics for owned site", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    const ownedSite = await createSite({ owner_id: user.id });
    await createLog({ siteId: ownedSite.id, msg: "test" });

    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    const { token } = loginResponse.json() as { token: string };

    const metricsResponse = await fastify.inject({
      method: "GET",
      url: `/api/metrics/${ownedSite.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(metricsResponse.statusCode).toBe(200);
    const body = metricsResponse.json() as { siteId: number };
    expect(body.siteId).toBe(ownedSite.id);

    await fastify.close();
  });

  test("GET /api/metrics/:siteId returns 403 for unowned site", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    const otherUser = await createUser();
    const otherSite = await createSite({ owner_id: otherUser.id });

    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    const { token } = loginResponse.json() as { token: string };

    const response = await fastify.inject({
      method: "GET",
      url: `/api/metrics/${otherSite.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);

    await fastify.close();
  });

  test("GET /api/metrics/traffic/overview returns traffic data", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const { response } = await authenticatedRequest(
      fastify,
      "GET",
      "/api/metrics/traffic/overview",
    );

    expect(response.statusCode).toBe(200);
    const body = response.json() as { statusCodes: unknown[] };
    expect(body.statusCodes).toBeDefined();

    await fastify.close();
  });

  test("GET /api/metrics/traffic/:siteId returns traffic for owned site", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    const site = await createSite({ owner_id: user.id });
    await createLog({
      siteId: site.id,
      msg: "request completed",
      statusCode: 200,
    });

    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    const { token } = loginResponse.json() as { token: string };

    const response = await fastify.inject({
      method: "GET",
      url: `/api/metrics/traffic/${site.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);

    await fastify.close();
  });

  test("GET /api/metrics/traffic/:siteId returns 403 for unowned site", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    const otherUser = await createUser();
    const otherSite = await createSite({ owner_id: otherUser.id });

    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    const { token } = loginResponse.json() as { token: string };

    const response = await fastify.inject({
      method: "GET",
      url: `/api/metrics/traffic/${otherSite.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);

    await fastify.close();
  });

  test("GET /api/metrics/events/overview returns events", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const { response } = await authenticatedRequest(
      fastify,
      "GET",
      "/api/metrics/events/overview",
    );

    expect(response.statusCode).toBe(200);
    const body = response.json() as { events: unknown[] };
    expect(body.events).toBeDefined();

    await fastify.close();
  });

  test("GET /api/metrics/events/:siteId returns events for owned site", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    const site = await createSite({ owner_id: user.id });
    await createLog({ siteId: site.id });

    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    const { token } = loginResponse.json() as { token: string };

    const response = await fastify.inject({
      method: "GET",
      url: `/api/metrics/events/${site.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { events: unknown[] };
    expect(body.events).toBeDefined();

    await fastify.close();
  });

  test("GET /api/metrics/events/:siteId returns 403 for unowned site", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    const otherUser = await createUser();
    const otherSite = await createSite({ owner_id: otherUser.id });

    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    const { token } = loginResponse.json() as { token: string };

    const response = await fastify.inject({
      method: "GET",
      url: `/api/metrics/events/${otherSite.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);

    await fastify.close();
  });

  test("GET /api/metrics/events/overview with type filter", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    const site = await createSite({ owner_id: user.id });
    await createLog({ siteId: site.id, msg: "incoming request" });

    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    const { token } = loginResponse.json() as { token: string };

    const response = await fastify.inject({
      method: "GET",
      url: "/api/metrics/events/overview?type=api&page=1",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);

    await fastify.close();
  });
});
