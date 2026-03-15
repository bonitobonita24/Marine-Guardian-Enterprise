# project.memory.md — Marine Guardian Enterprise
# V10 rules summary + agent stack. Agents own this file.

---

## Project Identity

- **App Name**: Marine Guardian Enterprise
- **Platform Version**: Spec-Driven Platform V10
- **Bootstrap Date**: 2026-03-15
- **Current Phase**: Phase 0 complete — awaiting PRODUCT.md completion

---

## V10 Active Rules (non-negotiable)

| Rule | Summary |
|------|---------|
| Rule 1  | docs/PRODUCT.md is sole source of truth — only file humans edit |
| Rule 2  | inputs.yml + inputs.schema.json are agent-owned — never edit manually |
| Rule 3  | Every change updates CHANGELOG_AI.md + DECISIONS_LOG.md + IMPLEMENTATION_MAP.md |
| Rule 4  | Read all 9 context docs before any change |
| Rule 5  | Docker Compose-first, AWS-ready — split compose files per service group |
| Rule 6  | K8s scaffold inactive by default (enabled via inputs.yml flag) |
| Rule 7  | Multi-tenant architecture: shared schema + tenant_id; RLS + RBAC always scaffolded |
| Rule 8  | .devcontainer frozen after Phase 3 — never touch again |
| Rule 9  | Bidirectional governance: PRODUCT.md ↔ inputs.yml always in sync |
| Rule 10 | Never infer missing info — always ask |
| Rule 11 | Removal requires: list → confirm → delete + down-migration + update docs |
| Rule 12 | TypeScript strict everywhere — no any, no JS in src/ |
| Rule 13 | Mobile apps NEVER access DB directly — API only via packages/api-client |
| Rule 14 | OSS-first stack: Valkey+BullMQ, Auth.js, Keycloak, MinIO |
| Rule 15 | Every CHANGELOG_AI.md entry must include Agent: CLINE/CLAUDE_CODE/COPILOT/HUMAN |
| Rule 16 | Visual QA after every Phase 6 + major Phase 7 update |
| Rule 17 | Search before reading — codebase_search first, then open files (SocratiCode) |

---

## The 4-Agent Stack

### Claude Code (Planning)
- **Role**: Phase 2 discovery interview + PRODUCT.md guidance + Session Resume
- **Auto-loads**: CLAUDE.md every session
- **Use for**: Updating PRODUCT.md, Phase 2 interview, Phase 2.5 spec summary
- **Hand off to Cline after**: Phase 3 spec files are confirmed

### Cline (Building)
- **Role**: Phase 3–8 fully automated builder
- **Reads**: .clinerules automatically before every task
- **Reads**: All 9 context docs automatically
- **Runs**: Phase 4 all 8 parts without stopping
- **Self-heals**: 3 attempts per error before writing handoff file
- **Rule 17**: Calls codebase_search before opening any files (Phase 7+)
- **After every task**: Updates CHANGELOG_AI.md, IMPLEMENTATION_MAP.md, agent-log.md, lessons.md

### Copilot + SpecStory (Inline)
- **Role**: Always-on ghost text autocomplete; fallback for Phase 7 if Cline blocked
- **SpecStory**: Auto-injects master prompt from .specstory/specs/v10-master-prompt.md
- **Use for**: PR reviews, inline autocomplete, handoff resolution

### SocratiCode (Codebase Intelligence — NEW V10)
- **Role**: Semantic + keyword codebase search MCP server
- **Config**: .vscode/mcp.json → npx -y socraticode
- **Requires**: Docker running (manages its own Qdrant + Ollama containers)
- **First use**: Auto-pulls Docker images (~5 min one-time setup)
- **Benchmarks**: 61% less context, 84% fewer tool calls, 37x faster than grep
- **Tools**: codebase_search, codebase_graph_query, codebase_graph_circular, codebase_context_search, codebase_status, codebase_update, codebase_index
- **Rule 17**: Cline calls codebase_search before opening any file during Phase 7+

---

## The 9 Context Documents (read ALL before any task)

```
1. .cline/memory/lessons.md          ← READ FIRST — past errors + fixes
2. docs/PRODUCT.md                   ← single source of truth (HUMAN edits)
3. inputs.yml                        ← derived spec (AGENT-owned)
4. inputs.schema.json                ← validation schema (AGENT-owned)
5. docs/CHANGELOG_AI.md              ← change history with agent attribution
6. docs/DECISIONS_LOG.md             ← locked architectural decisions
7. docs/IMPLEMENTATION_MAP.md        ← current implementation state
8. project.memory.md                 ← this file: V10 rules + agent stack
9. .cline/memory/agent-log.md        ← what every agent has done
```

---

## Security Layers (always scaffolded)

| Layer | Name                    | Single Mode | Multi Mode |
|-------|-------------------------|-------------|------------|
| L1    | tRPC tenantId scoping   | DEFERRED    | ACTIVE     |
| L2    | PostgreSQL RLS          | DEFERRED    | ACTIVE     |
| L3    | RBAC middleware         | ACTIVE      | ACTIVE     |
| L4    | PgBouncer pool limits   | DEFERRED    | ACTIVE     |
| L5    | Immutable AuditLog      | ACTIVE      | ACTIVE     |
| L6    | Prisma query guardrails | ACTIVE      | ACTIVE     |

L3, L5, L6 always active. L1, L2, L4 scaffolded but dormant in single mode.

---

## Compose-First Infrastructure

```
deploy/compose/[env]/
  docker-compose.db.yml       → Amazon RDS (PostgreSQL + PgBouncer)
  docker-compose.storage.yml  → Amazon S3 (MinIO)
  docker-compose.cache.yml    → Amazon ElastiCache (Valkey + BullMQ)
  docker-compose.infra.yml    → Amazon SES (MailHog dev / SMTP relay)
  docker-compose.app.yml      → ECS/EC2 (Next.js app + workers)
  .env
```

Startup: `bash deploy/compose/start.sh dev up -d`
db.yml always starts first (creates shared Docker network).
AWS migration = stop compose service + update .env + restart. Zero code changes.

---

## Error Recovery Protocol

1. Read full error output before attempting fix
2. 3 auto-fix attempts per error
3. After each fix → verify with appropriate command
4. If resolved → append to .cline/memory/lessons.md
5. After 3 failed attempts → write handoff to .cline/handoffs/<timestamp>-<error-type>.md
6. Never suppress TypeScript errors with @ts-ignore or any

---

## Filesystem Ownership

```
HUMAN OWNS:
  docs/PRODUCT.md              ← only file humans ever edit
  CLAUDE.md                    ← copy of master prompt
  .claude/settings.json
  .clinerules
  .cline/tasks/*.md
  .vscode/mcp.json

AGENT OWNS (never edit manually):
  inputs.yml
  inputs.schema.json
  docs/CHANGELOG_AI.md
  docs/DECISIONS_LOG.md
  docs/IMPLEMENTATION_MAP.md
  project.memory.md
  .socraticodecontextartifacts.json
  apps/** packages/** tools/** deploy/** .github/**

CLINE WRITES (append only):
  .cline/memory/lessons.md
  .cline/memory/agent-log.md
  .cline/handoffs/*.md

FROZEN FOREVER (after Phase 3):
  .devcontainer/**
```
