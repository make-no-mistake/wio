# Team 21 - Make No Mistake

## Iteration 02 - Review & Retrospect

- When: February 22, 2026
- Where: Online (Zoom) / Discord

## Process - Reflection

#### What worked well

1. **Strict GitHub PR Reviews**
   Enforcing a CI-pass requirement and requiring at least one peer approval before merging has been one of our best decisions. This ensured that complex features (like WebSocket compilation and JWT auth) didn't break the `main` branch. It allowed multiple sets of eyes to catch edge-case bugs early. We even utilized custom instructions for GitHub Copilot PR reviewing, which accelerated the review process.
2. **Detailed Tracking via Kanban Board**
   Using the GitHub Issues board allowed us to cleanly split tasks across our 7-person team. By mapping user stories to specific actionable issues, we could effectively divide work across the separate architectural components (CLI, SDK, Backend, Web) without team members stepping on each other's toes.
3. **Knowledge Sharing Sessions**
   Because our technology stack (Fastify/Bun) was new to some members, taking the time to have domain experts (Yianni, Ivan) teach the team the structure of the Wio backend was highly effective. This significantly accelerated the onboarding process and unblocked members who were struggling with the architectural setup.

#### What did not work well

1. **Initial Context Silos**
   Because we initially split our work strictly by architecture (Frontend vs Backend), some frontend members found themselves blocked. They struggled to test their components because the backend API endpoints were not yet complete, and there was confusion on how to run the isolated database tests locally. This siloed approach slowed down integration.
2. **Handling Complex Merges**
   Stitching together the various independent pieces caused friction. For instance, connecting the CLI `push` command to the backend `site.controller.ts` led to unexpected merge conflicts and bugs because the interface boundaries between the tools weren't strictly defined and mocked early on.
3. **Overestimation of Task Timelines**
   We occasionally overestimated how quickly certain infrastructure tasks could be completed. Setting up the isolated testing infrastructure and standardizing the SDK compilation pipeline took significantly longer than anticipated, which temporarily delayed the development of user-facing features.

#### Planned changes

1. **End-to-End Pair Programming**
   To resolve the context silos, we plan to shift toward cross-functional pairings for D4. For example, having a CLI developer pair program with a backend endpoint developer will ensure features are integrated immediately rather than waiting for discrete handoffs.
2. **Better API Mocking**
   We will rely more heavily on mocking our APIs from the start. This will allow frontend developers to build and test their UI components independently, completely unblocking them while the backend team finishes the actual implementation.

#### Integration & Next steps

Because Wio is a highly complex Backend-as-a-Service platform, we followed **Option 2: Split by Architecture** for our sub-teams. Our architecture required three foundational subteams to work simultaneously before a cohesive user story could function:

1. **Frontend & CLI Interface Subteam:** Jonathan, Mary focused on the developer CLI upload pipeline and the web dashboard interface.
2. **Backend Engine & Database Repositories Subteam:** Yianni, Nicholas, Milan focused on generating Postgres JSON schemas, the testing infrastructure, Fastify application routing, the `POST /api/site` orchestrator, and individual database manipulation endpoints.
3. **Client SDK & Integrations Subteam:** Omid, Ivan focused on the custom TypeScript transpiler, the database client library, server-side Socket.IO wrappers, and native LLM API integration.

To integrate them into a cohesive product, we connected the layers via our `POST /api/site` deployment route. This endpoint acts as the bridge, allowing the **CLI Interface Subteam's** tooling to bundle a user's web project and push it to the **Backend Engine Subteam's** routing infrastructure, which then allocates the isolated datastores provided by the **Client SDK Subteam.**

## Product - Review

#### How was your product demo?

Our project does not have an external partner, so no partner demo was conducted. However, we have a working product demo prepared and will be presenting it at our upcoming Thursday tutorial meeting with our TA, Guan Huang. The demo will walk through the full `wio push` deployment pipeline—from initializing a project with the CLI to deploying it live on the platform—and showcase the real-time WebSocket chat, AI prompt integration, and client-side database features running on our deployed environment at https://noivan.dev/.
