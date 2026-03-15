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
