---
sidebar_position: 2
title: Observability
---

# Observability

Wio automatically logs all platform activity to a PostgreSQL `logs` table. This includes HTTP requests, WebSocket events, AI prompts, and server lifecycle events. Site owners can view analytics through the dashboard at [wio.onl/dashboard](https://wio.onl/dashboard) or by running `wio dashboard`.

## What Gets Logged

Every log entry is a structured JSON record stored in the `logs` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | `SERIAL` | Auto-incrementing primary key |
| `time` | `TIMESTAMP` | When the event occurred |
| `pid` | `INTEGER` | Process ID |
| `level` | `INTEGER` | Pino log level (30=info, 40=warn, 50=error) |
| `hostname` | `TEXT` | Server hostname |
| `msg` | `TEXT` | Log message (e.g., `"incoming request"`, `"request completed"`) |
| `content` | `JSONB` | Structured event data |

### Tracked Events

| Event | `content` fields | Description |
|-------|-----------------|-------------|
| `incoming request` | `req`, `siteId` | HTTP request received |
| `request completed` | `responseTime`, `res`, `siteId`, `reqId` | HTTP response sent |
| `ws_connect` | `socketId`, `siteId` | WebSocket connection opened |
| `ws_disconnect` | `socketId`, `siteId` | WebSocket connection closed |
| `ws_message` | `wsEvent`, `socketId`, `data`, `siteId` | WebSocket message received |
| `ai_prompt` | `promptLength`, `success`, `error` | LLM prompt processed |
| `platform_restart` | — | Server started |

## How It Works

Wio uses [Pino](https://getpino.io/) for structured logging. A custom Pino transport (`pino-db-transport.ts`) streams every log entry into the `logs` table in real time. For site-scoped requests, a child logger is created that automatically includes the `siteId` in every log entry.

The `logs` table is indexed on:
- `time DESC` — for chronological queries
- `content->>'event'` — for filtering by event type
- `content->>'siteId'` — for filtering by site

## Dashboard

Authenticated users can access the analytics dashboard by running `wio dashboard` or visiting [`wio.onl/dashboard`](https://wio.onl/dashboard). The dashboard shows:

- **Total events** — All logged events with 24-hour trend
- **Active connections** — WebSocket connections in the last hour
- **Average response time** — HTTP response time with trend
- **Page views** — Hourly request counts
- **Top paths** — Most-visited routes with average response times
- **Daily event counts** — 7-day event volume
- **Recent events** — Latest 50 log entries

The dashboard also supports per-site filtering, traffic analysis (status codes, path breakdowns, traffic volume), and paginated event browsing filtered by type (API, WebSocket, AI).
