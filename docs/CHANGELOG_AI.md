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

## 2026-03-15 — Phase 4 + Phase 5: Full Monorepo Scaffold + Validation

- Agent: CLINE
- Why: Build the complete monorepo scaffold derived from inputs.yml. All 8 parts executed sequentially per .clinerules Phase 4 rules. Phase 5 auto-validation run immediately after.
- Files added:
  pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .editorconfig, .prettierrc, .eslintrc.js,
  packages/shared/package.json, packages/shared/tsconfig.json,
  packages/shared/src/enums.ts, packages/shared/src/types/_.ts (11 files), packages/shared/src/schemas/_.ts (9 files), packages/shared/src/index.ts,
  packages/db/package.json, packages/db/tsconfig.json,
  packages/db/prisma/schema.prisma, packages/db/prisma/migrations/apply_rls_policies.sql,
  packages/db/src/client.ts, packages/db/src/rls.ts, packages/db/src/audit.ts, packages/db/src/seed.ts,
  packages/db/src/middleware/tenant-guard.ts, packages/db/src/repositories/_.ts (3 files), packages/db/src/index.ts,
  packages/api-client/package.json, packages/api-client/tsconfig.json, packages/api-client/src/_.ts (3 files),
  packages/ui/package.json, packages/ui/tsconfig.json, packages/ui/src/lib/utils.ts, packages/ui/src/components/_.tsx (4 files), packages/ui/src/index.ts,
  packages/jobs/package.json, packages/jobs/tsconfig.json, packages/jobs/src/redis.ts, packages/jobs/src/queues.ts,
  packages/jobs/src/workers/_.ts (2 files), packages/jobs/src/dlq/dlq-helpers.ts, packages/jobs/src/index.ts,
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

## 2026-03-15 — Phase 0: Bootstrap

- Agent: CLINE
- Why: Initial project bootstrap — create all governance and infrastructure scaffolding files
- Files added: .clinerules, .nvmrc, .gitignore, package.json, .devcontainer/devcontainer.json, .devcontainer/Dockerfile, .vscode/mcp.json, .claude/settings.json, .cline/memory/lessons.md, .cline/memory/agent-log.md, .cline/tasks/phase4-autorun.md, docs/PRODUCT.md, docs/CHANGELOG_AI.md, docs/DECISIONS_LOG.md, docs/IMPLEMENTATION_MAP.md, project.memory.md, CLAUDE.md, .specstory/specs/v10-master-prompt.md
- Files modified: none
- Files deleted: none
- Schema/migrations: none
- Errors encountered: none
- Errors resolved: none
