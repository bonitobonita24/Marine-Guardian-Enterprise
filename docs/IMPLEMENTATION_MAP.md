# IMPLEMENTATION_MAP.md — Marine Guardian Enterprise

# Current implementation state. Agents rewrite this after every change.

# Humans never edit this file directly.

---

## Status Legend

- ✅ Built and validated
- ⏳ In progress
- ⬜ Declared in PRODUCT.md but not yet built
- ❌ Blocked / failed (see agent-log.md)

---

## Phase Status

| Phase | Name                   | Status | Date        |
| ----- | ---------------------- | ------ | ----------- |
| 0     | Bootstrap              | ✅     | 2026-03-15 |
| 1     | Open Devcontainer      | ✅     | 2026-03-15 |
| 2     | Discovery Interview    | ✅     | 2026-03-15 |
| 2.5   | Spec Decision Summary  | ✅     | 2026-03-15 |
| 3     | Generate Spec Files    | ✅     | 2026-03-15 |
| 4     | Full Monorepo Scaffold | ✅     | 2026-03-15 |
| 5     | Validation             | ✅     | 2026-03-15 |
| 6     | Start Docker Services  | ✅     | 2026-03-18 |
| 7     | Auth + Pages           | ✅     | 2026-03-18 |
| 8     | Production Ready       | ⏳     | 2026-03-18 |

## Phase 8 Status (2026-03-18) — IN PROGRESS

| Check                                         | Result |
| -------------------------------------------- | ------ |
| Auth.js v5 + Credentials provider            | ✅     |
| JWT session with role/tenant context         | ✅     |
| tRPC procedures (protected, tenant, authorized) | ✅   |
| Full CRUD router (fisherfolk, vessel, etc.) | ✅     |
| Dashboard + 9 module pages                   | ✅     |
| Tenant layout + sidebar + provider           | ✅     |
| Inline SVG icons (no external deps)         | ✅     |
| Settings page + tenant switcher              | ✅     |
| CSV export endpoint                          | ✅     |
| Fisherfolk new form page                    | ✅     |
| Fisherfolk detail page                      | ✅     |
| tsconfig.json declaration: false             | ✅     |
| pnpm turbo typecheck (all 15 tasks)         | ✅     |

---

## Validation Results (Phase 5) — 2026-03-15 (re-validated 2026-03-18)

| Check                                       | Result |
| ------------------------------------------- | ------ |
| `pnpm install`                              | ✅     |
| `packages/shared` tsc --noEmit              | ✅     |
| `packages/db` tsc --noEmit                  | ✅     |
| `packages/jobs` tsc --noEmit                | ✅     |
| `packages/api-client` tsc --noEmit          | ✅     |
| `packages/storage` tsc --noEmit             | ✅     |
| `packages/ui` tsc --noEmit                  | ✅     |
| `apps/marine-guardian-enterprise` typecheck | ✅     |
| `apps/worker` typecheck (via turbo)         | ✅     |
| `apps/bluesentinel-mobile` typecheck        | ✅     |
| Prisma schema validate                      | ✅     |
| `node tools/validate-inputs.mjs`            | ✅     |
| `pnpm turbo typecheck` (all 15 tasks)       | ✅     |

---

## Files Created — Phase 4 (2026-03-15)

### Monorepo Root

- `pnpm-workspace.yaml` — workspace: apps/_, packages/_
- `turbo.json` — build/typecheck/lint/test pipeline
- `tsconfig.base.json` — strict TypeScript ESM base config
- `.editorconfig` — whitespace/indent rules
- `.prettierrc` — Prettier + tailwindcss plugin
- `.eslintrc.js` — strict TS ESLint (no any, no ts-ignore)
- `MANIFEST.txt` — complete Phase 4 file manifest

### packages/shared ✅

