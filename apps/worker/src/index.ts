// apps/worker/src/index.ts — BullMQ worker process
import {
  createPermitExpiryWorker,
  createNotificationDispatchWorker,
  permitExpiryQueue,
  closeRedisConnection,
} from "@marine-guardian/jobs";

async function main(): Promise<void> {
  console.log("🚀 Worker starting...");

  const workers = [
    createPermitExpiryWorker(),
    createNotificationDispatchWorker(),
  ];

  // Schedule daily permit expiry check at midnight
  await permitExpiryQueue.add(
    "permit-expiry-check",
    { triggeredAt: new Date().toISOString() },
    {
      repeat: { pattern: "0 0 * * *" },
      jobId: "permit-expiry-daily",
    },
  );

  workers.forEach((w) => {
    w.on("completed", (job) => console.log(`✅ Job ${job.id ?? ""} completed in ${w.name}`));
    w.on("failed", (job, err) => console.error(`❌ Job ${job?.id ?? ""} failed:`, err));
  });

  console.log(`✅ ${String(workers.length)} workers active`);

  const shutdown = async (): Promise<void> => {
    console.log("🛑 Shutting down workers...");
    await Promise.all(workers.map((w) => w.close()));
    await closeRedisConnection();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
}

main().catch((err) => {
  console.error("Worker startup failed:", err);
  process.exit(1);
});
