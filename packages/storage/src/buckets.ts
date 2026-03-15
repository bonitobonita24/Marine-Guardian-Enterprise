// packages/storage/src/buckets.ts — Typed storage paths + presigned URL helpers
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStorageClient, STORAGE_BUCKET } from "./client.js";

export const StoragePaths = {
  fisherfolkPhoto: (tenantSlug: string, fisherfolkId: string) =>
    `${tenantSlug}/fisherfolk/${fisherfolkId}/photo.jpg`,
  fisherfolkSignature: (tenantSlug: string, fisherfolkId: string) =>
    `${tenantSlug}/fisherfolk/${fisherfolkId}/signature.png`,
  permitPdf: (tenantSlug: string, permitId: string) =>
    `${tenantSlug}/permits/${permitId}/permit.pdf`,
  idCardPdf: (tenantSlug: string, fisherfolkId: string) =>
    `${tenantSlug}/idcards/${fisherfolkId}/idcard.pdf`,
  evidencePhoto: (tenantSlug: string, incidentId: string, n: number) =>
    `${tenantSlug}/incidents/${incidentId}/evidence-${String(n)}.jpg`,
} as const;

export async function generatePresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300,
): Promise<string> {
  const command = new PutObjectCommand({ Bucket: STORAGE_BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(getStorageClient(), command, { expiresIn: expiresInSeconds });
}

export async function generatePresignedGetUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: STORAGE_BUCKET, Key: key });
  return getSignedUrl(getStorageClient(), command, { expiresIn: expiresInSeconds });
}
