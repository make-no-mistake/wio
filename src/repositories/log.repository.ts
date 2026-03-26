import { sql } from "bun";

export async function getEventCounts(siteIds: number[]) {
  const result = await sql`
    SELECT 
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE time >= NOW() - INTERVAL '24 hours') as current_count,
      COUNT(*) FILTER (WHERE time >= NOW() - INTERVAL '48 hours' AND time < NOW() - INTERVAL '24 hours') as past_count
    FROM logs 
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
  `;
  return result;
}

export async function getActiveConnections(siteIds: number[]) {
  const result = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE time >= NOW() - INTERVAL '1 hour') as current_count,
      COUNT(*) FILTER (WHERE time >= NOW() - INTERVAL '2 hours' AND time < NOW() - INTERVAL '1 hour') as past_count
    FROM logs 
    WHERE (content->>'siteId')::int IN ${sql(siteIds)} 
      AND content->>'event' = 'ws_connect'
  `;
  return result;
}

export async function getAvgResponseTime(siteIds: number[]) {
  const result = await sql`
    SELECT 
      AVG((content->>'responseTime')::numeric) as total_avg,
      AVG((content->>'responseTime')::numeric) FILTER (WHERE time >= NOW() - INTERVAL '1 hour') as current_avg,
      AVG((content->>'responseTime')::numeric) FILTER (WHERE time >= NOW() - INTERVAL '2 hours' AND time < NOW() - INTERVAL '1 hour') as past_avg
    FROM logs 
    WHERE (content->>'siteId')::int IN ${sql(siteIds)} 
      AND msg = 'request completed'
  `;
  return result;
}

export async function getTotalRequests(siteIds: number[]) {
  const result = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE time >= NOW() - INTERVAL '24 hours') as current_count,
      COUNT(*) FILTER (WHERE time >= NOW() - INTERVAL '48 hours' AND time < NOW() - INTERVAL '24 hours') as past_count
    FROM logs 
    WHERE (content->>'siteId')::int IN ${sql(siteIds)} AND msg = 'incoming request'
  `;
  return result;
}

