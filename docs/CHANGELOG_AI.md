# CHANGELOG_AI.md — Marine Guardian Enterprise

# Every entry must include Agent attribution (Rule 15).

# Agents write this. Humans never edit this file.

---

## Entry Format (Rule 15)

```markdown
## YYYY-MM-DD — [Phase or Feature Name]

- Agent: CLINE | CLAUDE_CODE | COPILOT | HUMAN
- Why: reason for the change
- Files added: list or "none"
- Files modified: list or "none"
- Files deleted: list or "none"
- Schema/migrations: list or "none"
- Errors encountered: list or "none"
- Errors resolved: how each was fixed, or "none"
```

---

## 2026-03-15 — Phase 3: Spec Files Generated

- Agent: CLAUDE_CODE
- Why: Phase 2 discovery interview complete — all 5 clarifying questions answered and locked. Generating spec files to hand off to Cline for Phase 4 automated scaffold.
- Files added: inputs.yml, inputs.schema.json
- Files modified: .devcontainer/devcontainer.json ({{APP_NAME}} replaced — frozen), docs/DECISIONS_LOG.md (17 decisions appended)
- Files deleted: none
- Schema/migrations: none
- Errors encountered: none
- Errors resolved: none

---

## 2026-03-15 — Phase 4 Audit + Post-Scaffold Fixes

- Agent: CLINE
- Why: Thorough audit of all 8 Phase 4 scaffold parts to verify completeness and correctness against the plan. Found 4 issues missed in original Phase 5 validation (which only checked per-package tsc, not app-level or full turbo run). Fixed all 4. Re-ran full `pnpm turbo typecheck` — all 15/15 tasks now green.
- Files added:
  apps/bluesentinel-mobile/app/\_layout.tsx (Expo Router root layout — resolves TS18003 missing inputs)
- Files modified:
  apps/marine-guardian-enterprise/next.config.ts (experimental.serverComponentsExternalPackages → serverExternalPackages — Next.js 15 breaking rename),
  apps/marine-guardian-enterprise/src/app/layout.tsx (added explicit JSX.Element return type + ReactNode import — fixes TS2742 non-portable type),
  apps/marine-guardian-enterprise/src/app/page.tsx (added explicit JSX.Element return type — fixes TS2742),
  package.json (added @types/react and @types/react-dom to pnpm overrides → forces single ^19.0.0 version across monorepo — fixes TS2742 dual-version conflict),
  MANIFEST.txt (corrected model count 16 → 18; schema.prisma description updated),
  docs/IMPLEMENTATION_MAP.md (corrected model count 16 → 18; added 4 new rows to Phase 5 validation table; all 15 tasks now green)
- Files deleted: none
- Schema/migrations: none
- Errors encountered:
  1. bluesentinel-mobile typecheck TS18003 — no source files in Phase 4 scaffold (only package.json + app.json + tsconfig.json created)
  2. marine-guardian-enterprise typecheck TS2742 — non-portable inferred type in layout.tsx + page.tsx
  3. @types/react dual-version conflict — packages/ui pinned ~18.3.0 while web app uses ^19.0.0, causing ReactNode type mismatch
  4. MANIFEST.txt + IMPLEMENTATION_MAP.md model count error — listed 16 models, schema has 18 (PushToken + RefreshToken were missing from count)
  5. next.config.ts used deprecated Next.js 14 key experimental.serverComponentsExternalPackages instead of Next.js 15 top-level serverExternalPackages
- Errors resolved:
  1. Added apps/bluesentinel-mobile/app/\_layout.tsx placeholder (Expo Router entry point)
     2+3. Fixed TS2742 by adding explicit JSX.Element return types + adding @types/react: ^19.0.0 pnpm override to eliminate dual-version conflict
  2. Updated MANIFEST.txt (2 locations) and IMPLEMENTATION_MAP.md (packages/db section)
  3. Updated next.config.ts to use serverExternalPackages at top level

---

