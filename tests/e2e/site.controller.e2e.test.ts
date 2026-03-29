import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { createTestApp } from "../helpers";
import { createUser } from "../factories/user.factory";
import { createSite } from "../factories/site.factory";
import { insertSiteFile } from "../../src/repositories/file.repository";
import {
  writeS3File,
  deleteS3File,
} from "../../src/repositories/s3.repository";
import { getS3Path } from "../../src/helpers/storage";

Bun.env.JWT_SECRET ??= "test-secret";

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

describe("E2E: Site controller - listSites", () => {
  let fastify: Awaited<ReturnType<typeof createTestApp>>;

  beforeEach(async () => {
    fastify = await createTestApp();
  });

  afterEach(async () => {
    await fastify.close();
  });

  test("GET /api/sites returns sites for authenticated user", async () => {
    const user = await createUser();
    await createSite({ name: `ctrl-list-a-${Date.now()}`, owner_id: user.id });
    await createSite({ name: `ctrl-list-b-${Date.now()}`, owner_id: user.id });

    const token = await loginAs(fastify, user.tag);

    const res = await fastify.inject({
      method: "GET",
      url: "/api/sites",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const sites = res.json() as { name: string; url: string }[];
    expect(sites.length).toBeGreaterThanOrEqual(2);
    sites.forEach((s) => {
      expect(s.url).toContain("https://");
      expect(s.url).toContain(".wio.onl");
    });
  });

  test("GET /api/sites returns correct URL structure", async () => {
    const user = await createUser();
    const name = `ctrl-url-${Date.now()}`;
    await createSite({ name, owner_id: user.id });

    const token = await loginAs(fastify, user.tag);

    const res = await fastify.inject({
      method: "GET",
      url: "/api/sites",
      headers: { authorization: `Bearer ${token}` },
    });

    const sites = res.json() as { name: string; url: string }[];
    const site = sites.find((s) => s.name === name);
    expect(site).toBeDefined();
    expect(site!.url).toBe(`https://${name}.wio.onl`);
  });
});

describe("E2E: Site controller - push", () => {
  let fastify: Awaited<ReturnType<typeof createTestApp>>;

  beforeEach(async () => {
    fastify = await createTestApp();
  });

  afterEach(async () => {
    await fastify.close();
  });

  test("POST /api/site returns 401 without auth", async () => {
    const res = await fastify.inject({
      method: "POST",
      url: "/api/site",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("E2E: Site asset serving", () => {
  let fastify: Awaited<ReturnType<typeof createTestApp>>;
  let createdS3Paths: string[] = [];

  beforeEach(async () => {
    fastify = await createTestApp();
  });

  afterEach(async () => {
    await fastify.close();
    for (const p of createdS3Paths) {
      await deleteS3File(p);
    }
    createdS3Paths = [];
  });

  test("GET /sites/:site/ serves index.html from S3", async () => {
    // Note: This test involves deep multi-layer integration with S3 mock methods in a controller test flow.
    const siteName = `ctrl-asset-idx-${Date.now()}`;
    const site = await createSite({ name: siteName });

    const s3Path = getS3Path(siteName, "index.html");
    const content = new TextEncoder().encode(
      "<html><body>Hello Wio!</body></html>",
    );
    await writeS3File(s3Path, content.buffer as ArrayBuffer);
    createdS3Paths.push(s3Path);
    await insertSiteFile(site.id, s3Path, "index.html");

    const res = await fastify.inject({
      method: "GET",
      url: `/sites/${siteName}/`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("Hello Wio!");
  });

  test("GET /sites/:site/:asset serves named asset from S3", async () => {
    const siteName = `ctrl-asset-css-${Date.now()}`;
    const site = await createSite({ name: siteName });

    const s3Path = getS3Path(siteName, "style.css");
    const content = new TextEncoder().encode("body { margin: 0; }");
    await writeS3File(s3Path, content.buffer as ArrayBuffer);
    createdS3Paths.push(s3Path);
    await insertSiteFile(site.id, s3Path, "style.css");

    const res = await fastify.inject({
      method: "GET",
      url: `/sites/${siteName}/style.css`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("margin: 0");
  });
});
