// ─────────────────────────────────────────────────────────────────────────────
// packages/db/src/repositories/tenant.repo.ts
// Typed helpers for Tenant and TenantMembership.
// ─────────────────────────────────────────────────────────────────────────────
import { type PrismaClient } from "@prisma/client";

export async function findTenantBySlug(db: PrismaClient, slug: string) {
  return db.tenant.findUnique({ where: { slug } });
}

export async function findUserMemberships(db: PrismaClient, userId: string) {
  return db.tenantMembership.findMany({
    where: { userId, isActive: true },
    include: { tenant: true },
  });
}

export async function findActiveMembership(
  db: PrismaClient,
  userId: string,
  tenantId: string,
) {
  return db.tenantMembership.findFirst({
    where: { userId, tenantId, isActive: true },
    include: { tenant: true },
  });
}

export async function seedBarangaysForTenant(
  db: PrismaClient,
  tenantId: string,
  barangayNames: string[],
): Promise<void> {
  await db.barangay.createMany({
    data: barangayNames.map((name) => ({
      tenantId,
      name,
      isActive: true,
    })),
    skipDuplicates: true,
  });
}
