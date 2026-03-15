// ─────────────────────────────────────────────────────────────────────────────
// NotificationDispatch worker
// Sends in-app, email, and Expo Push notifications.
// Retry 3x per channel. DLQ after 3 failures — non-blocking.
// ─────────────────────────────────────────────────────────────────────────────
import { Worker, type Job } from "bullmq";
import { prisma } from "@marine-guardian/db";
import { getRedisConnection } from "../redis.js";
import { QUEUE_NAMES, type NotificationDispatchJobData } from "../queues.js";

export function createNotificationDispatchWorker(): Worker<NotificationDispatchJobData> {
  return new Worker<NotificationDispatchJobData>(
    QUEUE_NAMES.NOTIFICATION_DISPATCH,
    async (job: Job<NotificationDispatchJobData>) => {
      const { userId, type, title, body, channel } = job.data;

      // ── In-app notification (always succeeds) ───────────────────────────
      if (channel === "IN_APP" || channel === "PUSH") {
        await prisma.notification.create({
          data: {
            userId,
            type,
            title,
            body,
            channel: "IN_APP",
            isRead: false,
            sentAt: new Date(),
          },
        });
      }

      // ── Expo Push notification ───────────────────────────────────────────
      if (channel === "PUSH" && job.data.pushTokens !== undefined) {
        const tokens = job.data.pushTokens;
        // Push delivery via Expo Push Service
        // Expo SDK sends to https://exp.host/--/api/v2/push/send
        const messages = tokens.map((to) => ({
          to,
          title,
          body,
          data: { type },
          sound: "default" as const,
        }));

        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(messages),
        });

        if (!response.ok) {
          throw new Error(`Expo Push API responded with ${String(response.status)}`);
        }

        // Handle DeviceNotRegistered errors — delete stale tokens
        const result = (await response.json()) as {
          data: Array<{ status: string; details?: { error?: string } }>;
        };

        const staleTokens = tokens.filter((_, i) => {
          const ticket = result.data[i];
          return ticket?.details?.error === "DeviceNotRegistered";
        });

        if (staleTokens.length > 0) {
          await prisma.pushToken.deleteMany({
            where: { token: { in: staleTokens } },
          });
        }
      }

      // ── Email notification ───────────────────────────────────────────────
      if (channel === "EMAIL" && job.data.emailAddress !== undefined) {
        // TODO: integrate with SES/SMTP via nodemailer in next phase
        // For now, record as sent in the notification table
        await prisma.notification.create({
          data: {
            userId,
            type,
            title,
            body,
            channel: "EMAIL",
            isRead: false,
            sentAt: new Date(),
          },
        });
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 10,
    },
  );
}
