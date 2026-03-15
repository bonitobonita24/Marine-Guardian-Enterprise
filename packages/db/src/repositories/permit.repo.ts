// ─────────────────────────────────────────────────────────────────────────────
// packages/db/src/repositories/permit.repo.ts
// Typed query helpers for Permit entity.
// ─────────────────────────────────────────────────────────────────────────────
import { type Prisma, type PrismaClient } from "@prisma/client";

export type PermitWithVessel = Prisma.PermitGetPayload<{
  include: { vessel: true; approvedBy: true };
}>;

export async function findPermits(
  db: PrismaClient,
  params: {
    tenantId: string;
    vesselId?: string;
    status?: Prisma.PermitWhereInput["status"];
    page: number;
    pageSize: number;
  },
): Promise<{ items: PermitWithVessel[]; total: number }> {
  const { tenantId, vesselId, status, page, pageSize } = params;

  const where: Prisma.PermitWhereInput = {
    tenantId,
    ...(vesselId !== undefined && { vesselId }),
    ...(status !== undefined && { status }),
  };

  const [items, total] = await Promise.all([
    db.permit.findMany({
      where,
      include: { vessel: true, approvedBy: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.permit.count({ where }),
  ]);

  return { items, total };
}

export async function findActivePermitByVesselAndType(
  db: PrismaClient,
  tenantId: string,
  vesselId: string,
  type: Prisma.PermitWhereInput["type"],
): Promise<boolean> {
  const where: Prisma.PermitWhereInput = {
    tenantId,
    vesselId,
    status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
  };
  if (type !== undefined) {
    where.type = type;
  }
  const existing = await db.permit.findFirst({ where });
  return existing !== null;
}

export async function expirePermits(db: PrismaClient): Promise<number> {
  const now = new Date();
  const result = await db.permit.updateMany({
    where: {
      status: "APPROVED",
      expiresAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  });
  return result.count;
}
