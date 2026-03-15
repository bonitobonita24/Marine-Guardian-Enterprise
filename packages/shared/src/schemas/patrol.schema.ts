import { z } from "zod";
import { PatrolStatus } from "../enums.js";

const GpsPointSchema = z.tuple([
  z.number(), // longitude
  z.number(), // latitude
  z.number(), // timestamp (unix ms)
]);

export const StartPatrolSchema = z.object({
  vesselId: z.string().cuid(),
});

export const CompletePatrolSchema = z.object({
  endTime: z.coerce.date(),
  fuelConsumedLiters: z.number().positive().optional(),
  routeGeoJson: z.array(GpsPointSchema).optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdatePatrolStatusSchema = z.object({
  status: z.nativeEnum(PatrolStatus),
  notes: z.string().max(1000).optional(),
});

export const PatrolListQuerySchema = z.object({
  tenantId: z.string().cuid(),
  status: z.nativeEnum(PatrolStatus).optional(),
  startedById: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type StartPatrolInput = z.infer<typeof StartPatrolSchema>;
export type CompletePatrolInput = z.infer<typeof CompletePatrolSchema>;
export type UpdatePatrolStatusInput = z.infer<typeof UpdatePatrolStatusSchema>;
export type PatrolListQuery = z.infer<typeof PatrolListQuerySchema>;