- `src/enums.ts` — Role, TenantType, VesselType, PermitType, PermitStatus, IncidentSeverity, PatrolStatus, NotificationChannel, AuditAction
- `src/types/` — 11 pure TS interface files (no runtime deps)
- `src/schemas/` — 8 Zod validation schemas (fisherfolk, vessel, permit, catch-report, program, incident, patrol, tenant/auth)
- `src/index.ts` — barrel export

### packages/db ✅

- `prisma/schema.prisma` — 18 models: Tenant, User, TenantMembership, Barangay, Species, Fisherfolk, Vessel, Permit, CatchReport, Program, ProgramBeneficiary, DistributionEvent, Incident, Patrol, Notification, AuditLog, PushToken, RefreshToken
- `prisma/migrations/apply_rls_policies.sql` — PostgreSQL RLS policies + mg_app runtime role
- `src/client.ts` — PrismaClient singleton with query logging in dev
- `src/rls.ts` — L2: withTenantContext() using SET LOCAL in transactions
- `src/audit.ts` — L5: immutable writeAuditLog() (no update/delete for mg_app)
- `src/middleware/tenant-guard.ts` — L6: Prisma v6 $extends tenantGuardExtension() + assertTenantId()
- `src/repositories/` — fisherfolk.repo.ts, permit.repo.ts, tenant.repo.ts
- `src/seed.ts` — dev seed: BFAR Admin + Calapan City LGU + 62 Mindoro Oriental barangays
- `src/index.ts` — public barrel

### packages/api-client ✅

- `src/router-type.ts` — AppRouter type bridge
- `src/client.ts` — createApiClient() factory with splitLink (SSE subscriptions + httpBatch)
- `src/index.ts` — barrel

### packages/ui ✅

- `src/lib/utils.ts` — cn() (clsx + tailwind-merge)
- `src/components/` — Button, Badge, Card, Input (shadcn/ui pattern with CVA)
- `src/index.ts` — barrel

### packages/jobs ✅

- `src/redis.ts` — IORedis singleton (REDIS_HOST/PORT env)
- `src/queues.ts` — 7 typed queues: image-optimization, permit-pdf, idcard-pdf, permit-expiry, notification-dispatch, offline-sync, evidence-photo
- `src/workers/permit-expiry.worker.ts` — daily cron + bulk updateMany + AuditLog write
- `src/workers/notification-dispatch.worker.ts` — EMAIL/IN_APP/PUSH fanout
- `src/dlq/dlq-helpers.ts` — DLQ inspection + retry + dismiss
- `src/index.ts` — barrel

### packages/storage ✅

- `src/client.ts` — S3Client singleton (MinIO/S3/R2 via env)
- `src/buckets.ts` — StoragePaths constants + presigned URL helpers
- `src/index.ts` — barrel

### apps/marine-guardian-enterprise ✅

- `package.json` — Next.js 15, tRPC v11, Auth.js v5, Tailwind, @marine-guardian/\* dependencies
- `next.config.ts` — standalone output, packages transpile
- `tsconfig.json` — extends base, JSX react-jsx, path aliases
- `tailwind.config.ts` — content paths, custom colors (BFAR blue/marine)
- `postcss.config.mjs` — Tailwind + autoprefixer
- `src/app/layout.tsx` — root layout with Inter font + Tailwind
- `src/app/page.tsx` — placeholder redirect to /login
- `src/app/globals.css` — CSS custom properties + Tailwind base
- `src/app/api/health/route.ts` — GET /api/health → DB ping → 200/503
- `src/auth.ts` — NextAuth v5 config with Credentials provider
- `src/trpc/server.ts` — protectedProcedure, tenantProcedure, authorizedTenantProcedure
- `src/trpc/router.ts` — full CRUD router for all entities
- `src/trpc/client.ts` — createTRPCReact client
- `src/middleware.ts` — tenant-aware auth middleware
- `src/components/providers/trpc-provider.tsx` — client-side provider
- `src/components/shell/sidebar.tsx` — tenant navigation with inline SVGs
- `src/app/[slug]/layout.tsx` — tenant shell layout
- `src/app/[slug]/page.tsx` — dashboard with stats
- `src/app/[slug]/fisherfolk/page.tsx` — fisherfolk registry
- `src/app/[slug]/vessels/page.tsx` — vessel registry
- `src/app/[slug]/permits/page.tsx` — permit management
- `src/app/[slug]/catch-reports/page.tsx` — catch reports
- `src/app/[slug]/programs/page.tsx` — programs
- `src/app/[slug]/incidents/page.tsx` — incidents
- `src/app/[slug]/patrols/page.tsx` — patrols
- `src/app/login/page.tsx` — login page
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth API route
- `src/app/api/trpc/[trpc]/route.ts` — tRPC API route

