# DECISIONS_LOG.md — Marine Guardian Enterprise
# Locked architectural decisions. Agents write this. Humans never edit.
# Once a decision is LOCKED, changing it requires explicit confirmation + Rule 11 cleanup.

---

## Entry Format

```markdown
## [Decision Name] — LOCKED
- Date:     YYYY-MM-DD
- Agent:    CLINE | CLAUDE_CODE | COPILOT | HUMAN
- Decision: what was decided
- Reason:   why this choice was made
- Tradeoff: what was given up
- Status:   LOCKED
```

---

## Bootstrap Decisions

### Spec-Driven Platform Version — LOCKED
- Date:     2026-03-15
- Agent:    CLINE
- Decision: Using Spec-Driven Platform V10
- Reason:   Latest version with SocratiCode MCP integration, 4-agent architecture
- Tradeoff: none — this is the current version
- Status:   LOCKED

### Package Manager — LOCKED
- Date:     2026-03-15
- Agent:    CLINE
- Decision: pnpm@9.12.0
- Reason:   Fast, disk-efficient, strict dependency resolution, monorepo support
- Tradeoff: Less familiar than npm for some developers
- Status:   LOCKED

### Node Version — LOCKED
- Date:     2026-03-15
- Agent:    CLINE
- Decision: Node 20 LTS
- Reason:   Current LTS, broad ecosystem support, stable API surface
- Tradeoff: Not the absolute latest version
- Status:   LOCKED

### Codebase Intelligence — LOCKED
- Date:     2026-03-15
- Agent:    CLINE
- Decision: SocratiCode MCP server for semantic codebase search
- Reason:   61% less context, 84% fewer tool calls, 37x faster than grep; Rule 17 compliance
- Tradeoff: Requires Docker running; one-time ~5min setup for first use
- Status:   LOCKED

<!-- Architectural decisions will be appended here as Phase 3 and Phase 4 proceed -->

---

## Phase 3 Decisions — 2026-03-15

### Tenancy Model — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: multi-tenant, subdirectory routing (/[slug]/...)
- Reason:   Multiple LGUs require strict data isolation. Subdirectory routing avoids wildcard DNS/SSL — a single certificate covers all tenants.
- Tradeoff: Next.js middleware must resolve tenant on every request. Slightly more complex than single-tenant.
- Status:   LOCKED

### Frontend Framework — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Next.js App Router
- Reason:   SSR for dashboard pages, API routes for tRPC, first-class TypeScript support.
- Tradeoff: App Router requires careful layout/loading boundary design.
- Status:   LOCKED

### API Layer — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: tRPC (end-to-end type safety)
- Reason:   Eliminates API contract drift between server and client. TypeScript types flow from DB schema to UI with no manual sync.
- Tradeoff: tRPC is less familiar than REST for external integrations; REST adapter can be added later if needed.
- Status:   LOCKED

### ORM and Database — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Prisma + PostgreSQL. RLS enforced via mg_app runtime role (NOT superuser). Migrations via mg_migrate (BYPASSRLS, never used at runtime).
- Reason:   Prisma provides type-safe queries. Two-role PostgreSQL RLS pattern ensures data isolation at the database layer even if application logic has a bug.
- Tradeoff: Two-role Postgres setup adds provisioning complexity. PgBouncer in transaction mode limits use of session-level SET — resolved by using SET LOCAL within explicit transactions.
- Status:   LOCKED

### Auth Provider — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Auth.js v5 (web) + custom JWT Bearer with RefreshToken table (mobile)
- Reason:   Auth.js is OSS (MIT), integrates natively with Next.js App Router, and handles SameSite=Lax cookies correctly. Mobile requires Bearer token auth — Auth.js session cookies are not suitable for React Native; custom JWT flow with sliding refresh gives equivalent security.
- Tradeoff: Two auth paths to maintain (web and mobile). Mitigated by sharing the same tRPC procedures for both.
- Status:   LOCKED

### Cache and Queue Backend — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Valkey + BullMQ
- Reason:   Valkey is the MIT-licensed fork of Redis — OSS-first per Rule 14. BullMQ is the standard robust job queue for Node.js with TypeScript support.
- Tradeoff: Valkey is newer than Redis; community is growing but smaller. BullMQ requires explicit queue definitions per job type.
- Status:   LOCKED

### File Storage — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: MinIO (dev) / S3 or Cloudflare R2 (prod). Zero code changes to switch — env var only.
- Reason:   S3-compatible API across all providers. MinIO is OSS (AGPL). Presigned PUT URLs keep large file uploads off the app server.
- Tradeoff: AGPL license for MinIO in dev — acceptable since it is a dev-only service. Prod uses S3/R2 which are proprietary but operationally essential.
- Status:   LOCKED

