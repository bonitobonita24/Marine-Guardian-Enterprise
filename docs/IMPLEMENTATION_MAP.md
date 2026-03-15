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

| Phase | Name                   | Status | Date       |
| ----- | ---------------------- | ------ | ---------- |
| 0     | Bootstrap              | ✅     | 2026-03-15 |
| 1     | Open Devcontainer      | ✅     | 2026-03-15 |
| 2     | Discovery Interview    | ✅     | 2026-03-15 |
| 2.5   | Spec Decision Summary  | ✅     | 2026-03-15 |
| 3     | Generate Spec Files    | ✅     | 2026-03-15 |
| 4     | Full Monorepo Scaffold | ✅     | 2026-03-15 |
| 5     | Validation             | ✅     | 2026-03-15 |
| 6     | Start Docker Services  | ⬜     | —          |

---

## Validation Results (Phase 5) — 2026-03-15

| Check                              | Result |
| ---------------------------------- | ------ |
| `pnpm install`                     | ✅     |
| `packages/shared` tsc --noEmit     | ✅     |
| `packages/db` tsc --noEmit         | ✅     |
| `packages/jobs` tsc --noEmit       | ✅     |
| `packages/api-client` tsc --noEmit | ✅     |
| `packages/storage` tsc --noEmit    | ✅     |
| `packages/ui` tsc --noEmit         | ✅     |
| Prisma schema validate             | ✅     |
| `node tools/validate-inputs.mjs`   | ✅     |

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

- `prisma/schema.prisma` — 16 models: Tenant, User, TenantMembership, Barangay, Species, Fisherfolk, Vessel, Permit, CatchReport, Program, ProgramBeneficiary, DistributionEvent, Incident, Patrol, Notification, AuditLog, PushToken, RefreshToken
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
| L1    | Auth.js sessions      | apps/marine-guardian-enterprise            | ⬜ wired in Phase 6+ |
| L2    | RLS withTenantContext | packages/db/src/rls.ts                     | ✅                   |
| L3    | tRPC procedure guards | apps/marine-guardian-enterprise/trpc       | ⬜ wired in Phase 6+ |
| L4    | Zod input validation  | packages/shared/src/schemas                | ✅                   |
| L5    | Immutable AuditLog    | packages/db/src/audit.ts                   | ✅                   |
| L6    | Prisma TenantGuard    | packages/db/src/middleware/tenant-guard.ts | ✅                   |
| L7    | RBAC role matrix      | apps/marine-guardian-enterprise/trpc       | ⬜ wired in Phase 6+ |

---

## What Is NOT Yet Built

| Item                                      | Phase |
| ----------------------------------------- | ----- |
| Auth.js session/login pages               | 6+    |
| tRPC router + procedures                  | 6+    |
| Dashboard pages (LGU, BA, Consolidated)   | 6+    |
| Fisherfolk registry CRUD pages            | 6+    |
| Vessel management pages                   | 6+    |
| Permit management + PDF generation        | 6+    |
| Catch reports pages                       | 6+    |
| Program management pages                  | 6+    |
| Incident reporting pages                  | 6+    |
| Patrol management pages                   | 6+    |
| BlueSentinel mobile screens               | 6+    |
| WatermelonDB offline sync                 | 6+    |
| Push notifications (Expo)                 | 6+    |
| CSV export endpoints                      | 6+    |
| Rate limiting middleware                  | 6+    |
| Multi-tenant middleware (slug resolution) | 6+    |
| Prisma migrations (actual DB deploy)      | 6     |
| Docker services running (Phase 6)         | 6     |
