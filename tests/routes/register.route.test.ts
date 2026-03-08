import { describe, expect, test } from "bun:test";
import { createTestApp } from "../helpers";

describe("GET /register", () => {
  test("renders the register page with correct content", async () => {
    const fastify = await createTestApp();

    const response = await fastify.inject({
      method: "GET",
      url: "/register",
    });

    expect(response.body).toContain("User tag");

    await fastify.close();
  });
});
