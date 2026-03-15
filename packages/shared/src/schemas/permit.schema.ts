import { z } from "zod";
import { PermitStatus, PermitType } from "../enums.js";

export const CreatePermitSchema = z.object({
  vesselId: z.string().cuid(),
  type: z.nativeEnum(PermitType),
  status: z.nativeEnum(PermitStatus).default(PermitStatus.DRAFT),
  expiresAt: z.coerce.date().optional(),
});

export const UpdatePermitStatusSchema = z.object({
  status: z.nativeEnum(PermitStatus),
  rejectionNotes: z.string().max(1000).optional(),
  expiresAt: z.coerce.date().optional(),
});

export const PermitListQuerySchema = z.object({
  tenantId: z.string().cuid(),
  vesselId: z.string().cuid().optional(),
  type: z.nativeEnum(PermitType).optional(),
  status: z.nativeEnum(PermitStatus).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type CreatePermitInput = z.infer<typeof CreatePermitSchema>;
export type UpdatePermitStatusInput = z.infer<typeof UpdatePermitStatusSchema>;
export type PermitListQuery = z.infer<typeof PermitListQuerySchema>;
