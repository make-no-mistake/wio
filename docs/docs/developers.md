---
sidebar_position: 5
title: Developers
---

# Developers

This guide covers setting up a local development environment and contributing to the Wio codebase.

## Prerequisites

- [Bun](https://bun.sh/) — Runtime and package manager
- [Docker](https://www.docker.com/) — For PostgreSQL, MinIO, and the web container
- A `GEMINI_API_KEY` environment variable (for AI features)

## Local Setup

Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

Install dependencies:

```bash
bun install
```

### Running with Docker (Recommended)

Start all services (PostgreSQL, MinIO, web server):

```bash
bun run up
```

The server starts at `http://localhost:3000`. Services:

| Service | Port | Description |
|---------|------|-------------|
| `wio-web` | 3000 | Fastify application server |
| `wio-postgres` | 5432 | PostgreSQL 16 database |
| `wio-minio` | 9000/9001 | S3-compatible object storage |

Other Docker commands:

```bash
bun run logs      # Follow container logs
bun run down      # Stop containers
bun run rebuild   # Rebuild containers from scratch
bun run nuke      # Destroy volumes and rebuild (full reset)
```

### Running without Docker

Start the development server with hot reload:

```bash
bun run dev
```

This requires a running PostgreSQL instance and MinIO. Set the following environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`
- `JWT_SECRET` — Secret for signing auth tokens
- `GEMINI_API_KEY` — Google Gen AI API key

### CLI Development

Link the CLI globally for local testing:

```bash
bun link
```

Or run it directly:

```bash
bun run cli/index.ts init my-test-project
```

## Running Tests

```bash
bun test
```

Tests use Bun's built-in test runner. The test environment skips the Pino-to-DB log transport to avoid database dependencies in unit tests.

## Linting

```bash
bun run lint          # Fix lint and formatting issues
bun run lint:check    # Check without fixing
```

Uses ESLint and Prettier.

## Project Structure

```
├── src/
│   ├── index.ts              # Server entry point
│   ├── app/
│   │   ├── routes.ts         # App-level route registration
│   │   └── routes/           # User, site, dashboard routes
│   ├── site/
│   │   ├── routes.ts         # Per-site route handler (asset serving, SDK)
│   │   └── db/routes.ts      # Database API routes (CRUD)
│   ├── controllers/          # Business logic (site push, user creation)
│   ├── repositories/         # Data access layer (SQL queries)
│   ├── db/
│   │   ├── schema.ts         # Table definitions
│   │   └── seeds.ts          # Development seed data
│   ├── plugins/              # Fastify plugins (authorization)
│   ├── sdk/                  # Client SDK source (transpiled to wio.js)
│   │   ├── _index.ts         # SDK entry point (wio class)
│   │   ├── db/               # Query builder (select, insert, update, delete)
│   │   ├── ai/               # LLM client
│   │   ├── websockets/       # Socket.IO client wrapper
│   │   ├── markdown/         # Markdown rendering client
│   │   ├── play_sound/       # Sound playback client
│   │   └── transpiler.ts     # Bun.build bundler for SDK
│   ├── websocket/            # Socket.IO server (rooms, connections)
│   ├── llm/                  # LLM server (Gemma model proxy)
│   ├── markdown/             # Markdown server endpoint
│   ├── play_sound/           # Sound playback server endpoint
│   ├── observability/        # Pino-to-PostgreSQL log transport
│   ├── helpers/              # Shared utilities
│   ├── callbacks/            # Fastify hooks (subdomain routing)
│   ├── views/                # EJS templates (landing, login, dashboard)
│   ├── static/               # Static assets (demo sites, sounds)
│   └── types/                # TypeScript type extensions
├── cli/                      # CLI source
│   ├── index.ts              # CLI entry point
│   ├── commands/             # Command implementations
│   └── helpers/              # CLI utilities
├── tests/                    # Test files
└── docs/                     # Docusaurus documentation
```

## Architecture Patterns

### Repository Pattern

All database access goes through repository modules in `src/repositories/`. Repositories expose pure functions (or class methods) that encapsulate SQL queries. Controllers never write SQL directly.

```
Controller → Repository → Database
```

For example, `site.controller.ts` calls `findSiteByName()` from `site.repository.ts`, never executes SQL itself.

### Controller Pattern

Controllers in `src/controllers/` handle request processing logic. They receive Fastify request/reply objects and orchestrate calls to repositories.

### Subdomain Routing

Wio uses subdomain-based routing to serve sites. The `appAndSiteSpaceSwitch` callback rewrites incoming URLs:

- `my-site.wio.onl/page` → internally routes to `/sites/my-site/page`
- `wio.onl/dashboard` → stays as-is (app-level routes)

This is implemented via Fastify's `rewriteUrl` option.

### SDK Transpilation

The client SDK is written in TypeScript and transpiled to a browser-compatible JS bundle on-the-fly using `Bun.build`. When a site requests `/wio.js`, the transpiler bundles `src/sdk/_index.ts` and all its dependencies into a single file.

### Database Model

The platform uses five tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (identified by a 16-digit tag) |
| `sites` | Deployed sites (owned by a user) |
| `site_files` | File registry (maps files to S3 paths) |
| `relations` | Generic data storage (per-site, per-relation JSONB) |
| `logs` | Observability logs (structured Pino output) |

The `relations` table is the key abstraction — it stores arbitrary JSONB data keyed by `site_id` and `relation_name`, enabling each site to have its own virtual tables without DDL.

### Authentication

Authentication uses JWT tokens stored in HTTP-only cookies. The flow:

1. User registers at `/register` → receives a 16-digit tag
2. User logs in with the tag → server issues a JWT signed with `JWT_SECRET`
3. JWT is stored in the `wio-session` cookie
4. Protected routes use the `authorize` preHandler to verify the token

## Adding a New Feature

1. **Server-side:** Add routes in `src/` and register them in the appropriate route file
2. **SDK client:** Add a new module under `src/sdk/` and export it from `src/sdk/_index.ts`
3. **Tests:** Add tests in `tests/` following existing patterns
4. **Documentation:** Update the relevant docs page and the `AGENTS.sample.md` file in `cli/`
