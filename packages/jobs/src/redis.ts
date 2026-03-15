// ─────────────────────────────────────────────────────────────────────────────
// packages/jobs/src/redis.ts — Shared Redis/Valkey connection for BullMQ
// ─────────────────────────────────────────────────────────────────────────────
import IORedis from "ioredis";

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (redisConnection !== null) return redisConnection;

  redisConnection = new IORedis({
    host: process.env["REDIS_HOST"] ?? "localhost",
    port: parseInt(process.env["REDIS_PORT"] ?? "6379", 10),
    password: process.env["REDIS_PASSWORD"],
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
  });

  return redisConnection;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisConnection !== null) {
    await redisConnection.quit();
    redisConnection = null;
  }
}
