// ─────────────────────────────────────────────────────────────────────────────
// @marine-guardian/db — Public API
// ─────────────────────────────────────────────────────────────────────────────

// Core Prisma client (singleton)
export { prisma, PrismaClient } from "./client.js";

// Re-export Prisma types for convenience
export * from "@prisma/client";

// Security layers
export { withTenantContext, setTenantContext } from "./rls.js"; // L2
export { tenantGuardExtension, assertTenantId } from "./middleware/tenant-guard.js"; // L6
export { writeAuditLog, type AuditAction, type WriteAuditLogParams } from "./audit.js"; // L5

// Repository helpers
export * from "./repositories/fisherfolk.repo.js";
export * from "./repositories/permit.repo.js";
export * from "./repositories/tenant.repo.js";
