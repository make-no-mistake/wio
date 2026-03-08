import { describe, expect, test } from "bun:test";
import { createSite } from "../factories/site.factory";
import { createLog } from "../factories/log.factory";
import {
  getEventCounts,
  getActiveConnections,
  getAvgResponseTime,
  getPageViews,
  getTopPaths,
  getDailyEventCounts,
  getRecentEvents,
  getStatusCodes,
  getAllPaths,
  getTrafficVolume,
  getFilteredEvents,
} from "../../src/repositories/log.repository";

describe("log.repository", () => {
  test("getEventCounts returns counts", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id, msg: "test" });

    const result = await getEventCounts([site.id]);

    expect(Number(result[0]?.total_count)).toBeGreaterThanOrEqual(1);
  });

  test("getActiveConnections returns counts", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id, event: "ws_connect" });

    const result = await getActiveConnections([site.id]);

    expect(result[0]).toBeDefined();
    expect(Number(result[0]?.current_count)).toBeGreaterThanOrEqual(0);
  });

  test("getAvgResponseTime returns averages", async () => {
    const site = await createSite();
    await createLog({
      siteId: site.id,
      msg: "request completed",
      responseTime: 42,
    });

    const result = await getAvgResponseTime([site.id]);

    expect(result[0]).toBeDefined();
  });

  test("getPageViews returns time series", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id, msg: "incoming request" });

    const result = await getPageViews([site.id]);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getTopPaths returns paths with hits", async () => {
    const site = await createSite();
    const reqId = "shared-req-top";
    await createLog({
      siteId: site.id,
      msg: "incoming request",
      reqId,
      reqUrl: "/test-path",
    });
    await createLog({
      siteId: site.id,
      msg: "request completed",
      reqId,
      responseTime: 10,
    });

    const result = await getTopPaths([site.id]);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getDailyEventCounts returns daily counts", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id });

    const result = await getDailyEventCounts([site.id]);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getRecentEvents returns events", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id });

    const result = await getRecentEvents([site.id]);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getStatusCodes returns status code distribution", async () => {
    const site = await createSite();
    await createLog({
      siteId: site.id,
      msg: "request completed",
      statusCode: 200,
    });

    const result = await getStatusCodes([site.id]);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getAllPaths returns paths with response stats", async () => {
    const site = await createSite();
    const reqId = "shared-req-all";
    await createLog({
      siteId: site.id,
      msg: "incoming request",
      reqId,
      reqUrl: "/all-path",
    });
    await createLog({
      siteId: site.id,
      msg: "request completed",
      reqId,
      responseTime: 25,
    });

    const result = await getAllPaths([site.id]);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getTrafficVolume returns hourly volume", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id, msg: "incoming request" });

    const result = await getTrafficVolume([site.id]);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getFilteredEvents returns events with no filter", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id });

    const result = await getFilteredEvents([site.id], "all", 50, 0);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getFilteredEvents filters api events", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id, msg: "incoming request" });

    const result = await getFilteredEvents([site.id], "api", 50, 0);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getFilteredEvents filters ws events", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id, event: "ws_connect" });

    const result = await getFilteredEvents([site.id], "ws", 50, 0);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("getFilteredEvents filters ai events", async () => {
    const site = await createSite();
    await createLog({ siteId: site.id, event: "ai_prompt" });

    const result = await getFilteredEvents([site.id], "ai", 50, 0);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
