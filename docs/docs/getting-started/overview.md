---
sidebar_position: 1
title: Overview
---

# Getting Started

This guide walks you through creating your first Wio site from scratch.

## Prerequisites

- [Node.js](https://nodejs.org/) (for `npm`)
- An AI coding agent (Claude Code, Codex, or OpenCode)

## 1. Install the CLI

```bash
npm i -g wio-cli
```

Verify the installation:

```bash
wio version
```

## 2. Create a Project

```bash
wio init my-site
cd my-site
```

This creates a directory with three files:

| File | Purpose |
|------|---------|
| `wio.yaml` | Project configuration (site name, auth credentials) |
| `index.html` | Entry point for your site |
| `AGENTS.md` | Instructions for AI agents on how to use the Wio SDK |

## 3. Register an Account

Visit [https://wio.onl/register](https://wio.onl/register) to get a user tag (a 16-digit identifier).

## 4. Log In

```bash
wio login <your-user-tag>
```

This saves your auth token to `wio.yaml` in the current directory.

## 5. Build Your App

Launch your AI coding agent and instruct it to build your application. The agent reads `AGENTS.md` to understand how to use the Wio SDK.

Your `index.html` should import the SDK:

```html
<script type="module">
  import wio from "/wio.js";
</script>
```

The SDK is automatically served by Wio at `/wio.js` — you don't need to install or bundle anything.

## 6. Deploy

```bash
wio push
```

All files in the project directory are packaged and uploaded. Your site becomes available at:

```
https://my-site.wio.onl
```

## 7. Verify

Check your project status at any time:

```bash
wio status
```

This shows whether your config file, `index.html`, `AGENTS.md`, and login credentials are present.

## What's Next

- Learn about the [Database](/docs/features/database) query builder
- Add [real-time features](/docs/features/websockets) with WebSockets
- Integrate [AI responses](/docs/features/llm-api) into your app
- Store [site cookies](/docs/features/cookies) through the SDK
- See the full [SDK Reference](/docs/sdk)
