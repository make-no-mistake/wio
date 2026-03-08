import type { FastifyInstance, FastifyReply } from "fastify";
import { findSitesByOwner } from "../../repositories/site.repository";
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
} from "../../repositories/log.repository";

function calculateTrend(current: number, past: number): string | null {
  if (past === 0) return null;
  const percent = ((current - past) / past) * 100;
  return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

export async function dashboardRoutes(fastify: FastifyInstance) {
  // View Route
  fastify.get("/dashboard", async (request, reply) => {
    try {
      await fastify.authorize(request, reply as FastifyReply);
    } catch {
      return reply.redirect("/login");
    }

    const sites = await findSitesByOwner(request.currentUser!.id);
    return reply.viewAsync("dashboard.ejs", {
      user: request.currentUser,
      sites,
    });
  });

  // Analytics APIs
  fastify.register(async (api) => {
    api.addHook("preHandler", fastify.authorize);

    api.get("/api/metrics/overview", async (request) => {
      const sites = await findSitesByOwner(request.currentUser!.id);

      if (sites.length === 0) {
        return {
          totalEvents: 0,
          activeConnections: 0,
          avgResponseTime: 0,
          totalEventsTrend: "0%",
          activeConnectionsTrend: "0%",
          avgResponseTimeTrend: "0%",
        };
      }

      const siteIds = sites.map((s) => s.id);

      const eventsResult = await getEventCounts(siteIds);
      const activeConnResult = await getActiveConnections(siteIds);
      const avgResponseResult = await getAvgResponseTime(siteIds);
      const pageViewsResult = await getPageViews(siteIds);
      const topPathsResult = await getTopPaths(siteIds);
      const eventsCountResult = await getDailyEventCounts(siteIds);
      const recentEventsResult = await getRecentEvents(siteIds);

      return {
        totalEvents: Number(eventsResult[0]?.total_count || 0),
        activeConnections: Number(activeConnResult[0]?.current_count || 0),
        avgResponseTime: Math.round(
          Number(avgResponseResult[0]?.total_avg || 0),
        ),
        totalEventsTrend: calculateTrend(
          Number(eventsResult[0]?.current_count || 0),
          Number(eventsResult[0]?.past_count || 0),
        ),
        activeConnectionsTrend: calculateTrend(
          Number(activeConnResult[0]?.current_count || 0),
          Number(activeConnResult[0]?.past_count || 0),
        ),
        avgResponseTimeTrend: calculateTrend(
          Number(avgResponseResult[0]?.current_avg || 0),
          Number(avgResponseResult[0]?.past_avg || 0),
        ),
        pageViews: pageViewsResult,
        topPaths: topPathsResult,
        eventCounts: eventsCountResult,
        recentEvents: recentEventsResult,
      };
    });

    api.get("/api/metrics/:siteId", async (request, reply) => {
      const siteId = Number((request.params as { siteId: string }).siteId);
      const sites = await findSitesByOwner(request.currentUser!.id);

      const ownsSite = sites.some((s) => s.id === siteId);
      if (!ownsSite) {
        return reply.code(403).send({ error: "Forbidden" });
      }

      const siteIds = [siteId];

      const eventsResult = await getEventCounts(siteIds);
      const activeConnResult = await getActiveConnections(siteIds);
      const avgResponseResult = await getAvgResponseTime(siteIds);
      const pageViewsResult = await getPageViews(siteIds);
      const topPathsResult = await getTopPaths(siteIds);
      const eventsCountResult = await getDailyEventCounts(siteIds);
      const recentEventsResult = await getRecentEvents(siteIds);

      return {
        siteId,
        totalEvents: Number(eventsResult[0]?.total_count || 0),
        activeConnections: Number(activeConnResult[0]?.current_count || 0),
        avgResponseTime: Math.round(
          Number(avgResponseResult[0]?.total_avg || 0),
        ),
        totalEventsTrend: calculateTrend(
          Number(eventsResult[0]?.current_count || 0),
          Number(eventsResult[0]?.past_count || 0),
        ),
        activeConnectionsTrend: calculateTrend(
          Number(activeConnResult[0]?.current_count || 0),
          Number(activeConnResult[0]?.past_count || 0),
        ),
        avgResponseTimeTrend: calculateTrend(
          Number(avgResponseResult[0]?.current_avg || 0),
          Number(avgResponseResult[0]?.past_avg || 0),
        ),
        pageViews: pageViewsResult,
        topPaths: topPathsResult,
        eventCounts: eventsCountResult,
        recentEvents: recentEventsResult,
      };
    });

    api.get("/api/metrics/traffic/:siteId", async (request, reply) => {
      const siteIdParam = (request.params as { siteId: string }).siteId;
      const sites = await findSitesByOwner(request.currentUser!.id);

      const isOverview = siteIdParam === "overview";
      const siteIds = isOverview
        ? sites.map((s) => s.id)
        : [Number(siteIdParam)];

      if (!isOverview) {
        const ownsSite = sites.some((s) => s.id === siteIds[0]);
        if (!ownsSite) {
          return reply.code(403).send({ error: "Forbidden" });
        }
      }

      if (siteIds.length === 0) {
        return { statusCodes: [], allPaths: [], trafficVolume: [] };
      }

      const statusCodesResult = await getStatusCodes(siteIds);
      const allPathsResult = await getAllPaths(siteIds);
      const trafficVolumeResult = await getTrafficVolume(siteIds);

      return {
        statusCodes: statusCodesResult,
        allPaths: allPathsResult,
        trafficVolume: trafficVolumeResult,
      };
    });

    api.get("/api/metrics/events/:siteId", async (request, reply) => {
      const siteIdParam = (request.params as { siteId: string }).siteId;
      const query = request.query as { page?: string; type?: string };
      const page = Number(query.page || 1);
      const type = query.type || "all";
      const pageSize = 50;
      const offset = (page - 1) * pageSize;

      const sites = await findSitesByOwner(request.currentUser!.id);

      const isOverview = siteIdParam === "overview";
      const siteIds = isOverview
        ? sites.map((s) => s.id)
        : [Number(siteIdParam)];

      if (!isOverview) {
        const ownsSite = sites.some((s) => s.id === siteIds[0]);
        if (!ownsSite) {
          return reply.code(403).send({ error: "Forbidden" });
        }
      }

      if (siteIds.length === 0) {
        return { events: [] };
      }

      try {
        const eventsResult = await getFilteredEvents(
          siteIds,
          type,
          pageSize,
          offset,
        );

        return { events: eventsResult };
      } catch (err: unknown) {
        const error = err as Error;
        request.log.error({ err: error }, "Failed to fetch events");
        return reply
          .code(500)
          .send({ error: "Database error", details: error.message });
      }
    });
  });
}
