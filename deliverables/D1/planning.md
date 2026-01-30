# Wio

> _Note:_ This document will evolve throughout your project. You commit regularly to this file while working on the project (especially edits/additions/deletions to the _Highlights_ section).
> **This document will serve as a master plan between your team, your partner and your TA.**

## Product Details

#### Q1: What is the product?

Wio is a **backend-as-a-service platform** designed specifically for low-code and no-code developers who want to build full-stack web applications without needing traditional programming expertise.

**The Problem:** Aspiring developers and entrepreneurs often face significant barriers when trying to build web applications. They may lack access to CS education, find backend development too complex, or struggle with database management, authentication, and real-time features. Existing solutions either require significant technical knowledge or are too limiting in functionality.

**The Solution:** Wio provides a simple, AI-agent-friendly API that handles all backend complexity:

- **Database Operations:** Create collections, query data, and manage persistent storage through a simple JavaScript API
- **Real-time Features:** Built-in WebSocket support for real-time applications
- **AI Integration:** Native Claude AI API for intelligent application features
- **Authentication:** Built-in user authentication and security
- **Simple Deployment:** CLI-based project initialization and one-command deployment

**How it works:**
1. Developer installs CLI: `npx create-wio-app project_name`
2. Developer uses an AI coding agent (Claude Code, Cursor, etc.) to build their application
3. AI agent uses Wio's simple API to create tables, handle data, and add features
4. Developer deploys with: `wio push`
5. Site is live at `project_name.wio.dev`

**Example Use Case:** A UofT student wants to create a course ranking website. Using Wio, they simply describe what they want to an AI agent, and the agent builds the complete application using Wio's backend API—no server configuration, database setup, or deployment complexity required.

This is an **independent project** with no external partner organization.

#### Q2: Who are your target users?

Our primary target users are:

**Persona 1: The Aspiring Entrepreneur**
- Age: 20-35
- Background: Has business ideas but limited programming experience
- Goal: Build and launch web applications to validate business ideas
- Pain Points: Frustrated by the learning curve of traditional development, can't afford to hire developers
- Needs: A way to leverage AI coding assistants without needing to understand backend complexity

**Persona 2: The No-Code Developer**
- Age: 18-45
- Background: Uses tools like Webflow, Bubble, or Zapier
- Goal: Build more sophisticated applications than current no-code tools allow
- Pain Points: Limited by what no-code platforms offer, wants more control without learning to code
- Needs: A bridge between no-code and traditional development that works with AI

**Persona 3: The CS Student Learner**
- Age: 18-25
- Background: University student learning programming, may be in early CS courses
- Goal: Build portfolio projects and learn full-stack development
- Pain Points: Overwhelmed by infrastructure setup, unclear how pieces connect
- Needs: A platform that lets them focus on building features rather than DevOps

#### Q3: Why would your users choose your product? What are they using today to solve their problem/need?

**Current Solutions and Their Limitations:**

| Solution | Limitation |
|----------|-----------|
| Firebase/Supabase | Requires understanding of database schemas, authentication flows, and SDK integration |
| Vercel/Railway | Focused on deployment, not simplifying backend logic |
| No-code tools (Bubble, Webflow) | Limited customization, expensive, vendor lock-in |
| Traditional development | High learning curve, requires months of study |

**Why Wio is Different:**

1. **AI-First Design:** Our API and documentation (AGENTS.md) are specifically designed for AI coding assistants to understand and use effectively. Users describe what they want; AI builds it.

2. **Zero Configuration:** No database schemas to define upfront, no authentication flows to configure—just start building.

3. **Time Savings:** What traditionally takes weeks (backend setup, database configuration, deployment pipeline) takes minutes with Wio.

4. **Progressive Learning:** Users can start with AI-generated code and gradually understand the patterns, making it an educational tool as well.

5. **Real-time Built-in:** WebSocket support is native, not an afterthought, enabling modern interactive applications.

#### Q4: What are the user stories that make up the Minimum Viable Product (MVP)?

