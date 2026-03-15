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

| Phase | Name                        | Status | Date       |
|-------|-----------------------------|--------|------------|
| 0     | Bootstrap                   | ✅     | 2026-03-15 |
| 1     | Open Devcontainer           | ⬜     | —          |
| 2     | Discovery Interview         | ⬜     | —          |
| 2.5   | Spec Decision Summary       | ⬜     | —          |
| 3     | Generate Spec Files         | ⬜     | —          |
| 4     | Full Monorepo Scaffold      | ⬜     | —          |
| 5     | Validation                  | ⬜     | —          |
| 6     | Start Docker Services       | ⬜     | —          |

---

## Files Created

### Phase 0 — Bootstrap (✅ 2026-03-15)

**Infrastructure & Config**
- `.nvmrc` — Node 20 pin
- `.gitignore` — comprehensive ignore rules
- `package.json` — root workspace package with pnpm@9.12.0
- `.devcontainer/devcontainer.json` — devcontainer config ({{APP_NAME}} placeholder — frozen after Phase 3)
- `.devcontainer/Dockerfile` — Node 20 slim + pnpm 9.12.0 + git + curl + netcat

**Cline Automation**
- `.clinerules` — V10 context load order, execution rules, Rule 17 SocratiCode, error recovery, governance rules
- `.cline/tasks/phase4-autorun.md` — Phase 4 all-8-parts task file
- `.cline/memory/lessons.md` — error lessons memory (empty, populated as errors resolved)
- `.cline/memory/agent-log.md` — running agent action log

**MCP & IDE Config**
- `.vscode/mcp.json` — SocratiCode MCP entry (npx -y socraticode)
- `.claude/settings.json` — Claude Code config with all 9 context file paths

**Governance Docs**
- `docs/PRODUCT.md` — template with all required sections (human edits this)
- `docs/CHANGELOG_AI.md` — Rule 15 format template + Phase 0 entry
- `docs/DECISIONS_LOG.md` — locked decisions format + bootstrap decisions
- `docs/IMPLEMENTATION_MAP.md` — this file
- `project.memory.md` — V10 rules + 4-agent stack summary

**Master Prompt**
- `CLAUDE.md` — copy of V10 master prompt (auto-loads in Claude Code)
- `.specstory/specs/v10-master-prompt.md` — SpecStory injection copy

---

## What Is NOT Yet Built

Everything below requires PRODUCT.md to be filled in first.

**Spec Files (Phase 3)**
- `inputs.yml` — full app spec derived from PRODUCT.md
- `inputs.schema.json` — JSON Schema for inputs.yml validation

**Monorepo Scaffold (Phase 4)**
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `.prettierrc`, `.editorconfig`, `.eslintrc.js`
- `packages/shared/` — TypeScript interfaces + Zod schemas
- `packages/api-client/` — typed tRPC/fetch client
- `packages/db/` — Prisma schema + migrations + seed + audit helpers
- `packages/ui/` — shadcn/ui + Tailwind + Radix UI
- `packages/jobs/` — BullMQ (if jobs.enabled)
- `packages/storage/` — MinIO/S3 wrapper (if storage.enabled)
- `apps/[web]/` — Next.js full scaffold
- `apps/[mobile]/` — Expo scaffold (if declared)
- `tools/` — validate-inputs, check-env, check-product-sync, hydration-lint
- `deploy/compose/` — split compose files per env + start.sh
- `deploy/k8s-scaffold/` — inactive placeholder
- `.socraticodecontextartifacts.json` — SocratiCode context artifacts
- `.github/workflows/ci.yml` — GitHub Actions CI
- `MANIFEST.txt` — complete file manifest

---

## Next Steps

1. Fill in `docs/PRODUCT.md` (the human's only job)
2. Run Phase 2 in Claude Code for discovery interview
3. Confirm spec in Phase 2.5
4. Generate `inputs.yml` + `inputs.schema.json` in Phase 3
5. Say "Start Phase 4" in Cline for full automated scaffold
