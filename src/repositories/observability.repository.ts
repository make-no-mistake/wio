import { sql } from "bun";

export interface ObservabilityEvent {
  id: number;
  site_id: number | null;
  type: string;
  path: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export type EventInsertRow = Omit<ObservabilityEvent, "id" | "created_at">;

export interface EventFilters {
  type?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export async function insertEvent(
  siteId: number | null,
  type: string,
  path: string | null,
  metadata: Record<string, unknown> = {},
): Promise<ObservabilityEvent> {
  const result = await sql<ObservabilityEvent[]>`
    INSERT INTO observability_events (site_id, type, path, metadata)
    VALUES (${siteId}, ${type}, ${path}, ${metadata})
    RETURNING id, site_id, type, path, metadata, created_at;
  `;
  return result[0]!;
}

export async function insertBulkEvents(
  events: EventInsertRow[],
): Promise<ObservabilityEvent[]> {
  if (events.length === 0) return [];
  const result = await sql<ObservabilityEvent[]>`
    INSERT INTO observability_events ${sql(events)}
    RETURNING id, site_id, type, path, metadata, created_at;
  `;
  return result;
}

export async function getEventsBySite(
  siteId: number,
  filters: EventFilters = {},
): Promise<ObservabilityEvent[]> {
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  let query = sql`SELECT * FROM observability_events WHERE site_id = ${siteId}`;

  if (filters.type) {
    query = sql`${query} AND type = ${filters.type}`;
  }
  if (filters.from) {
    query = sql`${query} AND created_at >= ${filters.from}`;
  }
  if (filters.to) {
    query = sql`${query} AND created_at <= ${filters.to}`;
  }

  query = sql`${query} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`;

  return await sql<ObservabilityEvent[]>`${query}`;
}

export async function getPlatformEvents(
  filters: EventFilters = {},
): Promise<ObservabilityEvent[]> {
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  let query = sql`SELECT * FROM observability_events WHERE site_id IS NULL`;

  if (filters.type) {
    query = sql`${query} AND type = ${filters.type}`;
  }
  if (filters.from) {
    query = sql`${query} AND created_at >= ${filters.from}`;
  }
  if (filters.to) {
    query = sql`${query} AND created_at <= ${filters.to}`;
  }

  query = sql`${query} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`;

  return await sql<ObservabilityEvent[]>`${query}`;
}

export async function getEventCountsBySite(
  siteId: number,
  groupBy: "type" | "date" = "type",
): Promise<{ key: string; count: number }[]> {
  if (groupBy === "type") {
    const rows = await sql<{ type: string; count: number }[]>`
      SELECT type, COUNT(*) as count
      FROM observability_events
      WHERE site_id = ${siteId}
      GROUP BY type
      ORDER BY count DESC;
    `;
    return rows.map((r) => ({ key: r.type, count: Number(r.count) }));
  } else {
    // group by date (YYYY-MM-DD)
    const rows = await sql<{ date: string; count: number }[]>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM observability_events
      WHERE site_id = ${siteId}
      GROUP BY DATE(created_at)
      ORDER BY date ASC;
    `;
    return rows.map((r) => ({ key: r.date, count: Number(r.count) }));
  }
}
