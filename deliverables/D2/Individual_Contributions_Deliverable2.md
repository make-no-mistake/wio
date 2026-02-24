# Deliverable 2 - Individual Contributions

We split the work for this deliverable by **Architecture** (Backend Server, Web Frontend, CLI, and SDK). This approach was necessary because Wio is a complex Backend-as-a-Service system; multiple foundational layers (database engine, websocket routing, authentication) had to be built before a full user story (like deploying a real-time web app via CLI) could function.

## Team 21 Members

### Jonathan Qiao

- **Role:** Frontend & CLI Interface Subteam Member
- **Contributions:**
  - Implemented the `wio push` developer CLI command (PR [#54](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/54)), enabling parsing of `wio.yaml` configs, project directory globbing, and `.tar.gz` archive generation for upload.
  - Implemented the `POST /api/site` push endpoint (PR [#83](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/83)): registered the route in `site.routes.ts`; authored the `push` controller in `site.controller.ts`; created `site.repository.ts` and `file.repository.ts` for `sites`/`site_files` DB operations; created `s3.repository.ts` wrapping Bun's S3 client.
  - Conducted 2 code reviews on GitHub.

### Mary Zhao

- **Role:** Frontend & CLI Interface Subteam Member
- **Contributions:**
  - Drafted and built the visual web components for the Wio landing page (PR [#78](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/78)), translating high-level concepts into consumer-facing designs.
  - Conducted 2 code reviews on GitHub.

### Yianni Culmone

- **Role:** Backend Engine & Database Repositories Subteam Member
- **Contributions:**
  - Architected the core User repository structure (PR [#56](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/56), [#66](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/66)) and the `/register` authentication routing (PR [#61](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/61)).
  - Engineered the isolated `wio_test` Postgres database infrastructure and User Factories to facilitate reliable, idempotent CI testing (PR [#58](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/58), [#59](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/59), [#60](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/60), [#63](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/63)).
  - Conducted 25 code reviews on GitHub.

### Nicholas Koh

- **Role:** Backend Engine & Database Repositories Subteam Member
- **Contributions:**
  - Implemented the database `relation.repository.ts` which handles batch inserting raw SQL transaction records dynamically scoped to specific site schemas (PR [#72](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/72)).

### Milan Panta

- **Role:** Backend Engine & Database Repositories Subteam Member
- **Contributions:**
  - No contributions have been made to this deliverable at this time.

### Omid Hemmati

- **Role:** Client SDK & Integrations Subteam Member
- **Contributions:**
  - Integrated server-side Socket.IO wrappers utilizing secure per-site rooms for isolated real-time infrastructure (PR [#36](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/36), [#55](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/55), [#73](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/73)).
  - Engineered the `src/llm/gemini` API endpoint and proxy layer, exposing native Gemini 3 Flash generation securely to the client SDK via `wio.ask()` (PR [#69](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/69)).
  - Coordinated the overarching system architecture breakdown and led the planning/documentation for Deliverables 1 & 2, including the project `README.md` (PR [#5](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/5), [#85](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/85)).
  - Conducted 6 code reviews on GitHub.

### Ivan Chepelev

- **Role:** Client SDK & Integrations, Backend Engine & Database Repositories Subteam Member, Frontend & CLI Interface Subteam Member, CI/CD Subteam Member
- **Contributions:**
  - Developed the core `wio.js` database client library, exposing syntax like `.where()` and `.insert()` for use in frontend applications (PR [#39](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/39)).
  - Built the custom SDK transpiler to dynamically convert the TypeScript client libraries into a unified, browser-compatible ES module (PR [#64](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/64), [#71](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/71)).
  - Developed the initial CLI interface for `wio push` and `wio init` commands. ([commit](https://github.com/csc301-2026-s/project-21-make-no-mistake/commit/27033732fdf246f13c7eb4791eb7aa1953c21c7f))
  - Developed the CI/CD pipeline for the project, including the GitHub Actions workflows: (PR [#40](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/40)) (PR [#41](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/41)) (PR [#62](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/62)) (PR [#70](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/70)) (PR [#77](https://github.com/csc301-2026-s/project-21-make-no-mistake/pull/77))
  - Was responsible for the containerizing ([commit](https://github.com/csc301-2026-s/project-21-make-no-mistake/commit/b0d11fe3f98962333b3ae951411bea31e9d6fbd0)) and deployment of the application on a VPS, including domain DNS configuration, HTTPS certificate setup, Cloudflare Proxy setup, NGINX reverse proxy configuration, and hardening of the server with a firewall. (https://noivan.dev)
  - Implemented wildcard subdomain rerouting to handle user-created subdomains for sites, such as `chat.noivan.dev` etc. ([commit 1](https://github.com/csc301-2026-s/project-21-make-no-mistake/commit/203c37c13803a7a4d8b3f73df6baab5aab8aa04a), [commit 2](https://github.com/csc301-2026-s/project-21-make-no-mistake/commit/90d756148beb9fdd1081a6013553a899e1f73bca))
  - Conducted 24 code reviews on GitHub.
