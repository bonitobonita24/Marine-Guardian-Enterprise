import { z } from "zod";

export const CreateCatchReportSchema = z
  .object({
    vesselId: z.string().cuid(),
    fisherfolkId: z.string().cuid(),
    speciesId: z.string().cuid().optional(),
    speciesFreeText: z.string().max(200).optional(),
    catchVolumeKg: z.number().positive(),
    catchDate: z.coerce.date(),
    landingLocation: z.string().min(1).max(200),
    notes: z.string().max(1000).optional(),
  })
  .refine((d) => d.speciesId !== undefined || d.speciesFreeText !== undefined, {
    message: "Either speciesId or speciesFreeText must be provided",
  });

export const CatchReportListQuerySchema = z.object({
  tenantId: z.string().cuid(),
  vesselId: z.string().cuid().optional(),
  fisherfolkId: z.string().cuid().optional(),
  speciesId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type CreateCatchReportInput = z.infer<typeof CreateCatchReportSchema>;
export type CatchReportListQuery = z.infer<typeof CatchReportListQuerySchema>;
