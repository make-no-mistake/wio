# [Wio](https://wio.onl/)

Wio is a backend-as-a-service platform for developing web applications with AI agents.

- **Easy-to-learn**: The entire development cycle consists of a few CLI commands.
- **Instant deployment**: Sites are deployed instantly with zero configuration.
- **AI-agent-powered**: All development is powered by an AI agent.

Wio provides a [managed database](https://wio.onl/docs/features/database), [websockets](https://wio.onl/docs/features/websockets), [observability](https://wio.onl/docs/features/observability), [markdown renderer](https://wio.onl/docs/features/markdown), [sound player](https://wio.onl/docs/features/sound-player), and [LLM API](https://wio.onl/docs/features/llm-api). Sites using Wio rely on the [SDK](https://wio.onl/docs/sdk) to interface the backend services provided by Wio. The development of sites is meant to be fully AI driven, requiring no human-written code.

## Getting Started

Install the [Wio CLI](https://www.npmjs.com/package/wio-cli) NPM package:

```bash
npm i -g wio-cli
```

Initialize a new site (the site name must be unique):

```bash
wio init my-site
```

Switch to the site directory:

```bash
cd my-site
```

Launch an AI agent of your choice (Claude Code, Codex, and OpenCode are supported) and prompt it to create a web application of your choice. The agent will automatically infer the instructions on using Wio infrastructure.

> [!NOTE]  
> The user is responsible for bringing their own AI coding agent.

Once the agent has finished coding, deploy the website:

```bash
wio push
```

The site will become available for public access at https://my-site.wio.onl.

## Architecture

Wio is written in TypeScript and uses [Bun](https://bun.com/) as the runtime. The backend is powered by [Fastify](https://fastify.dev/). Data persistence is implemented with [PostgreSQL](https://www.postgresql.org/) and static file storage is done with [MinIO](https://github.com/minio/minio). The project relies heavily on separation of concerns using the [Repository Pattern](https://www.cosmicpython.com/book/chapter_02_repository.html) and the [Controller pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller).

Wio consists of three parts:

1. **Backend**: provides services to the client sites.
2. **CLI**: command line interface for managing sites.
3. **SDK**: interface for accessing Wio services.

See the [architecture guide](ARCHITECTURE.md) for more information.

## Development

All code contributions are expected to follow the feature-branch PR workflow. See the [issues page](https://github.com/csc301-2026-s/project-21-make-no-mistake/issues) for a list of relevant coding tasks and the [Kanban board](https://github.com/orgs/csc301-2026-s/projects/5) for a per-stream work breakdown.

All PRs must pass all CI steps to be merged and need to be approved by at least one maintainer. All code contributions must provide reasonable test coverage.

See the [development guide](DEVELOPERS.md) for information about setting up the development environment.

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
