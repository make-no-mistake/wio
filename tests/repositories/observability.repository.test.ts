import { describe, expect, test } from "bun:test";
import { createSite } from "../factories/site.factory";
import {
  insertEvent,
  insertBulkEvents,
  getEventsBySite,
  getPlatformEvents,
  getEventCountsBySite,
} from "../../src/repositories/observability.repository";

describe("observability.repository", () => {
  describe("Events", () => {
    test("insertEvent: inserts platform-level event (site_id = null)", async () => {
      const event = await insertEvent(null, "platform_event", "/push", {
        status: "success",
      });
      expect(event.id).toBeGreaterThan(0);
      expect(event.site_id).toBeNull();
      expect(event.type).toBe("platform_event");
      expect(event.path).toBe("/push");
      expect(event.metadata).toEqual({ status: "success" });
      expect(event.created_at).toBeInstanceOf(Date);
    });

    test("insertEvent: inserts site-level event", async () => {
      const site = await createSite();
      const event = await insertEvent(site.id, "page_view", "/home", {
        latency: 120,
      });
      expect(event.site_id).toBe(site.id);
      expect(event.type).toBe("page_view");
    });

    test("insertBulkEvents: inserts multiple events efficiently", async () => {
      const site = await createSite();
      const events = await insertBulkEvents([
        { site_id: site.id, type: "api_call", path: "/users", metadata: {} },
        { site_id: site.id, type: "page_view", path: "/about", metadata: {} },
      ]);
      expect(events).toHaveLength(2);
      expect(events[0]?.type).toBe("api_call");
      expect(events[1]?.type).toBe("page_view");
    });

    test("insertBulkEvents: returns empty array if given empty list", async () => {
      const events = await insertBulkEvents([]);
      expect(events).toHaveLength(0);
    });

    test("getPlatformEvents: fetches and filters platform events", async () => {
      await insertEvent(null, "platform_event", "/1", {});
      await insertEvent(null, "platform_event", "/2", {});

      const all = await getPlatformEvents();
      expect(all).toBeInstanceOf(Array);
      expect(all.length).toBeGreaterThanOrEqual(2);
      expect(all[0]?.site_id).toBeNull();

      const paged = await getPlatformEvents({ limit: 1 });
      expect(paged).toHaveLength(1);
    });

    test("getEventsBySite: fetches and pages events correctly", async () => {
      const site = await createSite();
      await insertBulkEvents([
        { site_id: site.id, type: "api_call", path: "/1", metadata: {} },
        { site_id: site.id, type: "api_call", path: "/2", metadata: {} },
        { site_id: site.id, type: "page_view", path: "/3", metadata: {} },
      ]);

      const all = await getEventsBySite(site.id);
      expect(all).toHaveLength(3);

      const apiCalls = await getEventsBySite(site.id, { type: "api_call" });
      expect(apiCalls).toHaveLength(2);

      const paged = await getEventsBySite(site.id, { limit: 1 });
      expect(paged).toHaveLength(1);

      const overPaged = await getEventsBySite(site.id, { offset: 100 });
      expect(overPaged).toBeInstanceOf(Array);
      expect(overPaged).toHaveLength(0);
    });

    test("getEventCountsBySite: aggregations work for type and date", async () => {
      const site = await createSite();
      await insertBulkEvents([
        { site_id: site.id, type: "api_call", path: "/1", metadata: {} },
        { site_id: site.id, type: "api_call", path: "/2", metadata: {} },
        { site_id: site.id, type: "page_view", path: "/3", metadata: {} },
      ]);

      const byType = await getEventCountsBySite(site.id, "type");
      expect(byType).toHaveLength(2);

      const apiCount = byType.find((x) => x.key === "api_call")?.count;
      expect(apiCount).toBe(2);

      const byDate = await getEventCountsBySite(site.id, "date");
      expect(byDate).toHaveLength(1);
      expect(byDate[0]?.count).toBe(3);
    });
  });
});
