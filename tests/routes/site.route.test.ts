import { describe, expect, test } from "bun:test";
import { createUser } from "../factories/user.factory";
import { createSite } from "../factories/site.factory";
import { createTestApp } from "../helpers";

async function loginAs(
  fastify: Awaited<ReturnType<typeof createTestApp>>,
  tag: string,
): Promise<string> {
  const res = await fastify.inject({
    method: "POST",
    url: "/login",
    payload: { tag },
  });
  return (res.json() as { token: string }).token;
}

// ---------------------------------------------------------------------------
// POST /api/site  (push)
// ---------------------------------------------------------------------------

describe("POST /api/site", () => {
  test("returns 401 without a token", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "POST",
      url: "/api/site",
    });

    expect(response.statusCode).toBe(401);

    await fastify.close();
  });
});

// ---------------------------------------------------------------------------
// GET /api/sites  (list)
// ---------------------------------------------------------------------------

describe("GET /api/sites", () => {
  test("returns 401 without a token", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({ method: "GET", url: "/api/sites" });

    expect(response.statusCode).toBe(401);

    await fastify.close();
  });

  test("returns an array for authenticated user", async () => {
    const fastify = await createTestApp();
    const user = await createUser();
    if (!user) throw new Error("Failed to create user");

    const token = await loginAs(fastify, user.tag);

    const response = await fastify.inject({
      method: "GET",
      url: "/api/sites",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.json())).toBe(true);

    await fastify.close();
  });

  test("only returns sites owned by the authenticated user", async () => {
    const fastify = await createTestApp();
    const user = await createUser();
    const other = await createUser();
    if (!user || !other) throw new Error("Failed to create users");

    await createSite({ name: "list-mine", owner_id: user.id });
    await createSite({ name: "list-theirs", owner_id: other.id });

    const token = await loginAs(fastify, user.tag);

    const response = await fastify.inject({
      method: "GET",
      url: "/api/sites",
      headers: { authorization: `Bearer ${token}` },
    });

    const names = (response.json() as { name: string }[]).map((s) => s.name);
    expect(names).toContain("list-mine");
    expect(names).not.toContain("list-theirs");

    await fastify.close();
  });

  test("each entry has the expected shape", async () => {
    const fastify = await createTestApp();
    const user = await createUser();
    if (!user) throw new Error("Failed to create user");

    await createSite({ name: "list-shape", owner_id: user.id });
    const token = await loginAs(fastify, user.tag);

    const response = await fastify.inject({
      method: "GET",
      url: "/api/sites",
      headers: { authorization: `Bearer ${token}` },
    });

    const sites = response.json() as {
      name: string;
      url: string;
    }[];
    const site = sites.find((s) => s.name === "list-shape");

    expect(site).toBeDefined();
    expect(site!.url).toBe("https://list-shape.wio.onl");

    await fastify.close();
  });

  test("returns empty array for user with no sites", async () => {
    const fastify = await createTestApp();
    const user = await createUser();
    if (!user) throw new Error("Failed to create user");

    const token = await loginAs(fastify, user.tag);

    const response = await fastify.inject({
      method: "GET",
      url: "/api/sites",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);

    await fastify.close();
  });
});
