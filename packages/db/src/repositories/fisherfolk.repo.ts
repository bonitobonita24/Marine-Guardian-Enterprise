// ─────────────────────────────────────────────────────────────────────────────
// packages/db/src/repositories/fisherfolk.repo.ts
// Typed query helpers for Fisherfolk entity.
// All queries require tenantId — enforced by tenant guard middleware (L6).
// ─────────────────────────────────────────────────────────────────────────────
import { type Prisma, type PrismaClient } from "@prisma/client";

export type FisherfolkWithBarangay = Prisma.FisherfolkGetPayload<{
  include: { barangay: true };
}>;

export function buildFisherfolkCode(tenantSlug: string, sequence: number): string {
  const prefix = tenantSlug.toUpperCase().slice(0, 4);
  return `${prefix}-${String(sequence).padStart(6, "0")}`;
}

export async function getNextFisherfolkSequence(
  db: PrismaClient,
  tenantId: string,
): Promise<number> {
  const count = await db.fisherfolk.count({ where: { tenantId } });
  return count + 1;
}

export async function findFisherfolk(
  db: PrismaClient,
  params: {
    tenantId: string;
    barangayId?: string;
    isActive?: boolean;
    search?: string;
    page: number;
    pageSize: number;
  },
): Promise<{ items: FisherfolkWithBarangay[]; total: number }> {
  const { tenantId, barangayId, isActive, search, page, pageSize } = params;

  const where: Prisma.FisherfolkWhereInput = {
    tenantId,
    ...(barangayId !== undefined && { barangayId }),
    ...(isActive !== undefined && { isActive }),
    ...(search !== undefined && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { fisherfolkCode: { contains: search, mode: "insensitive" } },
        { rsbsaNumber: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    db.fisherfolk.findMany({
      where,
      include: { barangay: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.fisherfolk.count({ where }),
  ]);

  return { items, total };
}

export async function findFisherfolkById(
  db: PrismaClient,
  id: string,
  tenantId: string,
): Promise<FisherfolkWithBarangay | null> {
  return db.fisherfolk.findFirst({
    where: { id, tenantId },
    include: { barangay: true },
  });
}

export async function checkRsbsaDuplicate(
  db: PrismaClient,
  tenantId: string,
  rsbsaNumber: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.fisherfolk.findFirst({
    where: {
      tenantId,
      rsbsaNumber,
      ...(excludeId !== undefined && { id: { not: excludeId } }),
    },
  });
  return existing !== null;
}