| # | User Story | Acceptance Criteria |
|---|-----------|---------------------|
| 1 | As a **developer**, I want to initialize a new Wio project using the CLI so that I can quickly start building my application | - Running `npx create-wio-app project_name` creates a new directory<br>- Directory contains `index.html` starter template<br>- Directory contains `AGENTS.md` with AI instructions<br>- CLI provides clear success/error messages |
| 2 | As a **developer**, I want to create and query database tables from my frontend code so that I can store and retrieve application data | - Can create tables with `useTable("tablename")`<br>- Can insert documents with flexible JSON schema<br>- Can query with `.where()` and `.findBy()` methods<br>- Data persists between sessions |
| 3 | As a **developer**, I want to deploy my application with a single command so that users can access my site | - Running `wio push` uploads all project files<br>- Site is accessible at `project_name.wio.dev`<br>- Deployment completes in under 60 seconds<br>- Clear error messages on failure |
| 4 | As a **developer**, I want to use AI capabilities in my application so that I can add intelligent features | - Can call `ask("prompt").response()` to get AI responses<br>- AI integration works without API key management<br>- Responses are returned in a usable format |
| 5 | As a **developer**, I want real-time functionality via WebSockets so that I can build interactive applications | - Can create topics and broadcast messages<br>- Multiple clients receive updates in real-time<br>- Connection state is managed automatically |
| 6 | As a **user of a Wio-built app**, I want to authenticate so that my data is secure and personalized | - Can register and login through the application<br>- Sessions persist appropriately<br>- Personal data is protected from other users |

#### Q5: Have you decided on how you will build it? Share what you know now or tell us the options you are considering.

**Technology Stack:**

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Bun | Fast startup, TypeScript-native, built-in test framework |
| **Backend Framework** | Fastify | Excellent WebSocket support, high performance, good plugin ecosystem |
| **Language** | TypeScript | Type safety, better developer experience, team familiarity |
| **Database** | PostgreSQL + JSON | Familiar to team, reliable, JSON queries for flexible schemas |
| **Testing** | Bun's built-in test library | Native integration, fast execution |
| **Linting** | ESLint + Prettier | Industry standard, consistent code quality |

**Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                       Wio Platform                          │
├─────────────────────────────────────────────────────────────┤
│  CLI (npx create-wio-app)                                   │
│    ├── Project initialization                               │
│    └── Project upload (wio push)                            │
├─────────────────────────────────────────────────────────────┤
│  Backend API (Fastify + Bun)                                │
│    ├── Site API: CRUD operations for hosted sites          │
│    ├── App API: Database queries, auth, AI                 │
│    └── WebSocket API: Real-time messaging                  │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)                                      │
│    ├── Site metadata                                        │
│    └── User data (JSON documents)                          │
├─────────────────────────────────────────────────────────────┤
│  External Services                                          │
│    └── Claude AI API                                        │
└─────────────────────────────────────────────────────────────┘
```

**Deployment:** Docker containers via docker-compose for local development. Production deployment strategy TBD (considering Railway or self-hosted).

----
## Intellectual Property Confidentiality Agreement

This is an **independent project** with no external partner organization.

We have chosen to use the **MIT License** for our codebase, which means:
- The code is freely available and open source
- Anyone can use, modify, and distribute the code
- We retain copyright but grant broad permissions

This aligns with our goal of making Wio accessible to the developer community.

----

## Teamwork Details

#### Q6: Have you met with your team?

**Team Building Activity:** We held a virtual get-together on Discord where we introduced ourselves, discussed our backgrounds, and shared our interests and goals for the project.

**Evidence:**

![Team Building Discord Call](../team/team-building-discord-call.png)

**Fun Facts:**
1. Ivan is passionate about Go programming and advocates for its concurrency model in every technical discussion
2. Yianni has experience in multiple programming paradigms, from low-level C to high-level JavaScript
3. The team collectively decided on the name "Make No Mistake" which is an ironic play on prompt engineers instructing AI to make no mistakes

#### Q7: What are the roles & responsibilities on the team?

| Member | Role(s) | Responsibilities | Why This Role? |
|--------|---------|------------------|----------------|
| **Omid Hemmati** | Full Stack Developer, GitHub Admin | Core API development, repository management, deployment infrastructure | Strong experience in full-stack development and DevOps |
| **Mary Zhao** | Frontend Developer | UI/UX design, frontend implementation, Prompt Builder interface | Interest in user experience and visual design |
| **Yianni Culmone** | Backend Developer | WebSocket implementation, database layer, API endpoints | Experience with backend systems and databases |
| **Nicholas Koh** | Full Stack Developer | CLI development, integration testing, documentation | Balanced frontend/backend experience |
| **Ivan Chepelev** | Backend Developer | AI integration, authentication system, API architecture | Strong backend experience, interest in AI systems |
| **Milan Panta** | Full Stack Developer | Feature implementation, testing, code review | Eager to contribute across the stack |

**Partner Communications:** Since this is an independent project without an external partner, all team members share communication responsibilities with the TA.

#### Q8: How will you work as a team?

**Regular Team Meetings:**
- **When:** Every Thursday at 6:00 PM
- **Where:** Discord voice channel
- **Purpose:** Sprint planning, progress updates, blockers discussion

**Additional Meetings:**
- Ad-hoc coding sessions as needed
- Code review sessions before major merges
- Quick sync calls for urgent issues

**TA Meetings:** 8:00PM on Thursdays via Zoom with Guan Huang

#### Q9: How will you organize your team?

**Project Management Tools:**
- **GitHub Projects:** Primary task tracking (Kanban board)
- **Discord:** Team communication and quick sync
- **GitHub Issues:** Bug tracking and feature requests

**Workflow:**
1. **Task Creation:** Features/bugs are created as GitHub Issues
2. **Prioritization:** Team discusses priorities in Thursday meetings
3. **Assignment:** Team members self-assign or are assigned based on expertise
4. **Status Tracking:** Issues move through: Backlog → In Progress → In Review → Done
5. **Code Review:** At least 1 approval required, no pushing to main branch

**Access:** TA will be granted access to the GitHub repository and project board.

#### Q10: What are the rules regarding how your team works?

**Communications:**
- **Frequency:** Daily check-ins on Discord, formal weekly meeting on Thursdays
- **Channels:** Discord for quick communication, GitHub for code-related discussion
- **Response Time:** Team members expected to respond within 24 hours on Discord

**Collaboration:**
- **Attendance:** Missing two consecutive meetings without notice requires team discussion
- **Accountability:** Tasks not completed by deadline require explanation and re-planning
- **Non-contribution:** If a member is unresponsive for a week, the team will reach out directly and escalate to TA if needed
- **Conflict Resolution:** Issues discussed openly in team meetings; TA consulted if unresolved

**Code Standards:**
- All code must pass CI (linting + tests) before merge
- PRs require at least 1 approval
- Commit messages should be concise and descriptive

## Organisation Details

#### Q11. How does your team fit within the overall team organisation of the partner?

As an **independent project** without an external partner, our team operates autonomously. We function as a full product development team responsible for:

- Product vision and roadmap
- Technical architecture and implementation
- Quality assurance and testing
- Documentation and deployment

This gives us complete ownership of all decisions while also requiring us to define our own success metrics and direction.

#### Q12. How does your project fit within the overall product from the partner?

Since Wio is an independent project, we are building the **complete product from the ground up**. There are no existing components or external dependencies.

**Current Project Scope:**
```
Wio Platform (Complete Ownership)
├── CLI Tool (npx create-wio-app)
├── Backend API Server
├── Database Layer  
├── Web Components (wio.js client library)
├── AI Integration
├── Documentation (AGENTS.md)
└── Deployment Infrastructure
```

**Success Criteria:**
1. A working MVP that allows users to initialize, build, and deploy a simple web application
2. Clear documentation that AI agents can parse and use effectively
3. At least one demo application built entirely using Wio
4. Clean, maintainable codebase with good test coverage

**Future Vision:** If successful, Wio could become an open-source platform used by indie developers and educator communities to lower the barrier to web development.

## Potential Risks

#### Q13. What are some potential risks to your project?

| Risk | Severity | Likelihood | Description |
|------|----------|------------|-------------|
| **Scope Creep** | High | Medium | The vision for Wio is ambitious. We may try to implement too many features, leading to an incomplete MVP |
| **Technical Complexity** | High | Medium | Integrating WebSockets, AI, database, and auth in a seamless developer experience is challenging |
| **Team Availability** | Medium | Medium | As students, academic commitments may conflict with project work, especially around midterms/finals |
| **Unclear User Stories** | Medium | Low | Without an external partner, we may misjudge what features are actually valuable to users |
| **Integration Challenges** | Medium | Medium | The CLI, backend, and client library must work together seamlessly; integration bugs could be hard to trace |
| **AI API Costs/Limits** | Low | Medium | Claude API has usage costs and rate limits that could affect development and testing |

#### Q14. What are some potential mitigation strategies for the risks you identified?

| Risk | Mitigation Strategy |
|------|---------------------|
| **Scope Creep** | Define MVP strictly in D1, resist adding features until MVP is complete. Use "nice-to-have" vs "must-have" categorization |
| **Technical Complexity** | Start with the simplest implementation (database + deployment), add WebSockets and AI as incremental features |
| **Team Availability** | Share calendars with exam/deadline dates upfront, plan reduced velocity during busy academic periods |
| **Unclear User Stories** | Build the demo application ourselves as dogfooding, gather informal feedback from friends/classmates |
| **Integration Challenges** | Write integration tests early, maintain clear API contracts between components |
| **AI API Costs/Limits** | Use mock responses for development, implement caching, set up usage monitoring |
