### Developer Workflow

To test the full developer deployment pipeline locally:

1. Ensure you have [Bun](https://bun.sh/) installed.
2. Clone the repository and start the server (see [Local Installation](#local-installation) below).
3. In a new terminal, scaffold a project: `bun run cli/main.ts init my-demo-project`
4. Write your client-side application using the `wio.js` SDK (see [sample file](#feature-testing-walkthrough) below).
5. Deploy with: `cd my-demo-project && bun run ../cli/main.ts push`
6. Your site is instantly live at `my-demo-project.localhost:3000`.

### Local Installation

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

## Technology Stack

- **Runtime:** Bun
- **Backend:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL + JSON
- **Testing:** Bun's built-in test library

## External Dependencies

- Google Gen AI API (for AI features)
- PostgreSQL (database)

## Team Git & GitHub Workflow

Our team strictly adheres to a **Pull Request & Continuous Integration workflow**:

- **Feature Branches**: We build features on isolated branches (e.g. `feat/cli-upload` or `fix/jwt-auth`).
- **Required Pull Requests**: All changes must be made via PRs to `main`. Committing directly to `main` is disallowed.
- **CI/CD Triggers**: GitHub Actions run against every PR, executing our isolated database tests via Bun.
- **Approval Protocol**: PRs require at least 1 approval from a peer before merging. We've defined custom instructions for AI-assisted PR reviewing to make the review process more comprehensive.
- **Project Board**: We map our User Stories to individual issues and track assignments via the GitHub Kanban board.

## Troubleshooting

If your local setup gets out of sync, reinstall dependencies with `bun install`.

For a full reset, remove linked artifacts, rebuild containers, and reinstall everything:

```bash
bun unlink
bun run nuke
bun install
bun link
```