### Realtime Transport — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Server-Sent Events (SSE) via tRPC subscriptions
- Reason:   SSE is sufficient for the one-directional (server → client) dashboard invalidation pattern. Simpler infrastructure than WebSockets — no separate WS server needed. Works natively over HTTP/2.
- Tradeoff: SSE is unidirectional. If bidirectional realtime is needed in the future (e.g., live chat), WebSockets would need to be added.
- Status:   LOCKED

### Mobile Framework — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Expo managed workflow — iOS + Android. App Store + Play Store distribution via Expo EAS Build.
- Reason:   Managed workflow reduces native build complexity. Expo Camera, Location, SecureStore, LocalAuthentication, and ImageManipulator cover all required native features within the managed sandbox.
- Tradeoff: Managed workflow limits custom native modules. Ejecting to bare workflow would be required if a non-Expo native module is needed in a future phase.
- Status:   LOCKED

### Offline Sync (Mobile) — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: WatermelonDB (local SQLite on device)
- Reason:   Purpose-built for React Native offline-first apps. Handles sync, conflict resolution, and large datasets efficiently. Supports the required server-wins/device-wins conflict strategy.
- Tradeoff: WatermelonDB has a steeper learning curve than AsyncStorage. Schema changes require migrations. Worth it for the offline-first requirement.
- Status:   LOCKED

### Worker App Structure — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: apps/worker/ — standalone Node.js app importing from packages/jobs. Deployed as a separate Docker Compose service.
- Reason:   Clean monorepo separation of concerns. Worker scales independently from the Next.js web app. Separate deployment unit matches the separate Docker Compose service.
- Tradeoff: Two app entry points to maintain instead of one.
- Status:   LOCKED

### Fisherfolk Code Format — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Prefixed sequential — {TENANT_SLUG_UPPER}-{NNNNNN} (e.g., CALA-000123). 6-digit zero-padded sequence per tenant.
- Reason:   Prefix gives instant visual LGU identification on printed documents, ID cards, and BFAR reports. Simple integers have no LGU context. LGU-defined prefixes (Option 3) create cross-LGU inconsistency.
- Tradeoff: Slug-derived prefix means codes change display if slug ever changes — mitigated by slug being immutable after creation.
- Status:   LOCKED

### Multi-Tenant Login UX — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Auto-route to most recently used tenant + nav header tenant switcher.
- Reason:   90% of users have one tenant membership and should not be blocked by a selection screen on every login. Switcher handles the multi-membership edge case cleanly.
- Tradeoff: Requires storing lastActiveTenantId on the User record.
- Status:   LOCKED

### ID Card PDF Generation — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: Synchronous generation — PDF rendered in-request, browser download starts immediately. Job definition exists but invoked synchronously.
- Reason:   A single ID card PDF is lightweight (sub-second generation). Async queue adds UX complexity without benefit for a single-file, on-demand operation.
- Tradeoff: If PDF generation time grows (e.g., bulk export), this decision would need revisiting via a Feature Update.
- Status:   LOCKED

### CSV Export Scope — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: CSV export on fisherfolk registry and permit list tables only.
- Reason:   BFAR regulatory reporting requires these two tables. Avoiding scope creep on vessels and catch reports keeps the initial build focused.
- Tradeoff: Staff may request vessel/catch export in a future phase — scaffolded as a future Feature Update.
- Status:   LOCKED

### Connection Pooler — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: PgBouncer in transaction mode. Per-LGU tenant limit: 10 connections. BA cross-tenant analytics pool: 5 connections.
- Reason:   Transaction mode is compatible with Prisma and SET LOCAL for RLS. Per-tenant limits prevent connection exhaustion from high-traffic tenants starving others.
- Tradeoff: Transaction mode means no session-level state between queries — all RLS tenant context must be set within explicit transactions using SET LOCAL.
- Status:   LOCKED

### UI Component Library — LOCKED
- Date:     2026-03-15
- Agent:    CLAUDE_CODE
- Decision: shadcn/ui + Tailwind CSS (web); React Native Reusables + NativeWind (mobile)
- Reason:   shadcn/ui is OSS (MIT), composable, and pairs naturally with Tailwind. React Native Reusables is the mobile equivalent with NativeWind for consistent styling primitives.
- Tradeoff: shadcn/ui components are copied into the project (not a package dependency) — intentional design. Requires discipline to keep up with upstream.
- Status:   LOCKED
