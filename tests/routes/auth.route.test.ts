import { describe, expect, test } from "bun:test";
import { createUser } from "../factories/user.factory";
import { createTestApp } from "../helpers";

Bun.env.JWT_SECRET ??= "test-secret";

describe("Auth Routes", () => {
  test("POST /login returns 401 for unknown tag", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: "does-not-exist" },
    });

    expect(response.statusCode).toBe(401);

    await fastify.close();
  });

  test("POST /login returns a token for existing user", async () => {
    const fastify = await createTestApp();
    const user = await createUser();
    if (!user) throw new Error("Failed to create user for test");

    const response = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { token: string };
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);

    await fastify.close();
  });

  test("GET /me returns user when authorized", async () => {
    const fastify = await createTestApp();
    await fastify.ready();

    const user = await createUser();
    if (!user) throw new Error("Failed to create user for test");
    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/login",
      payload: { tag: user.tag },
    });
    expect(loginResponse.statusCode).toBe(200);
    const { token } = loginResponse.json() as { token: string };

    const response = await fastify.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { user: { tag: string } };
    expect(body.user.tag).toBe(user.tag);

    await fastify.close();
  });

  test("GET /me returns 401 without token", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/me",
    });

    expect(response.statusCode).toBe(401);

    await fastify.close();
  });
});
