import { z } from "zod";
import { VesselType } from "../enums.js";

export const CreateVesselSchema = z.object({
  ownerId: z.string().cuid(),
  vesselName: z.string().min(1).max(200),
  registrationNumber: z.string().min(1).max(100),
  type: z.nativeEnum(VesselType),
  lengthMeters: z.number().positive().optional(),
  tonnage: z.number().positive().optional(),
  gearType: z.string().max(200).optional(),
  homePortBarangayId: z.string().cuid(),
});

export const UpdateVesselSchema = CreateVesselSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const VesselListQuerySchema = z.object({
  tenantId: z.string().cuid(),
  ownerId: z.string().cuid().optional(),
  type: z.nativeEnum(VesselType).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type CreateVesselInput = z.infer<typeof CreateVesselSchema>;
export type UpdateVesselInput = z.infer<typeof UpdateVesselSchema>;
export type VesselListQuery = z.infer<typeof VesselListQuerySchema>;
