# Wio

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/n-sVoP2Y)

**A backend-as-a-service platform for low-code and no-code developers, powered by AI.**

## Overview

Wio is a platform that enables aspiring developers and entrepreneurs to build full-stack web applications without traditional programming expertise. By providing a simple, AI-agent-friendly API, Wio handles all backend complexity—database operations, authentication, real-time features, and deployment.

### Key Features

- **Database Operations:** Create collections and query data through a simple JavaScript API
- **Real-time Features:** Built-in WebSocket support for interactive applications
- **AI Integration:** Native Claude AI API for intelligent application features
- **Authentication:** Built-in user auth and security
- **Simple Deployment:** CLI-based project initialization and one-command deployment

## Quick Start

### Installation

Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

Install dependencies:

```bash
bun install
```

### CLI

The CLI can be installed globally using:

```bash
bun link
```

### Development

Start the development server:

```bash
bun run dev
```

Start with Docker:

```bash
bun run up      # Start containers
bun run logs    # View logs
bun run down    # Stop containers
```

### Linting

```bash
bun run lint        # Check for issues
bun run lint:fix    # Fix issues automatically
```

## Project Management

Tasks are managed using **GitHub Projects** (Kanban board) and **GitHub Issues** for bug tracking and feature requests.

## Team

| Member | Role | GitHub |
|--------|------|--------|
| Omid Hemmati | Full Stack Developer | [@hemmatio](https://github.com/hemmatio) |
| Mary Zhao | Frontend Developer | [@mariimao](https://github.com/mariimao) |
| Yianni Culmone | Backend Developer | [@CulmoneY](https://github.com/CulmoneY) |
| Nicholas Koh | Full Stack Developer | [@kohnicholas1](https://github.com/kohnicholas1) |
| Ivan Chepelev | Backend Developer | [@ch-iv](https://github.com/ch-iv) |
| Milan Panta | Full Stack Developer | [@milan-panta](https://github.com/milan-panta) |

## Technology Stack

- **Runtime:** Bun
- **Backend:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL + JSON
- **Testing:** Bun's built-in test library

## External Dependencies

- Claude AI API (for AI features)
- PostgreSQL (database)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*CSC301 - Team 21: Make No Mistake*