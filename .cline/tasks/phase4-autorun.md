# Phase 4 — Full Monorepo Scaffold (Auto-Run Task)
# Cline reads this file and executes all 8 parts without stopping.

## Trigger
User says "Start Phase 4" in Cline panel.

## Pre-conditions
- inputs.yml must exist and be valid
- inputs.schema.json must exist
- All 9 context docs must be readable

## Execution Instructions

READ all 9 context documents before starting.
Run Parts 1–8 sequentially. No stops. No "next" prompts between parts.
After Part 8 completes → automatically run Phase 5 validation.

---

## PART 1 — Root config files
- pnpm-workspace.yaml
- turbo.json (pipelines: lint, typecheck, test, build with dependsOn)
- root package.json (root scripts delegating to turbo)
- tsconfig.base.json (strict: true, noUncheckedIndexedAccess, exactOptionalPropertyTypes, etc.)
- .editorconfig
- .prettierrc
- .eslintrc.js (no-explicit-any: error, no-unsafe-assignment: error, strict-boolean-expressions: error)
- .gitignore (final version)
- .nvmrc (Node 20)

## PART 2 — packages/shared + packages/api-client
- packages/shared/src/types/ — TypeScript interfaces for every entity in inputs.yml
- packages/shared/src/schemas/ — Zod schemas for all entities
- packages/api-client/ — typed tRPC client or fetch wrappers (used by all apps, NEVER by packages/db or workers)

## PART 3 — packages/db
- Full Prisma schema with ALL entities from PRODUCT.md (typed, relations included)
- Tenant model always (single or multi mode)
- AuditLog model always (immutable)
- tenantId on every entity (nullable in single mode, NOT NULL in multi mode)
- RLS policies as SQL comments in single mode, active in multi mode
- Initial migration files (up + down)
- Typed query helpers / repository layer per entity
- Seed script for dev data
- src/audit.ts — AuditLog write helper (L5 — always active)
- src/middleware/tenant-guard.ts — Prisma guardrails (L6 — always active)
- src/rls.ts — only if tenancy.mode: multi (L2)

## PART 4 — packages/ui + packages/jobs + packages/storage
- packages/ui/ — shadcn/ui + Tailwind + Radix UI (web)
  - Include React Native Reusables + NativeWind ONLY if mobile app declared
- packages/jobs/ — ONLY if jobs.enabled in inputs.yml. BullMQ typed queues, workers, DLQ.
- packages/storage/ — ONLY if storage.enabled in inputs.yml. Typed MinIO/S3/R2 wrapper.

## PART 5 — apps/[web app] (Next.js full scaffold)
For each web app in inputs.yml:
- tsconfig.json (extends ../../tsconfig.base.json)
- src/env.ts — ALL env vars typed + validated at startup (Zod)
- src/app/ — App Router layout, pages for every module
- src/app/api/trpc/[trpc]/route.ts — tRPC handler
- src/server/trpc/ — routers for every entity/module
- src/server/auth/ — Auth.js / Keycloak / chosen provider config
- src/middleware.ts — tenant resolution + auth guard
- src/components/ — page-level components per module
- next.config.ts — typed Next.js config
- src/server/trpc/middleware/rbac.ts — RBAC role guard (L3 — always active)
- src/server/trpc/context.ts — base tRPC context
- src/server/trpc/middleware/tenant.ts — only if tenancy.mode: multi (L1)
- All source files .ts / .tsx ONLY — zero .js in src/

## PART 6 — apps/[mobile app] (Expo full scaffold)
SKIP ENTIRELY if no mobile app declared in inputs.yml.
If declared:
- app.json / app.config.ts
- eas.json (EAS Build config for App Store + Play Store)
- src/env.ts — typed env vars for mobile
- src/components/ui/ — React Native Reusables + NativeWind
- src/app/ — Expo Router screens for every mobile workflow
- src/api/ — uses packages/api-client/ ONLY (NEVER packages/db — Rule 13)
- src/storage/ — WatermelonDB / AsyncStorage / MMKV for local persistence
- src/sync/ — offline queue + sync logic (only if offline-first declared)
- src/notifications/ — Expo Push / FCM+APNs (only if declared)

## PART 7 — tools/ + deploy/compose/ + K8s scaffold + SocratiCode artifacts
- tools/validate-inputs.mjs
- tools/check-env.mjs
- tools/check-product-sync.mjs
- tools/hydration-lint.mjs
- deploy/compose/dev|stage|prod/ — split compose files per service group:
  - docker-compose.db.yml (PostgreSQL + PgBouncer)
  - docker-compose.storage.yml (MinIO)
  - docker-compose.cache.yml (Valkey + BullMQ)
  - docker-compose.infra.yml (MailHog dev / SMTP relay)
  - docker-compose.app.yml (Next.js app + workers)
  - .env (template)
- deploy/compose/start.sh — one-command startup script
- deploy/k8s-scaffold/ — inactive placeholder + README
- .socraticodecontextartifacts.json — SocratiCode context artifacts config

## PART 8 — CI + governance docs + MANIFEST.txt + SocratiCode index
- .github/workflows/ci.yml — GitHub Actions CI (governance + quality matrix)
- Append to docs/CHANGELOG_AI.md (Agent: CLINE)
- Rewrite docs/IMPLEMENTATION_MAP.md (complete current state)
- Write MANIFEST.txt (every file generated across all 8 parts)
- Trigger SocratiCode initial index:
  → codebase_index {}
  → codebase_status {} (poll until complete)
  → codebase_context_index {} (index .socraticodecontextartifacts.json)

## After Part 8 — Immediately run Phase 5 (no stop)

Phase 5 commands (all must be green):
```bash
pnpm install --frozen-lockfile
pnpm tools:validate-inputs
pnpm tools:check-env
pnpm tools:check-product-sync
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
Fix every failure. Never suppress TypeScript errors. All 8 green before Phase 6.
