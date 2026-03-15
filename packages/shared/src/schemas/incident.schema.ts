import { z } from "zod";
import { IncidentStatus } from "../enums.js";

export const CreateIncidentSchema = z.object({
  violatorName: z.string().min(1).max(200),
  violatorInfo: z.string().max(1000).optional(),
  vesselId: z.string().cuid().optional(),
  gearUsed: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  incidentDate: z.coerce.date(),
  description: z.string().min(1).max(5000),
  evidenceUrls: z.array(z.string().url()).max(5).default([]),
});

export const UpdateIncidentStatusSchema = z.object({
  status: z.nativeEnum(IncidentStatus),
});

export const IncidentListQuerySchema = z.object({
  tenantId: z.string().cuid(),
  status: z.nativeEnum(IncidentStatus).optional(),
  reportedById: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;
export type UpdateIncidentStatusInput = z.infer<typeof UpdateIncidentStatusSchema>;
export type IncidentListQuery = z.infer<typeof IncidentListQuerySchema>;
