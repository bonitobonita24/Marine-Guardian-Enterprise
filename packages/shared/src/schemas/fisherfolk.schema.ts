import { z } from "zod";
import { ActivityCategory, Sex } from "../enums.js";

export const CreateFisherfolkSchema = z.object({
  firstName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.coerce.date(),
  sex: z.nativeEnum(Sex),
  barangayId: z.string().cuid(),
  contactNumber: z.string().max(20).optional(),
  rsbsaNumber: z.string().max(50).optional(),
  activityCategories: z.array(z.nativeEnum(ActivityCategory)).min(1),
  photoUrl: z.string().url().optional(),
  signatureUrl: z.string().url().optional(),
});

export const UpdateFisherfolkSchema = CreateFisherfolkSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const FisherfolkListQuerySchema = z.object({
  tenantId: z.string().cuid(),
  barangayId: z.string().cuid().optional(),
  activityCategory: z.nativeEnum(ActivityCategory).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type CreateFisherfolkInput = z.infer<typeof CreateFisherfolkSchema>;
export type UpdateFisherfolkInput = z.infer<typeof UpdateFisherfolkSchema>;
export type FisherfolkListQuery = z.infer<typeof FisherfolkListQuerySchema>;
