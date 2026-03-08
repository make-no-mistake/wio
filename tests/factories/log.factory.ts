import { sql } from "bun";

interface LogOverrides {
  siteId?: number;
  msg?: string;
  event?: string;
  responseTime?: number;
  reqId?: string;
  reqUrl?: string;
  statusCode?: number;
  time?: Date;
}

let logCounter = 1;

export async function createLog(overrides: LogOverrides = {}) {
  const time = overrides.time ?? new Date();
  const siteId = overrides.siteId ?? 1;
  const msg = overrides.msg ?? "test log";
  const reqId = overrides.reqId ?? `req-${logCounter++}`;

  const content: Record<string, unknown> = { siteId };

  if (overrides.event) content.event = overrides.event;
  if (overrides.responseTime !== undefined)
    content.responseTime = overrides.responseTime;
  if (overrides.reqId || overrides.reqUrl) content.reqId = reqId;
  if (overrides.reqUrl) content.req = { url: overrides.reqUrl };
  if (overrides.statusCode !== undefined)
    content.res = { statusCode: String(overrides.statusCode) };

  const result = await sql`
    INSERT INTO logs (time, pid, level, hostname, msg, content)
    VALUES (${time}, 1, 30, 'test', ${msg}, ${content})
    RETURNING id, time, msg, content`;

  return result[0];
}
