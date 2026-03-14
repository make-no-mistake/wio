---
slug: /
sidebar_position: 1
title: Introduction
---

# Wio

Wio is a **backend-as-a-service platform** for developing web applications with AI agents. It provides a [managed database](/docs/features/database), [real-time websockets](/docs/features/websockets), [LLM API](/docs/features/llm-api), [markdown rendering](/docs/features/markdown-renderer), [sound playback](/docs/features/sound-player), [site cookies](/docs/features/cookies), and instant deployment — all accessible through a lightweight client SDK.

The development workflow is designed to be fully AI-driven. You scaffold a project with the CLI, point an AI coding agent at it, and deploy with a single command. No server configuration, no build pipelines, no infrastructure management.

## How It Works

1. **Scaffold** a project with `wio init my-site`
2. **Build** your app using the `wio.js` SDK (let an AI agent write the code)
3. **Deploy** with `wio push` — your site is instantly live at `https://my-site.wio.onl`

Your app's HTML, CSS, and JS files are uploaded and served from Wio's infrastructure. The SDK (`wio.js`) is automatically available at `/wio.js` and provides access to all platform services.

## Platform Services

| Service | SDK Method | Description |
|---------|-----------|-------------|
| [Database](/docs/features/database) | `wio.useRelation()` | Managed PostgreSQL with a query builder interface |
| [WebSockets](/docs/features/websockets) | `wio.ws` | Real-time communication via Socket.IO rooms |
| [LLM API](/docs/features/llm-api) | `wio.ask()` | Server-side AI text generation |
| [Markdown](/docs/features/markdown-renderer) | `wio.renderMarkdown()` | Server-side markdown to HTML conversion |
| [Sound Player](/docs/features/sound-player) | `wio.playSound()` | Broadcast sound effects to all connected users |
| [Cookies](/docs/features/cookies) | `wio.cookies` | Site-scoped cookie storage via the SDK |

## Documentation Structure

- **[Getting Started](/docs/getting-started/overview)** — Install the CLI, create a project, and deploy your first site
- **[Features](/docs/category/features)** — Detailed guides for each platform service
- **[SDK Reference](/docs/sdk)** — Complete API reference for the `wio` class
- **[CLI Reference](/docs/cli)** — Every CLI command, flag, and option
- **[Developers](/docs/developers)** — Contributing to Wio: local setup, architecture, and testing

## Tech Stack

Wio is built with TypeScript on [Bun](https://bun.sh/) and [Fastify](https://fastify.dev/). Data is stored in PostgreSQL, static files in MinIO (S3-compatible), and real-time features use Socket.IO.
