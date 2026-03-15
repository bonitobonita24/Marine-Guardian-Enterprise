import { z } from "zod";
import { ProgramType } from "../enums.js";

export const CreateProgramSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(ProgramType),
  description: z.string().max(2000).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export const UpdateProgramSchema = CreateProgramSchema.partial();

export const EnrollBeneficiarySchema = z.object({
  programId: z.string().cuid(),
  fisherfolkId: z.string().cuid(),
});

export const CreateDistributionEventSchema = z.object({
  programId: z.string().cuid(),
  fisherfolkId: z.string().cuid(),
  itemGiven: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  distributionDate: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});

export type CreateProgramInput = z.infer<typeof CreateProgramSchema>;
export type UpdateProgramInput = z.infer<typeof UpdateProgramSchema>;
export type EnrollBeneficiaryInput = z.infer<typeof EnrollBeneficiarySchema>;
export type CreateDistributionEventInput = z.infer<typeof CreateDistributionEventSchema>;
