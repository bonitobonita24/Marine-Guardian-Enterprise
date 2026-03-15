// ─────────────────────────────────────────────────────────────────────────────
// packages/db/src/rls.ts — L2 PostgreSQL RLS helpers
// Injects tenant context per-transaction using SET LOCAL.
// Compatible with PgBouncer transaction mode.
// ─────────────────────────────────────────────────────────────────────────────
import { type PrismaClient } from "@prisma/client";
import { prisma } from "./client.js";

/**
 * Run a database operation within a tenant-scoped transaction.
 * Sets `app.current_tenant_id` via SET LOCAL before any query executes.
 * This ensures RLS policies on all tenant-scoped tables are enforced.
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: (tx: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SET LOCAL app.current_tenant_id = ${tenantId}`;
    return fn(tx);
  });
}

/**
 * Run a raw tenant-scoped query outside of the application transaction helper.
 * Use this for BA cross-tenant analytics only with the analytics pool.
 */
export async function setTenantContext(
  client: PrismaClient,
  tenantId: string,
): Promise<void> {
  await client.$executeRaw`SET LOCAL app.current_tenant_id = ${tenantId}`;
}