export async function getErrorCount(siteIds: number[]) {
  const result = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE time >= NOW() - INTERVAL '24 hours') as current_count,
      COUNT(*) FILTER (WHERE time >= NOW() - INTERVAL '48 hours' AND time < NOW() - INTERVAL '24 hours') as past_count
    FROM logs 
    WHERE (content->>'siteId')::int IN ${sql(siteIds)} 
      AND msg = 'request completed'
      AND (content->'res'->>'statusCode')::int >= 400
  `;
  return result;
}

export async function getPageViews(siteIds: number[]) {
  const result = await sql`
    SELECT date_trunc('hour', time) as hour, COUNT(*) as count
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
      AND msg = 'incoming request'
      AND time >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour DESC
    LIMIT 24
  `;
  return result;
}

export async function getErrorsOverTime(siteIds: number[]) {
  const result = await sql`
    SELECT date_trunc('hour', time) as hour, COUNT(*) as count
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
      AND msg = 'request completed'
      AND (content->'res'->>'statusCode')::int >= 400
      AND time >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour ASC
  `;
  return result;
}

export async function getTopPaths(siteIds: number[]) {
  const result = await sql`
    SELECT 
      req.content->'req'->>'url' as path,
      COUNT(*) as total_hits,
      AVG((res.content->>'responseTime')::numeric) as avg_response
    FROM logs req
    JOIN logs res ON req.content->>'reqId' = res.content->>'reqId'
    WHERE (req.content->>'siteId')::int IN ${sql(siteIds)} 
      AND req.msg = 'incoming request' 
      AND res.msg = 'request completed'
    GROUP BY path
    ORDER BY total_hits DESC
    LIMIT 10
  `;
  return result;
}

export async function getDailyEventCounts(siteIds: number[]) {
  const result = await sql`
    SELECT date_trunc('day', time) as day, COUNT(*) as count
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
    GROUP BY day
    ORDER BY day DESC
    LIMIT 7
  `;
  return result;
}

export async function getRecentEvents(siteIds: number[]) {
  const result = await sql`
    SELECT time, msg, content
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
    ORDER BY time DESC
    LIMIT 50
  `;
  return result;
}

export async function getStatusCodes(siteIds: number[], since = "24h") {
  if (siteIds.length === 0) return [];
  const sinceFilter =
    since === "all" || since === "24h" || since === "7d" || since === "30d"
      ? since
      : "90d";
  const result = await sql`
    SELECT 
      content->'res'->>'statusCode' as status_code,
      COUNT(*) as count
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
      AND msg = 'request completed'
      AND content->'res'->>'statusCode' IS NOT NULL
      AND (
        ${sinceFilter} = 'all'
        OR (${sinceFilter} = '24h' AND time >= NOW() - INTERVAL '24 hours')
        OR (${sinceFilter} = '7d' AND time >= NOW() - INTERVAL '7 days')
        OR (${sinceFilter} = '30d' AND time >= NOW() - INTERVAL '30 days')
        OR (${sinceFilter} = '90d' AND time >= NOW() - INTERVAL '90 days')
      )
    GROUP BY status_code
    ORDER BY count DESC
  `;
  return result;
}

export async function getAllPaths(siteIds: number[], since = "24h") {
  if (siteIds.length === 0) return [];
  const sinceFilter =
    since === "all" || since === "24h" || since === "7d" || since === "30d"
      ? since
      : "90d";
  const result = await sql`
    SELECT 
      req.content->'req'->>'url' as path,
      COUNT(*) as total_hits,
      AVG((res.content->>'responseTime')::numeric) as avg_response,
      MAX((res.content->>'responseTime')::numeric) as max_response
    FROM logs req
    JOIN logs res ON req.content->>'reqId' = res.content->>'reqId'
    WHERE (req.content->>'siteId')::int IN ${sql(siteIds)}
      AND req.msg = 'incoming request'
      AND res.msg = 'request completed'
      AND (
        ${sinceFilter} = 'all'
        OR (${sinceFilter} = '24h' AND req.time >= NOW() - INTERVAL '24 hours')
        OR (${sinceFilter} = '7d' AND req.time >= NOW() - INTERVAL '7 days')
        OR (${sinceFilter} = '30d' AND req.time >= NOW() - INTERVAL '30 days')
        OR (${sinceFilter} = '90d' AND req.time >= NOW() - INTERVAL '90 days')
      )
    GROUP BY path
    ORDER BY total_hits DESC
    LIMIT 100
  `;
  return result;
}

export async function getTrafficVolume(siteIds: number[], since = "24h") {
  if (siteIds.length === 0) return [];
  const sinceFilter =
    since === "all" || since === "24h" || since === "7d" || since === "30d"
      ? since
      : "90d";
  const result = await sql`
    SELECT date_trunc(CASE WHEN ${sinceFilter} = '24h' THEN 'hour' ELSE 'day' END, time) as hour, COUNT(*) as count
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
      AND msg = 'incoming request'
      AND (
        ${sinceFilter} = 'all'
        OR (${sinceFilter} = '24h' AND time >= NOW() - INTERVAL '24 hours')
        OR (${sinceFilter} = '7d' AND time >= NOW() - INTERVAL '7 days')
        OR (${sinceFilter} = '30d' AND time >= NOW() - INTERVAL '30 days')
        OR (${sinceFilter} = '90d' AND time >= NOW() - INTERVAL '90 days')
      )
    GROUP BY hour
    ORDER BY hour ASC
    LIMIT ${sinceFilter === "all" ? 1000000 : 48}
  `;
  return result;
}

const MAX_PAGE_SIZE = 100;

export async function getFilteredEvents(
  siteIds: number[],
  type: string,
  pageSize: number,
  offset: number,
  since?: string,
) {
  if (siteIds.length === 0) return [];

  const limit = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  const sinceFilter =
    since === "1h"
      ? "1h"
      : since === "6h"
        ? "6h"
        : since === "24h"
          ? "24h"
          : since === "7d"
            ? "7d"
            : since === "30d"
              ? "30d"
              : "any";

  const rawTypes =
    type && type !== "all" ? type.split(",").map((t) => t.trim()) : [];
  const includeApi = rawTypes.includes("api");
  const includeWs = rawTypes.includes("ws");
  const includeAi = rawTypes.includes("ai");
  const includeErr = rawTypes.includes("err");
  const includeAllTypes =
    type === "all" || (!includeApi && !includeWs && !includeAi && !includeErr);

  const result = await sql`
    SELECT time, msg, content
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
      AND (
        ${sinceFilter} = 'any'
        OR (${sinceFilter} = '1h' AND time >= NOW() - INTERVAL '1 hour')
        OR (${sinceFilter} = '6h' AND time >= NOW() - INTERVAL '6 hours')
        OR (${sinceFilter} = '24h' AND time >= NOW() - INTERVAL '24 hours')
        OR (${sinceFilter} = '7d' AND time >= NOW() - INTERVAL '7 days')
        OR (${sinceFilter} = '30d' AND time >= NOW() - INTERVAL '30 days')
      )
      AND (
        ${includeAllTypes}
        OR (
          (${includeApi} AND (msg = 'incoming request' OR msg = 'request completed'))
          OR (
            ${includeWs}
            AND (
              content->>'event' = 'ws_connect'
              OR content->>'event' = 'ws_disconnect'
              OR content->>'event' = 'ws_message'
            )
          )
          OR (${includeAi} AND content->>'event' = 'ai_prompt')
          OR (
            ${includeErr}
            AND (
              ((content->'res'->>'statusCode') ~ '^[0-9]+$' AND (content->'res'->>'statusCode')::int >= 400)
              OR content->>'error' IS NOT NULL
            )
          )
        )
      )
    ORDER BY time DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result;
}
