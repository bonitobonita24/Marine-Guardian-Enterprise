// ─────────────────────────────────────────────────────────────────────────────
// packages/db/src/audit.ts — L5 Immutable AuditLog writer
// Written synchronously before parent transaction commits.
// If this write fails, the parent transaction ROLLS BACK.
// Cannot be disabled by any role.
// ─────────────────────────────────────────────────────────────────────────────
import { Prisma, type PrismaClient } from "@prisma/client";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "STATUS_CHANGE"
  | "ROLE_CHANGE"
  | "TENANT_PROVISIONED"
  | "PERMIT_APPROVED"
  | "PERMIT_REJECTED"
  | "PERMIT_EXPIRED"
  | "INCIDENT_STATUS_CHANGED"
  | "BULK_EXPORT";

export interface WriteAuditLogParams {
  tx: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
  tenantId: string | null;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Write an immutable audit log entry.
 * Must be called within the same Prisma transaction as the parent mutation.
 * If this throws, the parent transaction will roll back (no partial writes).
 */
export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  const { tx, tenantId, userId, action, entity, entityId, before, after, ipAddress } =
    params;

  const data: Prisma.AuditLogCreateInput = {
    action,
    entity,
    entityId,
    before: (before as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
    after: (after as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
    ipAddress: ipAddress ?? null,
    user: { connect: { id: userId } },
  };

  if (tenantId !== null) {
    data.tenant = { connect: { id: tenantId } };
  }

  await tx.auditLog.create({ data });
}
