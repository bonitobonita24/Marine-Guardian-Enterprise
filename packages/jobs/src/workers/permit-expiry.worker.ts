// ─────────────────────────────────────────────────────────────────────────────
// PermitExpiryCheck worker — runs daily via cron
// Transitions Approved permits past expiresAt to Expired.
// Results logged to AuditLog.
// ─────────────────────────────────────────────────────────────────────────────
import { Worker, type Job } from "bullmq";
import { prisma, expirePermits, writeAuditLog } from "@marine-guardian/db";
import { getRedisConnection } from "../redis.js";
import { QUEUE_NAMES, type PermitExpiryJobData } from "../queues.js";

export function createPermitExpiryWorker(): Worker<PermitExpiryJobData> {
  return new Worker<PermitExpiryJobData>(
    QUEUE_NAMES.PERMIT_EXPIRY,
    async (job: Job<PermitExpiryJobData>) => {
      const expiredCount = await expirePermits(prisma);

      // Log to AuditLog
      if (expiredCount > 0) {
        const systemUser = await prisma.user.findFirst({
          where: { email: "system@internal" },
        });

        if (systemUser !== null) {
          await writeAuditLog({
            tx: prisma,
            tenantId: null,
            userId: systemUser.id,
            action: "PERMIT_EXPIRED",
            entity: "Permit",
            entityId: "batch",
            after: { expiredCount, triggeredAt: job.data.triggeredAt },
          });
        }
      }

      return { expiredCount };
    },
    {
      connection: getRedisConnection(),
      concurrency: 1,
    },
  );
}
