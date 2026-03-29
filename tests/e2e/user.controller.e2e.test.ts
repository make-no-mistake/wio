import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { createTestApp } from "../helpers";

Bun.env.JWT_SECRET ??= "test-secret";

describe("User Controller E2E", () => {
  let fastify: Awaited<ReturnType<typeof createTestApp>>;

  beforeEach(async () => {
    fastify = await createTestApp();
  });

  afterEach(async () => {
    await fastify.close();
  });

  test("POST /register creates a new user and returns 201 with tag", async () => {
    const res = await fastify.inject({
      method: "POST",
      url: "/register",
    });

    expect(res.statusCode).toBe(201);
    const body = res.json() as { tag: string };
    expect(body.tag).toBeDefined();
    expect(typeof body.tag).toBe("string");
    expect(body.tag.length).toBeGreaterThan(0);
  });

  test("POST /register returns different tags each time", async () => {
    const res1 = await fastify.inject({ method: "POST", url: "/register" });
    const res2 = await fastify.inject({ method: "POST", url: "/register" });

    const tag1 = (res1.json() as { tag: string }).tag;
    const tag2 = (res2.json() as { tag: string }).tag;

    expect(tag1).not.toBe(tag2);
  });

  test("GET /register renders the register page", async () => {
    const res = await fastify.inject({
      method: "GET",
      url: "/register",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("User tag");
  });

  test("GET /login renders the login page", async () => {
    const res = await fastify.inject({
      method: "GET",
      url: "/login",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("Log in"); // Added missing meaningful body assertion
  });

  test("POST /login authenticates a registered user and returns a token", async () => {
    const registerRes = await fastify.inject({
      method: "POST",
      url: "/register",
    });
    const { tag } = registerRes.json() as { tag: string };

    const loginRes = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag },
    });

    expect(loginRes.statusCode).toBe(200);
    const { token } = loginRes.json() as { token: string };
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  test("GET /me returns correct user data when accessed with valid token", async () => {
    const registerRes = await fastify.inject({
      method: "POST",
      url: "/register",
    });
    const { tag } = registerRes.json() as { tag: string };

    const loginRes = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag },
    });
    const { token } = loginRes.json() as { token: string };

    const meRes = await fastify.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(meRes.statusCode).toBe(200);
    const body = meRes.json() as { user: { tag: string } };
    expect(body.user.tag).toBe(tag);
  });
});