## 2026-03-15 — Phase 4 + Phase 5: Full Monorepo Scaffold + Validation

- Agent: CLINE
- Why: Build the complete monorepo scaffold derived from inputs.yml. All 8 parts executed sequentially per .clinerules Phase 4 rules. Phase 5 auto-validation run immediately after.
- Files added:
  pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .editorconfig, .prettierrc, .eslintrc.js,
  packages/shared/package.json, packages/shared/tsconfig.json,
  packages/shared/src/enums.ts, packages/shared/src/types/_.ts (11 files), packages/shared/src/schemas/_.ts (9 files), packages/shared/src/index.ts,
  packages/db/package.json, packages/db/tsconfig.json,
  packages/db/prisma/schema.prisma, packages/db/prisma/migrations/apply*rls_policies.sql,
  packages/db/src/client.ts, packages/db/src/rls.ts, packages/db/src/audit.ts, packages/db/src/seed.ts,
  packages/db/src/middleware/tenant-guard.ts, packages/db/src/repositories/*.ts (3 files), packages/db/src/index.ts,
  packages/api-client/package.json, packages/api-client/tsconfig.json, packages/api-client/src/_.ts (3 files),
  packages/ui/package.json, packages/ui/tsconfig.json, packages/ui/src/lib/utils.ts, packages/ui/src/components/_.tsx (4 files), packages/ui/src/index.ts,
  packages/jobs/package.json, packages/jobs/tsconfig.json, packages/jobs/src/redis.ts, packages/jobs/src/queues.ts,
  packages/jobs/src/workers/\_.ts (2 files), packages/jobs/src/dlq/dlq-helpers.ts, packages/jobs/src/index.ts,
  packages/storage/package.json, packages/storage/tsconfig.json, packages/storage/src/\*.ts (3 files),
  apps/marine-guardian-enterprise/package.json, apps/marine-guardian-enterprise/next.config.ts, apps/marine-guardian-enterprise/tsconfig.json,
  apps/marine-guardian-enterprise/tailwind.config.ts, apps/marine-guardian-enterprise/postcss.config.mjs,
  apps/marine-guardian-enterprise/src/app/layout.tsx, apps/marine-guardian-enterprise/src/app/globals.css,
  apps/marine-guardian-enterprise/src/app/page.tsx, apps/marine-guardian-enterprise/src/app/api/health/route.ts,
  apps/worker/package.json, apps/worker/tsconfig.json, apps/worker/src/index.ts,
  apps/bluesentinel-mobile/package.json, apps/bluesentinel-mobile/app.json, apps/bluesentinel-mobile/tsconfig.json,
  tools/validate-inputs.mjs, tools/check-env.mjs,
  deploy/compose/docker-compose.yml, deploy/docker/Dockerfile.web, deploy/docker/Dockerfile.worker,
  .github/workflows/ci.yml, MANIFEST.txt
- Files modified:
  package.json (added pnpm.overrides for ioredis pin, ajv/ajv-formats/js-yaml devDeps),
  packages/ui/package.json (removed non-existent @radix-ui/react-button, @radix-ui/react-badge, @radix-ui/react-sheet),
  inputs.schema.json (default field type widened to string|boolean|number|null),
  packages/db/src/middleware/tenant-guard.ts (rewrote from $use → $extends for Prisma v6),
  packages/db/src/repositories/permit.repo.ts (fixed exactOptionalPropertyTypes violation),
  packages/api-client/src/client.ts (removed headers from httpSubscriptionLink — not supported in tRPC v11 SSE),
  packages/jobs/src/queues.ts (added extends object constraint to makeQueue generic),
  tools/validate-inputs.mjs (added ajv-formats + allowUnionTypes)
- Files deleted: none
- Schema/migrations: packages/db/prisma/schema.prisma (16 models), packages/db/prisma/migrations/apply_rls_policies.sql (RLS policies + mg_app role)
- Errors encountered:
  1. @radix-ui/react-button, @radix-ui/react-badge, @radix-ui/react-sheet — packages don't exist in npm
  2. Prisma v6 removed $use middleware — tenant-guard.ts used $use
  3. exactOptionalPropertyTypes: type undefined not assignable in permit.repo.ts
  4. ioredis dual-version conflict (5.10.0 vs 5.9.3) between jobs package and BullMQ bundled version
  5. httpSubscriptionLink does not support headers in tRPC v11
  6. makeQueue generic needed T extends object constraint
  7. ajv-formats missing for uri format validation in validate-inputs.mjs
  8. inputs.schema.json default field type was string-only, inputs.yml has boolean/null defaults
- Errors resolved:
  1. Removed non-existent radix packages from ui/package.json
  2. Rewrote tenant-guard.ts using Prisma.defineExtension() — $extends API (Prisma v6)
  3. Used explicit conditional assignment (if type !== undefined) rather than spread
  4. Added pnpm.overrides: ioredis: 5.9.3 to root package.json
  5. Removed headers from httpSubscriptionLink; auth token passed via query param for subscriptions
  6. Changed makeQueue<T> to makeQueue<T extends object>
  7. Added ajv-formats to root devDependencies; addFormats(ajv) in validate-inputs.mjs
  8. Changed default schema type to ["string", "boolean", "number", "null"] + allowUnionTypes: true

---

## 2026-03-17 — Phase 6: Docker Services + Dev Environment

- Agent: CLINE
- Why: Started Phase 6 — Docker Compose infrastructure. Created split compose files per service group (db, cache, storage, app), start script, .env files. Docker services running (PostgreSQL, Valkey/Redis, MinIO). Prisma migration applied.
- Files added:
  deploy/compose/docker-compose.db.yml (PostgreSQL + PgBouncer),
  deploy/compose/docker-compose.cache.yml (Valkey),
  deploy/compose/docker-compose.storage.yml (MinIO + MailHog),
  deploy/compose/docker-compose.infra.yml (placeholder for future SES),
  deploy/compose/docker-compose.app.yml (web + worker),
  deploy/compose/start.sh (orchestration script),
  deploy/compose/.env (dev environment vars),
  .env.local (root local env vars)
- Files modified:
  docs/IMPLEMENTATION_MAP.md (Phase 6 status added),
  docs/IMPLEMENTATION_MAP.md (Phase 6 status table added),
  deploy/compose/docker-compose.db.yml (removed obsolete version key),
  deploy/compose/docker-compose.cache.yml (removed obsolete version key)
- Files deleted: none
- Schema/migrations: prisma/migrations/20260317155601_init (applied)
- Errors encountered:
  1. PgBouncer restarting in loop — configuration issue (non-blocking for dev)
  2. RLS policies failed — SQL uses tenant_id but Prisma schema uses tenantId (camelCase)
  3. mg_app user doesn't exist — needs to be created in PostgreSQL
  4. bcryptjs not installed in packages/db — seed fails
  5. DIRECT_DATABASE_URL env var not found — pnpm filter doesn't pass env vars from .env.local
- Errors resolved:
  1. Non-blocking — using direct PostgreSQL connection instead
  2. RLS policies need to be rewritten to use tenantId (camelCase) — deferred to Phase 7
  3. Need to create mg_app user manually — pending
  4. Need to install bcryptjs in packages/db — pending
  5. Run with explicit DATABASE_URL and DIRECT_DATABASE_URL env vars
- Next steps:
  1. Create mg_app user in PostgreSQL
  2. Install bcryptjs and run seed
  3. Fix RLS policies for camelCase column names
  4. Verify /api/health returns 200

---

## 2026-03-18 — Phase 8: Auth + Pages

- Agent: CLINE
- Why: Complete Phase 8 — Auth.js v5 integration, tRPC routers with tenant-scoped procedures, and all dashboard pages. Session resumed from Phase 7 work.
- Files added:
  apps/marine-guardian-enterprise/src/auth.ts (NextAuth v5 config with Credentials provider, JWT session, role/tenant in session),
  apps/marine-guardian-enterprise/src/trpc/server.ts (protectedProcedure, tenantProcedure, authorizedTenantProcedure),
  apps/marine-guardian-enterprise/src/trpc/router.ts (full CRUD: fisherfolk, vessel, permit, catchReport, program, incident, patrol, user, tenant + dashboard stats + settings.switchTenant),
  apps/marine-guardian-enterprise/src/components/providers/trpc-provider.tsx (client-side tRPC + React Query provider),
  apps/marine-guardian-enterprise/src/components/shell/sidebar.tsx (tenant-aware navigation with role filtering, inline SVG icons),
  apps/marine-guardian-enterprise/src/app/[slug]/layout.tsx (tenant shell with sidebar + provider wrapper),
  apps/marine-guardian-enterprise/src/app/[slug]/page.tsx (dashboard with stats cards),
  apps/marine-guardian-enterprise/src/app/[slug]/fisherfolk/page.tsx,
  apps/marine-guardian-enterprise/src/app/[slug]/vessels/page.tsx,
  apps/marine-guardian-enterprise/src/app/[slug]/permits/page.tsx,
  apps/marine-guardian-enterprise/src/app/[slug]/catch-reports/page.tsx,
  apps/marine-guardian-enterprise/src/app/[slug]/programs/page.tsx,
  apps/marine-guardian-enterprise/src/app/[slug]/incidents/page.tsx,
  apps/marine-guardian-enterprise/src/app/[slug]/patrols/page.tsx
- Files modified:
  apps/marine-guardian-enterprise/src/middleware.ts (enhanced tenant slug routing + auth flow),
  apps/marine-guardian-enterprise/src/app/[slug]/page.tsx (replaced placeholder with actual dashboard),
  apps/marine-guardian-enterprise/tsconfig.json (added declaration: false, isolatedModules: false to fix TS2742 portability errors)
- Files deleted: none
- Schema/migrations: none
- Errors encountered:
  1. TS2742 — auth.ts, middleware.ts, client.ts: "inferred type cannot be named without reference" (isolatedModules + declaration conflict)
  2. TS2742 router.ts — "tenantId does not exist on context" (authorizedProcedure lacks tenant context)
  3. Prisma exactOptionalPropertyTypes — nullable fields reject undefined, require null
  4. lucide-react missing — pnpm store mismatch preventing install
  5. IncidentStatus enum mismatch — router uses wrong values (IncidentStatus vs actual enum)
- Errors resolved:
  1. Added declaration: false + isolatedModules: false to web app tsconfig.json
  2. Added authorizedTenantProcedure in server.ts that chains tenantProcedure + role check
  3. Changed all nullable Prisma field assignments from undefined to null (e.g., middleName: input.middleName ?? null)
  4. Rewrote sidebar with inline SVG icons instead of lucide-react
  5. Fixed IncidentStatus colors mapping (REPORTED, UNDER_INVESTIGATION, RESOLVED, DISMISSED)

---

## 2026-03-15 — Phase 0: Bootstrap

- Agent: CLINE
- Why: Initial project bootstrap — create all governance and infrastructure scaffolding files
- Files added: .clinerules, .nvmrc, .gitignore, package.json, .devcontainer/devcontainer.json, .devcontainer/Dockerfile, .vscode/mcp.json, .claude/settings.json, .cline/memory/lessons.md, .cline/memory/agent-log.md, .cline/tasks/phase4-autorun.md, docs/PRODUCT.md, docs/CHANGELOG_AI.md, docs/DECISIONS_LOG.md, docs/IMPLEMENTATION_MAP.md, project.memory.md, CLAUDE.md, .specstory/specs/v10-master-prompt.md
- Files modified: none
- Files deleted: none
- Schema/migrations: none
- Errors encountered: none
- Errors resolved: none