### apps/worker ✅

- `package.json` — standalone Node.js worker app
- `tsconfig.json` — strict ESM Node build
- `src/index.ts` — starts permit-expiry + notification-dispatch workers, graceful shutdown

### apps/bluesentinel-mobile ✅

- `package.json` — Expo 52 SDK, React Native, @marine-guardian/api-client
- `app.json` — BlueSentinel app config, EAS build config
- `tsconfig.json` — Expo TypeScript config

### tools ✅

- `tools/validate-inputs.mjs` — AJV v8 + ajv-formats; validates inputs.yml against schema
- `tools/check-env.mjs` — pre-flight required env var check (9 vars)

### deploy ✅

- `deploy/compose/docker-compose.yml` — Postgres 16 Alpine + Valkey 8 Alpine + MinIO + web + worker (all with healthchecks)
- `deploy/docker/Dockerfile.web` — multi-stage Next.js standalone image (node:22-alpine)
- `deploy/docker/Dockerfile.worker` — multi-stage worker image (node:22-alpine)

### .github ✅

- `.github/workflows/ci.yml` — TypeCheck + Lint + Build + Prisma validate (pnpm@9, node@22)

---

## Security Layers — All Defined

| Layer | Name                  | Location                                   | Status               |
| ----- | --------------------- | ------------------------------------------ | -------------------- |
| L1    | Auth.js sessions      | apps/marine-guardian-enterprise            | ✅                   |
| L2    | RLS withTenantContext | packages/db/src/rls.ts                     | ✅                   |
| L3    | tRPC procedure guards | apps/marine-guardian-enterprise/trpc       | ✅                   |
| L4    | Zod input validation  | packages/shared/src/schemas                | ✅                   |
| L5    | Immutable AuditLog    | packages/db/src/audit.ts                   | ✅                   |
| L6    | Prisma TenantGuard    | packages/db/src/middleware/tenant-guard.ts | ✅                   |
| L7    | RBAC role matrix      | apps/marine-guardian-enterprise/trpc       | ✅                   |

---

## What Is NOT Yet Built

| Item                                      | Phase |
| ----------------------------------------- | ----- |
| Form pages for create/edit operations     | 8     |
| Detail/view pages for each entity         | 8     |
| Settings page + tenant switcher           | 8     |
| BlueSentinel mobile screens               | 8+    |
| WatermelonDB offline sync                 | 8+    |
| Push notifications (Expo)                 | 8+    |
| CSV export endpoints                      | 8+    |
| Rate limiting middleware                  | 8+    |
| PDF generation for permits/ID cards       | 8+    |
| Seed data population                     | 8+    |
| Visual QA (Phase 6 Rule 16)              | 8+    |

---

## Phase 8 Remaining Tasks

1. Form pages for Fisherfolk, Vessel, Permit, CatchReport, Program, Incident, Patrol create/edit
2. Detail pages for each entity (byId queries exist in router)
3. Settings page with tenant switcher (tRPC switchTenant exists)
4. CSV export endpoints (API route scaffolding)
5. Rate limiting (package or middleware)
6. PDF generation endpoints
7. Seed data (bfar admin user + sample LGU)
8. Visual QA against localhost:3000
