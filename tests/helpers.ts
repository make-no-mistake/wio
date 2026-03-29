import Fastify, { type FastifyInstance } from "fastify";
import { sql } from "bun";
import { expect } from "bun:test";

import fastifyView from "@fastify/view";
import fastifyCookie from "@fastify/cookie";
import sensible from "@fastify/sensible";
import fastifyRateLimit from "@fastify/rate-limit";
import ejs from "ejs";
import { fileURLToPath } from "node:url";
import { appRoutes } from "../src/app/routes";
import { registerErrorHandler } from "../src/plugins/error-handler";
import { siteRoutes } from "../src/site/routes";

const viewsRoot = fileURLToPath(new URL("../src/views", import.meta.url));
const defaultRateLimitOptions = { max: 100, timeWindow: "1 minute" } as const;

export async function createTestApp(
  rateLimitOptions = defaultRateLimitOptions,
) {
  const fastify = Fastify();

  await fastify.register(sensible);
  await fastify.register(fastifyRateLimit, rateLimitOptions);
  registerErrorHandler(fastify);
  await fastify.register(fastifyCookie);
  await fastify.register(fastifyView, {
    engine: { ejs },
    root: viewsRoot,
    viewExt: "ejs",
  });
  await fastify.register(appRoutes);
  await fastify.register(siteRoutes, { prefix: "/sites/:site" });

  return fastify;
}

export async function setupSiteAndMockSdkFetch(
  fastify: FastifyInstance,
  siteName: string,
) {
  const { createSite } = await import("./factories/site.factory");
  const { setFetch } = await import("../src/sdk/db/request");

  const site = await createSite({ name: siteName });

  const customFetch = async (
    input: Parameters<typeof fetch>[0],
    options?: RequestInit,
  ) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const res = await fastify.inject({
      method:
        (options?.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH") ||
        "GET",
      url: `/sites/${siteName}${url}`,
      headers: options?.headers as Record<string, string>,
      payload: options?.body as string,
    });

    return new Response(res.payload, {
      status: res.statusCode,
      headers: res.headers as HeadersInit,
    });
  };

  setFetch(customFetch as typeof fetch);

  return site;
}

export async function assertRecordsInDb(
  siteName: string,
  relationName: string,
  expectedRecords: Record<string, unknown> | Record<string, unknown>[],
) {
  const result = await sql`
    SELECT *
    FROM relations r 
    JOIN sites s ON r.site_id = s.id 
    WHERE r.relation_name = ${relationName} 
      AND s.name = ${siteName}
  `;
  const parsedData = result.map((r: Record<string, unknown>) =>
    typeof r.data === "string" ? JSON.parse(r.data) : r.data,
  );

  const expectedArray = Array.isArray(expectedRecords)
    ? expectedRecords
    : [expectedRecords];

  expect(parsedData).toHaveLength(expectedArray.length);

  const expectedMatchers = expectedArray.map((record) =>
    expect.objectContaining(record),
  );
  expect(parsedData).toEqual(expect.arrayContaining(expectedMatchers));
}
