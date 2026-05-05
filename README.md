# [Wio](https://wio.onl/)

[Wio](https://wio.onl/) is a backend-as-a-service platform for developing web applications with AI agents.

- **Easy-to-learn**: The entire development cycle consists of a few CLI commands.
- **Instant deployment**: Sites are deployed instantly with zero configuration.
- **AI-agent-powered**: All development is powered by an AI agent.

Wio provides a [managed database](https://wio.onl/docs/features/database), [websockets](https://wio.onl/docs/features/websockets), [markdown renderer](https://wio.onl/docs/features/markdown-renderer), [sound player](https://wio.onl/docs/features/sound-player), and [LLM API](https://wio.onl/docs/features/llm-api). Sites using Wio rely on the [SDK](https://wio.onl/docs/sdk) to interface with the backend services provided by Wio. The development of sites is meant to be fully AI driven, requiring no human-written code.

---

## Documentation & Demo

The full documentation for Wio, including the SDK reference, feature guides, and architecture details, is available at:

### 🔗 [**wio.onl/docs**](https://wio.onl/docs)

### Demo Video

[![Wio Demo Video](https://img.shields.io/badge/Watch-Demo--Video-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=1TkNEpCDUI4)

_(Click the badge above to watch our project demo)_

---

## Getting Started

1. Install the [Wio CLI](https://www.npmjs.com/package/wio-cli) NPM package:

```bash
npm i -g wio-cli
```

2. Initialize a new site (the site name must be unique):

```bash
wio init my-site
```

3. Switch to the site directory:

```bash
cd my-site
```

4. Register a new user tag by visiting [https://wio.onl/register](https://wio.onl/register).

> [!NOTE]  
> Be sure to save your user tag someplace safe! You will need it to login and manage your sites.

5. Login using your user tag:

```bash
wio login <user-tag>
```

> [!NOTE]  
> After logging in, you can see your user tag by using `wio status`.

6. Launch an AI agent of your choice (Claude Code, Codex, and OpenCode are supported) and prompt it to create a web application of your choice. The agent will automatically infer the instructions from the pre-packaged [SDK](https://wio.onl/docs/sdk) to use Wio infrastructure.

> [!NOTE]  
> The user is responsible for bringing their own AI coding agent.

7. Once the agent has finished coding, deploy the website:

```bash
wio push
```

8. The site is immediately live at https://my-site.wio.onl.

## Core Workflows

To see an example of how to use WIO, see our [Core Workflows](http://wio.onl/docs/getting-started/core_workflows).

It covers:

- end-to-end site setup, development, and deployment
- focused validation paths for the CLI and SDK/database
- the expected outcomes reviewers should be able to confirm

---

## Architecture

Wio is written in TypeScript and uses [Bun](https://bun.com/) as the runtime. The backend is powered by [Fastify](https://fastify.dev/). Data persistence is implemented with [PostgreSQL](https://www.postgresql.org/) and static file storage is done with [MinIO](https://github.com/minio/minio). The project relies heavily on separation of concerns using the [Repository Pattern](https://www.cosmicpython.com/book/chapter_02_repository.html) and the [Controller pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller).

Wio consists of three parts:

1. **Backend**: provides services to the client sites.
2. **CLI**: command line interface for managing sites.
3. **SDK**: interface for accessing Wio services.

See the [architecture guide](https://wio.onl/docs/developers/architecture) for more information.

## Development

All code contributions are expected to follow the feature-branch PR workflow. See the [issues page](https://github.com/csc301-2026-s/project-21-make-no-mistake/issues) for a list of relevant coding tasks and the [Kanban board](https://github.com/orgs/csc301-2026-s/projects/5) for a per-stream work breakdown.

All PRs must pass all CI steps to be merged and need to be approved by at least one maintainer. All code contributions must provide reasonable test coverage.

See the [development guide](https://wio.onl/docs/developers/overview) for information about setting up the development environment.

### Troubleshooting

If you encounter issues during local development, try using the following commands defined in `package.json` to reset or debug your environment:

- `bun run nuke`: Completely tears down the Docker containers, removes volumes (clearing the database), and rebuilds everything from scratch. Useful for a completely fresh start.
- `bun run rebuild`: Rebuilds the Docker containers without clearing your database volumes.
- `bun run down`: Stops and removes the Docker containers.
- `bun run logs`: View the logs from the running Docker containers.

If nothing else works, refer to the [Local Setup Documentation](https://wio.onl/docs/developers/overview#local-setup) for detailed instructions on how to re-install the project.

### Deployment

Wio is deployed to a Virtual Private Server (VPS) using GitHub Actions. We maintain separate workflows for **Production** and **Staging** (both triggered manually via GitHub Actions UI).

Deployments are containerized using Docker Compose, with staging utilizing distinct ports to safely run alongside production. Detailed deployment information can be found in our [Deployment Guide](http://wio.onl/docs/developers/deployment).

## Contributors

| Member         | Role                 | GitHub                                             |
| -------------- | -------------------- | -------------------------------------------------- |
| Omid Hemmati   | Full Stack Developer | [@hemmatio](https://github.com/hemmatio)           |
| Mary Zhao      | Frontend Developer   | [@mariimao](https://github.com/mariimao)           |
| Yianni Culmone | Backend Developer    | [@CulmoneY](https://github.com/CulmoneY)           |
| Nicholas Koh   | Full Stack Developer | [@kohnicholas1](https://github.com/kohnicholas1)   |
| Ivan Chepelev  | Backend Developer    | [@ch-iv](https://github.com/ch-iv)                 |
| Milan Panta    | Full Stack Developer | [@milan-panta](https://github.com/milan-panta)     |
| Jonathan Qiao  | Full Stack Developer | [@jonathanqiao1](https://github.com/jonathanqiao1) |

## License

Wio uses the [MIT license](LICENSE), because the core contributors to the project believe that it is the best way to promote computer user freedom.
