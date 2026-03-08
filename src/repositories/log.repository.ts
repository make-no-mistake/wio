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

export async function getPageViews(siteIds: number[]) {
  const result = await sql`
    SELECT date_trunc('hour', time) as hour, COUNT(*) as count
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)} AND msg = 'incoming request'
    GROUP BY hour
    ORDER BY hour DESC
    LIMIT 24
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

export async function getStatusCodes(siteIds: number[]) {
  const result = await sql`
    SELECT 
      content->'res'->>'statusCode' as status_code,
      COUNT(*) as count
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)} 
      AND msg = 'request completed'
      AND content->'res'->>'statusCode' IS NOT NULL
    GROUP BY status_code
  `;
  return result;
}

export async function getAllPaths(siteIds: number[]) {
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
    GROUP BY path
    ORDER BY total_hits DESC
    LIMIT 100
  `;
  return result;
}

export async function getTrafficVolume(siteIds: number[]) {
  const result = await sql`
    SELECT date_trunc('hour', time) as hour, COUNT(*) as count
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)} AND msg = 'incoming request'
    GROUP BY hour
    ORDER BY hour DESC
    LIMIT 48
  `;
  return result;
}

export async function getFilteredEvents(
  siteIds: number[],
  type: string,
  pageSize: number,
  offset: number,
) {
  let typeFilter = sql``;
  if (type === "api") {
    typeFilter = sql`AND (msg = 'incoming request' OR msg = 'request completed')`;
  } else if (type === "ws") {
    typeFilter = sql`AND (content->>'event' = 'ws_connect' OR content->>'event' = 'ws_disconnect' OR content->>'event' = 'ws_message')`;
  } else if (type === "ai") {
    typeFilter = sql`AND content->>'event' = 'ai_prompt'`;
  }

  const result = await sql`
    SELECT time, msg, content
    FROM logs
    WHERE (content->>'siteId')::int IN ${sql(siteIds)}
    ${typeFilter}
    ORDER BY time DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;
  return result;
}
