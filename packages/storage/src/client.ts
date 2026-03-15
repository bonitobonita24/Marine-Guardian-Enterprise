// packages/storage/src/client.ts — S3-compatible client (MinIO dev / S3|R2 prod)
import { S3Client } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

export function getStorageClient(): S3Client {
  if (s3Client !== null) return s3Client;

  const endpoint = process.env["STORAGE_ENDPOINT"];
  const region = process.env["STORAGE_REGION"] ?? "us-east-1";

  s3Client = new S3Client({
    region,
    ...(endpoint !== undefined && {
      endpoint,
      forcePathStyle: true, // Required for MinIO
    }),
    credentials: {
      accessKeyId: process.env["STORAGE_ACCESS_KEY"] ?? "minioadmin",
      secretAccessKey: process.env["STORAGE_SECRET_KEY"] ?? "minioadmin",
    },
  });

  return s3Client;
}

export const STORAGE_BUCKET = process.env["STORAGE_BUCKET"] ?? "marine-guardian";
