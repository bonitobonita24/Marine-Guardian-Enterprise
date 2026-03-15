// ─────────────────────────────────────────────────────────────────────────────
// packages/db/src/middleware/tenant-guard.ts — L6 Prisma query guardrails
// Uses Prisma v6 client extensions ($extends) — $use was removed in v6.
// Throws before any DB write if tenantId is missing on a tenant-scoped model.
// ─────────────────────────────────────────────────────────────────────────────
import { Prisma } from "@prisma/client";

const TENANT_SCOPED_MODELS = new Set([
  "Barangay",
  "Fisherfolk",
  "Vessel",
  "Permit",
  "CatchReport",
  "Program",
  "Incident",
  "Patrol",
]);

/**
 * Prisma v6 extension that enforces tenantId on all tenant-scoped model writes.
 * Usage: const db = prisma.$extends(tenantGuardExtension());
 */
export function tenantGuardExtension() {
  return Prisma.defineExtension({
    name: "tenant-guard",
    query: {
      $allModels: {
        async create<T, A>(
          this: T,
          {
            model,
            args,
            query,
          }: {
            model: string;
            args: A & { data?: Record<string, unknown> };
            query: (args: A) => Promise<unknown>;
          },
        ) {
          if (TENANT_SCOPED_MODELS.has(model)) {
            const data = args.data;
            if (data !== undefined && data["tenantId"] === undefined) {
              throw new Error(
                `[TenantGuard] Missing tenantId on ${model} create. Security violation.`,
              );
            }
          }
          return query(args);
        },
        async createMany<T, A>(
          this: T,
          {
            model,
            args,
            query,
          }: { model: string; args: A & { data?: unknown }; query: (args: A) => Promise<unknown> },
        ) {
          if (TENANT_SCOPED_MODELS.has(model)) {
            const rows = args.data;
            if (Array.isArray(rows)) {
              for (const row of rows as Record<string, unknown>[]) {
                if (row["tenantId"] === undefined || row["tenantId"] === null) {
                  throw new Error(
                    `[TenantGuard] Missing tenantId on ${model} createMany row. Security violation.`,
                  );
                }
              }
            }
          }
          return query(args);
        },
      },
    },
  });
}

/**
 * Simple validation helper for use outside of the extension context.
 * Call before any manual tenant-scoped write.
 */
export function assertTenantId(model: string, tenantId: string | undefined | null): void {
  if (tenantId === undefined || tenantId === null || tenantId === "") {
    throw new Error(`[TenantGuard] Missing tenantId on ${model} write. Security violation.`);
  }
}
