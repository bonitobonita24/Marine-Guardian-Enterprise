import { Queue, type Job } from "bullmq";
import { getRedisConnection } from "../redis.js";

export interface DlqJobInfo {
  id: string | undefined;
  name: string;
  data: unknown;
  failedReason: string | undefined;
  attemptsMade: number;
  queueName: string;
}

export async function getDlqJobs(queueName: string): Promise<DlqJobInfo[]> {
  const queue = new Queue(queueName, { connection: getRedisConnection() });
  const failed = await queue.getFailed(0, 100);
  return failed.map((job: Job) => ({
    id: job.id,
    name: job.name,
    data: job.data,
    failedReason: job.failedReason,
    attemptsMade: job.attemptsMade,
    queueName,
  }));
}

export async function retryDlqJob(queueName: string, jobId: string): Promise<void> {
  const queue = new Queue(queueName, { connection: getRedisConnection() });
  const job = await queue.getJob(jobId);
  if (job !== undefined) await job.retry();
}

export async function dismissDlqJob(queueName: string, jobId: string): Promise<void> {
  const queue = new Queue(queueName, { connection: getRedisConnection() });
  const job = await queue.getJob(jobId);
  if (job !== undefined) await job.remove();
}
