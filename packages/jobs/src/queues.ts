// ─────────────────────────────────────────────────────────────────────────────
// packages/jobs/src/queues.ts — BullMQ queue definitions
// One queue per job type for independent scaling.
// ─────────────────────────────────────────────────────────────────────────────
import { Queue } from "bullmq";
import { getRedisConnection } from "./redis.js";

// ── Queue names (const — used as keys across the codebase) ───────────────────
export const QUEUE_NAMES = {
  IMAGE_OPTIMIZATION: "image-optimization",
  PERMIT_PDF: "permit-pdf",
  IDCARD_PDF: "idcard-pdf",
  PERMIT_EXPIRY: "permit-expiry",
  NOTIFICATION_DISPATCH: "notification-dispatch",
  OFFLINE_SYNC: "offline-sync",
  EVIDENCE_PHOTO: "evidence-photo",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ── Job data types ─────────────────────────────────────────────────────────────

export interface ImageOptimizationJobData {
  tenantId: string;
  fisherfolkId: string;
  type: "photo" | "signature";
  rawStoragePath: string;
}

export interface PermitPdfJobData {
  tenantId: string;
  permitId: string;
  triggeredByUserId: string;
}

export interface IdCardPdfJobData {
  tenantId: string;
  fisherfolkId: string;
  requestedByUserId: string;
}

export interface PermitExpiryJobData {
  triggeredAt: string; // ISO timestamp
}

export interface NotificationDispatchJobData {
  userId: string;
  type: string;
  title: string;
  body: string;
  channel: "EMAIL" | "IN_APP" | "PUSH";
  pushTokens?: string[];
  emailAddress?: string;
}

export interface OfflineSyncJobData {
  userId: string;
  tenantId: string;
  reports: unknown[]; // typed downstream
  clientSyncId: string;
}

export interface EvidencePhotoJobData {
  tenantId: string;
  incidentId: string;
  rawStoragePaths: string[];
}

// ── Queue factories ────────────────────────────────────────────────────────────

function makeQueue<T extends object>(name: string): Queue<T> {
  return new Queue<T>(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });
}

export const imageOptimizationQueue = makeQueue<ImageOptimizationJobData>(
  QUEUE_NAMES.IMAGE_OPTIMIZATION,
);
export const permitPdfQueue = makeQueue<PermitPdfJobData>(QUEUE_NAMES.PERMIT_PDF);
export const idCardPdfQueue = makeQueue<IdCardPdfJobData>(QUEUE_NAMES.IDCARD_PDF);
export const permitExpiryQueue = makeQueue<PermitExpiryJobData>(QUEUE_NAMES.PERMIT_EXPIRY);
export const notificationDispatchQueue = makeQueue<NotificationDispatchJobData>(
  QUEUE_NAMES.NOTIFICATION_DISPATCH,
);
export const offlineSyncQueue = makeQueue<OfflineSyncJobData>(QUEUE_NAMES.OFFLINE_SYNC);
export const evidencePhotoQueue = makeQueue<EvidencePhotoJobData>(QUEUE_NAMES.EVIDENCE_PHOTO);
